from django.db import models
from django.conf import settings
from datetime import date

# --- Enums ---
class Religion(models.TextChoices):
    MUSLIM = 'muslim', 'Muslim'
    HINDU = 'hindu', 'Hindu'
    CHRISTIAN = 'christian', 'Christian'

class Alcohol(models.TextChoices):
    NEVER = 'never', 'Never'
    OCCASIONALLY = 'occasionally', 'Occasionally'
    SOCIALLY = 'socially', 'Socially'

class Smoking(models.TextChoices):
    NEVER = 'never', 'Never'
    OCCASIONALLY = 'occasionally', 'Occasionally'
    YES = 'yes', 'Yes'

class SleepCycle(models.TextChoices):
    EARLY_BIRD = 'early_bird', 'Early Bird'
    NIGHT_OWL = 'night_owl', 'Night Owl'

# --- Core ---
class Profile(models.Model):
    PROFILE_FOR_CHOICES = [
        ('self', 'Myself'),
        ('son', 'My Son'),
        ('daughter', 'My Daughter'),
        ('brother', 'My Brother'),
        ('sister', 'My Sister'),
        ('relative', 'Relative/Friend'),
    ]
    GENDER_CHOICES = [('male','Male'), ('female','Female')]
    FAMILY_TYPE_CHOICES = [('nuclear','Nuclear Family'), ('joint','Joint Family')]
    PRIVACY_CHOICES = [('public','Public'), ('matches','Matches Only')]
    MARITAL_STATUS_CHOICES = [
        ('never_married','Never Married'),
        ('divorced','Divorced'),
        ('widowed','Widowed'),
    ]
    BLOOD_GROUP_CHOICES = [
        ('A+','A+'),('A-','A-'),('B+','B+'),('B-','B-'),
        ('AB+','AB+'),('AB-','AB-'),('O+','O+'),('O-','O-'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    profile_for = models.CharField(max_length=20, choices=PROFILE_FOR_CHOICES, default='self')

    # Identity
    name = models.CharField(max_length=100)
    date_of_birth = models.DateField(blank=True, null=True)
    birth_year = models.PositiveSmallIntegerField(blank=True, null=True, db_index=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)

    # Media
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    # Physical
    height_cm = models.PositiveSmallIntegerField(blank=True, null=True, help_text="centimeters")
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, blank=True, null=True)

    # Faith & lifestyle
    religion = models.CharField(max_length=20, choices=Religion.choices, blank=True, null=True)
    alcohol = models.CharField(max_length=20, choices=Alcohol.choices, blank=True, null=True)
    smoking = models.CharField(max_length=20, choices=Smoking.choices, blank=True, null=True)


    # Location (use ISO-3166 alpha-2 codes)
    current_city = models.CharField(max_length=100, blank=True, null=True)
    current_country = models.CharField(max_length=2, blank=True, null=True)  # e.g., 'BD', 'US'
    origin_city = models.CharField(max_length=100, blank=True, null=True)
    origin_country = models.CharField(max_length=2, blank=True, null=True)

    # Immigration (keep simple text now; can normalize later)
    visa_status = models.CharField(max_length=100, blank=True, null=True)
    citizenship = models.CharField(max_length=100, blank=True, null=True)

    # Family
    father_occupation = models.CharField(max_length=100, blank=True, null=True)
    mother_occupation = models.CharField(max_length=100, blank=True, null=True)
    siblings = models.CharField(max_length=20, blank=True, null=True)  # e.g., "1B,2S"
    family_type = models.CharField(max_length=20, choices=FAMILY_TYPE_CHOICES, blank=True, null=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, blank=True, null=True)


    # About & contact
    about = models.TextField(blank=True, null=True)
    looking_for = models.TextField(blank=True, null=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)

    # Extras
    hobbies = models.JSONField(default=list, blank=True)

    # Social media
    facebook_profile = models.URLField(max_length=200, blank=True, null=True)
    instagram_profile = models.URLField(max_length=200, blank=True, null=True)
    linkedin_profile = models.URLField(max_length=200, blank=True, null=True)

    # Verification (keep minimal here; move to separate table if you need auditing)
    is_verified = models.BooleanField(default=False)

    # Privacy
    profile_image_privacy = models.CharField(max_length=20, choices=PRIVACY_CHOICES, default='public')
    additional_images_privacy = models.CharField(max_length=20, choices=PRIVACY_CHOICES, default='matches')


    # Lifecycle
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['current_country', 'current_city']),
            models.Index(fields=['marital_status', 'religion']),
            models.Index(fields=['birth_year']),
        ]

    def __str__(self):
        return self.name

    @property
    def age(self):
        if not self.date_of_birth:
            return None
        t, d = date.today(), self.date_of_birth
        return t.year - d.year - ((t.month, t.day) < (d.month, d.day))

    def save(self, *args, **kwargs):
        self.birth_year = self.date_of_birth.year if self.date_of_birth else None

        super().save(*args, **kwargs)

# --- Normalized child tables ---
class Education(models.Model):
    profile = models.ForeignKey(Profile, related_name='education', on_delete=models.CASCADE)
    degree = models.CharField(max_length=100)
    school = models.CharField(max_length=150)
    field_of_study = models.CharField(max_length=120, blank=True, null=True)
    graduation_year = models.PositiveSmallIntegerField(blank=True, null=True)

class WorkExperience(models.Model):
    profile = models.ForeignKey(Profile, related_name='work_experience', on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    company = models.CharField(max_length=150, blank=True, null=True)
    currently_working = models.BooleanField(default=False)
  
class UserLanguage(models.Model):
    LEVEL = [('A1','A1'),('A2','A2'),('B1','B1'),('B2','B2'),('C1','C1'),('C2','C2'),('native','Native')]
    profile = models.ForeignKey(Profile, related_name='languages', on_delete=models.CASCADE)
    language = models.CharField(max_length=50)
    level = models.CharField(max_length=10, choices=LEVEL, default='native')

    class Meta:
        unique_together = ('profile', 'language')

# --- Preferences (hard filters + a few extensible softs) ---
class Preference(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE)

    # Hard filters
    min_age = models.PositiveSmallIntegerField(blank=True, null=True)
    max_age = models.PositiveSmallIntegerField(blank=True, null=True)
    min_height_cm = models.PositiveSmallIntegerField(blank=True, null=True)
    religion = models.CharField(max_length=20, choices=Religion.choices, blank=True, null=True)
    marital_statuses = models.JSONField(default=list, blank=True)    # e.g., ['never_married']
    country = models.CharField(max_length=2, blank=True, null=True)
    profession = models.CharField(max_length=100, blank=True, null=True)
    require_non_alcoholic = models.BooleanField(default=False)
    require_non_smoker = models.BooleanField(default=False)




class AdditionalImage(models.Model):
    profile = models.ForeignKey(
        Profile, related_name='additional_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='additional_images/')

    def __str__(self):
        return f"Image for {self.profile.name}"


class Interest(models.Model):
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    sender = models.ForeignKey(Profile, related_name='sent_interests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(Profile, related_name='received_interests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('sender', 'receiver')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender.name} -> {self.receiver.name} ({self.status})"