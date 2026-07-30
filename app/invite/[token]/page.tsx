import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AcceptInviteButton } from "@/components/invite/AcceptInviteButton";

const ROLE_LABEL: Record<string, string> = {
  editor: "Primary/Secondary Caretaker — can view and edit",
  viewer: "Family Member — can view",
};

interface InviteInfo {
  circle_id: string;
  circle_name: string;
  role: string;
  valid: boolean;
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("get_invite_info", { p_token: token })
    .single<InviteInfo>();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (error || !data || !data.valid) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <h1 className="text-3xl font-bold">This invite link isn&apos;t valid</h1>
        <p className="text-lg text-muted">
          It may have already been used, revoked, or expired. Ask the care
          circle owner to send a new link.
        </p>
      </main>
    );
  }

  const roleLabel = ROLE_LABEL[data.role] ?? data.role;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-12 text-center">
      <h1 className="text-3xl font-bold">
        You&apos;re invited to join {data.circle_name}
      </h1>
      <Card>
        <p className="text-lg">
          Role: <span className="font-semibold">{roleLabel}</span>
        </p>
      </Card>
      {user ? (
        <AcceptInviteButton token={token} />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-lg text-muted">
            Sign in with your email to accept this invite.
          </p>
          <Link href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}>
            <Button className="w-full">Sign in to accept</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
