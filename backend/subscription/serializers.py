from rest_framework import serializers
from .models import SubscriptionPlan, UserSubscription, CreditWallet, Transaction

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['slug', 'name', 'price_bdt', 'base_currency', 'credit_amount', 'duration_days', 'description', 'features']

class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = ['plan', 'start_date', 'end_date', 'is_active', 'auto_renew', 'is_expired']

class CreditWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditWallet
        fields = ['balance']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'currency', 'gateway', 'status', 'purpose', 'created_at']

class PaymentInitiateSerializer(serializers.Serializer):
    gateway = serializers.ChoiceField(choices=['stripe', 'sslcommerz'])
    plan_slug = serializers.CharField(required=False)
    credit_amount = serializers.IntegerField(required=False)
    currency = serializers.CharField(required=False, default='BDT')
    
    def validate(self, data):
        if not data.get('plan_slug') and not data.get('credit_amount'):
            raise serializers.ValidationError("Either plan_slug or credit_amount must be provided")
        return data

class TransferSubscriptionSerializer(serializers.Serializer):
    email = serializers.EmailField()

