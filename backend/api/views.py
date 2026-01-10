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
from .models import Profile, Interest, WorkExperience, Notification, VerificationDocument, MatchUnlock
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from .services.matching_service import MatchingService
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
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class RecommendedMatchesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
            
            # Use MatchingService to get top matches
            # The service handles gender filtering, scoring, and ranking
            limit = int(request.query_params.get('limit', 5))
            ranked_matches = MatchingService.get_ranked_recommendations(profile, limit=limit)
            
            # Serialize profiles using ProfileSerializer to apply privacy/masking logic
            profiles = [item['profile'] for item in ranked_matches]
            serializer = ProfileSerializer(
                profiles, 
                many=True, 
                context={'request': request}
            )
            
            # Combine serialized data with their scores
            data = []
            for i, item in enumerate(serializer.data):
                item['compatibility_score'] = ranked_matches[i]['score']
                data.append(item)
                
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
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
    
    # Import MatchingService for compatibility scores
    from api.services.matching_service import MatchingService
    
    # Format response
    viewers = []
    for view in views:
        visitor = view.viewer
        # Calculate match score
        match_score = MatchingService.calculate_compatibility_score(profile, visitor)
        
        # Consistent Name Masking (Match Discover page logic)
        full_name = visitor.name or "Member"
        common_surnames = [
            'Chowdhury', 'Syed', 'Khan', 'Ali', 'Zaman', 'Haque', 'Ahmed', 
            'Hussain', 'Majumder', 'Talukdar', 'Bhuiyan', 'Rahman', 'Islam', 'Uddin',
            'Siddique', 'Miah', 'Sheikh', 'Ghosh', 'Das', 'Roy'
        ]
        
        words = full_name.split()
        masked_name = "Member"
        
        if words:
            found_surname = None
            for word in words:
                clean_word = "".join(filter(str.isalpha, word))
                if clean_word.capitalize() in common_surnames:
                    found_surname = clean_word.capitalize()
                    break
            
            if found_surname:
                masked_name = found_surname
            else:
                first_word = words[0]
                masked_name = f"{first_word[0].upper()}. {'*' * 5}"
        
        # Get profession
        profession = None
        if visitor.work_experience.exists():
            latest_work = visitor.work_experience.first()
            profession = latest_work.title if latest_work else None
        
        # Get absolute image URL
        profile_picture = None
        if visitor.profile_image:
            profile_picture = request.build_absolute_uri(visitor.profile_image.url)
        
        viewers.append({
            'profile_id': visitor.id,
            'name': masked_name,  # Masked name for privacy
            'age': visitor.age,
            'height': visitor.height,
            'profession': profession,
            'city': visitor.current_city,
            'profile_picture': profile_picture,
            'is_verified': visitor.is_verified,
            'viewed_at': view.viewed_at,
            'source': view.source,
            'match_score': match_score
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
    
    # Search appearances
    search_appearances = AnalyticsService.get_search_appearances(profile, days=days)
    
    # Top keywords
    top_keywords = AnalyticsService.get_top_profile_keywords(profile, days=days)
    
    # Platform averages
    avg_views = AnalyticsService.get_average_user_views(days=days)
    
    # Trends
    view_trend = AnalyticsService.get_view_trend(profile, days=days)
    interest_trend = AnalyticsService.get_interest_trend(profile, days=days)
    
    return Response({
        'daily_views': daily_views,
        'demographics': demographics,
        'engagement': engagement,
        'profile_strength': strength,
        'search_appearances': search_appearances,
        'top_keywords': top_keywords,
        'platform_avg_views': avg_views,
        'view_trend': view_trend,
        'interest_trend': interest_trend
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
@api_view(['POST'])
def unlock_profile(request):
    """
    Unlock a profile by spending credits.
    Requires mutual interest approval.
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
        
    target_profile_id = request.data.get('profile_id')
    if not target_profile_id:
        return Response({'error': 'Profile ID required'}, status=400)
    
    target_profile = get_object_or_404(Profile, id=target_profile_id)
    user_profile = request.user.profile
    
    # Check if already unlocked
    if MatchUnlock.objects.filter(user=request.user, target_profile=target_profile).exists():
        return Response({'message': 'Profile already unlocked'}, status=200)
    
    # Check for mutual interest approval
    interest = Interest.objects.filter(
        (Q(sender=user_profile, receiver=target_profile) | 
         Q(sender=target_profile, receiver=user_profile)),
        status='accepted'
    ).first()
    
    if not interest:
        return Response({'error': 'Mutual interest approval required before unlocking.'}, status=400)
    
    # Check credits
    unlock_cost = 10 # Hardcoded for now, can be dynamic
    
    from subscription.models import CreditWallet
    wallet, created = CreditWallet.objects.get_or_create(user=request.user)
    
    if wallet.balance < unlock_cost:
        return Response({'error': f'Insufficient credits. Need {unlock_cost} credits to unlock.'}, status=400)
    
    # Process unlock
    wallet.deduct_credits(unlock_cost)
    MatchUnlock.objects.create(user=request.user, target_profile=target_profile)
    
    # Notify target user (optional but good for engagement)
    Notification.objects.create(
        recipient=target_profile.user,
        actor_profile=user_profile,
        verb="unlocked your full profile!",
    )
    
    return Response({
        'message': 'Profile unlocked successfully', 
        'new_balance': wallet.balance,
        'unlocked': True
    })
