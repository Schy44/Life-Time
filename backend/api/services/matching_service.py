from django.db.models import Q
from ..models import Profile, Interest

class MatchingService:
    @staticmethod
    def calculate_compatibility_score(user_profile, other_profile):
        """
        Calculate mutual compatibility score between two profiles.
        Returns 0-100 or None.
        """
        if not user_profile or not other_profile:
            return None
        
        if user_profile == other_profile:
            return None
        
        # Don't show compatibility for same gender (standard matrimonial rule)
        u_gender = (user_profile.gender or '').lower()
        o_gender = (other_profile.gender or '').lower()
        
        if u_gender and o_gender and u_gender == o_gender:
            return None
        
        # Calculate scores in both directions (mutual compatibility)
        my_score = MatchingService.calculate_one_way_score(user_profile, other_profile)
        their_score = MatchingService.calculate_one_way_score(other_profile, user_profile)
        
        # Return average (mutual compatibility)
        if my_score is None and their_score is None:
            # If both have no preferences, but they are opposite gender, 
            # give a base "curiosity" score so they still show up.
            return 60
        elif my_score is None:
            # Viewer has no preferences, use how well THEY match the other's preferences
            return their_score
        elif their_score is None:
            # Other has no preferences, use how well THEY match the viewer's preferences
            return my_score
        else:
            return int((my_score + their_score) / 2)

    @staticmethod
    def calculate_one_way_score(viewer_profile, viewed_profile):
        """
        Calculate how well viewed_profile matches viewer_profile's preferences.
        Returns score 0-100 or None if no preferences set.
        """
        # Safely check for preference object
        try:
            prefs = viewer_profile.preference
        except (AttributeError, Profile.preference.RelatedObjectDoesNotExist):
            return None

        if not prefs:
            return None
        
        score = 0
        max_score = 0
        
        # 1. AGE (Weight: 25) - Sliding scale with grace range
        if prefs.min_age and prefs.max_age and viewed_profile.age:
            max_score += 25
            age = viewed_profile.age
            
            if prefs.min_age <= age <= prefs.max_age:
                score += 25
            elif prefs.min_age - 2 <= age <= prefs.max_age + 2:
                score += 15
            elif prefs.min_age - 5 <= age <= prefs.max_age + 5:
                score += 5
        
        # 2. RELIGION (Weight: 25)
        if prefs.religion and viewed_profile.religion:
            max_score += 25
            if viewed_profile.religion.lower() == prefs.religion.lower():
                score += 25
        
        # 3. COUNTRY (Weight: 20)
        if prefs.country and viewed_profile.current_country:
            max_score += 20
            if viewed_profile.current_country.upper() == prefs.country.upper():
                score += 20
        
        # 4. MARITAL STATUS (Weight: 15)
        if prefs.marital_statuses and viewed_profile.marital_status:
            max_score += 15
            if isinstance(prefs.marital_statuses, list):
                if viewed_profile.marital_status in prefs.marital_statuses:
                    score += 15
            elif viewed_profile.marital_status == prefs.marital_statuses:
                score += 15
        
        # 5. PROFESSION (Weight: 10)
        if prefs.profession and viewed_profile.work_experience.exists():
            max_score += 10
            viewed_professions = [work.title.lower() for work in viewed_profile.work_experience.all()]
            pref_profs = prefs.profession if isinstance(prefs.profession, list) else [prefs.profession]
            if any(pref_prof.lower() in ' '.join(viewed_professions) for pref_prof in pref_profs):
                score += 10
        
        # 6. HEIGHT (Weight: 10)
        if prefs.min_height_inches and viewed_profile.height_inches:
            max_score += 10
            if viewed_profile.height_inches >= prefs.min_height_inches:
                score += 10
            elif viewed_profile.height_inches >= prefs.min_height_inches - 2:
                score += 5
        
        if max_score == 0:
            # If preferences exist but no overlap in data was found (e.g. viewed_profile is empty)
            # return a baseline score so matching still works
            return 50
        
        return int((score / max_score) * 100)

    @staticmethod
    def get_ranked_recommendations(user_profile, limit=5):
        """
        Fetches and ranks potential matches based on compatibility.
        """
        # 1. Start with a broad pool of the opposite gender
        try:
            gender_preference = getattr(user_profile.preference, 'looking_for_gender', 'any')
        except (AttributeError, Profile.preference.RelatedObjectDoesNotExist):
            gender_preference = 'any'
        
        queryset = Profile.objects.exclude(user=user_profile.user).filter(is_deleted=False)
        
        if gender_preference == 'bride':
            queryset = queryset.filter(gender__iexact='female')
        elif gender_preference == 'groom':
            queryset = queryset.filter(gender__iexact='male')
        else:
            # Fallback based on user gender
            u_gender = (user_profile.gender or '').lower()
            if u_gender == 'male':
                queryset = queryset.filter(gender__iexact='female')
            elif u_gender == 'female':
                queryset = queryset.filter(gender__iexact='male')

        # 2. Optimization: Prefetch relations used in scoring
        queryset = queryset.prefetch_related('work_experience', 'preference')
        
        # 3. Calculate scores and rank
        scored_profiles = []
        for profile in queryset[:100]: # Limit pool size for performance
            score = MatchingService.calculate_compatibility_score(user_profile, profile)
            if score is not None:
                scored_profiles.append({
                    'profile': profile,
                    'score': score
                })
        
        # 4. Sort by score descending
        scored_profiles.sort(key=lambda x: x['score'], reverse=True)
        
        # 5. Take top N
        return scored_profiles[:limit]
