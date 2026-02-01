import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from django.core import signing
from django.urls import reverse

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def get_base_context():
        """Returns common context variables for all emails"""
        frontend_url = settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else "http://localhost:3000"
        # Use the logo from Supabase Storage for better reliability
        logo_url = "https://airogkqmcjqvvipdwnwh.supabase.co/storage/v1/object/public/LT_Images/assets/EmailLogo.png"
        return {
            'frontend_url': frontend_url,
            'logo_url': logo_url,
            'YEAR': timezone.now().year,
            'email_ref_id': str(int(timezone.now().timestamp()))
        }

    @staticmethod
    def send_payment_confirmation_email(transaction):
        """
        Sends a payment confirmation email.
        """
        user = transaction.user
        profile = getattr(user, 'profile', None)
        user_name = profile.name if profile else user.username
        
        context = EmailService.get_base_context()
        context.update({
            'user_name': user_name,
            'transaction_id': transaction.transaction_id,
            'date': transaction.created_at.strftime('%d %b, %Y'),
            'amount': transaction.amount,
            'currency': transaction.currency,
            'is_activation': False,
            'purpose_display': transaction.purpose.replace('_', ' ')
        })

        # Customize based on purpose
        if transaction.purpose == 'profile_activation':
            context['is_activation'] = True
            subject = "Profile Activated - Payment Successful"
        elif transaction.purpose in ['subscription', 'credit_topup']:
            subject = "Credits Added - Payment Successful"
            # Try to get new balance
            try:
                from subscription.models import CreditWallet
                wallet = CreditWallet.objects.get(user=user)
                context['new_balance'] = wallet.balance
                
                # Estimate credits added based on metadata or plan
                credits = transaction.metadata.get('credits_to_add')
                if not credits and transaction.metadata.get('plan_slug'):
                    # Fetch plan if strictly needed, or just rely on new_balance
                    pass
                context['credits_added'] = credits
            except:
                pass
        else:
            subject = "Payment Successful"

        html_content = render_to_string('emails/payment_confirmation.html', context)
        text_content = strip_tags(html_content)
        
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@yourdomain.com')
        to_email = user.email
        
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
        msg.attach_alternative(html_content, "text/html")
        
        try:
            msg.send()
            logger.info(f"Payment email sent to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send payment email to {to_email}: {str(e)}")
    @staticmethod
    def send_interest_request_email(interest):
        """
        Sends an interactive email to the receiver of an interest request.
        """
        sender = interest.sender
        receiver = interest.receiver
        
        # Format sender location
        location_parts = []
        if sender.current_city:
            location_parts.append(sender.current_city)
        if sender.current_country:
            from ..utils.country_utils import get_country_name
            country_name = get_country_name(sender.current_country)
            location_parts.append(country_name)
        
        location_str = ", ".join(location_parts) if location_parts else "an Unknown Location"
        
        context = EmailService.get_base_context()
        context.update({
            'sender_name': sender.name,
            'sender_location': location_str,
            'receiver_name': receiver.name,
            'full_accept_url': EmailService.generate_response_url(interest.id, 'full'),
            'bio_only_url': EmailService.generate_response_url(interest.id, 'bio_only'),
            'reject_url': EmailService.generate_response_url(interest.id, 'reject'),
        })
        
        html_content = render_to_string('emails/interest_request.html', context)
        text_content = strip_tags(html_content)
        
        subject = f"{sender.name} from {location_str} wants to connect with you"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@yourdomain.com')
        to_email = receiver.user.email
        
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
        msg.attach_alternative(html_content, "text/html")
        
        try:
            msg.send()
            logger.info(f"Interest request email sent to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")

    @staticmethod
    def send_interest_accepted_email(interest):
        """
        Sends an email to the sender when their interest request is accepted.
        """
        sender = interest.sender
        receiver = interest.receiver
        
        # Determine context variables based on share type
        is_full = interest.share_type == 'full'
        receiver_phone = receiver.phone if receiver.phone else "Not specified"
        
        context = EmailService.get_base_context()
        profile_link = f"{context['frontend_url']}/profiles/{receiver.id}"

        
        # Extended Profile Details
        age = receiver.age if receiver.age else "N/A"
        religion = receiver.religion.title() if receiver.religion else "Not specified"
        
        # Location
        location_parts = []
        if receiver.current_city: location_parts.append(receiver.current_city)
        if receiver.current_country:
            from ..utils.country_utils import get_country_name
            location_parts.append(get_country_name(receiver.current_country))
        location = ", ".join(location_parts) if location_parts else "Unknown Location"
        
        # Profession (Try simpler field first, then work experience)
        profession = "Not specified"
        # Since profession is complex in model (WorkExperience vs Preference), we'll try to get the latest job title
        latest_job = receiver.work_experience.filter(currently_working=True).first()
        if not latest_job:
            latest_job = receiver.work_experience.first()
        
        if latest_job:
            profession = latest_job.title
        
        # Profile Image
        profile_image_url = None
        if is_full and receiver.profile_image:
             # Ensure absolute URL
             profile_image_url = receiver.profile_image.url
        
        # WhatsApp Link (Basic sanitization)
        whatsapp_link = None
        if receiver.phone:
            # Remove non-numeric characters for the link
            clean_number = "".join(filter(str.isdigit, receiver.phone))
            if clean_number:
                whatsapp_link = f"https://wa.me/{clean_number}"

        context.update({
            'sender_name': sender.name,
            'receiver_name': receiver.name,
            'receiver_phone': receiver_phone,
            'receiver_age': age,
            'receiver_religion': religion,
            'receiver_location': location,
            'receiver_profession': profession,
            'profile_image_url': profile_image_url,
            'whatsapp_link': whatsapp_link,
            'is_full': is_full,
            'profile_link': profile_link,
        })
        
        html_content = render_to_string('emails/interest_accepted.html', context)
        text_content = strip_tags(html_content)
        
        subject = f"Good News! {receiver.name} accepted your interest request"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@yourdomain.com')
        to_email = sender.user.email
        
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
        msg.attach_alternative(html_content, "text/html")
        
        try:
            msg.send()
            logger.info(f"Interest accepted email sent to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send acceptance email to {to_email}: {str(e)}")

    @staticmethod
    def generate_response_url(interest_id, choice):
        """
        Generates a secure signed URL for responding to an interest.
        Redirects to a backend view that processes the choice.
        """
        token = signing.dumps({'interest_id': interest_id, 'choice': choice})
        
        # Use the configured BACKEND_URL from settings
        site_url = settings.BACKEND_URL.rstrip('/')
            
        return f"{site_url}/api/interests/respond-email/?token={token}"
