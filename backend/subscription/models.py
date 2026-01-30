from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class SubscriptionPlan(models.Model):
    # Removed hardcoded choices to allow flexible naming via API/Admin
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(primary_key=True)
    price_bdt = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price in BDT (Base Currency)")
    base_currency = models.CharField(max_length=3, default='BDT')
    credit_amount = models.PositiveIntegerField(default=0, help_text="Credits given (for bundles)")
    duration_days = models.PositiveIntegerField(default=0, help_text="Duration in days. 0 for permanent.")
    description = models.TextField(blank=True)
    features = models.JSONField(default=dict, blank=True, help_text="Feature flags and limits")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.price_bdt} {self.base_currency})"

class UserSubscription(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    auto_renew = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.plan.name}"

    @property
    def is_expired(self):
        if not self.end_date:
            return False # Lifetime or Free
        return timezone.now() > self.end_date

class CreditWallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet')
    balance = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.balance} Credits"

    def add_credits(self, amount):
        self.balance += amount
        self.save()

    def deduct_credits(self, amount):
        if self.balance >= amount:
            self.balance -= amount
            self.save()
            return True
        return False

class Transaction(models.Model):
    GATEWAY_CHOICES = (
        ('stripe', 'Stripe'),
        ('sslcommerz', 'SSLCommerz'),
        ('admin', 'Admin/System'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    PURPOSE_CHOICES = (
        ('subscription', 'Subscription (Legacy)'),
        ('profile_activation', 'Profile Activation'),
        ('credit_topup', 'Credit Top-up'),
        ('interest_fee', 'Interest Fee'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')  # Increased to support 'CREDITS'
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.amount} {self.currency} ({self.status})"
