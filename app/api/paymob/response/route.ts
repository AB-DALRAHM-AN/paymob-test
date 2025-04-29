// app/api/paymob/response/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

// Helper function to verify HMAC signature for response redirect
// See: https://docs.paymob.com/docs/hmac-calculation#response-callback-hmac
function verifyHmacSignatureForResponse(
  queryParams: URLSearchParams,
  hmacSecret: string
): boolean {
  const receivedHmac = queryParams.get("hmac");
  if (!receivedHmac) {
    console.warn("HMAC not found in response query parameters.");
    return false; // Or handle as appropriate, maybe allow if secret not configured
  }

  // Concatenate the required fields from query parameters in the specified order
  const fields = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];

  const dataString = fields
    .map((field) => queryParams.get(field) || "")
    .join("");

  // Calculate HMAC using the secret
  const calculatedHmac = crypto
    .createHmac("sha512", hmacSecret)
    .update(dataString)
    .digest("hex");

  // Compare the calculated HMAC with the received HMAC
  const isValid = calculatedHmac === receivedHmac;
  if (!isValid) {
    console.error("Response HMAC signature verification failed.");
    console.log("Data String:", dataString);
    console.log("Received HMAC:", receivedHmac);
    console.log("Calculated HMAC:", calculatedHmac);
  }
  return isValid;
}

// This endpoint will handle the transaction response callback from Paymob
// It will redirect users to the appropriate page based on the transaction status
export async function GET(request: Request) {
  try {
    // Get the URL from the request
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Extract transaction details from query parameters
    const success = searchParams.get("success");
    const txnId = searchParams.get("id") || searchParams.get("txn_id");
    const orderId = searchParams.get("order") || searchParams.get("order_id");
    const amount = searchParams.get("amount_cents");
    const currency = searchParams.get("currency");
    const integrationId = searchParams.get("integration_id");

    // Verify HMAC signature if secret is configured
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (hmacSecret) {
      const isHmacValid = verifyHmacSignatureForResponse(
        searchParams,
        hmacSecret
      );
      if (!isHmacValid) {
        // Handle invalid HMAC - maybe redirect to an error page or log extensively
        console.error("Invalid HMAC signature received in response.");
        // Depending on security requirements, you might want to stop processing
        // return NextResponse.redirect(new URL("/payment/error?reason=invalid_hmac", request.url));
      } else {
        console.log("Response HMAC signature verified successfully.");
      }
    } else {
      console.warn(
        "HMAC secret not configured. Skipping response HMAC verification."
      );
    }

    // Log the transaction response for debugging
    console.log("Transaction response received (after potential HMAC check):", {
      success,
      txnId,
      orderId,
      amount,
      currency,
      integrationId,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    // Determine the redirect URL based on the transaction status
    let redirectUrl: string;
    if (success === "true") {
      // Redirect to success page with transaction details
      redirectUrl = `/payment/success?txn_id=${txnId}&order_id=${orderId}`;
      if (amount) redirectUrl += `&amount=${amount}`;
      if (currency) redirectUrl += `&currency=${currency}`;

      console.log(
        `Payment successful for order ${orderId}, transaction ID: ${txnId}`
      );
    } else {
      // Redirect to declined page with transaction details
      redirectUrl = `/payment/declined?txn_id=${txnId}&order_id=${orderId}`;
      if (amount) redirectUrl += `&amount=${amount}`;
      if (currency) redirectUrl += `&currency=${currency}`;

      console.log(
        `Payment failed for order ${orderId}, transaction ID: ${txnId}`
      );
    }

    // Return a redirect response
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("Error processing transaction response:", error);
    // Redirect to home page in case of error
    return NextResponse.redirect(new URL("/", request.url));
  }
}
