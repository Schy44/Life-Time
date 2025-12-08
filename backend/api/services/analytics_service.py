"""
Analytics service for profile performance tracking
"""
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from api.models import Profile, ProfileView, Interest, AnalyticsSnapshot


class AnalyticsService:
    
    @staticmethod
    def track_profile_view(viewer_profile, viewed_profile, source='direct'):
        """Track a profile view"""
        try:
            # Don't track self-views
            if viewer_profile == viewed_profile:
                return None
            
            # Create view record
            view = ProfileView.objects.create(
                viewer=viewer_profile,
                viewed_profile=viewed_profile,
                source=source
            )
            

            
            return view
        except Exception as e:
            # Log the error but don't break the profile view
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error tracking profile view: {e}")
            return None
    
    @staticmethod
    def get_profile_views(profile, days=30):
        """Get profile views for last N days"""
        since = timezone.now() - timedelta(days=days)
        return ProfileView.objects.filter(
            viewed_profile=profile,
            viewed_at__gte=since
        ).select_related('viewer', 'viewer__user')
    
    @staticmethod
    def get_view_count(profile, days=30):
        """Get view count for last N days"""
        since = timezone.now() - timedelta(days=days)
        return ProfileView.objects.filter(
            viewed_profile=profile,
            viewed_at__gte=since
        ).count()

    @staticmethod
    def get_total_views(profile):
        """Get total view count"""
        return ProfileView.objects.filter(viewed_profile=profile).count()
    
    @staticmethod
    def get_daily_views(profile, days=30):
        """Get daily view counts for graphing"""
        since = timezone.now() - timedelta(days=days)
        
        # Get views grouped by date
        from django.db.models.functions import TruncDate
        views = ProfileView.objects.filter(
            viewed_profile=profile,
            viewed_at__gte=since
        ).annotate(
            date=TruncDate('viewed_at')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        return list(views)
    
    @staticmethod
    def calculate_profile_strength(profile):
        """Calculate profile completion score (0-100)"""
        score = 0
        
        # Basic info (30 points)
        if profile.name:
            score += 5
        if profile.date_of_birth:
            score += 5
        if profile.gender:
            score += 5
        if profile.about and len(profile.about) >= 50:
            score += 10
        elif profile.about:
            score += 5
        if profile.current_city:
            score += 5
        
        # Photos (20 points)
        photo_count = profile.additional_images.count()
        if profile.profile_image:
            score += 10
        if photo_count >= 3:
            score += 10
        elif photo_count >= 1:
            score += 5
        
        # Preferences (15 points)
        if hasattr(profile, 'preference'):
            pref = profile.preference
            if pref.min_age and pref.max_age:
                score += 5
            if pref.religion:
                score += 5
            if pref.country:
                score += 5
        
        # Professional (15 points)
        if profile.work_experience.exists():
            score += 10
        if profile.education.exists():
            score += 5
        
        # Personal (10 points)
        if profile.religion:
            score += 5
        if profile.faith_tags:
            score += 5
        
        # Verification (10 points)
        if profile.is_verified:
            score += 10
        
        return min(score, 100)
    
    @staticmethod
    def get_profile_strength_suggestions(profile):
        """Get suggestions to improve profile"""
        suggestions = []
        
        # Critical suggestions
        if not profile.profile_image:
            suggestions.append({
                'type': 'critical',
                'message': 'Add a profile picture to increase visibility by 80%',
                'action': 'upload_photo',
                'points': 10
            })
        
        # Important suggestions
        if profile.additional_images.count() < 3:
            missing = 3 - profile.additional_images.count()
            suggestions.append({
                'type': 'important',
                'message': f'Add {missing} more photos to complete your gallery',
                'action': 'upload_photos',
                'points': 10 if missing == 3 else 5
            })
        
        if not profile.about or len(profile.about) < 50:
            suggestions.append({
                'type': 'important',
                'message': 'Write a detailed bio (at least 50 characters)',
                'action': 'edit_bio',
                'points': 10
            })
        
        # Recommended suggestions
        if not profile.work_experience.exists():
            suggestions.append({
                'type': 'recommended',
                'message': 'Add your work experience',
                'action': 'add_work',
                'points': 10
            })
        
        if not profile.education.exists():
            suggestions.append({
                'type': 'recommended',
                'message': 'Add your education',
                'action': 'add_education',
                'points': 5
            })
        
        if not profile.is_verified:
            suggestions.append({
                'type': 'recommended',
                'message': 'Get your profile verified',
                'action': 'verify_profile',
                'points': 10
            })
        
        return suggestions
    
    @staticmethod
    def get_viewer_demographics(profile, days=30):
        """Get demographics of people who viewed profile"""
        since = timezone.now() - timedelta(days=days)
        viewers = ProfileView.objects.filter(
            viewed_profile=profile,
            viewed_at__gte=since
        ).values_list('viewer', flat=True).distinct()
        
        viewer_profiles = Profile.objects.filter(id__in=viewers)
        
        # Age distribution
        age_ranges = {
            '18-25': 0,
            '26-30': 0,
            '31-35': 0,
            '36-40': 0,
            '40+': 0
        }
        
        # Religion distribution
        religion_dist = {}
        
        # Location distribution
        location_dist = {}
        
        for viewer in viewer_profiles:
            # Age
            age = viewer.age
            if age:
                if 18 <= age <= 25:
                    age_ranges['18-25'] += 1
                elif 26 <= age <= 30:
                    age_ranges['26-30'] += 1
                elif 31 <= age <= 35:
                    age_ranges['31-35'] += 1
                elif 36 <= age <= 40:
                    age_ranges['36-40'] += 1
                else:
                    age_ranges['40+'] += 1
            
            # Religion
            if viewer.religion:
                religion_dist[viewer.religion] = religion_dist.get(viewer.religion, 0) + 1
            
            # Location
            if viewer.current_city:
                location_dist[viewer.current_city] = location_dist.get(viewer.current_city, 0) + 1
        
        return {
            'age_distribution': age_ranges,
            'religion_distribution': religion_dist,
            'location_distribution': location_dist,
            'total_viewers': len(viewers)
        }
    
    @staticmethod
    def get_engagement_metrics(profile):
        """Get engagement metrics"""
        # Interests
        interests_sent = Interest.objects.filter(sender=profile).count()
        interests_received = Interest.objects.filter(receiver=profile).count()
        interests_accepted = Interest.objects.filter(
            sender=profile,
            status='accepted'
        ).count()
        
        # Calculate acceptance rate
        acceptance_rate = 0
        if interests_sent > 0:
            acceptance_rate = (interests_accepted / interests_sent) * 100
        
        return {
            'interests_sent': interests_sent,
            'interests_received': interests_received,
            'interests_accepted': interests_accepted,
            'acceptance_rate': round(acceptance_rate, 1)
        }
