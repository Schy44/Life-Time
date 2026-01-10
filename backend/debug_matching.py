from api.models import Profile, Preference
from django.contrib.auth.models import User

def debug():
    profiles = Profile.objects.all()
    print(f"Total Profiles: {profiles.count()}")
    for p in profiles:
        has_pref = hasattr(p, 'preference')
        pref_desc = "NONE"
        if has_pref:
            pref = p.preference
            pref_desc = f"Looking for: {pref.looking_for_gender}, Age: {pref.min_age}-{pref.max_age}, Religion: {pref.religion}"
        
        print(f"ID: {p.id} | Name: {p.name} | Gender: {p.gender} | Pref: {pref_desc}")

    # Check for clash
    # Example: If all males are looking for females, but no females exist.
    males = Profile.objects.filter(gender='male').count()
    females = Profile.objects.filter(gender='female').count()
    print(f"Summary: {males} Males, {females} Females")

debug()
