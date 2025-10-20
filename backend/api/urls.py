
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, UserView, ProfileViewSet, ProfileDetailView, InterestViewSet

router = DefaultRouter()
router.register('profiles', ProfileViewSet, basename='profile')
router.register('interests', InterestViewSet, basename='interest')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserView.as_view(), name='user'),
    path('profile/', ProfileDetailView.as_view(), name='profile-detail'),
    path('', include(router.urls)),
]
