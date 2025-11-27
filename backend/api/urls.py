from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserView, ProfileViewSet, ProfileDetailView, InterestViewSet, CountryListView, ProfessionListView, NotificationListView, MarkNotificationAsReadView, UnreadNotificationCountView

router = DefaultRouter()
router.register('profiles', ProfileViewSet, basename='profile')
router.register('interests', InterestViewSet, basename='interest')

urlpatterns = [
    # Authentication now handled by Supabase on frontend
    path('user/', UserView.as_view(), name='user'),
    path('profile/', ProfileDetailView.as_view(), name='profile-detail'),
    path('countries/', CountryListView.as_view(), name='country-list'),
    path('professions/', ProfessionListView.as_view(), name='profession-list'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/mark-read/', MarkNotificationAsReadView.as_view(), name='notification-mark-read'),
    path('notifications/unread-count/', UnreadNotificationCountView.as_view(), name='notification-unread-count'),
    path('', include(router.urls)),
]