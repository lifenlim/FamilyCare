import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AcceptInviteButton } from "@/components/invite/AcceptInviteButton";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Dictionary } from "@/lib/i18n/dictionary";

interface InviteInfo {
  circle_id: string;
  circle_name: string;
  role: string;
  valid: boolean;
}

function roleLabel(dictionary: Dictionary, role: string): string {
  const map: Record<string, string> = {
    editor: dictionary.invite.caretakerDescription,
    viewer: dictionary.invite.familyMemberDescription,
  };
  return map[role] ?? role;
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const dictionary = await getDictionary();

  const { data, error } = await supabase
    .rpc("get_invite_info", { p_token: token })
    .single<InviteInfo>();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (error || !data || !data.valid) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <h1 className="text-3xl font-bold">{dictionary.invite.invalidTitle}</h1>
        <p className="text-lg text-muted">{dictionary.invite.invalidBody}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-12 text-center">
      <h1 className="text-3xl font-bold">
        {dictionary.invite.invitedTo(data.circle_name)}
      </h1>
      <Card>
        <p className="text-lg">
          {dictionary.invite.roleLabel}{" "}
          <span className="font-semibold">{roleLabel(dictionary, data.role)}</span>
        </p>
      </Card>
      {user ? (
        <AcceptInviteButton token={token} />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-lg text-muted">{dictionary.invite.signInToAccept}</p>
          <Link href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}>
            <Button className="w-full">{dictionary.invite.signInButton}</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
