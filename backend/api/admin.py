from django.contrib import admin
from django.utils.html import format_html
from .models import Profile, AdditionalImage, Education, WorkExperience, Preference, VerificationDocument

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
    list_display = ('name', 'user', 'gender', 'is_verified', 'show_on_map', 'created_at')
    list_filter = ('gender', 'is_verified', 'show_on_map', 'created_at')
    search_fields = ('name', 'user__username', 'current_city', 'current_country')
    inlines = [EducationInline, WorkExperienceInline, PreferenceInline, AdditionalImageInline]
    fieldsets = (
        (None, {'fields': ('user', 'profile_for', 'name', 'date_of_birth', 'gender', 'profile_image', 'height_inches', 'father_occupation', 'mother_occupation', 'siblings', 'family_type', 'about', 'looking_for', 'email', 'phone')}),
        ('Faith & Lifestyle', {'fields': ('religion',)}),
        ('Location', {'fields': ('current_city', 'current_country', 'origin_city', 'origin_country')}),
        ('Immigration', {'fields': ('visa_status', 'citizenship')}),
        ('Optional Details', {'fields': ('marital_status', 'blood_group')}),
        ('Social Media', {'fields': ('facebook_profile', 'instagram_profile', 'linkedin_profile')}),
        ('Privacy Settings', {'fields': ('profile_image_privacy', 'additional_images_privacy', 'show_on_map')}),
        ('Verification', {'fields': ('is_verified',)}),
        ('Lifecycle', {'fields': ('is_deleted',)}),
    )

@admin.register(AdditionalImage)
class AdditionalImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'image')
    list_filter = ('profile',)


@admin.register(VerificationDocument)
class VerificationDocumentAdmin(admin.ModelAdmin):
    list_display = ('profile', 'status', 'uploaded_at', 'reviewed_by', 'reviewed_at')
    list_filter = ('status', 'uploaded_at', 'reviewed_at')
    search_fields = ('profile__name', 'profile__email', 'profile__user__username')
    readonly_fields = ('uploaded_at', 'image_preview')
    fieldsets = (
        ('Document Information', {
            'fields': ('profile', 'document_image', 'image_preview', 'status')
        }),
        ('Review Information', {
            'fields': ('reviewed_by', 'reviewed_at', 'admin_notes')
        }),
    )
    
    def image_preview(self, obj):
        """Display a preview of the uploaded document image"""
        if obj.document_image:
            return format_html(
                '<img src="{}" style="max-width: 400px; max-height: 400px; border: 1px solid #ddd; padding: 5px;" /><br>'
                '<a href="{}" target="_blank" style="margin-top: 10px; display: inline-block;">Open Full Size in New Tab</a>', 
                obj.document_image.url, 
                obj.document_image.url
            )
        return "No document uploaded"
    
    image_preview.short_description = "Document Preview"
    
    def save_model(self, request, obj, form, change):
        """Automatically set reviewed_by and reviewed_at when status changes"""
        if change and 'status' in form.changed_data:
            if obj.status in ['approved', 'rejected']:
                obj.reviewed_by = request.user
                from django.utils import timezone
                obj.reviewed_at = timezone.now()
                
                # If approved, verify the profile
                if obj.status == 'approved':
                    obj.profile.is_verified = True
                    obj.profile.save()
        
        super().save_model(request, obj, form, change)
