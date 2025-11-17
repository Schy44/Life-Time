from django.db import models
from django.conf import settings
from datetime import date
from api.storage import SupabaseStorage
from django.db.models.signals import post_save
from django.dispatch import receiver

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
  
# --- Preferences (hard filters + a few extensible softs) ---
class Preference(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE)

    # Hard filters
    min_age = models.PositiveSmallIntegerField(blank=True, null=True)
    max_age = models.PositiveSmallIntegerField(blank=True, null=True)
    min_height_cm = models.PositiveSmallIntegerField(blank=True, null=True)
    religion = models.CharField(max_length=20, choices=Religion.choices, blank=True, null=True)
    marital_statuses = models.JSONField(default=list, blank=True, null=True)    # e.g., ['never_married']
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

class Notification(models.Model):
    """
    Stores notifications for users.
    - recipient: The user who receives the notification.
    - actor_profile: The profile of the user who initiated the action.
    - verb: A description of the action (e.g., "viewed your profile").
    - target_profile: Optional, the profile that was the object of the action (e.g., if User A liked User B's profile, User B is the recipient, User A is the actor, and User B's profile is the target).
    - unread: Boolean flag indicating if the notification has been read.
    - created_at: Timestamp of when the notification was created.
    """
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_notifications',
        help_text="The user who should receive this notification."
    )
    actor_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='initiated_notifications',
        help_text="The profile of the user who performed the action."
    )
    verb = models.CharField(
        max_length=255,
        help_text="A short phrase describing the action (e.g., 'viewed your profile')."
    )
    target_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='notifications_about_this_profile',
        null=True,
        blank=True,
        help_text="Optional: The profile that was the object of the action."
    )
    
    unread = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        indexes = [
            models.Index(fields=['recipient', 'unread']),
        ]
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        if self.target_profile:
            return f"{self.actor_profile.name} {self.verb} {self.target_profile.name} for {self.recipient.username}"
        return f"{self.actor_profile.name} {self.verb} for {self.recipient.username}"

    def mark_as_read(self):
        """Marks the notification as read."""
        if self.unread:
            self.unread = False
            self.save(update_fields=['unread'])

    def get_absolute_url(self):
        """Returns the URL to the actor's profile, or target's if more relevant."""
        if self.target_profile:
            return f"/profiles/{self.target_profile.id}"
        return f"/profiles/{self.actor_profile.id}"


@receiver(post_save, sender=Interest)
def create_interest_notification(sender, instance, created, **kwargs):
    """
    Signal receiver to create a notification when an Interest status changes to 'accepted'.
    """
    # Only trigger if an existing Interest object is updated and its status becomes 'accepted'
    if not created and instance.status == 'accepted':
        # Ensure both requester and receiver have profiles
        if hasattr(instance.sender, 'user') and hasattr(instance.receiver, 'user'):
            Notification.objects.create(
                recipient=instance.sender.user,  # The user who sent the request
                actor_profile=instance.receiver, # The profile of the user who accepted it
                verb="accepted your interest request",
                target_profile=instance.sender # The profile that was accepted
            )
