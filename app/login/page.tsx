import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BRAND_ICON_VERSION } from "@/lib/brand";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-12">
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- small brand mark, skip the image optimizer's caching layer */}
        <img
          src={`/icons/logo.png?v=${BRAND_ICON_VERSION}`}
          alt="FamilyCare"
          width={72}
          height={72}
          className="mx-auto h-16 w-16 rounded-xl border-2 border-primary/20"
        />
        <h1 className="mt-2 text-4xl font-bold text-primary">FamilyCare</h1>
        <p className="mt-3 text-lg text-muted">
          Sign in with your email. We&apos;ll send you a link — no password
          needed.
        </p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
