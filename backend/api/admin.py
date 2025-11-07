from django.contrib import admin
from .models import Profile, AdditionalImage, Education, WorkExperience, Preference

class AdditionalImageInline(admin.TabularInline):
    model = AdditionalImage
    extra = 1

class EducationInline(admin.TabularInline):
    model = Education
    extra = 1

class WorkExperienceInline(admin.TabularInline):
    model = WorkExperience
    extra = 1

class PreferenceInline(admin.StackedInline):
    model = Preference

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'gender', 'is_verified', 'created_at')
    list_filter = ('gender', 'is_verified', 'created_at')
    search_fields = ('name', 'user__username', 'current_city', 'current_country')
    inlines = [EducationInline, WorkExperienceInline, PreferenceInline, AdditionalImageInline]
    fieldsets = (
        (None, {'fields': ('user', 'profile_for', 'name', 'date_of_birth', 'gender', 'profile_image', 'height_cm', 'father_occupation', 'mother_occupation', 'siblings', 'family_type', 'about', 'looking_for', 'email', 'phone')}),
        ('Faith & Lifestyle', {'fields': ('religion', 'alcohol', 'smoking')}),
        ('Location', {'fields': ('current_city', 'current_country', 'origin_city', 'origin_country')}),
        ('Immigration', {'fields': ('visa_status', 'citizenship')}),
        ('Optional Details', {'fields': ('marital_status', 'blood_group')}),
        ('Social Media', {'fields': ('facebook_profile', 'instagram_profile', 'linkedin_profile')}),
        ('Privacy Settings', {'fields': ('profile_image_privacy', 'additional_images_privacy')}),
        ('Verification', {'fields': ('is_verified',)}),
        ('Lifecycle', {'fields': ('is_deleted',)}),
    )

@admin.register(AdditionalImage)
class AdditionalImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'image')
    list_filter = ('profile',)
