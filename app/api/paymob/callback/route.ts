// app/api/paymob/callback/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

// Helper function to verify HMAC signature
function verifyHmacSignature(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  hmacSecret: string,
  receivedHmac: string
): boolean {
  // Create a string representation of the payload
  const dataString = JSON.stringify(payload);

  // Calculate HMAC using the secret
  const calculatedHmac = crypto
    .createHmac("sha512", hmacSecret)
    .update(dataString)
    .digest("hex");

  // Compare the calculated HMAC with the received HMAC
  return calculatedHmac === receivedHmac;
}

// This endpoint will receive payment notifications from Paymob
export async function POST(request: Request) {
  try {
    // Parse the transaction data sent by Paymob
    const transactionData = await request.json();

    // Log the transaction data for debugging
    console.log(
      "Payment callback received:",
      JSON.stringify(transactionData, null, 2)
    );

    // Extract important transaction details
    const { obj } = transactionData;

    if (!obj) {
      console.error("Invalid callback data: missing obj property");
      return NextResponse.json(
        { status: "error", message: "Invalid data format" },
        { status: 400 }
      );
    }

    // Verify HMAC signature if provided in headers
    const hmacHeader = request.headers.get("hmac");
    if (hmacHeader && process.env.PAYMOB_HMAC_SECRET) {
      const isValid = verifyHmacSignature(
        obj,
        process.env.PAYMOB_HMAC_SECRET,
        hmacHeader
      );

      if (!isValid) {
        console.error("HMAC signature verification failed");
        return NextResponse.json(
          { status: "error", message: "Invalid signature" },
          { status: 401 }
        );
      }

      console.log("HMAC signature verified successfully");
    } else {
      console.warn("No HMAC signature provided or HMAC secret not configured");
    }

    // Extract transaction details
    const {
      id: transactionId,
      order: { id: orderId },
      success,
    } = obj;

    if (success) {
      console.log(
        `Payment successful for order ${orderId}, transaction ID: ${transactionId}`
      );
      // Here you would update your order status in the database
      console.log(
        `Redirecting to success page for order ${orderId}, transaction ID: ${transactionId}, Sending Data to DB with Data: ${JSON.stringify(obj)}`
      )
      // First acknowledge receipt of the webhook with a 200 response
      // This is important for Paymob to know the webhook was received
      return NextResponse.json({
        status: "success",
        message: "Payment successful",
        redirect: `/payment/success?txn_id=${transactionId}&order_id=${orderId}&amount=${obj.amount_cents}&currency=${obj.currency}`,
      });
    } else {
      console.log(
        `Payment failed for order ${orderId}, transaction ID: ${transactionId}`
      );
      // Here you would update your order status in the database
      // Example: await db.orders.update({ where: { id: orderId }, data: { status: 'failed' } });

      // First acknowledge receipt of the webhook with a 200 response
      return NextResponse.json({
        status: "error",
        message: "Payment failed",
        redirect: `/payment/declined?txn_id=${transactionId}&order_id=${orderId}&amount=${obj.amount_cents}&currency=${obj.currency}`,
      });
    }
  } catch (error) {
    console.error("Error processing payment callback:", error);
    // Still return a 200 to acknowledge receipt (prevents Paymob from retrying)
    return NextResponse.json({
      status: "error",
      message: "Error processing callback",
    });
  }
}
