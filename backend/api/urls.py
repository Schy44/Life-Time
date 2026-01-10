from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserView, ProfileViewSet, ProfileDetailView, InterestViewSet, 
    CountryListView, ProfessionListView, NotificationListView, 
    MarkNotificationAsReadView, UnreadNotificationCountView,
    VerificationDocumentViewSet, AdminVerificationDocumentViewSet,
    RecommendedMatchesView, unlock_profile,
    # Analytics views
    get_basic_stats, who_viewed_me, get_advanced_analytics, get_profile_strength
)
from .views_analytics import AdminDashboardAnalyticsView

router = DefaultRouter()
router.register('profiles', ProfileViewSet, basename='profile')
router.register('interests', InterestViewSet, basename='interest')
router.register('verification-documents', VerificationDocumentViewSet, basename='verification-document')
router.register('admin/verification-documents', AdminVerificationDocumentViewSet, basename='admin-verification-document')

urlpatterns = [
    # Authentication now handled by Supabase on frontend
    path('user/', UserView.as_view(), name='user'),
    path('profile/', ProfileDetailView.as_view(), name='profile-detail'),
    path('countries/', CountryListView.as_view(), name='country-list'),
    path('professions/', ProfessionListView.as_view(), name='profession-list'),
    path('profiles/recommendations/', RecommendedMatchesView.as_view(), name='profile-recommendations'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/mark-read/', MarkNotificationAsReadView.as_view(), name='notification-mark-read'),
    path('notifications/unread-count/', UnreadNotificationCountView.as_view(), name='notification-unread-count'),
    # Analytics endpoints
    path('analytics/basic/', get_basic_stats, name='analytics-basic'),
    path('analytics/who-viewed/', who_viewed_me, name='analytics-who-viewed'),
    path('analytics/advanced/', get_advanced_analytics, name='analytics-advanced'),
    path('analytics/strength/', get_profile_strength, name='analytics-strength'),
    path('analytics/admin/', AdminDashboardAnalyticsView.as_view(), name='admin-analytics'),
    path('profiles/unlock/', unlock_profile, name='profile-unlock'),
    path('', include(router.urls)),
]