from api.models import Profile, Preference
from django.contrib.auth.models import User

def debug_active_user():
    # Sort by updated_at to find the most recently active profile
    recent_profiles = Profile.objects.all().order_by('-updated_at')[:3]
    print(f"--- Top 3 Most Recently Updated Profiles ---")
    for p in recent_profiles:
        has_pref = hasattr(p, 'preference')
        pref_desc = "NONE"
        if has_pref:
            pref = p.preference
            pref_desc = f"Looking for: {pref.looking_for_gender}, Age: {pref.min_age}-{pref.max_age}, Religion: {pref.religion}"
        
        print(f"ID: {p.id} | Name: {p.name} | Gender: {p.gender} | Updated: {p.updated_at} | Pref: {pref_desc}")

debug_active_user()
