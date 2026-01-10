from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer, CreditWalletSerializer, PaymentInitiateSerializer
from .models import SubscriptionPlan, UserSubscription, CreditWallet, Transaction
from .gateways.stripe_gateway import StripeGateway
from .gateways.sslcommerz_gateway import SSLCommerzGateway
import uuid

class PlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]

class MySubscriptionView(generics.RetrieveAPIView):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        sub, created = UserSubscription.objects.get_or_create(
            user=self.request.user,
            defaults={'plan': SubscriptionPlan.objects.get_or_create(slug='free', defaults={'name':'Free', 'price_usd':0, 'duration_days':0})[0]}
        )
        # Check expiry
        if sub.is_expired and sub.plan.slug != 'free':
             # Downgrade logic could be here or middleware. 
             # For now, simplistic check:
             pass 
        return sub

class MyCreditBalanceView(generics.RetrieveAPIView):
    serializer_class = CreditWalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        wallet, created = CreditWallet.objects.get_or_create(user=self.request.user)
        return wallet

class PaymentInitiateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentInitiateSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user = request.user
            gateway_name = data['gateway']
            
            amount = 0
            purpose = ''
            
            if data.get('plan_slug'):
                plan = get_object_or_404(SubscriptionPlan, slug=data['plan_slug'])
                amount = plan.price_usd
                purpose = 'subscription'
            elif data.get('credit_amount'):
                # Simple logic: 1 credit = $0.1 (or use a package model if complex)
                # User prompt said "$50 for monthly", "$500 yearly".
                # Credits: "Buy credits". Let's assume $1 = 10 credits for now or configurable.
                # I'll implement 1 Credit = $0.5 for now? Or just map credit packages.
                # Simplest: Input amount directly? No, usually you buy packages.
                # I will assume data['credit_amount'] is the DOLLAR amount they want to spend? 
                # OR data['credit_amount'] is NUMBER of credits.
                # Implementation Plan didn't specify packages.
                # I'll assume 1 Credit = $1 for simplicity unless configured.
                # Actually, plan mentions "Buy credits".
                # Let's fix 1 Credit = $1 USD for simplicity.
                amount = data['credit_amount'] * 1 # $1 per credit
                purpose = 'credit_topup'
                data['credits_to_add'] = data['credit_amount'] # storing number of credits
            
            if amount <= 0 and purpose == 'subscription':
                 # Free plan change?
                 return Response({"error": "Cannot pay for free plan"}, status=400)

            # Create Transaction
            transaction = Transaction.objects.create(
                user=user,
                amount=amount,
                currency='USD',
                gateway=gateway_name,
                purpose=purpose,
                status='pending',
                transaction_id=str(uuid.uuid4()), # temporary unique id
                metadata=data
            )
            
            # Select Gateway
            if gateway_name == 'stripe':
                gateway = StripeGateway()
            elif gateway_name == 'sslcommerz':
                gateway = SSLCommerzGateway()
            else:
                return Response({"error": "Invalid gateway"}, status=400)
            
            try:
                result = gateway.initiate_payment(transaction)
                return Response(result)
            except Exception as e:
                return Response({"error": str(e)}, status=400)
        
        return Response(serializer.errors, status=400)

from django.utils import timezone
from datetime import timedelta

class PaymentCallbackView(APIView):
    permission_classes = [permissions.AllowAny] # Callbacks come from external

    def post(self, request):
        gateway_name = request.query_params.get('gateway')
        if not gateway_name:
             return Response({"error": "Gateway param missing"}, status=400)
        
        if gateway_name == 'stripe':
            gateway = StripeGateway()
        elif gateway_name == 'sslcommerz':
            gateway = SSLCommerzGateway()
        else:
             return Response({"error": "Invalid gateway"}, status=400)

        success, gateway_txn_id, metadata = gateway.verify_payment(request.data or request.query_params)
        
        if success:
             internal_txn_id = None
             if gateway_name == 'stripe':
                 # For Stripe, metadata is the Session object
                 internal_txn_id = metadata.client_reference_id
             elif gateway_name == 'sslcommerz':
                 internal_txn_id = gateway_txn_id 

             if not internal_txn_id:
                  return Response({"error": "Transaction ID not found"}, status=400)
             
             from django.db import transaction as db_transaction
             
             try:
                 with db_transaction.atomic():
                     try:
                         transaction = Transaction.objects.select_for_update().get(transaction_id=internal_txn_id)
                     except Transaction.DoesNotExist:
                         return Response({"error": "Transaction not found"}, status=404)

                     if transaction.status == 'completed':
                         return Response({"message": "Already processed"})

                     transaction.status = 'completed'
                     transaction.save()
            
                     # Application Logic
                     print(f"DEBUG: Processing transaction {transaction.transaction_id} purpose={transaction.purpose}")
                     print(f"DEBUG: Metadata: {transaction.metadata}")
                     
                     if transaction.purpose == 'subscription':
                         plan_slug = transaction.metadata.get('plan_slug')
                         if plan_slug:
                              plan = SubscriptionPlan.objects.get(slug=plan_slug)
                              print(f"DEBUG: Plan {plan.slug} credits={plan.credit_amount}")
                              
                              sub, _ = UserSubscription.objects.get_or_create(user=transaction.user, defaults={'plan': plan})
                              sub.plan = plan
                              sub.is_active = True
                              sub.start_date = timezone.now()
                              if plan.duration_days > 0:
                                   sub.end_date = timezone.now() + timedelta(days=plan.duration_days)
                              sub.end_date = None
                              sub.save()
                              
                              # Update Profile Feature Flags (Badge, etc.)
                              try:
                                  profile = transaction.user.profile
                                  # features = plan.features 
                                  # is_verified is ONLY for manual ID verification. 
                                  # TODO: Implement is_premium or subscription_tier field on Profile model.
                                  pass # Placeholder until model update
                                  
                                  # profile.save() 
                              except Exception as prof_err:
                                  print(f"ERROR updating profile features: {prof_err}")
                              
                              # Credits from Plan
                              if plan.credit_amount > 0:
                                  wallet, _ = CreditWallet.objects.get_or_create(user=transaction.user)
                                  previous_balance = wallet.balance
                                  wallet.add_credits(plan.credit_amount)
                                  print(f"DEBUG: Added {plan.credit_amount} credits. New Balance: {wallet.balance}")

                     elif transaction.purpose == 'credit_topup':
                         credits_to_add = transaction.metadata.get('credits_to_add', 0)
                         print(f"DEBUG: Topup credits: {credits_to_add}")
                         if credits_to_add > 0:
                             wallet, _ = CreditWallet.objects.get_or_create(user=transaction.user)
                             previous_balance = wallet.balance
                             wallet.add_credits(credits_to_add)
                             print(f"DEBUG: Added {credits_to_add} credits. New Balance: {wallet.balance}")
                             
                     return Response({"status": "Payment Successful", "transaction": transaction.transaction_id})

             except Exception as e:
                 print(f"ERROR: {str(e)}")
                 return Response({"error": str(e)}, status=400)
        
        return Response({"error": "Payment Verification Failed"}, status=400)

class CreateFreePlanView(APIView):
    """Helper for dev/testing to initiate default plans"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        # 1. Silver (Free)
        SubscriptionPlan.objects.update_or_create(
            slug='free',
            defaults={
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
                    'can_initiate_chat': False
                }
            }
        )
        
        # 2. Gold (Monthly)
        SubscriptionPlan.objects.update_or_create(
            slug='monthly',
            defaults={
                'name': 'Gold (Monthly)',
                'price_usd': 29, 
                'duration_days': 30,
                'description': 'Get 3x more matches with Verified Badge and Credits.',
                'credit_amount': 100, # 100 Credits (~$10 value)
                'features': {
                    'verified_badge': True,
                    'connection_requests': 30,
                    'profile_visibility': 'High',
                    'see_who_viewed_me': True,
                    'support': 'Priority',
                    'ad_free': True
                }
            }
        )
        
        # 3. Platinum (Yearly)
        SubscriptionPlan.objects.update_or_create(
            slug='yearly',
            defaults={
                'name': 'Platinum (Yearly)',
                'price_usd': 199, 
                'duration_days': 365,
                'description': 'Maximum Visibility & Priority Treatment. VIP Status.',
                'credit_amount': 1500, # 1500 Credits (~$150 value)
                'features': {
                    'verified_badge': True,
                    'connection_requests': 'Unlimited',
                    'profile_visibility': 'Priority',
                    'see_who_viewed_me': True,
                    'support': 'Dedicated Relationship Manager',
                    'profile_spotlight': 'Monthly',
                    'ad_free': True
                }
            }
        )
        return Response({"message": "Plans updated to Silver/Gold/Platinum"}, status=status.HTTP_200_OK)

from django.contrib.auth import get_user_model
from .serializers import TransferSubscriptionSerializer

class TransferSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TransferSubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            target_email = serializer.validated_data['email']
            sender = request.user
            
            # 1. Check Sender Subscription
            try:
                sender_sub = sender.subscription
            except UserSubscription.DoesNotExist:
                return Response({"error": "No subscription found"}, status=400)
            
            if sender_sub.plan.slug == 'free' or sender_sub.is_expired:
                return Response({"error": "You do not have a transferable subscription"}, status=400)
            
            # 2. Find Target User
            User = get_user_model()
            try:
                target_user = User.objects.get(email=target_email)
            except User.DoesNotExist:
                return Response({"error": "User with this email does not exist"}, status=404)
            
            if target_user == sender:
                return Response({"error": "Cannot transfer to yourself"}, status=400)

            # 3. Transfer Logic
            # Target gets the remaining time
            target_sub, _ = UserSubscription.objects.get_or_create(
                user=target_user, 
                defaults={'plan': SubscriptionPlan.objects.get(slug='free')}
            )
            
            # Update Target
            target_sub.plan = sender_sub.plan
            target_sub.start_date = timezone.now()
            target_sub.end_date = sender_sub.end_date # Inherit expiry
            target_sub.is_active = True
            target_sub.save()
            
            # Downgrade Sender
            free_plan = SubscriptionPlan.objects.get(slug='free')
            sender_sub.plan = free_plan
            sender_sub.end_date = None
            sender_sub.save()
            
            # Notifications could be added here
            
            return Response({"message": f"Subscription transferred to {target_email}"})
            
        return Response(serializer.errors, status=400)
