from api.serializers import ProfileSerializer
from api.models import Profile
from django.db import transaction
from django.http import QueryDict
import json
import traceback

def run_debug():
    try:
        # Assuming ID 25 as per log "PUT /profiles/25/"
        profile_id = 25
        try:
            instance = Profile.objects.get(id=profile_id)
            print(f"Found Profile ID: {instance.id}")
        except Profile.DoesNotExist:
            instance = Profile.objects.first()
            if not instance:
                return
            print(f"Using Profile ID: {instance.id}")

        # Mimic FormData (all strings)
        # Note: In QueryDict, values are strings.
        data_dict = {
            "profile_for": "self",
            "name": "Dewan Tisha Ahmed",
            "age": "27",
            "date_of_birth": "1999-01-07",
            "gender": "female",
            "height_inches": "60",
            "skin_complexion": "light",
            "blood_group": "AB+",
            "religion": "muslim",
            "current_city": "Oslo",
            "current_country": "NO",
            "origin_city": "Rajshahi",
            "origin_country": "BD",
            "visa_status": "F1",
            "father_occupation": "Doctor",
            "mother_occupation": "Homemaker",
            "siblings": "2",
            "family_type": "nuclear",
            "marital_status": "never_married",
            "siblings_details": "1 Brother (Engineer) – Ahmed Khan\n1 Sister (Student) – Sara Khan",
            "paternal_family_details": "Paternal Grandfather: Mohammad Ali Khan (Retired Teacher)\nPaternal Grandmother: Amina Begum (Homemaker)\nUncles:\nAsim Khan (Doctor)\nFaisal Khan (Businessman)\nAunts:\nBushra Khan (Teacher)\nNadia Khan (Housewife)",
            "maternal_family_details": "Maternal Grandfather: Abdul Rahman (Farmer)\nMaternal Grandmother: Sultana Begum (Homemaker)\nUncles:\nTariq Rahman (Engineer)\nBilal Rahman (Architect)\nAunts:\nNabila Rahman (Doctor)\nShahnaz Rahman (Housewife)",
            "willing_to_relocate": "yes",
            "about": "I am a passionate Muslim woman...",
            "looking_for": "I am seeking a kind...",
            "email": "schy4362@gmail.com",
            "phone": "01950604362",
            "is_activated": "true",
            "profile_image_privacy": "public",
            "additional_images_privacy": "matches",
            "is_deleted": "false",
            "credits": "7",
            "is_unlocked": "true",
            
            # JSON strings as sent by frontend
            "education": '[{"id":9,"degree":"O level","school":"Not specified"}]',
            "work_experience": '[{"id":22,"title":"Freelancer","company":"Not specified","currently_working":false}]',
            "faith_tags": '["Practicing Muslim","Family-Oriented","Halal Diet","Must Speak Bengali"]',
            "preference": '{"id":13,"min_age":25,"min_height_inches":70,"religion":"muslim","marital_statuses":["never_married"],"country":["BD"],"profession":["Manager","Medical Officer","Developer"],"looking_for_gender":"groom","location_preference":"abroad","min_education":"bachelors"}'
        }

        # Create QueryDict
        q = QueryDict('', mutable=True)
        for k, v in data_dict.items():
            q[k] = v
        
        # Verify QueryDict structure
        # print("QueryDict:", q)

        print("\n--- Validating Serializer with QueryDict ---")
        
        serializer = ProfileSerializer(instance, data=q)
        print(f"Field type for faith_tags: {serializer.fields['faith_tags']}")
        print(f"QueryDict.get('faith_tags'): {q.get('faith_tags')}")
        print(f"QueryDict['faith_tags']: {q['faith_tags']}")

        if serializer.is_valid():
            print("Serializer is VALID!")
        else:
            print("Serializer is INVALID!")
            print("Errors:", json.dumps(serializer.errors, indent=2))

    except Exception:
        traceback.print_exc()

run_debug()
