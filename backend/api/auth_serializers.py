from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile, EmailVerification, PasswordResetOTP


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration"""
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    
    def validate_email(self, value):
        """Check if email is already registered"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate(self, attrs):
        """Check if passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs


class VerifyEmailSerializer(serializers.Serializer):
    """Serializer for email verification with OTP"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)


class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP"""
    email = serializers.EmailField()


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField()


class PasswordResetVerifySerializer(serializers.Serializer):
    """Serializer for verifying password reset OTP"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset with new password"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Check if passwords match"""
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data in auth responses"""
    profile_id = serializers.SerializerMethodField()
    onboarding_completed = serializers.SerializerMethodField()
    is_activated = serializers.SerializerMethodField()
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_id', 'onboarding_completed', 'is_activated', 'is_staff', 'is_superuser']
    
    def get_profile_id(self, obj):
        """Get profile ID if exists"""
        try:
            return obj.profile.id
        except Profile.DoesNotExist:
            return None

    def get_onboarding_completed(self, obj):
        """Get onboarding status if exists"""
        try:
            return obj.profile.onboarding_completed
        except Profile.DoesNotExist:
            return False

    def get_is_activated(self, obj):
        """Get activation status if exists"""
        try:
            return obj.profile.is_activated
        except Profile.DoesNotExist:
            return False
