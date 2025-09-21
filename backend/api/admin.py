from django.contrib import admin
from .models import Profile, AdditionalImage

class AdditionalImageInline(admin.TabularInline):
    model = AdditionalImage
    extra = 1

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'age', 'gender', 'location', 'is_verified', 'created_at')
    list_filter = ('gender', 'location', 'is_verified', 'created_at')
    search_fields = ('name', 'user__username', 'location')
    inlines = [AdditionalImageInline]
    fieldsets = (
        (None, {'fields': ('user', 'profile_for', 'name', 'age', 'gender', 'location', 'profile_image', 'height', 'education', 'profession', 'religion', 'father_occupation', 'mother_occupation', 'siblings', 'family_type', 'about', 'looking_for', 'email', 'phone')}),
        ('Optional Details', {'fields': ('marital_status', 'languages_spoken', 'hobbies', 'blood_group')}),
        ('Social Media', {'fields': ('facebook_profile', 'instagram_profile', 'linkedin_profile')}),
        ('Privacy Settings', {'fields': ('profile_image_privacy', 'additional_images_privacy')}),
        ('Verification', {'fields': ('verification_document', 'is_verified')}),
    )

@admin.register(AdditionalImage)
class AdditionalImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'image')
    list_filter = ('profile',)
