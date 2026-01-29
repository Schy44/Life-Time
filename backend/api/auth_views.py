import random
import string
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Profile, EmailVerification, PasswordResetOTP
from .auth_serializers import (
    RegisterSerializer,
    VerifyEmailSerializer,
    ResendOTPSerializer,
    LoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetVerifySerializer,
    PasswordResetConfirmSerializer,
    UserSerializer
)


def generate_otp():
    """Generate a 6-digit OTP code"""
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(email, otp_code, purpose='verification'):
    """Send OTP code via email with a beautiful HTML template"""
    if purpose == 'verification':
        subject = 'Verify Your Email - Life-Time'
        title = 'Email Verification'
        header = 'Welcome to Life-Time!'
        body = 'Thank you for registering with us. To complete your registration and find your eternal partner, please use the verification code below:'
        footer = 'This code will expire in 5 minutes. If you did not request this, please ignore this email.'
    else:  # password reset
        subject = 'Password Reset Code - Life-Time'
        title = 'Password Reset'
        header = 'Reset Your Password'
        body = 'You requested to reset your password. Please use the code below to securely update your credentials:'
        footer = 'This code will expire in 5 minutes. If you did not request a password reset, your account is still secure.'

    # HTML Email Template
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .email-container {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 40px 20px;
            }}
            .card {{
                background-color: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 24px;
                padding: 48px;
                text-align: center;
            }}
            .logo-text {{
                font-size: 24px;
                font-weight: 900;
                letter-spacing: -1px;
                color: #000000;
                margin-bottom: 40px;
                text-transform: uppercase;
            }}
            .header {{
                font-size: 32px;
                color: #111827;
                margin-bottom: 16px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }}
            .body-text {{
                font-size: 16px;
                color: #6b7280;
                line-height: 1.6;
                margin-bottom: 40px;
            }}
            .otp-box {{
                background-color: #f9fafb;
                border-radius: 20px;
                padding: 32px;
                margin: 0 auto 40px;
                display: inline-block;
                width: 80%;
            }}
            .otp-code {{
                font-size: 48px;
                font-weight: 800;
                letter-spacing: 12px;
                color: #7c3aed;
                margin: 0;
            }}
            .footer-text {{
                font-size: 13px;
                color: #9ca3af;
                margin-top: 40px;
                line-height: 1.5;
            }}
            .signature {{
                margin-top: 32px;
                font-weight: 700;
                color: #111827;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="card">
                <div class="logo-text">Life-Time</div>
                <div class="header">{header}</div>
                <div class="body-text">{body}</div>
                
                <div class="otp-box">
                    <div class="otp-code">{otp_code}</div>
                </div>
                
                <div class="footer-text">
                    {footer}<br><br>
                    &copy; {timezone.now().year} Life-Time Inc. All rights reserved.
                </div>
                
                <div class="signature">
                    The Life-Time Team
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text version as fallback
    text_message = f"{header}\n\n{body}\n\nYour code: {otp_code}\n\n{footer}\n\nBest regards,\nLife-Time Team"
    
    send_mail(
        subject,
        text_message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
        html_message=html_message,
    )


def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user and send OTP for email verification.
    Does not create the user yet - only after OTP verification.
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    name = serializer.validated_data['name']
    password = serializer.validated_data['password']
    
    # Store registration data temporarily (you might want to use cache/session instead)
    # For now, we'll just send OTP and expect frontend to send all data again during verification
    
    # Generate OTP
    otp_code = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=5)
    
    # Delete any existing OTPs for this email
    EmailVerification.objects.filter(email=email).delete()
    
    # Create new OTP
    EmailVerification.objects.create(
        email=email,
        otp_code=otp_code,
        expires_at=expires_at
    )
    
    # Send OTP email
    try:
        send_otp_email(email, otp_code, purpose='verification')
    except Exception as e:
        return Response(
            {'error': f'Failed to send verification email: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return Response({
        'message': 'Verification code sent to your email. Please check your inbox.',
        'email': email
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Verify email with OTP and create the user account.
    Requires: email, otp, name, password
    """
    # First validate OTP
    otp_serializer = VerifyEmailSerializer(data=request.data)
    if not otp_serializer.is_valid():
        return Response(otp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = otp_serializer.validated_data['email']
    otp = otp_serializer.validated_data['otp']
    
    # Get user registration data
    name = request.data.get('name')
    password = request.data.get('password')
    
    if not name or not password:
        return Response(
            {'error': 'Name and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Find valid OTP
    try:
        otp_record = EmailVerification.objects.filter(
            email=email,
            otp_code=otp,
            is_used=False
        ).latest('created_at')
    except EmailVerification.DoesNotExist:
        return Response(
            {'error': 'Invalid or expired OTP code'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if OTP is still valid
    if not otp_record.is_valid():
        return Response(
            {'error': 'OTP code has expired. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'A user with this email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    user = User.objects.create_user(
        username=email,  # Use email as username
        email=email,
        password=password
    )
    
    # Create profile
    Profile.objects.create(
        user=user,
        name=name,
        email=email,
        gender='male'  # Default, user will update during onboarding
    )
    
    # Mark OTP as used
    otp_record.mark_as_used()
    
    # Generate tokens
    tokens = get_tokens_for_user(user)
    
    # Return user data and tokens
    user_serializer = UserSerializer(user)
    return Response({
        'message': 'Email verified successfully. Account created!',
        'user': user_serializer.data,
        'tokens': tokens
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """Resend OTP code to email"""
    serializer = ResendOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    
    # Generate new OTP
    otp_code = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=5)
    
    # Delete old OTPs
    EmailVerification.objects.filter(email=email).delete()
    
    # Create new OTP
    EmailVerification.objects.create(
        email=email,
        otp_code=otp_code,
        expires_at=expires_at
    )
    
    # Send email
    try:
        send_otp_email(email, otp_code, purpose='verification')
    except Exception as e:
        return Response(
            {'error': f'Failed to send email: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return Response({
        'message': 'New verification code sent to your email'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user with email and password"""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    
    # Find user by email
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Authenticate
    user = authenticate(username=user.username, password=password)
    if user is None:
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate tokens
    tokens = get_tokens_for_user(user)
    
    # Return user data and tokens
    user_serializer = UserSerializer(user)
    return Response({
        'message': 'Login successful',
        'user': user_serializer.data,
        'tokens': tokens
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user by blacklisting the refresh token.
    Note: Token blacklisting requires additional setup with simplejwt.
    For now, we'll just return success and let frontend handle token removal.
    """
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Request password reset - sends OTP to email"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    
    # Find user
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal if email exists or not
        return Response({
            'message': 'If an account with this email exists, a password reset code has been sent.'
        }, status=status.HTTP_200_OK)
    
    # Generate OTP
    otp_code = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=5)
    
    # Delete old OTPs for this user
    PasswordResetOTP.objects.filter(user=user).delete()
    
    # Create new OTP
    PasswordResetOTP.objects.create(
        user=user,
        otp_code=otp_code,
        expires_at=expires_at
    )
    
    # Send email
    try:
        send_otp_email(email, otp_code, purpose='reset')
    except Exception as e:
        return Response(
            {'error': f'Failed to send email: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return Response({
        'message': 'If an account with this email exists, a password reset code has been sent.'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_verify(request):
    """Verify OTP for password reset (optional step for better UX)"""
    serializer = PasswordResetVerifySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    otp = serializer.validated_data['otp']
    
    # Find user
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid OTP code'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Find valid OTP
    try:
        otp_record = PasswordResetOTP.objects.filter(
            user=user,
            otp_code=otp,
            is_used=False
        ).latest('created_at')
    except PasswordResetOTP.DoesNotExist:
        return Response(
            {'error': 'Invalid OTP code'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if OTP is still valid
    if not otp_record.is_valid():
        return Response(
            {'error': 'OTP code has expired. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({
        'message': 'OTP verified. You can now set a new password.'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Confirm password reset with OTP and new password"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    otp = serializer.validated_data['otp']
    new_password = serializer.validated_data['new_password']
    
    # Find user
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid request'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Find valid OTP
    try:
        otp_record = PasswordResetOTP.objects.filter(
            user=user,
            otp_code=otp,
            is_used=False
        ).latest('created_at')
    except PasswordResetOTP.DoesNotExist:
        return Response(
            {'error': 'Invalid or expired OTP code'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if OTP is still valid
    if not otp_record.is_valid():
        return Response(
            {'error': 'OTP code has expired. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update password
    user.set_password(new_password)
    user.save()
    
    # Mark OTP as used
    otp_record.mark_as_used()
    
    return Response({
        'message': 'Password reset successful. You can now login with your new password.'
    }, status=status.HTTP_200_OK)
