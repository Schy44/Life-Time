import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from django.core import signing
from django.urls import reverse

logger = logging.getLogger(__name__)

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def get_base_context():
        """Returns common context variables for all emails"""
        frontend_url = settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else "http://localhost:3000"
        # Use the logo from the hosted frontend public folder
        logo_url = f"{frontend_url}/logo-email.png"
        return {
            'frontend_url': frontend_url,
            'logo_url': logo_url,
            'YEAR': timezone.now().year
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
    def generate_response_url(interest_id, choice):
        """
        Generates a secure signed URL for responding to an interest.
        Redirects to a backend view that processes the choice.
        """
        token = signing.dumps({'interest_id': interest_id, 'choice': choice})
        
        # Use the configured BACKEND_URL from settings
        site_url = settings.BACKEND_URL.rstrip('/')
            
        return f"{site_url}/api/interests/respond-email/?token={token}"
