import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_time.settings')
django.setup()

from subscription.models import SubscriptionPlan

def seed_plans():
    plans = [
        {
            'slug': 'free',
            'name': 'Silver (Free)',
            'price_usd': 0,
            'duration_days': 0,
            'description': 'Start your journey. Browse profiles and be discovered.',
            'credit_amount': 0,
            'features': {
                'verified_badge': False,
                'connection_requests': 0,
                'profile_visibility': 'Standard',
                'see_who_viewed_me': False,
                'support': 'Standard',
                'can_initiate_chat': False,
                'ad_free': False
            }
        },
        {
            'slug': 'monthly',
            'name': 'Gold (Monthly)',
            'price_usd': 29,
            'duration_days': 30,
            'description': 'Get 3x more matches with Verified Badge and Credits.',
            'credit_amount': 100,
            'features': {
                'verified_badge': True,
                'connection_requests': 30,
                'profile_visibility': 'High',
                'see_who_viewed_me': True,
                'support': 'Priority',
                'can_initiate_chat': True,
                'ad_free': True
            }
        },
        {
            'slug': 'yearly',
            'name': 'Platinum (Yearly)',
            'price_usd': 199,
            'duration_days': 365,
            'description': 'Maximum Visibility & Priority Treatment. VIP Status.',
            'credit_amount': 1500,
            'features': {
                'verified_badge': True,
                'connection_requests': 'Unlimited',
                'profile_visibility': 'Priority',
                'see_who_viewed_me': True,
                'support': 'Dedicated Relationship Manager',
                'can_initiate_chat': True,
                'profile_spotlight': 'Monthly',
                'ad_free': True
            }
        }
    ]

    for plan_data in plans:
        plan, created = SubscriptionPlan.objects.update_or_create(
            slug=plan_data['slug'],
            defaults=plan_data
        )
        if created:
            print(f"Created plan: {plan.name}")
        else:
            print(f"Updated plan: {plan.name}")

if __name__ == '__main__':
    seed_plans()
