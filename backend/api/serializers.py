import json
from datetime import date
from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import models
from .models import (
    Profile, AdditionalImage, Education, WorkExperience, Preference, Interest, 
    Notification, VerificationDocument, AppConfig
)
from subscription.models import Transaction
from .services.matching_service import MatchingService



class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(
        style={'input_type': 'password'}, write_only=True)
    email = serializers.EmailField(required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password2')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def save(self):
        user = User(
            # Use .get for optional field
            email=self.validated_data.get('email', ''),
            username=self.validated_data['username'],
        )
        password = self.validated_data['password']
        password2 = self.validated_data['password2']

        if password != password2:
            raise serializers.ValidationError(
                {'password': 'Passwords must match.'})
        user.set_password(password)
        user.save()
        return user


class AdditionalImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = AdditionalImage
        fields = ('id', 'image', 'image_url', 'caption', 'order', 'uploaded_at')
        read_only_fields = ('uploaded_at',)

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ('id', 'degree', 'school',
                  'field_of_study', 'graduation_year')


class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = ('id', 'title', 'company', 'currently_working')


class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preference
        fields = ('id', 'min_age', 'max_age', 'min_height_inches', 'religion', 'marital_statuses',
                  'country', 'profession', 'looking_for_gender', 'location_preference',
                  'min_education')


class NestedProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('id', 'name', 'profile_image')


class InterestSerializer(serializers.ModelSerializer):
    sender = NestedProfileSerializer(read_only=True)
    receiver = NestedProfileSerializer(read_only=True)

    class Meta:
        model = Interest
        fields = ('id', 'sender', 'receiver',
                  'status', 'share_type', 'created_at', 'updated_at')


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    compatibility_score = serializers.SerializerMethodField()
    interest = serializers.SerializerMethodField()
    credits = serializers.SerializerMethodField()
    additional_images = AdditionalImageSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, required=False)
    work_experience = WorkExperienceSerializer(many=True, required=False)
    preference = PreferenceSerializer(required=False)
    age = serializers.SerializerMethodField()

    # Write-only fields for handling file uploads and nested updates
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )
    additional_images_to_keep = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    clear_profile_image = serializers.BooleanField(write_only=True, required=False)
    education_simple = serializers.CharField(write_only=True, required=False, allow_blank=True)
    profession_simple = serializers.CharField(write_only=True, required=False, allow_blank=True)

    current_country_name = serializers.SerializerMethodField()
    origin_country_name = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            'id', 'user', 'profile_for', 'name', 'age', 'date_of_birth', 'birth_year', 'gender',
            'profile_image', 'additional_images', 'height_inches', 'skin_complexion', 'blood_group', 'religion',
            'current_city', 'current_country', 'current_country_name', 'origin_city', 'origin_country', 'origin_country_name', 'visa_status', 'citizenship',
            'father_occupation', 'mother_occupation', 'siblings', 'family_type', 'marital_status',
            'siblings_details', 'paternal_family_details', 'maternal_family_details',
            'willing_to_relocate', 'lifestyle_priority',
            'about', 'looking_for', 'email', 'phone',
            'facebook_profile', 'instagram_profile', 'linkedin_profile', 'is_verified', 'is_activated',
            'profile_image_privacy', 'additional_images_privacy', 'is_deleted', 'created_at', 'updated_at',
            'education', 'work_experience', 'preference', 'uploaded_images', 'additional_images_to_keep',
            'compatibility_score', 'interest', 'faith_tags', 'clear_profile_image', 'credits',
            'education_simple', 'profession_simple'
        )
        read_only_fields = ('user', 'is_verified', 'is_activated', 'birth_year',
                            'additional_images', 'created_at', 'updated_at', 'interest', 'credits')

    def get_credits(self, obj):
        try:
            return obj.user.wallet.balance
        except:
            return 0

        return super().to_internal_value(data_copy)

    def to_internal_value(self, data):
        # Create a mutable copy of the data
        # If it's a QueryDict (from MulitPartParser), convert to standard dict to avoid quirks
        # but preserve list fields that we explicitly expect.
        if hasattr(data, 'dict') and hasattr(data, 'getlist'):
            data_copy = data.dict() # Gets single/last value for all keys
            # Explicitly preserve valid list fields
            list_fields = ['uploaded_images', 'additional_images_to_keep']
            for field in list_fields:
                if field in data:
                    data_copy[field] = data.getlist(field)
        else:
            # Standard dict or dict-like
            data_copy = data.copy() if hasattr(data, 'copy') else dict(data)

        # The frontend sends some nested data as JSON strings (common with MultiPartParser).
        # We need to parse them BEFORE calling super().to_internal_value()
        json_fields = ['education', 'work_experience', 'preference', 'faith_tags']
        for field in json_fields:
            field_value = data_copy.get(field)
            if field_value and isinstance(field_value, str):
                try:
                    data_copy[field] = json.loads(field_value)
                except (json.JSONDecodeError, TypeError):
                    # We can let super().to_internal_value handle the error or raise here
                    pass

        return super().to_internal_value(data_copy)

    def _coerce_to_int_list(self, value):
        """
        Normalize value into a list of ints.
        Returns:
          - [] if value is None or empty
          - list of ints otherwise (ignores non-int-convertible items)
        """
        if value is None:
            return []
        # If it's already a queryset/list/tuple/set, try to convert each element to int
        if isinstance(value, (list, tuple, set)):
            out = []
            for v in value:
                if v is None:
                    continue
                try:
                    out.append(int(v))
                except (ValueError, TypeError):
                    # skip invalid entries
                    continue
            return out
        # If it's a single integer
        if isinstance(value, int):
            return [value]
        # If it's a string, it might be JSON-parsed list, a comma-separated string, or a single number
        if isinstance(value, str):
            # Try JSON first
            try:
                parsed = json.loads(value)
                return self._coerce_to_int_list(parsed)
            except (json.JSONDecodeError, TypeError):
                pass
            # Try comma-separated
            if ',' in value:
                parts = [p.strip() for p in value.split(',') if p.strip()]
                out = []
                for p in parts:
                    try:
                        out.append(int(p))
                    except (ValueError, TypeError):
                        continue
                return out
            # Last attempt: single number as string
            try:
                return [int(value)]
            except (ValueError, TypeError):
                return []
        # Fallback: try converting single scalar
        try:
            return [int(value)]
        except (ValueError, TypeError):
            return []

    def create(self, validated_data):
        education_data = validated_data.pop('education', [])
        work_experience_data = validated_data.pop('work_experience', [])
        preference_data = validated_data.pop('preference', None)
        uploaded_images = validated_data.pop('uploaded_images', [])

        profile = Profile.objects.create(**validated_data)

        for edu_data in education_data:
            Education.objects.create(profile=profile, **edu_data)

        for work_data in work_experience_data:
            WorkExperience.objects.create(profile=profile, **work_data)

        if preference_data:
            Preference.objects.create(profile=profile, **preference_data)

        for image in uploaded_images:
            AdditionalImage.objects.create(profile=profile, image=image)

        return profile

    def update(self, instance, validated_data):
        # Pop nested data before calling super().update()
        uploaded_images = validated_data.pop('uploaded_images', [])
        additional_images_to_keep = validated_data.pop(
            'additional_images_to_keep', None)
        education_data = validated_data.pop('education', None)
        work_experience_data = validated_data.pop('work_experience', None)
        preference_data = validated_data.pop('preference', None)
        clear_profile_image = validated_data.pop('clear_profile_image', False)
        education_simple = validated_data.pop('education_simple', None)
        profession_simple = validated_data.pop('profession_simple', None)

        # Update the main Profile instance with its own fields
        # This call handles the profile_image update correctly and saves the instance.
        instance = super().update(instance, validated_data)

        if clear_profile_image:
            instance.profile_image = None
            instance.save()

        # --- Handle Additional Images ---
        if additional_images_to_keep is not None:
            # Normalize to list of ints (defensive)
            ids_to_keep = self._coerce_to_int_list(additional_images_to_keep)

            # Delete images that are not in the 'to_keep' list
            # If ids_to_keep is empty list -> exclude(id__in=[]) matches all rows (Django treats it as empty set, so nothing gets excluded),
            # but since we want to delete those NOT in the keep list, passing [] means delete all additional images.
            # That's consistent with a client explicitly sending an empty list to mean "keep none".
            instance.additional_images.exclude(id__in=ids_to_keep).delete()

        for image_data in uploaded_images:
            AdditionalImage.objects.create(profile=instance, image=image_data)

        # --- Handle Education (Create, Update, Delete) ---
        if education_data is not None:
            existing_ids = list(
                instance.education.values_list('id', flat=True))
            incoming_ids = [item.get('id')
                            for item in education_data if item.get('id')]

            for edu_id in existing_ids:
                if edu_id not in incoming_ids:
                    instance.education.get(id=edu_id).delete()

            for item in education_data:
                item_id = item.get('id')
                edu_item_data = {k: v for k, v in item.items() if k != 'id'}
                if item_id:
                    Education.objects.filter(
                        id=item_id, profile=instance).update(**edu_item_data)
                else:
                    Education.objects.create(profile=instance, **edu_item_data)

        # --- Handle Work Experience (Create, Update, Delete) ---
        if work_experience_data is not None:
            existing_ids = list(
                instance.work_experience.values_list('id', flat=True))
            incoming_ids = [item.get('id')
                            for item in work_experience_data if item.get('id')]

            for work_id in existing_ids:
                if work_id not in incoming_ids:
                    instance.work_experience.get(id=work_id).delete()

            for item in work_experience_data:
                item_id = item.get('id')
                work_item_data = {k: v for k, v in item.items() if k != 'id'}
                if item_id:
                    WorkExperience.objects.filter(
                        id=item_id, profile=instance).update(**work_item_data)
                else:
                    WorkExperience.objects.create(
                        profile=instance, **work_item_data)

        # --- Handle Preferences ---
        if preference_data is not None:
            # Defensive check: Ensure JSON fields are lists/dicts, not empty strings
            json_fields = ['marital_statuses', 'profession', 'country']
            for field in json_fields:
                if preference_data.get(field) == '':
                    preference_data[field] = []
            
            Preference.objects.update_or_create(
                profile=instance, defaults=preference_data)

        # --- Handle Simplified Onboarding Fields ---
        if education_simple:
            # Create or update the first education record
            edu = instance.education.first()
            if edu:
                edu.degree = education_simple
                edu.save()
            else:
                Education.objects.create(profile=instance, degree=education_simple, school="Not specified")

        if profession_simple:
            # Create or update the first work record
            work = instance.work_experience.first()
            if work:
                work.title = profession_simple
                work.save()
            else:
                WorkExperience.objects.create(profile=instance, title=profession_simple, company="Not specified")

        return instance

    def get_age(self, obj):
        if obj.date_of_birth:
            today = date.today()
            return today.year - obj.date_of_birth.year - ((today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day))
        elif obj.birth_year:
            return date.today().year - obj.birth_year
        return None

    def get_compatibility_score(self, obj):
        """
        Calculate compatibility score between authenticated user and profile.
        Returns 0-100 score based on weighted preference matching.
        Uses mutual compatibility (average of both directions).
        """
        request = self.context.get('request')
        
        # Validation checks
        if not request or not request.user.is_authenticated:
            return None
        if not hasattr(request.user, 'profile'):
            return None
        if obj == request.user.profile:
            return None
        
        user_profile = request.user.profile
        other_profile = obj
        
        result = MatchingService.calculate_compatibility_score(user_profile, other_profile)
        
        # Extract score from dict (new format) or return raw value (backwards compatibility)
        if result and isinstance(result, dict):
            return result.get('score')
        return result
    

    def get_interest(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_profile = request.user.profile
            interest = Interest.objects.filter(
                (models.Q(sender=user_profile, receiver=obj) |
                 models.Q(sender=obj, receiver=user_profile))
            ).first()
            if interest:
                return InterestSerializer(interest).data
        return None

    def _get_interest(self, requesting_user_profile, profile_owner):
        if not requesting_user_profile or not profile_owner:
            return None
        return Interest.objects.filter(
            (models.Q(sender=requesting_user_profile, receiver=profile_owner) |
             models.Q(sender=profile_owner, receiver=requesting_user_profile)),
            status='accepted'
        ).first()

    def _has_accepted_interest(self, requesting_user_profile, profile_owner):
        return self._get_interest(requesting_user_profile, profile_owner) is not None

    def get_current_country_name(self, obj):
        from .utils.country_utils import get_country_name
        return get_country_name(obj.current_country)

    def get_origin_country_name(self, obj):
        from .utils.country_utils import get_country_name
        return get_country_name(obj.origin_country)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')

        # Initialize defaults
        representation['is_unlocked'] = False
        is_owner = False
        has_accepted_interest = False
        share_type = 'none'

        if request and request.user.is_authenticated:
            try:
                user_profile = request.user.profile
                is_owner = (user_profile == instance)
                
                # Use the _get_interest helper which checks for 'accepted' status
                active_interest = self._get_interest(user_profile, instance)
                if active_interest:
                    has_accepted_interest = True
                    share_type = active_interest.share_type
            except (AttributeError, Profile.DoesNotExist):
                pass
            
        # Profile is "unlocked" (full bio-data/locked fields) if owner or matched
        representation['is_unlocked'] = is_owner or has_accepted_interest
        show_full_details = representation['is_unlocked']

        # --- Image Visibility Logic ---
        # Show profile image if: owner, OR (matched AND share_type is full), OR privacy is public
        show_profile_image = is_owner or \
                            (has_accepted_interest and share_type == 'full') or \
                            (instance.profile_image_privacy == 'public')
        
        # Show additional gallery images if: owner, OR (matched AND share_type is full), OR privacy is public
        show_additional_images = is_owner or \
                               (has_accepted_interest and share_type == 'full') or \
                               (instance.additional_images_privacy == 'public')

        if not show_profile_image:
            representation['profile_image'] = None
        
        if not show_additional_images:
            representation['additional_images'] = []

        # --- Name and Contact Masking ---
        if not show_full_details:
             # Handle Name Privacy (Hybrid: Common Surnames + Initial Fallback)
            full_name = representation.get('name', '')
            common_surnames = [
                'Chowdhury', 'Syed', 'Khan', 'Ali', 'Zaman', 'Haque', 'Ahmed', 
                'Hussain', 'Majumder', 'Talukdar', 'Bhuiyan', 'Rahman', 'Islam', 'Uddin',
                'Siddique', 'Miah', 'Sheikh', 'Ghosh', 'Das', 'Roy'
            ]
            
            words = full_name.split()
            found_surname = None
            for word in words:
                # Clean punctuation from word
                clean_word = "".join(filter(str.isalpha, word))
                if clean_word.capitalize() in common_surnames:
                    found_surname = clean_word.capitalize()
                    break
            
            if found_surname:
                representation['name'] = found_surname
            elif words:
                first_word = words[0]
                representation['name'] = f"{first_word[0].upper()}. {'*' * 5}"
            else:
                representation['name'] = "Member"

            # Mask Social Links and Phone but indicate presence
            social_fields = ['facebook_profile', 'instagram_profile', 'linkedin_profile', 'phone']
            for field in social_fields:
                if representation.get(field):
                    representation[field] = "LOCKED"

        return representation

class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Notification model.
    Includes actor's name, target's name (if any), and dynamic URLs for frontend navigation.
    """
    actor_name = serializers.CharField(source='actor_profile.name', read_only=True)
    target_name = serializers.CharField(source='target_profile.name', read_only=True, allow_null=True)
    actor_profile_url = serializers.SerializerMethodField()
    target_profile_url = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = (
            'id', 'actor_name', 'target_name', 'verb', 'unread', 'created_at',
            'actor_profile_url', 'target_profile_url'
        )

    def get_actor_profile_url(self, obj):
        if obj.actor_profile:
            return f"/profiles/{obj.actor_profile.id}"
        return None
    
    def get_target_profile_url(self, obj):
        if obj.target_profile:
            return f"/profiles/{obj.target_profile.id}"
        return None


class VerificationDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for user verification documents.
    Provides image_url for easy frontend access to uploaded documents.
    """
    image_url = serializers.SerializerMethodField()
    profile_name = serializers.CharField(source='profile.name', read_only=True)
    
    class Meta:
        model = VerificationDocument
        fields = ('id', 'document_image', 'image_url', 'uploaded_at', 
                  'status', 'admin_notes', 'reviewed_at', 'profile_name')
        read_only_fields = ('uploaded_at', 'status', 'admin_notes', 'reviewed_at', 'profile_name')
    
    def get_image_url(self, obj):
        """Return the URL of the uploaded document image"""
        if obj.document_image:
            return obj.document_image.url
        return None


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'amount', 'currency', 'gateway', 'status', 'purpose', 'metadata', 'created_at')
        read_only_fields = ('created_at',)
