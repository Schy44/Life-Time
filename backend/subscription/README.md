# Subscription App Documentation

This app handles user subscriptions, credit wallets, and payment processing (Stripe & SSLCommerz).

## Features
- **Tiered Subscriptions**: Free, Monthly, Yearly plans.
- **Credit System**: Users can purchase and use credits for premium features.
- **Dual Payment Gateway**: Support for Stripe (International) and SSLCommerz (Bangladesh).
- **Subscription Transfer**: Users can transfer their active subscription to another user.
- **Auto-Downgrade**: Middleware checks for expiration and automatically downgrades users to the Free plan.

## Configuration
Ensure the following environment variables are set in your `.env` file:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...

# SSLCommerz
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASS=your_store_pass
SSLCOMMERZ_IS_SANDBOX=True  # Set to False for production
```

## API Endpoints

### 1. Plans & Subscriptions
- **GET** `/api/subscription/plans/` - List available subscription plans.
- **GET** `/api/subscription/my-subscription/` - Get current user's subscription status.
- **POST** `/api/subscription/transfer-subscription/` - Transfer subscription to another user.
  - Body: `{"email": "friend@example.com"}`

### 2. Credits
- **GET** `/api/subscription/credits/` - Get current credit balance.

### 3. Payments
- **POST** `/api/subscription/initiate-payment/` - Start a payment process.
  - **For Subscription**: `{"gateway": "stripe", "plan_slug": "monthly"}`
  - **For Credits**: `{"gateway": "sslcommerz", "credit_amount": 10}` (1 Credit = $1 USD default)
  - Returns: `{"payment_url": "...", "gateway_txn_id": "..."}`
- **POST/GET** `/api/subscription/payment-callback/` - Handle payment success/fail (Webhooks).

## Middleware
The `SubscriptionMiddleware` runs on every request for authenticated users. It checks if the `UserSubscription` is expired. If expired, it downgrades the user to the "Free" plan immediately.

## Models
- **SubscriptionPlan**: Defines plan details (price, duration, credits).
- **UserSubscription**: Links a user to a plan with start/end dates.
- **CreditWallet**: Stores user's available credits.
- **Transaction**: Logs all payment attempts and their status.
