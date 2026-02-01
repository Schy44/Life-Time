import stripe
from django.conf import settings
from .base import BasePaymentGateway

# Configure Stripe
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None)

class StripeGateway(BasePaymentGateway):
    def initiate_payment(self, transaction):
        """
        Creates a Stripe Checkout Session.
        """
        if not stripe.api_key:
            raise Exception("Stripe API key not configured")

        if settings.DEBUG:
            domain = "http://localhost:3000"
        else:
            # Check for explicit FRONTEND_URL or use the first CORS origin (Main Vercel App)
            # We avoid RENDER_EXTERNAL_HOSTNAME because it points to Backend (and lacks https://)
            if hasattr(settings, 'CORS_ALLOWED_ORIGINS') and settings.CORS_ALLOWED_ORIGINS:
                domain = settings.CORS_ALLOWED_ORIGINS[0]
            else:
                domain = settings.RENDER_EXTERNAL_HOSTNAME or "http://localhost:3000"

        # Ensure scheme (Stripe Requirement: https://)
        if domain and not domain.startswith('http'):
            domain = f"https://{domain}"
        
        # Append Stripe Session ID template for verification
        success_url = f"{domain}/payment/success?txn_id={transaction.transaction_id}&session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{domain}/payment/cancel?txn_id={transaction.id}"

        # Determine product name/price
        # In a real app complexity, we might have Stripe Product IDs mapped.
        # Here we do on-the-fly line item creation for simplicity.
        
        name = "Top-up Credits"
        if transaction.purpose == 'subscription':
            # We assume the transaction metadata or logic elsewhere has plan details
            # For simplicity, we use transaction.amount directly
            name = "Subscription Upgrade"
        
        # Stripe expects amount in cents
        amount_cents = int(transaction.amount * 100)

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': transaction.currency.lower(),
                    'product_data': {
                        'name': name,
                    },
                    'unit_amount': amount_cents,
                },
                'quantity': 1,
            }],
            mode='payment', # Use 'subscription' if using Stripe Subscriptions, but user logic implies modular manual handling? 
            # Plan says "Users buy credits" or "Monthly pass". 
            # Implementing as one-time payment for now for simplicity, handling recurring logic in backend via checking expiry?
            # Or should we use Stripe Subscriptions?
            # User requirement: "Subscription Transfer" implies flexible ownership, 
            # effectively easier to manage if we treat it as valid-until date in our DB 
            # and just charge monthly. But auto-renew requires 'subscription' mode in Stripe.
            # For now, let's use 'payment' mode (manual renewal) or 'subscription' mode if clearer.
            # Given instructions were high level "Monthly ($50)", I will use 'payment' for now to keep it generic across SSLCommerz which doesn't always support recurring easily.
            # We can implement recurring later if needed.
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=str(transaction.transaction_id),
        )

        return {
            'payment_url': session.url,
            'gateway_txn_id': session.id
        }

    def verify_payment(self, data):
        """
        Verifies via webhook or session retrieval.
        For simplicity, this example assumes we verify via session ID passed in return.
        REAL WORLD: Use Webhooks.
        """
        # Placeholder for simple verification (e.g. called from success view)
        session_id = data.get('session_id')
        if not session_id:
             return False, None, {}

        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == 'paid':
             return True, session.id, session
        return False, session.id, session
