# Paymob Integration Test Application

This is a Next.js application built to demonstrate and test integration with the Paymob payment gateway.

## Purpose

The primary goal of this application is to provide a working example of the Paymob payment flow, including:

- Authenticating with the Paymob API.
- Registering an order.
- Generating a payment key.
- Redirecting the user to the Paymob payment page.
- Handling the payment success callback from Paymob.
- Verifying the transaction callback using HMAC validation.

## Features

- Frontend interface to select a service/price.
- Form to collect basic customer billing information.
- Backend API route (`/api/paymob/checkout`) to handle the Paymob integration logic.
- Backend API route (`/api/paymob/callback`) to receive and process payment status updates from Paymob.
- Success page displaying transaction details after a successful payment.
- HMAC signature verification for callback security.

## Technology Stack

- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## Setup

Follow these steps to set up and run the project locally.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- A Paymob account (Sandbox or Production) to get API credentials.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/AB-DALRAHM-AN/paymob-test.git
    cd paymob-test
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

### Environment Variables

This application requires certain environment variables to connect to the Paymob API. Create a `.env.local` file in the root of the project and add the following variables:

```dotenv
# .env

# Your Paymob API Key (obtain from your Paymob dashboard)
PAYMOB_API_KEY="YOUR_PAYMOB_API_KEY"

# Your Paymob HMAC Secret (obtain from the Integration settings in your Paymob dashboard)
PAYMOB_HMAC_SECRET="YOUR_PAYMOB_HMAC_SECRET"

# The Integration ID for the payment method you want to use (e.g., Card Payment)
PAYMOB_INTEGRATION_ID="YOUR_PAYMOB_INTEGRATION_ID"

# The base URL of your application (IMPORTANT for callbacks)
# For local development using a tunnel like ngrok, this would be the ngrok URL.
# For production, this would be your deployed application's URL.
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Replace with your actual URL if needed
```

**Important Security Note:** Never commit your `.env` file or expose your API keys or HMAC secret publicly.

## Running Locally

Once the setup is complete, you can start the development server:

```bash
npm run dev
# or
yarn dev
```

The application should now be running on `http://localhost:3000` (or the port specified by Next.js).

## Usage

1.  Open your browser and navigate to the application URL (e.g., `http://localhost:3000`).
2.  Select one of the service price options.
3.  Fill in the required customer information.
4.  Click "Proceed to Pay".
5.  You will be redirected to the Paymob payment page.
6.  Complete the payment using test card details provided by Paymob (if using the sandbox environment).
7.  After successful payment, you should be redirected back to the application's success page (`/payment/success`).

## Paymob Callback Handling

Paymob sends transaction status updates (callbacks) to a predefined URL. This application uses the `/api/paymob/callback` endpoint for this purpose.

### Local Development Callback Setup

Paymob needs to be able to reach your callback URL over the internet. When running locally, your `localhost` is not accessible externally. To test callbacks locally:

1.  **Use a tunneling service:** Tools like `ngrok` can create a secure public URL that tunnels traffic to your local machine.

    - Install ngrok: [https://ngrok.com/download](https://ngrok.com/download)
    - Run ngrok: `ngrok http 3000` (assuming your app runs on port 3000).
    - Ngrok will provide a public HTTPS URL (e.g., `https://<unique-id>.ngrok.io`).

2.  **Update Environment Variable:** Set `NEXT_PUBLIC_APP_URL` in your `.env.local` file to this public ngrok URL.

    ```dotenv
    NEXT_PUBLIC_APP_URL="https://<unique-id>.ngrok.io"
    ```

    **Restart your Next.js application** after changing the environment variable.

3.  **Configure Paymob:** In your Paymob dashboard (under Developers -> Integrations -> Your Integration ID -> Edit), set the "Transaction processed callback URL" and "Transaction response callback URL" to your public callback endpoint:
    - Processed Callback: `https://<unique-id>.ngrok.io/api/paymob/callback`
    - Response Callback: `https://<unique-id>.ngrok.io/payment/success` (or your desired success page)

Now, when you complete a payment, Paymob will be able to send the callback to your local application via the ngrok tunnel.

### Production Callback Setup

When deploying your application to a hosting provider (like Vercel, Netlify, etc.), ensure:

1.  The `NEXT_PUBLIC_APP_URL` environment variable is set to your production domain (e.g., `https://your-app-domain.com`).
2.  The callback URLs in your Paymob dashboard are updated to use your production domain:
    - Processed Callback: `https://your-app-domain.com/api/paymob/callback`
    - Response Callback: `https://your-app-domain.com/payment/success`

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is licensed under the MIT License.
