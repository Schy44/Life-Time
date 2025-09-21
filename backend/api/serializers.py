import json
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, AdditionalImage


class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(
        style={'input_type': 'password'}, write_only=True)
    name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'name', 'password', 'password2')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def save(self):
        user = User(
            email=self.validated_data['email'],
            username=self.validated_data['username'],
            first_name=self.validated_data['name']
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


class ProfileSerializer(serializers.ModelSerializer):
    additional_images = AdditionalImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(
            max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    additional_images_to_keep = serializers.CharField(
        write_only=True, required=False)

    class Meta:
        model = Profile
        fields = (
            'id', 'user', 'profile_for', 'name', 'age', 'gender', 'location',
            'profile_image', 'additional_images', 'height', 'education', 'profession', 'religion', 'father_occupation',
            'mother_occupation', 'siblings', 'family_type', 'about', 'looking_for', 'email', 'phone',
            'marital_status', 'languages_spoken', 'hobbies', 'blood_group', 'facebook_profile',
            'instagram_profile', 'linkedin_profile', 'document_type', 'document_number', 'verification_document', 'is_verified',
            'profile_image_privacy', 'additional_images_privacy', 'uploaded_images', 'created_at', 'updated_at', 'additional_images_to_keep',
            'dietary_preference', 'lifestyle_habits', 'living_situation'
        )
        read_only_fields = ('user', 'is_verified',
                            'additional_images', 'created_at', 'updated_at',)

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        profile = Profile.objects.create(**validated_data)
        for image in uploaded_images:
            AdditionalImage.objects.create(profile=profile, image=image)
        return profile

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        additional_images_to_keep = validated_data.pop(
            'additional_images_to_keep', '[]')
        additional_images_to_keep = json.loads(additional_images_to_keep)

        # Handle profile_image update
        profile_image = validated_data.get('profile_image')
        if profile_image == '':  # Signal to clear the image
            instance.profile_image = None
        elif profile_image is not None:
            instance.profile_image = profile_image

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle additional images
        # Delete images not in additional_images_to_keep
        for existing_image in instance.additional_images.all():
            if existing_image.id not in additional_images_to_keep:
                existing_image.delete()

        # Add new uploaded images
        for image in uploaded_images:
            AdditionalImage.objects.create(profile=instance, image=image)

        return instance
