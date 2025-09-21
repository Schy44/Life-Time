from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    PROFILE_FOR_CHOICES = [
        ('self', 'Myself'),
        ('son', 'My Son'),
        ('daughter', 'My Daughter'),
        ('brother', 'My Brother'),
        ('sister', 'My Sister'),
        ('relative', 'Relative/Friend'),
    ]
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
    ]
    FAMILY_TYPE_CHOICES = [
        ('nuclear', 'Nuclear Family'),
        ('joint', 'Joint Family'),
    ]
    PRIVACY_CHOICES = [
        ('public', 'Public'),
        ('matches', 'Matches Only'),
    ]
    MARITAL_STATUS_CHOICES = [
        ('single', 'Single'),
        ('divorced', 'Divorced'),
        ('widowed', 'Widowed'),
    ]
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_for = models.CharField(
        max_length=20, choices=PROFILE_FOR_CHOICES, default='self')
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    location = models.CharField(max_length=100)
    profile_image = models.ImageField(
        upload_to='profile_images/', blank=True, null=True)
    height = models.CharField(max_length=10, blank=True, null=True)
    education = models.CharField(max_length=100, blank=True, null=True)
    profession = models.CharField(max_length=100, blank=True, null=True)
    religion = models.CharField(max_length=50, blank=True, null=True)
    dietary_preference = models.CharField(
        max_length=50, blank=True, null=True)
    lifestyle_habits = models.JSONField(default=list, blank=True)
    living_situation = models.CharField(max_length=50, blank=True, null=True)
    father_occupation = models.CharField(max_length=100, blank=True, null=True)
    mother_occupation = models.CharField(max_length=100, blank=True, null=True)
    siblings = models.CharField(max_length=10, blank=True, null=True)
    family_type = models.CharField(
        max_length=20, choices=FAMILY_TYPE_CHOICES, blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    looking_for = models.TextField(blank=True, null=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)

    # Optional details
    marital_status = models.CharField(
        max_length=20, choices=MARITAL_STATUS_CHOICES, blank=True, null=True)
    languages_spoken = models.JSONField(default=list, blank=True)
    hobbies = models.JSONField(default=list, blank=True)
    blood_group = models.CharField(
        max_length=3, choices=BLOOD_GROUP_CHOICES, blank=True, null=True)

    # Social media
    facebook_profile = models.URLField(max_length=200, blank=True, null=True)
    instagram_profile = models.URLField(max_length=200, blank=True, null=True)
    linkedin_profile = models.URLField(max_length=200, blank=True, null=True)
    document_type = models.CharField(max_length=50, blank=True, null=True)
    document_number = models.CharField(max_length=100, blank=True, null=True)
    verification_document = models.FileField(
        upload_to='verification_documents/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    profile_image_privacy = models.CharField(
        max_length=20, choices=PRIVACY_CHOICES, default='public')
    additional_images_privacy = models.CharField(
        max_length=20, choices=PRIVACY_CHOICES, default='matches')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class AdditionalImage(models.Model):
    profile = models.ForeignKey(
        Profile, related_name='additional_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='additional_images/')

    def __str__(self):
        return f"Image for {self.profile.name}"
