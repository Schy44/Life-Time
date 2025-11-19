from django.core.files.storage import Storage
from django.conf import settings
from django.core.files.base import ContentFile
from supabase import create_client, Client
import os
import logging
import sys

logger = logging.getLogger(__name__)

class SupabaseStorage(Storage):
    """
    A custom Django storage backend for Supabase Storage using the official Supabase Python client.
    """
    def __init__(self, bucket_name=None, supabase_url=None, supabase_key=None):
        print(f"=== SupabaseStorage __init__ CALLED ===", flush=True, file=sys.stderr)
        self.bucket_name = bucket_name or settings.SUPABASE_BUCKET_NAME
        self.supabase_url = supabase_url or settings.SUPABASE_URL
        self.supabase_key = supabase_key or settings.SUPABASE_KEY

        print(f"DEBUG: bucket_name={self.bucket_name}", flush=True, file=sys.stderr)
        print(f"DEBUG: supabase_url={self.supabase_url}", flush=True, file=sys.stderr)
        print(f"DEBUG: supabase_key={'***' if self.supabase_key else None}", flush=True, file=sys.stderr)

        if not self.bucket_name:
            raise ValueError("Supabase bucket name is not configured.")
        if not self.supabase_url:
            raise ValueError("Supabase URL is not configured.")
        if not self.supabase_key:
            raise ValueError("Supabase key is not configured.")

        self._client: Client = create_client(self.supabase_url, self.supabase_key)
        print(f"DEBUG: SupabaseStorage initialized for bucket: {self.bucket_name}", flush=True, file=sys.stderr)
        logger.info(f"SupabaseStorage initialized for bucket: {self.bucket_name}")

    def _save(self, name, content):
        """
        Save a file to Supabase Storage.
        `name` is the full path within the bucket, e.g., "profile_images/my_photo.jpg"
        `content` is a Django File object.
        """
        print(f"=== STORAGE _save CALLED ===", flush=True, file=sys.stderr)
        print(f"DEBUG: File name: {name}", flush=True, file=sys.stderr)
        print(f"DEBUG: Content type: {type(content)}", flush=True, file=sys.stderr)
        print(f"DEBUG: Bucket: {self.bucket_name}", flush=True, file=sys.stderr)
        
        try:
            name = name.replace('\\', '/')
            print(f"DEBUG: Normalized name: {name}", flush=True, file=sys.stderr)
            
            # Seek to start and read file
            if hasattr(content, 'seek'):
                content.seek(0)
                print(f"DEBUG: Seeked to start of file", flush=True, file=sys.stderr)
            
            file_bytes = content.read() if hasattr(content, 'read') else content
            print(f"DEBUG: Read {len(file_bytes)} bytes from content", flush=True, file=sys.stderr)
            
            if len(file_bytes) == 0:
                print(f"ERROR: File content is empty!", flush=True, file=sys.stderr)
                raise ValueError(f"Cannot upload empty file: {name}")
            
            content_type = content.content_type if hasattr(content, 'content_type') else 'application/octet-stream'
            print(f"DEBUG: Content-Type: {content_type}", flush=True, file=sys.stderr)
            
            # Check if the file already exists
            exists = self.exists(name)
            print(f"DEBUG: File exists check: {exists}", flush=True, file=sys.stderr)
            
            if exists:
                print(f"DEBUG: Updating existing file: {name}", flush=True, file=sys.stderr)
                logger.info(f"File {name} already exists. Attempting to update.")
                res = self._client.storage.from_(self.bucket_name).update(
                    path=name,
                    file=file_bytes,
                    file_options={"content-type": content_type}
                )
            else:
                print(f"DEBUG: Uploading new file: {name}", flush=True, file=sys.stderr)
                logger.info(f"File {name} does not exist. Attempting to upload.")
                res = self._client.storage.from_(self.bucket_name).upload(
                    path=name,
                    file=file_bytes,
                    file_options={"content-type": content_type}
                )

            print(f"DEBUG: Supabase response type: {type(res)}", flush=True, file=sys.stderr)
            print(f"DEBUG: Supabase response: {res}", flush=True, file=sys.stderr)
            
            # Check for success
            if hasattr(res, 'path') and hasattr(res, 'full_path'):
                print(f"DEBUG: Upload SUCCESS! Path: {res.path}", flush=True, file=sys.stderr)
                logger.info(f"Successfully uploaded/updated file: {name} to Supabase. Response: {res}")
                return name
            else:
                print(f"ERROR: Unexpected response format: {res}", flush=True, file=sys.stderr)
                logger.error(f"Supabase upload/update for {name} returned unexpected response: {res}")
                raise Exception(f"Supabase upload/update failed: {res}")
                
        except Exception as e:
            print(f"=== EXCEPTION IN _save ===", flush=True, file=sys.stderr)
            print(f"ERROR: Exception type: {type(e).__name__}", flush=True, file=sys.stderr)
            print(f"ERROR: Exception message: {str(e)}", flush=True, file=sys.stderr)
            import traceback
            print(f"ERROR: Traceback:\n{traceback.format_exc()}", flush=True, file=sys.stderr)
            logger.exception(f"Exception during Supabase file save for {name}: {e}")
            raise

    def _open(self, name, mode='rb'):
        """
        Open a file from Supabase Storage. (Not strictly necessary for ImageField uploads,
        but good practice for a complete storage backend).
        """
        logger.debug(f"Attempting to open file: {name} from bucket: {self.bucket_name}")
        try:
            res = self._client.storage.from_(self.bucket_name).download(name)
            if res.status_code == 200:
                logger.debug(f"Successfully downloaded file: {name} from Supabase.")
                return ContentFile(res.content)
            else:
                error_message = res.json() if res.text else "Unknown error"
                logger.error(f"Supabase download failed for {name}. Status: {res.status_code}, Response: {error_message}")
                raise Exception(f"Supabase download failed: {error_message}")
        except Exception as e:
            logger.exception(f"Exception during Supabase file open for {name}: {e}")
            raise

    def exists(self, name):
        """
        Check if a file exists in Supabase Storage.
        """
        logger.debug(f"Checking existence of file: {name} in bucket: {self.bucket_name}")
        try:
            parent_path = os.path.dirname(name)
            file_name = os.path.basename(name)
            
            # Supabase storage list returns a list of objects, not a response object
            objects = self._client.storage.from_(self.bucket_name).list(path=parent_path)
            
            # Check if the file_name exists in the list of objects
            for obj in objects:
                if obj.get('name') == file_name:
                    logger.debug(f"File {name} exists in Supabase.")
                    return True
            logger.debug(f"File {name} does not exist in Supabase.")
            return False
        except Exception as e:
            logger.exception(f"Exception during Supabase file existence check for {name}: {e}")
            # If an exception occurs during list, assume file does not exist or cannot be checked
            return False

    def url(self, name):
        """
        Return the public URL for a file.
        """
        logger.debug(f"Generating public URL for file: {name} from bucket: {self.bucket_name}")
        try:
            public_url_response = self._client.storage.from_(self.bucket_name).get_public_url(name)
            # Supabase get_public_url returns the URL directly, not a response object
            if public_url_response:
                logger.debug(f"Generated public URL: {public_url_response}")
                return public_url_response
            else:
                logger.error(f"Failed to generate public URL for {name}. Response was empty.")
                return None
        except Exception as e:
            logger.exception(f"Exception during Supabase URL generation for {name}: {e}")
            return None

    def delete(self, name):
        """
        Delete a file from Supabase Storage.
        """
        logger.debug(f"Attempting to delete file: {name} from bucket: {self.bucket_name}")
        try:
            res = self._client.storage.from_(self.bucket_name).remove([name])
            if res.status_code == 200:
                logger.info(f"Successfully deleted file: {name} from Supabase.")
                return True
            else:
                error_message = res.json() if res.text else "Unknown error"
                logger.error(f"Supabase delete failed for {name}. Status: {res.status_code}, Response: {error_message}")
                raise Exception(f"Supabase delete failed: {error_message}")
        except Exception as e:
            logger.exception(f"Exception during Supabase file delete for {name}: {e}")
            raise
