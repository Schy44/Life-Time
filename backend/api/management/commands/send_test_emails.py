from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from api.services.email_service import EmailService
from api.models import Profile, Interest, Religion
from subscription.models import Transaction, CreditWallet
from django.contrib.auth import get_user_model
from unittest.mock import MagicMock
import uuid

User = get_user_model()

class Command(BaseCommand):
    help = 'Sends test emails to a specified address for verification'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='The email address to send test emails to')

    def handle(self, *args, **options):
        recipient_email = options['email']
        self.stdout.write(f"Preparing to send test emails to: {recipient_email}")

        # --- Mock User & Profile for Receiver ---
        # We don't save these to DB to avoid clutter, we mock objects or create temporary ones
        # For templates logic to work, objects need attributes. 
        # Safest is to use temporary MagicMocks with necessary attributes.

        receiver_user = MagicMock(spec=User)
        receiver_user.email = recipient_email
        receiver_user.username = "recipient_user"
        
        receiver_profile = MagicMock(spec=Profile)
        receiver_profile.user = receiver_user
        receiver_profile.name = "Test Receiver"
        receiver_profile.id = 99999
        receiver_profile.phone = "+8801700000000"
        receiver_profile.age = 28
        receiver_profile.religion = "Muslim"
        receiver_profile.current_city = "Dhaka"
        receiver_profile.current_country = "BD"
        
        # Determine profession (complex logic in template, needs work_experience)
        # Mocking related manager
        work_mock = MagicMock()
        work_mock.title = "Software Engineer"
        work_mock.currently_working = True
        
        receiver_profile.work_experience.filter.return_value.first.return_value = work_mock
        receiver_profile.work_experience.first.return_value = work_mock
        
        receiver_profile.profile_image = MagicMock()
        receiver_profile.profile_image.url = "https://airogkqmcjqvvipdwnwh.supabase.co/storage/v1/object/public/LT_Images/profile_images/placeholder.png"

        # --- Mock User & Profile for Sender ---
        sender_user = MagicMock(spec=User)
        sender_user.email = "sender@example.com"
        
        sender_profile = MagicMock(spec=Profile)
        sender_profile.user = sender_user
        sender_profile.name = "Test Sender"
        sender_profile.current_city = "London"
        sender_profile.current_country = "GB"

        # --- 1. Payment Confirmation Email ---
        self.stdout.write("Sending Payment Confirmation Email...")
        transaction = MagicMock(spec=Transaction)
        transaction.user = receiver_user
        transaction.transaction_id = f"txn_{uuid.uuid4().hex[:8]}"
        transaction.created_at = timezone.now()
        transaction.amount = 500.00
        transaction.currency = 'BDT'
        transaction.purpose = 'credit_topup'
        transaction.metadata = {'credits_to_add': 100}
        
        # Patch getattr(user, 'profile', None) manually if needed, 
        # but EmailService uses transaction.user.profile which might fail if not properly attached since it's a mock.
        # Let's adjust attributes to match what EmailService expects.
        receiver_user.profile = receiver_profile
        
        try:
            EmailService.send_payment_confirmation_email(transaction)
            self.stdout.write(self.style.SUCCESS("✓ Payment Confirmation Sent"))
        except Exception as e:
            import traceback
            traceback.print_exc()
            self.stdout.write(self.style.ERROR(f"✗ Failed (Payment): {e}"))

        # --- 2. Interest Request Email ---
        self.stdout.write("Sending Interest Request Email...")
        interest_req = MagicMock(spec=Interest)
        interest_req.id = 88888
        interest_req.sender = sender_profile
        interest_req.receiver = receiver_profile
        
        # Mock country utils inside EmailService if needed, or just hope sender.current_country works
        # EmailService imports get_country_name. We might need to patch it or ensure logic works.
        # For now, let's assume it relies on real imports. To mock safely without importing in code:
        # We can't easily mock the internal import 'from ..utils.country_utils import get_country_name' inside the method.
        # But we can rely on data. The template just prints location string.
        # The service calls: country_name = get_country_name(sender.current_country)
        # If GB is valid code, it works.

        try:
            EmailService.send_interest_request_email(interest_req)
            self.stdout.write(self.style.SUCCESS("✓ Interest Request Sent"))
        except Exception as e:
             # It might fail on country utils import or database calls if not careful.
             # If it fails, we know we need to be more robust.
            import traceback
            traceback.print_exc()
            self.stdout.write(self.style.ERROR(f"✗ Failed (Interest Request): {e}"))

        # --- 3. Interest Accepted Email ---
        self.stdout.write("Sending Interest Accepted Email...")
        interest_acc = MagicMock(spec=Interest)
        interest_acc.id = 77777
        interest_acc.sender = sender_profile # Receiver of email (original sender)
        interest_acc.receiver = receiver_profile # Who accepted (data shown in email)
        interest_acc.share_type = 'full'
        
        # Swap roles: Email goes to 'sender.user.email', displays 'receiver' info
        # We want the email to go to *our* test email.
        # So we set sender_user.email to recipient_email
        sender_user.email = recipient_email 
        
        try:
            EmailService.send_interest_accepted_email(interest_acc)
            self.stdout.write(self.style.SUCCESS("✓ Interest Accepted Email Sent"))
        except Exception as e:
            import traceback
            traceback.print_exc()
            self.stdout.write(self.style.ERROR(f"✗ Failed (Interest Accepted): {e}"))

        self.stdout.write(self.style.SUCCESS(f"All test emails dispatched to {recipient_email}"))
