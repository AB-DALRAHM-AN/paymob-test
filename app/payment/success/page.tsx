import { Suspense } from "react";
import SuccessPage from "./success-page";

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      {" "}
      <SuccessPage />{" "}
    </Suspense>
  );
}
