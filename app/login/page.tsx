import { Suspense } from "react";
import { HeartHandshake } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <HeartHandshake
          className="mx-auto h-12 w-12 text-primary"
          aria-hidden="true"
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
