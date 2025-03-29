// app/api/paymob/response/route.ts
import { NextResponse } from "next/server";

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
    
    // Log the transaction response for debugging
    console.log("Transaction response received:", {
      success,
      txnId,
      orderId,
      amount,
      currency,
      integrationId,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // Determine the redirect URL based on the transaction status
    let redirectUrl: string;
    if (success === "true") {
      // Redirect to success page with transaction details
      redirectUrl = `/payment/success?txn_id=${txnId}&order_id=${orderId}`;
      if (amount) redirectUrl += `&amount=${amount}`;
      if (currency) redirectUrl += `&currency=${currency}`;
      
      console.log(`Payment successful for order ${orderId}, transaction ID: ${txnId}`);
    } else {
      // Redirect to declined page with transaction details
      redirectUrl = `/payment/declined?txn_id=${txnId}&order_id=${orderId}`;
      if (amount) redirectUrl += `&amount=${amount}`;
      if (currency) redirectUrl += `&currency=${currency}`;
      
      console.log(`Payment failed for order ${orderId}, transaction ID: ${txnId}`);
    }

    // Return a redirect response
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("Error processing transaction response:", error);
    // Redirect to home page in case of error
    return NextResponse.redirect(new URL("/", request.url));
  }
}