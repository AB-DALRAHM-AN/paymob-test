# Paymob Payment Testing Guide

## Test Card Details

To test the payment flow with Paymob, use the following test card details:

- **Card Number**: 5123456789012346 (Mastercard test card)
- **Expiry Date**: Any future date (e.g., 05/30)
- **CVV**: Any 3 digits (e.g., 123)
- **Cardholder Name**: Any name

Alternative test cards:
- Visa: 4987654321098769
- Mastercard (alternate): 5111111111111118

## Testing Process

1. Select a service option on the checkout page (£100, £300, or £1000)
2. Click "Pay Now"
3. You will be redirected to the Paymob payment iframe
4. Enter the test card details provided above
5. Complete the payment process

## Expected Results

- **Successful Payment**: The payment should be processed successfully, and you'll be redirected back to your application (if you've configured a success URL in your Paymob dashboard)
- **Failed Payment**: To simulate a failed payment, you can use an invalid card number or past expiry date

## Verifying Payments

### In Paymob Dashboard

1. Log in to your Paymob merchant dashboard
2. Navigate to "Transactions" section
3. You should see your test transaction listed with its status

### In Your Application

The application has been configured with a callback endpoint at `/api/paymob/callback` that will receive payment notifications from Paymob. When a payment is processed (successful or failed), Paymob will send a webhook notification to this endpoint.

To verify this is working:

1. Check your server logs after making a test payment
2. You should see a log entry with "Payment callback received:" followed by the transaction details
3. Depending on the payment status, you'll see either "Payment successful" or "Payment failed" log messages

## Troubleshooting

- If the iframe doesn't load, check that your PAYMOB_IFRAME_ID environment variable is set correctly
- If authentication fails, verify your PAYMOB_API_KEY is correct
- If order creation fails, ensure your PAYMOB_INTEGRATION_ID is set properly

## Next Steps for Production

1. Replace the dummy billing data in the checkout API with actual customer data
2. Configure proper success and failure URLs in your Paymob dashboard
3. Implement proper database storage for orders and transactions
4. Add proper error handling and user feedback