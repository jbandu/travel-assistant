# Stripe Payment Integration - Setup Guide

## Overview

This travel assistant app now includes full Stripe payment integration for processing real bookings. This guide will help you set up and test the payment system.

## Features Implemented

✅ Payment intent creation
✅ Secure checkout with Stripe Elements
✅ Webhook handler for payment events
✅ Payment confirmation page
✅ Automatic booking status updates
✅ Multiple currency support
✅ 3D Secure (SCA) compliance
✅ Refund handling

---

## 1. Stripe Account Setup

### Create Stripe Account
1. Go to https://stripe.com and sign up
2. Complete business verification (can skip for testing)
3. Navigate to **Developers** → **API keys**

### Get API Keys
You'll need 4 keys:

**Test Mode Keys (for development):**
- `STRIPE_SECRET_KEY` - Secret key (starts with `sk_test_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Publishable key (starts with `pk_test_`)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (starts with `whsec_`)

**Live Mode Keys (for production):**
- Same keys but with `sk_live_` and `pk_live_` prefixes

---

## 2. Environment Variables

Add these to your `.env` file:

```bash
# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Important Notes:
- `NEXT_PUBLIC_` prefix makes the key available to frontend
- **NEVER** commit `.env` file to git
- Use different keys for development and production
- Rotate keys if they're ever exposed

---

## 3. Webhook Setup

Webhooks notify your app when payments succeed, fail, or are refunded.

### Local Development (Using Stripe CLI)

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Linux
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost:**
   ```bash
   stripe listen --forward-to http://localhost:3000/api/payments/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`)
   - Add to `.env` as `STRIPE_WEBHOOK_SECRET`

5. **Trigger test events:**
   ```bash
   # Test successful payment
   stripe trigger payment_intent.succeeded

   # Test failed payment
   stripe trigger payment_intent.payment_failed
   ```

### Production Deployment (Vercel/Production)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/payments/webhook
   ```
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy the **Signing secret** and add to production environment variables

---

## 4. Testing Payments

### Test Card Numbers

Stripe provides test cards that simulate different scenarios:

**Successful Payments:**
```
4242 4242 4242 4242  - Visa (always succeeds)
5555 5555 5555 4444  - Mastercard (always succeeds)
3782 822463 10005    - American Express (always succeeds)
```

**Requires Authentication (3D Secure):**
```
4000 0025 0000 3155  - Requires authentication
```

**Payment Failures:**
```
4000 0000 0000 9995  - Always declined (insufficient funds)
4000 0000 0000 0069  - Expired card
4000 0000 0000 0341  - Incorrect CVC
```

**For all test cards:**
- Use any future expiration date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any 5-digit ZIP code (e.g., 12345)

### Testing Flow

1. **Create a booking:**
   - Search for flights/hotels
   - Select an option
   - Create booking (status: MOCK_RESERVED)

2. **Go to checkout:**
   - Navigate to `/bookings/[bookingId]/checkout`
   - Payment form loads automatically

3. **Complete payment:**
   - Enter test card: `4242 4242 4242 4242`
   - Enter expiry: `12/34`
   - Enter CVC: `123`
   - Click "Pay"

4. **Webhook processes payment:**
   - Booking status changes to CONFIRMED
   - Payment status changes to paid
   - User redirected to confirmation page

5. **Verify in Stripe Dashboard:**
   - Go to **Payments** tab
   - See your test payment listed

---

## 5. Payment Flow Architecture

### Step-by-Step Process

```
User selects flight/hotel
         ↓
Creates booking (MOCK_RESERVED)
         ↓
Navigates to /bookings/[id]/checkout
         ↓
Frontend calls /api/payments/create-intent
         ↓
Stripe PaymentIntent created
         ↓
User enters card details (Stripe Elements)
         ↓
Frontend calls stripe.confirmPayment()
         ↓
Payment processed by Stripe
         ↓
Stripe sends webhook to /api/payments/webhook
         ↓
Webhook updates booking (CONFIRMED, paid)
         ↓
User redirected to /bookings/[id]/confirmation
```

### Database Updates

**On payment success:**
```typescript
booking.status = 'CONFIRMED'
booking.paymentStatus = 'paid'
booking.bookingDetails.paidAt = new Date()
booking.bookingDetails.chargeId = 'ch_xxx'
```

**On payment failure:**
```typescript
booking.paymentStatus = 'failed'
booking.bookingDetails.paymentError = 'Card declined'
```

---

## 6. API Endpoints

### Create Payment Intent
```
POST /api/payments/create-intent

Body:
{
  "bookingId": "uuid"
}

Response:
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Webhook Handler
```
POST /api/payments/webhook

Headers:
stripe-signature: xxx

Events handled:
- payment_intent.succeeded
- payment_intent.payment_failed
- payment_intent.canceled
- charge.refunded
```

### Get Booking
```
GET /api/bookings/[id]

Response:
{
  "success": true,
  "booking": {
    "id": "uuid",
    "status": "CONFIRMED",
    "paymentStatus": "paid",
    "totalAmount": 500.00,
    "currency": "USD",
    ...
  }
}
```

---

## 7. Security Best Practices

### ✅ Implemented Security Features

1. **Server-side validation:**
   - Payment amount calculated server-side (not trusted from frontend)
   - User ownership verification before creating payment intent
   - Webhook signature verification

2. **Webhook security:**
   - Signature verification prevents spoofed webhooks
   - Idempotency handling (same event won't process twice)

3. **PCI compliance:**
   - Stripe Elements (card data never touches your server)
   - No card data stored in database
   - Stripe is PCI Level 1 certified

4. **User authentication:**
   - JWT required for all payment endpoints
   - User can only pay for their own bookings

### 🔒 Additional Recommendations

1. **Enable Radar (Stripe's fraud detection):**
   - Go to Stripe Dashboard → Radar
   - Configure fraud rules
   - Block suspicious payments

2. **Set up 3D Secure:**
   - Already enabled via `automatic_payment_methods`
   - Ensures SCA (Strong Customer Authentication) compliance

3. **Monitor webhooks:**
   - Check webhook logs in Stripe Dashboard
   - Set up alerts for failed webhooks
   - Retry failed webhook deliveries

4. **Rate limiting:**
   - Already implemented in `/lib/security/rate-limit.ts`
   - Prevents brute force payment attempts

---

## 8. Currency Support

The system supports all Stripe currencies:

**Major Currencies:**
- USD (United States Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen) - zero-decimal
- AUD (Australian Dollar)
- CAD (Canadian Dollar)
- CHF (Swiss Franc)

**Zero-Decimal Currencies** (handled automatically):
- JPY, KRW, VND, CLP, PYG, UGX, XAF

The `formatAmountForStripe()` helper automatically handles decimal conversions.

---

## 9. Refunds

### Processing Refunds

```typescript
// Full refund
await stripe.refunds.create({
  payment_intent: 'pi_xxx',
});

// Partial refund
await stripe.refunds.create({
  payment_intent: 'pi_xxx',
  amount: 5000, // $50.00
});
```

### Automatic Handling

The webhook handler automatically updates bookings when refunds occur:
- `booking.status` → CANCELLED
- `booking.paymentStatus` → refunded
- `booking.bookingDetails.refundedAt` → timestamp

### Refund Timeline
- Instant approval
- 5-10 business days to appear in customer's account
- Refund fees: None for standard refunds

---

## 10. Troubleshooting

### Common Issues

**"Webhook signature verification failed"**
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Ensure raw request body is used (not parsed JSON)
- Verify Stripe CLI is forwarding to correct port

**"Payment intent already succeeded"**
- User is trying to pay twice
- Check booking status before creating payment intent
- Handle idempotency

**"Payment requires authentication but client is not ready"**
- 3D Secure required
- Ensure `confirmParams.return_url` is set correctly
- User needs to complete authentication

**"Currency not supported"**
- Check currency code is valid (3-letter ISO code)
- Ensure lowercase in Stripe API calls
- Verify Stripe account supports that currency

### Debugging Tips

1. **Check Stripe Dashboard Logs:**
   - Go to Developers → Logs
   - See all API requests and errors

2. **Test webhook locally:**
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   stripe trigger payment_intent.succeeded
   ```

3. **Inspect payment intent:**
   ```bash
   stripe payment_intents retrieve pi_xxx
   ```

4. **Check webhook deliveries:**
   - Stripe Dashboard → Developers → Webhooks
   - Click on endpoint → View attempts
   - See request/response for each delivery

---

## 11. Going Live

### Pre-launch Checklist

- [ ] Replace test API keys with live keys
- [ ] Set up production webhook endpoint
- [ ] Enable Radar for fraud protection
- [ ] Configure Stripe billing settings
- [ ] Set up tax collection (if applicable)
- [ ] Test live checkout with real card (then refund)
- [ ] Set up email receipts (Stripe settings)
- [ ] Configure dispute handling
- [ ] Add terms of service & privacy policy links
- [ ] Set up customer portal (for subscription management)

### Live API Keys

Update `.env` with production keys:
```bash
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_live_your_live_webhook_secret
```

### Monitoring

Set up Stripe email notifications:
- Payment successes
- Payment failures
- Disputes/chargebacks
- Webhook failures

---

## 12. Costs & Fees

### Stripe Pricing (as of 2024)

**Per Transaction:**
- 2.9% + $0.30 for US cards
- 3.9% + $0.30 for international cards
- Additional 1% for currency conversion

**No Monthly Fees:**
- Free to set up
- Only pay for successful payments
- No hidden fees

**Example Calculation:**
```
Flight booking: $500
Stripe fee: ($500 × 0.029) + $0.30 = $14.80
You receive: $485.20
```

---

## 13. Support & Resources

**Stripe Documentation:**
- https://stripe.com/docs
- https://stripe.com/docs/payments/accept-a-payment
- https://stripe.com/docs/webhooks

**Stripe Support:**
- Live chat in Stripe Dashboard
- Email: support@stripe.com
- Discord: https://discord.gg/stripe

**Testing:**
- Test card numbers: https://stripe.com/docs/testing
- Webhook testing: https://stripe.com/docs/webhooks/test

---

## 14. Next Steps

### Enhancements to Consider

1. **Saved Payment Methods:**
   - Let users save cards for faster checkout
   - Use Stripe Customer objects
   - Enable one-click payments

2. **Subscription Billing:**
   - Monthly/annual travel insurance
   - Premium membership tiers
   - Recurring charges

3. **Payment Links:**
   - Send booking payment links via email/SMS
   - No login required for guest checkout

4. **Multi-currency Pricing:**
   - Show prices in user's local currency
   - Use Stripe automatic currency conversion

5. **Split Payments:**
   - Group bookings with multiple payers
   - Use Stripe Connect for marketplace model

6. **Apple Pay / Google Pay:**
   - Already enabled via `automatic_payment_methods`
   - Test on mobile devices

---

## ✅ Setup Complete!

Your Stripe payment integration is ready to process real bookings. Start by testing with test cards, then switch to live mode when ready to launch.

For issues or questions, refer to the troubleshooting section or contact Stripe support.

**Happy selling! 💳✈️**
