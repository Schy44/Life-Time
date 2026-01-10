from api.models import Profile, Preference
try:
    print(f'Profiles: {Profile.objects.count()}')
    print(f'Preferences: {Preference.objects.count()}')
    genders = list(Profile.objects.values_list('gender', flat=True)[:5])
    print(f'Sample Profile Genders: {genders}')
    
    # Check current user (assuming there's at least one)
    p = Profile.objects.first()
    if p:
        print(f'First Profile: {p.name}, Gender: {p.gender}')
        if hasattr(p, "preference"):
             print(f'First Profile Preference Looking For: {p.preference.looking_for_gender}')
        else:
             print('First Profile has NO preference record')
except Exception as e:
    print(f'Error: {e}')
