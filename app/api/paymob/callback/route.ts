import { NextResponse } from "next/server";
import crypto from "crypto";

// Helper function to verify HMAC signature for callback (Transaction Webhook)
// See: https://docs.paymob.com/docs/hmac-calculation#transaction-callback-webhook
function verifyHmacSignature(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payloadObj: any,
  hmacSecret: string,
  receivedHmac: string
): boolean {
  // Concatenate the required fields in the specified order
  const dataString =
    payloadObj.amount_cents +
    payloadObj.created_at +
    payloadObj.currency +
    payloadObj.error_occured +
    payloadObj.has_parent_transaction +
    payloadObj.id +
    payloadObj.integration_id +
    payloadObj.is_3d_secure +
    payloadObj.is_auth +
    payloadObj.is_capture +
    payloadObj.is_refunded +
    payloadObj.is_standalone_payment +
    payloadObj.is_voided +
    payloadObj.order.id + // Note: nested object access
    payloadObj.owner +
    payloadObj.pending +
    payloadObj.source_data.pan + // Note: nested object access
    payloadObj.source_data.sub_type + // Note: nested object access
    payloadObj.source_data.type + // Note: nested object access
    payloadObj.success;

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

    // Verify HMAC signature from the URL query parameters
    const url = new URL(request.url);
    const receivedHmac = url.searchParams.get("hmac"); // HMAC is in the query params for callbacks

    if (receivedHmac && process.env.PAYMOB_HMAC_SECRET) {
      const isValid = verifyHmacSignature(
        obj,
        process.env.PAYMOB_HMAC_SECRET,
        receivedHmac
      );

      if (!isValid) {
        console.error("HMAC signature verification failed");
        // Log details for debugging the mismatch
        console.log("Received HMAC (Query Param):", receivedHmac);
        // Reconstruct the data string exactly as done in verifyHmacSignature for logging
        const dataStringForLog =
          obj.amount_cents +
          obj.created_at +
          obj.currency +
          obj.error_occured +
          obj.has_parent_transaction +
          obj.id +
          obj.integration_id +
          obj.is_3d_secure +
          obj.is_auth +
          obj.is_capture +
          obj.is_refunded +
          obj.is_standalone_payment +
          obj.is_voided +
          obj.order.id + // Note: nested object access
          obj.owner +
          obj.pending +
          obj.source_data.pan + // Note: nested object access
          obj.source_data.sub_type + // Note: nested object access
          obj.source_data.type + // Note: nested object access
          obj.success;
        const calculatedHmacForLog = crypto
          .createHmac("sha512", process.env.PAYMOB_HMAC_SECRET)
          .update(dataStringForLog)
          .digest("hex");
        console.log("Data String (from Body 'obj'):", dataStringForLog);
        console.log("Calculated HMAC (from Body 'obj'):", calculatedHmacForLog);
        console.log(
          "HMAC Secret Used (first 5 chars):",
          process.env.PAYMOB_HMAC_SECRET?.substring(0, 5)
        ); // Log part of the secret for verification

        return NextResponse.json(
          { status: "error", message: "Invalid signature" },
          { status: 401 }
        );
      }

      console.log("HMAC signature verified successfully");
    } else {
      console.warn(
        "HMAC secret not configured or HMAC not provided in callback URL query parameters"
      );
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
        `Redirecting to success page for order ${orderId}, transaction ID: ${transactionId}, Sending Data to DB with Data: ${JSON.stringify(
          obj
        )}`
      );
      // First acknowledge receipt of the webhook with a 200 response
      // This is important for Paymob to know the webhook was received
      return NextResponse.json({
        status: "success",
        message: "Payment successful",
        redirect: `/payment/success?txn_id=${transactionId}&order_id=${orderId}&amount=${obj.amount_cents}&currency=${obj.currency}`,
      });
    } else {
      console.log(
        `Payment ${
          success ? "successful" : "failed"
        } for order ${orderId}, transaction ID: ${transactionId}`
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
