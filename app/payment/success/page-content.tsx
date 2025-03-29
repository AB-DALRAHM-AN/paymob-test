"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(7);
  const [transactionInfo, setTransactionInfo] = useState<{
    transactionId?: string;
    orderId?: string;
    amount?: string;
    currency?: string;
  } | null>(null);

  useEffect(() => {
    // Extract transaction details from URL or use hardcoded values if not available
    const txnId = searchParams.get("txn_id") || "279476263";
    const orderId = searchParams.get("order_id") || "312825912";
    const amount = searchParams.get("amount") || "100000";
    const currency = searchParams.get("currency") || "EGP";

    setTransactionInfo({
      transactionId: txnId,
      orderId: orderId,
      amount: amount,
      currency: currency
    });

    // Countdown to redirect back to home page
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, searchParams]);

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "#4CAF50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>

      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Payment Approved!
      </h1>

      <p style={{ fontSize: "1.1rem", marginBottom: "2rem", color: "#666" }}>
        Thank you for using the online payment service. Your transaction has
        been completed successfully.
      </p>

      {transactionInfo && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            textAlign: "left",
          }}
        >
          <p>
            <strong>Transaction ID:</strong> {transactionInfo.transactionId}
          </p>
          <p>
            <strong>Order ID:</strong> {transactionInfo.orderId}
          </p>
          {transactionInfo.amount && transactionInfo.currency && (
            <p>
              <strong>Amount:</strong> {(parseInt(transactionInfo.amount) / 100).toFixed(2)} {transactionInfo.currency}
            </p>
          )}
        </div>
      )}

      <div
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <p>
          You will be redirected to the home page in{" "}
          <strong>{countdown}</strong> seconds...
        </p>
      </div>

      <div
        style={{ marginBottom: "1rem", fontSize: "0.8rem", color: "#999" }}
      >
        © Payment is powered by Paymob
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#1a73e8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}