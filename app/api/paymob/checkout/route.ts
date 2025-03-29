// app/api/paymob/checkout/route.ts
import { NextResponse } from "next/server";

const allowedAmounts = [100, 300, 1000]; // Allowed prices in GBP

// Helper: generate a unique merchant order ID
const generateMerchantOrderId = () => {
  return `order_${Date.now()}`;
};

// Helper: call Paymob API with error handling
async function callPaymobAPI(url: string, payload: object, authToken?: string) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add Authorization header if token is provided
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.text();
    const jsonData = data ? JSON.parse(data) : {};

    if (!res.ok) {
      throw new Error(`Paymob API error: ${data}`);
    }

    return jsonData;
  } catch (error) {
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Parse the client-sent price and customer data (if available)
    const { price, customerData } = await request.json();

    // Validate the amount on the backend
    if (!allowedAmounts.includes(price)) {
      return NextResponse.json(
        { error: "Invalid amount provided." },
        { status: 400 }
      );
    }

    // Convert GBP to pence (1£ = 100 pence)
    const amountCents = price * 100;

    // Use the API key exactly as provided without trimming
    const apiKey = process.env.PAYMOB_API_KEY;
    if (!apiKey) {
      throw new Error("Paymob API key is missing or invalid");
    }

    const authPayload = { api_key: apiKey };
    const authData = await callPaymobAPI(
      "https://accept.paymob.com/api/auth/tokens",
      authPayload
    );

    const token = authData.token;
    if (!token) {
      throw new Error("Authentication with Paymob failed: No token received");
    }

    console.log("Authentication successful, token received");

    // 2. Create an order
    const orderPayload = {
      amount_cents: amountCents,
      currency: "EGP",
      merchant_order_id: generateMerchantOrderId(),
      items: [], // Include item details if needed.
    };
    const orderData = await callPaymobAPI(
      "https://accept.paymob.com/api/ecommerce/orders",
      orderPayload,
      token // Pass the auth token for the Authorization header
    );
    const orderId = orderData.id;
    if (!orderId) {
      throw new Error("Order creation failed.");
    }

    // 3. Request a payment key using order ID and billing data.
    // Use actual customer data if provided, otherwise use default values
    const defaultBillingData = {
      apartment: "NA",
      email: "customer@example.com",
      floor: "NA",
      first_name: "Customer",
      street: "NA",
      building: "NA",
      phone_number: "0123456789",
      shipping_method: "PKG",
      postal_code: "00000",
      city: "London",
      country: "GB",
      last_name: "Test",
      state: "NA",
    };

    // Merge provided customer data with default values
    // Only require first_name, last_name, email, country, and city
    // For all other fields, use default values if not provided
    const billingData = customerData
      ? {
          ...defaultBillingData,
          // Only use provided values for essential fields
          first_name: customerData.first_name || defaultBillingData.first_name,
          last_name: customerData.last_name || defaultBillingData.last_name,
          email: customerData.email || defaultBillingData.email,
          country: customerData.country || "GB",
          city: customerData.city || defaultBillingData.city,
          // For non-essential fields, use provided values if they exist, otherwise use defaults
          phone_number:
            customerData.phone_number || defaultBillingData.phone_number,
          street: customerData.street || defaultBillingData.street,
          building: customerData.building || defaultBillingData.building,
          apartment: customerData.apartment || defaultBillingData.apartment,
          floor: customerData.floor || defaultBillingData.floor,
          postal_code:
            customerData.postal_code || defaultBillingData.postal_code,
          state: customerData.state || defaultBillingData.state,
          shipping_method: defaultBillingData.shipping_method,
        }
      : defaultBillingData;

    const paymentPayload = {
      auth_token: token,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      billing_data: billingData,
      currency: "EGP",
      integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID || "0", 10),
    };
    const paymentData = await callPaymobAPI(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      paymentPayload,
      token // Pass the auth token for the Authorization header
    );
    const paymentKey = paymentData.token;
    if (!paymentKey) {
      throw new Error("Failed to obtain payment key.");
    }

    // 4. Build the payment URL using your IFRAME ID and the payment key
    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

    return NextResponse.json({ paymentUrl });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Paymob integration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
