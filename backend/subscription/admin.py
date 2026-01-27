from django.contrib import admin
from .models import SubscriptionPlan, UserSubscription, CreditWallet, Transaction

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'price_bdt', 'base_currency', 'credit_amount', 'duration_days', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'slug')

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'is_active', 'start_date', 'end_date', 'is_expired')
    list_filter = ('plan', 'is_active', 'auto_renew')
    search_fields = ('user__email', 'user__username', 'user__first_name')
    autocomplete_fields = ['user']

@admin.register(CreditWallet)
class CreditWalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'updated_at')
    search_fields = ('user__email', 'user__username')
    ordering = ('-balance',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'user', 'amount', 'currency', 'status', 'gateway', 'purpose', 'created_at')
    list_filter = ('status', 'gateway', 'purpose', 'created_at')
    search_fields = ('transaction_id', 'user__email', 'metadata')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
