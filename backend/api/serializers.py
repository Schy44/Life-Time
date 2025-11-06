import json
from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import models
from .models import Profile, AdditionalImage, Education, WorkExperience, Preference, Interest


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
            email=self.validated_data.get('email', ''), # Use .get for optional field
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
    class Meta:
        model = AdditionalImage
        fields = ('id', 'image')

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ('id', 'degree', 'school', 'field_of_study', 'graduation_year')

class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = ('id', 'title', 'company', 'currently_working')



class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preference
        fields = ('id', 'min_age', 'max_age', 'min_height_cm', 'religion', 'marital_statuses', 'country', 'profession', 'require_non_alcoholic', 'require_non_smoker')

class NestedProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('id', 'name', 'profile_image')

class InterestSerializer(serializers.ModelSerializer):
    sender = NestedProfileSerializer(read_only=True)
    receiver = NestedProfileSerializer(read_only=True)

    class Meta:
        model = Interest
        fields = ('id', 'sender', 'receiver', 'status', 'created_at', 'updated_at')

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    compatibility_score = serializers.SerializerMethodField()
    additional_images = AdditionalImageSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, required=False)
    work_experience = WorkExperienceSerializer(many=True, required=False)


    preference = PreferenceSerializer(required=False)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(
            max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    additional_images_to_keep = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Profile
        fields = (
            'id', 'user', 'profile_for', 'name', 'date_of_birth', 'birth_year', 'gender',
            'profile_image', 'additional_images', 'height_cm', 'blood_group', 'religion', 'alcohol', 'smoking',
            'current_city', 'current_country', 'origin_city', 'origin_country', 'visa_status', 'citizenship',
            'father_occupation', 'mother_occupation', 'siblings', 'family_type', 'marital_status', 'about', 'looking_for', 'email', 'phone',
            'facebook_profile', 'instagram_profile', 'linkedin_profile', 'is_verified',
            'profile_image_privacy', 'additional_images_privacy', 'is_deleted', 'created_at', 'updated_at',
            'education', 'work_experience', 'preference', 'uploaded_images', 'additional_images_to_keep',
            'compatibility_score'
        )
        read_only_fields = ('user', 'is_verified', 'birth_year',
                            'additional_images', 'created_at', 'updated_at',)

    def get_compatibility_score(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated or not hasattr(request.user, 'profile') or obj == request.user.profile:
            return None

        user_profile = request.user.profile

        # Don't show compatibility score for same gender
        if user_profile.gender == obj.gender:
            return None
        if not hasattr(user_profile, 'preference'):
            return None # Return None if the user has no preference object

        preferences = user_profile.preference
        score = 0
        max_score = 0

        # Age
        if preferences.min_age is not None and preferences.max_age is not None and obj.age is not None:
            max_score += 20 # Higher weight for age
            if preferences.min_age <= obj.age <= preferences.max_age:
                score += 20

        # Height
        if preferences.min_height_cm is not None and obj.height_cm is not None:
            max_score += 10 # Lower weight for height
            if preferences.min_height_cm <= obj.height_cm:
                score += 10

        # Religion
        if preferences.religion and obj.religion:
            max_score += 20 # Higher weight for religion
            if obj.religion == preferences.religion:
                score += 20

        # Marital Status
        if preferences.marital_statuses and obj.marital_status:
            max_score += 15 # Medium weight for marital status
            if obj.marital_status in preferences.marital_statuses:
                score += 15

        # Country
        if preferences.country and obj.current_country:
            max_score += 15 # Medium weight for country
            if obj.current_country == preferences.country:
                score += 15
        
        # Profession
        if preferences.profession and obj.work_experience.exists():
            max_score += 10
            if preferences.profession.lower() in [work.title.lower() for work in obj.work_experience.all()]:
                score += 10

        # Alcohol
        if preferences.require_non_alcoholic and obj.alcohol:
            max_score += 5 # Lower weight for lifestyle
            if obj.alcohol == 'never':
                score += 5
        
        # Smoking
        if preferences.require_non_smoker and obj.smoking:
            max_score += 5 # Lower weight for lifestyle
            if obj.smoking == 'never':
                score += 5

        if max_score == 0:
            return 0 # Return 0 if no preferences are set

        return int((score / max_score) * 100)

    def _has_accepted_interest(self, requesting_user_profile, profile_owner):
        if not requesting_user_profile or not profile_owner:
            return False
        return Interest.objects.filter(
            (models.Q(sender=requesting_user_profile, receiver=profile_owner) |
             models.Q(sender=profile_owner, receiver=requesting_user_profile)),
            status='accepted'
        ).exists()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')

        if request and request.user.is_authenticated and request.user.profile != instance:
            requesting_user_profile = request.user.profile
            profile_owner = instance

            has_accepted_interest = self._has_accepted_interest(requesting_user_profile, profile_owner)

            # Handle profile_image privacy
            if instance.profile_image_privacy == 'matches' and not has_accepted_interest:
                representation['profile_image'] = None
            
            # Handle additional_images privacy
            if instance.additional_images_privacy == 'matches' and not has_accepted_interest:
                representation['additional_images'] = []



        return representation

    def to_internal_value(self, data):
        # Manually create a mutable dictionary from the QueryDict
        mutable_data = {}
        for key, value in data.lists():
            if len(value) == 1:
                mutable_data[key] = value[0]
            else:
                mutable_data[key] = value

        profile_image = mutable_data.pop('profile_image', None) # Pop profile_image here

        # --- Coerce JSON strings to Python objects ---
        json_fields = ['education', 'work_experience',
                       'preference', 'additional_images_to_keep']
        for field in json_fields:
            if field in mutable_data and isinstance(mutable_data[field], str):
                try:
                    mutable_data[field] = json.loads(mutable_data[field])
                except (json.JSONDecodeError, TypeError):
                    raise serializers.ValidationError(
                        {field: f"Invalid JSON format for {field}."})

        # --- Handle image clearing ---
        if profile_image == '': # Check the popped profile_image
            profile_image = None

        internal_value = super().to_internal_value(mutable_data)
        if profile_image is not None:
            internal_value['profile_image'] = profile_image
        return internal_value

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
        # Pop file fields (profile_image is already handled in to_internal_value)
        uploaded_images = validated_data.pop('uploaded_images', [])

        # Pop nested data
        education_data = validated_data.pop('education', None)
        work_experience_data = validated_data.pop('work_experience', None)
        preference_data = validated_data.pop('preference', None)
        additional_images_to_keep = validated_data.pop('additional_images_to_keep', None)

        # --- Update main profile fields (including hobbies and languages) ---
        instance = super().update(instance, validated_data)

        # Handle additional images
        if additional_images_to_keep is not None:
            instance.additional_images.exclude(id__in=additional_images_to_keep).delete()

        for image in uploaded_images:
            AdditionalImage.objects.create(profile=instance, image=image)

        # --- Handle Education (Create, Update, Delete) ---
        if education_data is not None:
            existing_ids = instance.education.values_list('id', flat=True)
            incoming_ids = [item.get('id') for item in education_data if item.get('id')]
            
            # Delete
            for edu_id in existing_ids:
                if edu_id not in incoming_ids:
                    instance.education.get(id=edu_id).delete()
            
            # Create or Update
            for item in education_data:
                item_id = item.get('id')
                if item_id:
                    Education.objects.filter(id=item_id, profile=instance).update(**item)
                else:
                    Education.objects.create(profile=instance, **item)

        # --- Handle Work Experience (Create, Update, Delete) ---
        if work_experience_data is not None:
            existing_ids = instance.work_experience.values_list('id', flat=True)
            incoming_ids = [item.get('id') for item in work_experience_data if item.get('id')]

            for work_id in existing_ids:
                if work_id not in incoming_ids:
                    instance.work_experience.get(id=work_id).delete()

            for item in work_experience_data:
                item_id = item.get('id')
                if item_id:
                    WorkExperience.objects.filter(id=item_id, profile=instance).update(**item)
                else:
                    WorkExperience.objects.create(profile=instance, **item)

        # --- Handle Preferences ---
        if preference_data is not None:
            Preference.objects.update_or_create(profile=instance, defaults=preference_data)

        instance.save() # Save the instance after all updates
        return instance
