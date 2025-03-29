import { Suspense } from "react";
import PaymentDeclinedContent from "./page-content";

export default function PaymentDeclinedPage() {
  return (
    <Suspense>
      <PaymentDeclinedContent />
    </Suspense>
  );
}
