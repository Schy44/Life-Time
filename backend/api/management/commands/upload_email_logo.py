from django.core.management.base import BaseCommand
from django.conf import settings
from api.storage import SupabaseStorage
from django.core.files import File
import os

class Command(BaseCommand):
    help = 'Uploads the EmailLogo.png to Supabase Storage'

    def handle(self, *args, **options):
        # settings.BASE_DIR is E:\Life_Time\backend
        repo_root = settings.BASE_DIR.parent
        logo_path = repo_root / 'frontend' / 'public' / 'EmailLogo.png'
        
        self.stdout.write(f"Looking for logo at: {logo_path}")
        
        if not logo_path.exists():
            self.stdout.write(self.style.ERROR(f"File not found: {logo_path}"))
            return

        try:
            storage = SupabaseStorage()
            # We'll put it in a 'static' folder to keep it clean, or root if preferred.
            # Let's put it in root for simplicity of URL, or 'assets'
            target_name = 'assets/EmailLogo.png' 

            self.stdout.write(f"Uploading to Supabase bucket '{storage.bucket_name}' at path '{target_name}'...")

            with open(logo_path, 'rb') as f:
                django_file = File(f)
                
                # The SupabaseStorage.save method eventually calls _save which handles update vs upload
                saved_name = storage.save(target_name, django_file)
                self.stdout.write(self.style.SUCCESS(f"Upload completed. Internal name: {saved_name}"))
                
                # Get the URL
                url = storage.url(saved_name)
                self.stdout.write(self.style.SUCCESS(f"Public URL: {url}"))
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            self.stdout.write(self.style.ERROR(f"Upload failed: {str(e)}"))
