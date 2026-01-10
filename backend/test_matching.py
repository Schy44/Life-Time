from api.models import Profile, Preference, Religion
from api.services.matching_service import MatchingService
from django.contrib.auth.models import User

def test():
    print("--- Testing Matching Logic ---")
    
    # Create or get profiles for testing
    u1, _ = User.objects.get_or_create(username="test_user_1")
    p1, _ = Profile.objects.get_or_create(user=u1, name="Test User 1", gender="male")
    
    u2, _ = User.objects.get_or_create(username="test_user_2")
    p2, _ = Profile.objects.get_or_create(user=u2, name="Test User 2", gender="female")
    
    # Test 1: No preferences at all
    print(f"Test 1 (No preferences): {MatchingService.calculate_compatibility_score(p1, p2)}")
    
    # Test 2: Only one has preferences
    pref1, _ = Preference.objects.get_or_create(profile=p1)
    pref1.looking_for_gender = 'bride'
    pref1.min_age = 20
    pref1.max_age = 30
    pref1.religion = 'muslim'
    pref1.save()
    
    # Update p1 to ensure relation is fresh
    p1.refresh_from_db()
    
    print(f"Test 2 (P1 has pref, P2 none): {MatchingService.calculate_compatibility_score(p1, p2)}")
    
    # Test 3: Recommendation list
    recs = MatchingService.get_ranked_recommendations(p1)
    print(f"Test 3 (Recs for P1): Found {len(recs)} matches")

test()
