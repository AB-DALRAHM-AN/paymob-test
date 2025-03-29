import { Suspense } from "react";
import PaymentSuccessContent from "./page-content";

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}
