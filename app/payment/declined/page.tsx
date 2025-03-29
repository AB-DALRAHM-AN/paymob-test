import { Suspense } from "react";
import DeclinedPage from "./declined-page";

export default function PaymentDeclinedPage() {
  return (
    <Suspense>
      <DeclinedPage />
    </Suspense>
  );
}
