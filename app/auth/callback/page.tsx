import { Suspense } from "react";
import { ConfirmSignIn } from "@/components/auth/ConfirmSignIn";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmSignIn />
    </Suspense>
  );
}
