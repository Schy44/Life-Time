from django.utils import timezone
from .models import UserSubscription, SubscriptionPlan

class SubscriptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            try:
                # Optimized to avoid hitting DB on every static asset, but for API it's okay.
                # Ideally cache this result.
                sub = getattr(request.user, 'subscription', None)
                if sub and sub.is_expired and sub.plan.slug != 'free':
                    # Auto-downgrade
                    # Logically: If auto_renew is on, we should have tried to renew.
                    # If we are here, it means renewal failed or didn't happen.
                    # We downgrade to free.
                    
                    free_plan, _ = SubscriptionPlan.objects.get_or_create(slug='free', defaults={'name':'Free', 'price_usd':0, 'duration_days':0})
                    sub.plan = free_plan
                    sub.end_date = None
                    sub.is_active = True # Free plan is always active
                    sub.save()
                    
            except Exception:
                pass

        response = self.get_response(request)
        return response
