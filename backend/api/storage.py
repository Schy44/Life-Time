from django.core.files.storage import Storage
from django.conf import settings
from django.core.files.base import ContentFile
from supabase import create_client, Client
import os
import logging

logger = logging.getLogger(__name__)


class SupabaseStorage(Storage):
    """
    A custom Django storage backend for Supabase Storage using the official Supabase Python client.
    """

    def __init__(self, bucket_name=None, supabase_url=None, supabase_key=None):
        self.bucket_name = bucket_name or settings.SUPABASE_BUCKET_NAME
        self.supabase_url = supabase_url or settings.SUPABASE_URL
        self.supabase_key = supabase_key or settings.SUPABASE_KEY

        if not self.bucket_name:
            raise ValueError("Supabase bucket name is not configured.")
        if not self.supabase_url:
            raise ValueError("Supabase URL is not configured.")
        if not self.supabase_key:
            raise ValueError("Supabase key is not configured.")

        self._client: Client = create_client(
            self.supabase_url, self.supabase_key)
        logger.info(
            f"SupabaseStorage initialized for bucket: {self.bucket_name}")

    def _save(self, name, content):
        try:
            # ensure at start
            try:
                content.seek(0)
            except Exception:
                pass

            # read bytes (OK for typical images). For large files adopt streaming/TUS.
            file_bytes = content.read()

            # guess content-type
            content_type = getattr(content, "content_type", None)
            if not content_type:
                import mimetypes
                content_type = mimetypes.guess_type(
                    name)[0] or "application/octet-stream"

            options = {"content-type": content_type,
                       "cache-control": "public, max-age=3600", "upsert": "true"}

            # supabase-py may accept bytes or a file-like object
            res = self._client.storage.from_(self.bucket_name).upload(
                path=name,
                file=file_bytes,
                file_options=options
            )

            # Normalize response: SDKs often return dict { "data": ..., "error": ... } or raise.
            if isinstance(res, dict):
                if res.get("error"):
                    raise RuntimeError(
                        f"Supabase upload error: {res['error']}")
                # success
                return name
            # some SDKs return an object; treat any non-exception as success
            return name

        except Exception:
            logger.exception("Failed to upload %s", name)
            if 'res' in locals():
                logger.error("Supabase response: %s", res)
            raise

    def _open(self, name, mode='rb'):
        """
        Open a file from Supabase Storage. (Not strictly necessary for ImageField uploads,
        but good practice for a complete storage backend).
        """
        logger.debug(
            f"Attempting to open file: {name} from bucket: {self.bucket_name}")
        try:
            res = self._client.storage.from_(self.bucket_name).download(name)
            if res.status_code == 200:
                logger.debug(
                    f"Successfully downloaded file: {name} from Supabase.")
                return ContentFile(res.content)
            else:
                error_message = res.json() if res.text else "Unknown error"
                logger.error(
                    f"Supabase download failed for {name}. Status: {res.status_code}, Response: {error_message}")
                raise Exception(f"Supabase download failed: {error_message}")
        except Exception as e:
            logger.exception(
                f"Exception during Supabase file open for {name}: {e}")
            raise

    def exists(self, name):
        """
        Check if a file exists in Supabase Storage.
        """
        logger.debug(
            f"Checking existence of file: {name} in bucket: {self.bucket_name}")
        try:
            parent_path = os.path.dirname(name)
            file_name = os.path.basename(name)

            # Supabase storage list returns a list of objects, not a response object
            objects = self._client.storage.from_(
                self.bucket_name).list(path=parent_path)

            # Check if the file_name exists in the list of objects
            for obj in objects:
                if obj.get('name') == file_name:
                    logger.debug(f"File {name} exists in Supabase.")
                    return True
            logger.debug(f"File {name} does not exist in Supabase.")
            return False
        except Exception as e:
            logger.exception(
                f"Exception during Supabase file existence check for {name}: {e}")
            # If an exception occurs during list, assume file does not exist or cannot be checked
            return False

    def url(self, name):
        """
        Return the public URL for a file.
        """
        logger.debug(
            f"Generating public URL for file: {name} from bucket: {self.bucket_name}")
        try:
            public_url_response = self._client.storage.from_(
                self.bucket_name).get_public_url(name)
            # Supabase get_public_url returns the URL directly, not a response object
            if public_url_response:
                logger.debug(f"Generated public URL: {public_url_response}")
                return public_url_response
            else:
                logger.error(
                    f"Failed to generate public URL for {name}. Response was empty.")
                return None
        except Exception as e:
            logger.exception(
                f"Exception during Supabase URL generation for {name}: {e}")
            return None

    def delete(self, name):
        """
        Delete a file from Supabase Storage.
        """
        logger.debug(
            f"Attempting to delete file: {name} from bucket: {self.bucket_name}")
        try:
            res = self._client.storage.from_(self.bucket_name).remove([name])
            if res.status_code == 200:
                logger.info(
                    f"Successfully deleted file: {name} from Supabase.")
                return True
            else:
                error_message = res.json() if res.text else "Unknown error"
                logger.error(
                    f"Supabase delete failed for {name}. Status: {res.status_code}, Response: {error_message}")
                raise Exception(f"Supabase delete failed: {error_message}")
        except Exception as e:
            logger.exception(
                f"Exception during Supabase file delete for {name}: {e}")
            raise
