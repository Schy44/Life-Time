from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import auth_views

urlpatterns = [
    # Registration & Email Verification
    path('register/', auth_views.register, name='auth-register'),
    path('verify-email/', auth_views.verify_email, name='auth-verify-email'),
    path('resend-otp/', auth_views.resend_otp, name='auth-resend-otp'),
    
    # Login & Logout
    path('login/', auth_views.login, name='auth-login'),
    path('logout/', auth_views.logout, name='auth-logout'),
    
    # Token Refresh
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Password Reset
    path('password-reset/', auth_views.password_reset_request, name='password-reset-request'),
    path('password-reset-verify/', auth_views.password_reset_verify, name='password-reset-verify'),
    path('password-reset-confirm/', auth_views.password_reset_confirm, name='password-reset-confirm'),
]
