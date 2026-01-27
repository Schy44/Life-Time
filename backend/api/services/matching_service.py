from ..models import Profile, Interest
from ..utils.country_utils import get_country_name

class MatchingService:
    @staticmethod
    def calculate_compatibility_score(user_profile, other_profile):
        """
        Calculate mutual compatibility score between two profiles.
        Returns a dict with 'score' and 'reasons', or None.
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
        my_result = MatchingService.calculate_one_way_score(user_profile, other_profile)
        their_result = MatchingService.calculate_one_way_score(other_profile, user_profile)
        
        # Combine reasons from both directions
        all_reasons = set()
        if my_result and 'reasons' in my_result:
            all_reasons.update(my_result['reasons'])
        if their_result and 'reasons' in their_result:
            all_reasons.update(their_result['reasons'])
        
        # Calculate average score
        my_score = my_result['score'] if my_result else None
        their_score = their_result['score'] if their_result else None
        
        if my_score is None and their_score is None:
            # If both have no preferences, but they are opposite gender, 
            # give a base "curiosity" score so they still show up.
            return {'score': 60, 'reasons': []}
        elif my_score is None:
            final_score = their_score
        elif their_score is None:
            final_score = my_score
        else:
            final_score = int((my_score + their_score) / 2)
        
        return {
            'score': final_score,
            'reasons': list(all_reasons)
        }

    @staticmethod
    def calculate_one_way_score(viewer_profile, viewed_profile):
        """
        Calculate how well viewed_profile matches viewer_profile's preferences.
        Returns dict with 'score' (0-100) and 'reasons' (list), or None if no preferences set.
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
        reasons = []
        
        # 1. AGE (Weight: 25) - Sliding scale with grace range
        if prefs.min_age and prefs.max_age and viewed_profile.age:
            max_score += 25
            age = viewed_profile.age
            
            if prefs.min_age <= age <= prefs.max_age:
                score += 25
                reasons.append('Age')
            elif prefs.min_age - 2 <= age <= prefs.max_age + 2:
                score += 15
                reasons.append('Age')
            elif prefs.min_age - 5 <= age <= prefs.max_age + 5:
                score += 5
        
        # 2. RELIGION (Weight: 25)
        if prefs.religion and viewed_profile.religion:
            max_score += 25
            if viewed_profile.religion.lower() == prefs.religion.lower():
                score += 25
                # reasons.append('Religion') - Hidden as it's a hard filter (redundant)
        
        # 3. COUNTRY (Weight: 20)
        if prefs.country and viewed_profile.current_country:
            max_score += 20
            v_country = viewed_profile.current_country.upper()
            pref_countries = prefs.country if isinstance(prefs.country, list) else [prefs.country]
            if any(v_country == pc.upper() for pc in pref_countries if pc):
                score += 20
                reasons.append('Location')
        
        # 4. MARITAL STATUS (Weight: 15)
        if prefs.marital_statuses and viewed_profile.marital_status:
            max_score += 15
            if isinstance(prefs.marital_statuses, list):
                if viewed_profile.marital_status in prefs.marital_statuses:
                    score += 15
                    reasons.append('Marital Status')
            elif viewed_profile.marital_status == prefs.marital_statuses:
                score += 15
                reasons.append('Marital Status')
        
        # 5. PROFESSION (Weight: 10)
        if prefs.profession and viewed_profile.work_experience.exists():
            max_score += 10
            viewed_professions = [work.title.lower() for work in viewed_profile.work_experience.all()]
            pref_profs = prefs.profession if isinstance(prefs.profession, list) else [prefs.profession]
            if any(pref_prof.lower() in ' '.join(viewed_professions) for pref_prof in pref_profs):
                score += 10
                reasons.append('Profession')
        
        # 6. HEIGHT (Weight: 10)
        if prefs.min_height_inches and viewed_profile.height_inches:
            max_score += 10
            if viewed_profile.height_inches >= prefs.min_height_inches:
                score += 10
                reasons.append('Height')
            elif viewed_profile.height_inches >= prefs.min_height_inches - 2:
                score += 5
        
        if max_score == 0:
            # If preferences exist but no overlap in data was found (e.g. viewed_profile is empty)
            # return a baseline score so matching still works
            return {'score': 50, 'reasons': []}
        
        return {
            'score': int((score / max_score) * 100),
            'reasons': reasons
        }

    @staticmethod
    def get_ranked_recommendations(user_profile, limit=5):
        """
        Fetches and ranks potential matches based on compatibility.
        Returns dict with 'matches' (list of scored profiles), 'is_fallback' (bool), 
        and 'fallback_message' (str or None).
        """
        # Get user preferences
        try:
            prefs = user_profile.preference
            gender_input = getattr(prefs, 'looking_for_gender', 'any')
            religion_pref = getattr(prefs, 'religion', None)
            location_pref = getattr(prefs, 'location_preference', 'any')
            target_country = getattr(prefs, 'country', None)
            marital_status_pref = getattr(prefs, 'marital_statuses', [])
        except (AttributeError, Profile.preference.RelatedObjectDoesNotExist):
            prefs = None
            gender_input = 'any'
            religion_pref = None
            location_pref = 'any'
            target_country = None
            marital_status_pref = []

        def apply_hard_filters(queryset, include_country=True):
            """Apply hard filters (gender, religion, optionally country)"""
            # --- GENDER FILTER (HARD) ---
            if gender_input == 'bride':
                queryset = queryset.filter(gender__iexact='female')
            elif gender_input == 'groom':
                queryset = queryset.filter(gender__iexact='male')
            elif gender_input == 'any':
                pass  # No gender filter
            else:
                # Fallback (legacy logic): Match opposite gender
                u_gender = (user_profile.gender or '').lower()
                if u_gender == 'male':
                    queryset = queryset.filter(gender__iexact='female')
                elif u_gender == 'female':
                    queryset = queryset.filter(gender__iexact='male')
            
            # --- RELIGION FILTER (HARD) ---
            if religion_pref:
                queryset = queryset.filter(religion__iexact=religion_pref)
            
            # --- LOCATION FILTER (CONDITIONAL) ---
            if include_country and location_pref != 'any':
                if location_pref == 'near_me':
                    # Strictly local
                    if user_profile.current_country:
                        queryset = queryset.filter(current_country=user_profile.current_country)
                
                elif location_pref == 'abroad':
                    # Strictly abroad
                    if target_country:
                        if isinstance(target_country, list):
                             queryset = queryset.filter(current_country__in=target_country)
                        else:
                             queryset = queryset.filter(current_country=target_country)
                    else:
                        # Generic "abroad" means NOT my country
                        if user_profile.current_country:
                            queryset = queryset.exclude(current_country=user_profile.current_country)

            # --- MARITAL STATUS FILTER (HARD) ---
            if marital_status_pref:
                if isinstance(marital_status_pref, list) and len(marital_status_pref) > 0:
                    queryset = queryset.filter(marital_status__in=marital_status_pref)
                elif isinstance(marital_status_pref, str):
                    queryset = queryset.filter(marital_status=marital_status_pref)
            
            return queryset

        # 1. Start with base queryset
        base_queryset = Profile.objects.exclude(user=user_profile.user).filter(is_deleted=False)
        
        # 2. First attempt: Apply ALL hard filters (including country)
        queryset = apply_hard_filters(base_queryset.all(), include_country=True)
        queryset = queryset.prefetch_related('work_experience', 'preference')
        
        # 3. Calculate scores and rank
        scored_profiles = []
        for profile in queryset[:100]:  # Limit pool size for performance
            result = MatchingService.calculate_compatibility_score(user_profile, profile)
            if result is not None:
                scored_profiles.append({
                    'profile': profile,
                    'score': result['score'],
                    'reasons': result['reasons']
                })
        
        # 4. Sort by score descending
        scored_profiles.sort(key=lambda x: x['score'], reverse=True)
        
        # 5. Check if we have enough matches
        is_fallback = False
        fallback_message = None
        
        if len(scored_profiles) < 3 and location_pref != 'any':
            # Not enough matches with country filter - retry without it
            queryset_fallback = apply_hard_filters(base_queryset.all(), include_country=False)
            queryset_fallback = queryset_fallback.prefetch_related('work_experience', 'preference')
            
            scored_profiles_fallback = []
            for profile in queryset_fallback[:100]:
                result = MatchingService.calculate_compatibility_score(user_profile, profile)
                if result is not None:
                    scored_profiles_fallback.append({
                        'profile': profile,
                        'score': result['score'],
                        'reasons': result['reasons']
                    })
            
            scored_profiles_fallback.sort(key=lambda x: x['score'], reverse=True)
            
            if len(scored_profiles_fallback) > len(scored_profiles):
                # Use fallback results
                scored_profiles = scored_profiles_fallback
                is_fallback = True
                
                # Generate appropriate message
                if location_pref == 'near_me':
                    code = user_profile.current_country
                    country_name = get_country_name(code) if code else 'your country'
                    fallback_message = f"We didn't find enough matches in {country_name}, but here are other highly compatible profiles you might like."
                elif location_pref == 'abroad' and target_country:
                    country_name = get_country_name(target_country)
                    fallback_message = f"We didn't find enough matches in {country_name}, but here are other highly compatible profiles you might like."
                else:
                    fallback_message = "We didn't find enough matches with your location preference, but here are other highly compatible profiles you might like."
        
        # 6. Take top N
        top_matches = scored_profiles[:limit]
        
        return {
            'matches': top_matches,
            'is_fallback': is_fallback,
            'fallback_message': fallback_message
        }
