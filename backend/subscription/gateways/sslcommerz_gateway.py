import requests
from django.conf import settings
from .base import BasePaymentGateway
import uuid

class SSLCommerzGateway(BasePaymentGateway):
    def __init__(self):
        self.store_id = getattr(settings, 'SSLCOMMERZ_STORE_ID', None)
        self.store_passwd = getattr(settings, 'SSLCOMMERZ_STORE_PASS', None)
        self.is_sandbox = getattr(settings, 'SSLCOMMERZ_IS_SANDBOX', True)
        self.base_url = "https://sandbox.sslcommerz.com" if self.is_sandbox else "https://securepay.sslcommerz.com"

    def initiate_payment(self, transaction):
        if not self.store_id or not self.store_passwd:
             raise Exception("SSLCommerz credentials not configured")

        post_body = {
            'store_id': self.store_id,
            'store_passwd': self.store_passwd,
            'total_amount': str(transaction.amount),
            'currency': transaction.currency,
            'tran_id': transaction.transaction_id or str(uuid.uuid4())[:10],
            'success_url': f"{settings.CORS_ALLOWED_ORIGINS[0]}/payment/success", # Frontend success
            'fail_url': f"{settings.CORS_ALLOWED_ORIGINS[0]}/payment/fail",
            'cancel_url': f"{settings.CORS_ALLOWED_ORIGINS[0]}/payment/cancel",
            'emi_option': 0,
            'cus_name': transaction.user.get_full_name() or transaction.user.username,
            'cus_email': transaction.user.email,
            'cus_add1': 'Dhaka', # simplified
            'cus_city': 'Dhaka',
            'cus_country': 'Bangladesh',
            'cus_phone': '01700000000',
            'product_name': 'Subscription/Credits',
            'product_category': 'Service',
            'product_profile': 'general',
            'shipping_method': 'NO', 
            'num_of_item': 1,
        }

        response = requests.post(f"{self.base_url}/gwprocess/v4/api.php", data=post_body)
        data = response.json()
        
        if data.get('status') == 'SUCCESS':
            return {
                'payment_url': data.get('GatewayPageURL'),
                'gateway_txn_id': data.get('sessionkey') 
            }
        else:
             raise Exception(f"SSLCommerz Init Failed: {data.get('failedreason')}")

    def verify_payment(self, data):
        # Verification usually done via IPN or by validating POST data on success_url
        # Here we implement Validation API call
        val_id = data.get('val_id')
        if not val_id:
             return False, None, {}
        
        url = f"{self.base_url}/validator/api/validationserverAPI.php"
        params = {
            'val_id': val_id,
            'store_id': self.store_id,
            'store_passwd': self.store_passwd,
            'format': 'json'
        }
        res = requests.get(url, params=params)
        val_data = res.json()

        if val_data.get('status') == 'VALID' or val_data.get('status') == 'VALIDATED':
            return True, val_data.get('tran_id'), val_data
        return False, None, val_data
