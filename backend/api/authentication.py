import jwt
import logging
from django.conf import settings
from rest_framework import authentication, exceptions
from django.contrib.auth.models import User

from .models import Profile

logger = logging.getLogger(__name__)

class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Authenticate users using Supabase JWT tokens.
    Automatically creates Django users and profiles from Supabase Auth.
    """
    
    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).decode('utf-8')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        
        try:
            # Decode the Supabase JWT token
            decoded_token = jwt.decode(
                token, 
                settings.SUPABASE_JWT_SECRET, 
                algorithms=['HS256'],
                audience=settings.SUPABASE_AUDIENCE,
                leeway=60 # Allow 60s clock skew
            )
            
            # Extract user info from token
            user_id = decoded_token.get('sub')
            email = decoded_token.get('email')
            
            if not user_id:
                raise exceptions.AuthenticationFailed('Invalid token: missing user ID')
            
            # Get or create Django user
            user, created = User.objects.get_or_create(
                username=user_id,
                defaults={'email': email or ''}
            )
            
            if created:
                logger.info(f"Created new Django user from Supabase: {user_id}")
            
            # Get or create profile for this user
            try:
                profile = Profile.objects.get(user=user)
            except Profile.DoesNotExist:
                # Extract name from user metadata (set during registration)
                user_metadata = decoded_token.get('user_metadata', {})
                full_name = user_metadata.get('name', email if email else user.username)
                
                # Create profile with full name from registration
                profile = Profile.objects.create(
                    user=user,
                    name=full_name,  # Use the name provided during registration
                    email=email if email else '',
                    gender='male'  # Default value, user will update
                )
                logger.info(f"Created profile for user: {user_id}")
            
            return (user, None)
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {str(e)}")
            raise exceptions.AuthenticationFailed('Invalid token')
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            raise exceptions.AuthenticationFailed('Authentication failed')
