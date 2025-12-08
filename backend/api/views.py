from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserSerializer, ProfileSerializer, InterestSerializer, NotificationSerializer, VerificationDocumentSerializer
from django.contrib.auth.models import User
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from .models import Profile, Interest, WorkExperience, Notification, VerificationDocument
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.shortcuts import get_object_or_404
from datetime import date, timedelta
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAdminUser


class CountryListView(APIView):
    def get(self, request):
        # Static list of countries with codes and names. This provides a consistent list
        # regardless of user-generated profile data.
        countries = [
            {"name": "United States", "code": "US"},
            {"name": "Canada", "code": "CA"},
            {"name": "United Kingdom", "code": "GB"},
            {"name": "Australia", "code": "AU"},
            {"name": "Germany", "code": "DE"},
            {"name": "France", "code": "FR"},
            {"name": "Spain", "code": "ES"},
            {"name": "Italy", "code": "IT"},
            {"name": "Japan", "code": "JP"},
            {"name": "China", "code": "CN"},
            {"name": "India", "code": "IN"},
            {"name": "Brazil", "code": "BR"},
            {"name": "Mexico", "code": "MX"},
            {"name": "South Africa", "code": "ZA"},
            {"name": "Nigeria", "code": "NG"},
            {"name": "Egypt", "code": "EG"},
            {"name": "Argentina", "code": "AR"},
            {"name": "Sweden", "code": "SE"},
            {"name": "Norway", "code": "NO"},
            {"name": "Denmark", "code": "DK"},
            {"name": "Finland", "code": "FI"},
            {"name": "Netherlands", "code": "NL"},
            {"name": "Belgium", "code": "BE"},
            {"name": "Switzerland", "code": "CH"},
            {"name": "Austria", "code": "AT"},
            {"name": "Portugal", "code": "PT"},
            {"name": "Greece", "code": "GR"},
            {"name": "Ireland", "code": "IE"},
            {"name": "New Zealand", "code": "NZ"},
            {"name": "Singapore", "code": "SG"},
            {"name": "Malaysia", "code": "MY"},
            {"name": "Indonesia", "code": "ID"},
            {"name": "Thailand", "code": "TH"},
            {"name": "Vietnam", "code": "VN"},
            {"name": "Philippines", "code": "PH"},
            {"name": "South Korea", "code": "KR"},
            {"name": "Russia", "code": "RU"},
            {"name": "Saudi Arabia", "code": "SA"},
            {"name": "United Arab Emirates", "code": "AE"},
            {"name": "Turkey", "code": "TR"},
            {"name": "Ukraine", "code": "UA"},
            {"name": "Poland", "code": "PL"},
            {"name": "Czech Republic", "code": "CZ"},
            {"name": "Hungary", "code": "HU"},
            {"name": "Romania", "code": "RO"},
            {"name": "Chile", "code": "CL"},
            {"name": "Colombia", "code": "CO"},
            {"name": "Peru", "code": "PE"},
            {"name": "Pakistan", "code": "PK"},
            {"name": "Bangladesh", "code": "BD"},
            {"name": "Sri Lanka", "code": "LK"},
        ]
        return Response(countries)


class ProfessionListView(APIView):
    def get(self, request):
        professions = WorkExperience.objects.values_list(
            'title', flat=True).distinct()
        return Response(professions)


# RegisterView and LoginView removed - authentication now handled by Supabase Auth on frontend

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'email': request.user.email,
            'name': request.user.first_name
        })


class ProfileDetailView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # This view is for the user's own profile, so we fetch it via the request.user
        # Optimize query with prefetching to prevent N+1 queries
        queryset = Profile.objects.select_related('user').prefetch_related(
            'work_experience',
            'education',
            'additional_images',
            'preference',
            'sent_interests',
            'received_interests'
        )
        return get_object_or_404(queryset, user=self.request.user)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    pagination_class = PageNumberPagination

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # --- Track Profile View (Analytics) ---
        if request.user.is_authenticated and instance.user != request.user:
            if hasattr(request.user, 'profile'):
                from api.services.analytics_service import AnalyticsService
                AnalyticsService.track_profile_view(
                    viewer_profile=request.user.profile,
                    viewed_profile=instance,
                    source='profile_detail'
                )
        # --- Create Notification for Profile View ---
        # Ensure users don't get notified for viewing their own profile
        if request.user.is_authenticated and instance.user != request.user:
            # Check if the viewer has a profile
            if hasattr(request.user, 'profile'):
                # Throttle notifications: only create a new one if a similar one doesn't exist from the last 24 hours.
                recent_notification_exists = Notification.objects.filter(
                    recipient=instance.user,
                    actor_profile=request.user.profile,
                    verb="viewed your profile",
                    created_at__gte=timezone.now() - timedelta(hours=24)
                ).exists()

                if not recent_notification_exists:
                    Notification.objects.create(
                        recipient=instance.user,  # The owner of the profile being viewed
                        actor_profile=request.user.profile,  # The profile of the viewer
                        verb="viewed your profile",
                    )
        # ------------------------------------------
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_queryset(self):
        # Optimize queryset with select_related and prefetch_related to reduce queries
        queryset = Profile.objects.select_related('user').prefetch_related(
            'work_experience',
            'education',
            'additional_images',
            'preference'
        )

        if self.action == 'list':
            queryset = queryset.exclude(user=self.request.user)

            # Helper to calculate birth year range from age range
            def _get_birth_year_range_from_age(age_range_str):
                current_year = date.today().year
                if '-' in age_range_str:
                    min_age_str, max_age_str = age_range_str.split('-')
                    min_age = int(min_age_str)
                    max_age = int(max_age_str)
                elif '+' in age_range_str:
                    min_age = int(age_range_str.replace('+', ''))
                    max_age = 150  # Effectively no upper limit
                else:
                    return None, None  # Invalid format

                min_birth_year = current_year - max_age
                max_birth_year = current_year - min_age
                return min_birth_year, max_birth_year

            # Apply filters
            search_term = self.request.query_params.get('search', None)
            age_filter = self.request.query_params.get('age', None)
            gender_filter = self.request.query_params.get('gender', None)
            interest_filter = self.request.query_params.get(
                'interest', None)  # Assuming this is a text search for now

            if search_term:
                queryset = queryset.filter(
                    Q(name__icontains=search_term) |
                    Q(current_city__icontains=search_term) |
                    Q(origin_city__icontains=search_term) |
                    Q(about__icontains=search_term) |
                    Q(looking_for__icontains=search_term) |
                    Q(work_experience__title__icontains=search_term)
                ).distinct()

            if age_filter:
                min_birth_year, max_birth_year = _get_birth_year_range_from_age(
                    age_filter)
                if min_birth_year and max_birth_year:
                    queryset = queryset.filter(
                        birth_year__gte=min_birth_year, birth_year__lte=max_birth_year)

            if gender_filter:
                queryset = queryset.filter(gender__iexact=gender_filter)

            if interest_filter:
                # For now, treat interest_filter as a general text search across relevant fields
                queryset = queryset.filter(
                    Q(about__icontains=interest_filter) |
                    Q(looking_for__icontains=interest_filter) |
                    Q(work_experience__title__icontains=interest_filter)
                ).distinct()

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InterestViewSet(viewsets.ModelViewSet):
    queryset = Interest.objects.all()
    serializer_class = InterestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user.profile
        return Interest.objects.filter(
            Q(sender=user_profile) | Q(receiver=user_profile)
        )

    def create(self, request, *args, **kwargs):
        receiver_id = request.data.get('receiver')
        if not receiver_id:
            return Response({"error": "Receiver ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = Profile.objects.get(id=receiver_id)
        except Profile.DoesNotExist:
            return Response({"error": "Receiver profile not found."}, status=status.HTTP_404_NOT_FOUND)

        sender = request.user.profile

        if sender == receiver:
            return Response({"error": "You cannot send an interest to yourself."}, status=status.HTTP_400_BAD_REQUEST)

        interest, created = Interest.objects.get_or_create(
            sender=sender, receiver=receiver)

        if not created and interest.status in ['sent', 'accepted']:
            return Response({"error": "An interest has already been sent to this user."}, status=status.HTTP_400_BAD_REQUEST)

        if not created and interest.status == 'rejected':
            interest.status = 'sent'
            interest.save()

        # --- Create Notification for Interest Sent ---
        if created or interest.status == 'sent':
            Notification.objects.create(
                recipient=receiver.user,
                actor_profile=sender,
                verb="sent you an interest request",
                target_profile=receiver
            )
        # -----------------------------------------

        serializer = self.get_serializer(interest)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK, headers=headers)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        interest = self.get_object()
        if interest.receiver.user != request.user:
            return Response({'error': 'You are not authorized to accept this interest.'}, status=status.HTTP_403_FORBIDDEN)

        interest.status = 'accepted'
        interest.save()
        return Response({'status': 'Interest accepted'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        interest = self.get_object()
        if interest.receiver.user != request.user:
            return Response({'error': 'You are not authorized to reject this interest.'}, status=status.HTTP_403_FORBIDDEN)

        interest.status = 'rejected'
        interest.save()
        return Response({'status': 'Interest rejected'})

    def destroy(self, request, *args, **kwargs):
        interest = self.get_object()
        if interest.sender.user != request.user:
            return Response({'error': 'You are not authorized to cancel this interest.'}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)


# --- Notification Views ---
class NotificationListView(generics.ListAPIView):
    """
    List all unread notifications for the current authenticated user.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only unread notifications for the current user, ordered by most recent
        return self.request.user.received_notifications.filter(unread=True).order_by('-created_at')


class MarkNotificationAsReadView(APIView):
    """
    Mark a specific notification or all notifications for the current user as read.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notification_id = request.data.get('id')
        mark_all = request.data.get('all', False)

        if mark_all:
            # Mark all unread notifications for the current user as read
            request.user.received_notifications.filter(
                unread=True).update(unread=False)
            return Response(status=status.HTTP_204_NO_CONTENT)

        if notification_id:
            # Mark a specific notification as read
            notification = get_object_or_404(
                Notification, id=notification_id, recipient=request.user)
            notification.unread = False
            notification.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response({"detail": "Provide 'id' or 'all: true' in the request body."}, status=status.HTTP_400_BAD_REQUEST)


class UnreadNotificationCountView(APIView):
    """
    Returns the count of unread notifications for the current user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = request.user.received_notifications.filter(unread=True).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)


class VerificationDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for users to upload and manage their verification documents.
    Users can only view and upload their own documents.
    """
    serializer_class = VerificationDocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        # Users can only see their own verification documents
        if hasattr(self.request.user, 'profile'):
            return VerificationDocument.objects.filter(profile=self.request.user.profile)
        return VerificationDocument.objects.none()

    def perform_create(self, serializer):
        # Automatically associate the document with the user's profile
        serializer.save(profile=self.request.user.profile)


class AdminVerificationDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admins to review verification documents.
    Only accessible to admin users.
    """
    serializer_class = VerificationDocumentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        # Filter by status if provided, default to pending
        status_filter = self.request.query_params.get('status', 'pending')
        if status_filter:
            return VerificationDocument.objects.filter(status=status_filter).select_related('profile')
        return VerificationDocument.objects.all().select_related('profile')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a verification document and verify the profile.
        """
        document = self.get_object()
        document.status = 'approved'
        document.reviewed_by = request.user
        document.reviewed_at = timezone.now()
        document.admin_notes = request.data.get('admin_notes', '')
        document.save()

        # Update profile verification status
        profile = document.profile
        profile.is_verified = True
        profile.save()

        return Response({
            'status': 'success',
            'message': 'Document approved and profile verified',
            'document_id': document.id,
            'profile_id': profile.id
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject a verification document with optional admin notes.
        """
        document = self.get_object()
        document.status = 'rejected'
        document.reviewed_by = request.user
        document.reviewed_at = timezone.now()
        document.admin_notes = request.data.get(
            'admin_notes', 'Document rejected by admin')
        document.save()

        return Response({
            'status': 'success',
            'message': 'Document rejected',
            'document_id': document.id,
            'admin_notes': document.admin_notes
        })


# ==================== ANALYTICS ENDPOINTS ====================

from rest_framework.decorators import api_view
from api.services.analytics_service import AnalyticsService

@api_view(['GET'])
def get_basic_stats(request):
    """Get basic profile statistics (FREE for all users)"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    profile = request.user.profile
    
    # View counts
    view_count_7d = AnalyticsService.get_view_count(profile, days=7)
    view_count_30d = AnalyticsService.get_view_count(profile, days=30)
    
    # Profile strength
    strength = AnalyticsService.calculate_profile_strength(profile)
    suggestions = AnalyticsService.get_profile_strength_suggestions(profile)
    
    # Engagement metrics
    engagement = AnalyticsService.get_engagement_metrics(profile)
    
    return Response({
        'profile_views_7d': view_count_7d,
        'profile_views_30d': view_count_30d,
        'profile_strength': strength,
        'profile_strength_suggestions': suggestions,
        'total_profile_views': AnalyticsService.get_total_views(profile),
        'interests_sent': engagement['interests_sent'],
        'interests_received': engagement['interests_received'],
        'interests_accepted': engagement['interests_accepted'],
        'acceptance_rate': engagement['acceptance_rate']
    })


@api_view(['GET'])
def who_viewed_me(request):
    """See who viewed your profile (FREE for now, can be premium later)"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    profile = request.user.profile
    days = int(request.GET.get('days', 30))
    
    # Get viewers
    views = AnalyticsService.get_profile_views(profile, days=days)
    
    # Format response
    viewers = []
    for view in views:
        viewers.append({
            'profile_id': view.viewer.id,
            'name': view.viewer.name,
            'age': view.viewer.age,
            'city': view.viewer.current_city,
            'profile_picture': view.viewer.profile_image.url if view.viewer.profile_image else None,
            'viewed_at': view.viewed_at,
            'source': view.source
        })
    
    return Response({
        'total_views': len(viewers),
        'viewers': viewers
    })


@api_view(['GET'])
def get_advanced_analytics(request):
    """Get advanced analytics (FREE for now, can be premium later)"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    profile = request.user.profile
    days = int(request.GET.get('days', 30))
    
    # Daily views for graphing
    daily_views = AnalyticsService.get_daily_views(profile, days=days)
    
    # Demographics
    demographics = AnalyticsService.get_viewer_demographics(profile, days=days)
    
    # Engagement
    engagement = AnalyticsService.get_engagement_metrics(profile)
    
    # Profile strength
    strength = AnalyticsService.calculate_profile_strength(profile)
    
    return Response({
        'daily_views': daily_views,
        'demographics': demographics,
        'engagement': engagement,
        'profile_strength': strength
    })


@api_view(['GET'])
def get_profile_strength(request):
    """Get profile strength score and suggestions (FREE)"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    profile = request.user.profile
    strength = AnalyticsService.calculate_profile_strength(profile)
    suggestions = AnalyticsService.get_profile_strength_suggestions(profile)
    
    return Response({
        'strength_score': strength,
        'suggestions': suggestions,
        'completion_percentage': strength
    })
