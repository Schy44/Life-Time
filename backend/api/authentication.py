import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from django.contrib.auth.models import User

from .models import Profile

class SupabaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).decode('utf-8')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ').pop()
        try:
            decoded_token = jwt.decode(
                token, 
                settings.SUPABASE_JWT_SECRET, 
                algorithms=['HS256'],
                audience=settings.SUPABASE_AUDIENCE
            )
            user_id = decoded_token.get('sub')
            user = User.objects.get(username=user_id)
            try:
                profile = Profile.objects.get(user=user)
            except Profile.DoesNotExist:
                profile = Profile.objects.create(user=user, email=user.email)
            return (user, None)
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')
        except User.DoesNotExist:
            # Create a new user if they don't exist
            user_id = decoded_token.get('sub')
            email = decoded_token.get('email')
            user = User.objects.create_user(username=user_id, email=email)
            Profile.objects.create(user=user, email=email)
            return (user, None)
