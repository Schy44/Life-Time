from django.urls import path
from .views import PlanListView, MySubscriptionView, MyCreditBalanceView, CreateFreePlanView, PaymentInitiateView, PaymentCallbackView, TransferSubscriptionView

urlpatterns = [
    path('plans/', PlanListView.as_view(), name='plan-list'),
    path('my-subscription/', MySubscriptionView.as_view(), name='my-subscription'),
    path('credits/', MyCreditBalanceView.as_view(), name='my-credits'),
    path('initiate-payment/', PaymentInitiateView.as_view(), name='initiate-payment'),
    path('payment-callback/', PaymentCallbackView.as_view(), name='payment-callback'),
    path('transfer-subscription/', TransferSubscriptionView.as_view(), name='transfer-subscription'),
    path('init-plans/', CreateFreePlanView.as_view(), name='init-plans'),
]
