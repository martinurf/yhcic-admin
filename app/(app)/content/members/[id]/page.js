import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MemberForm from "../form";

export default async function EditMemberPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!member) notFound();

  return (
    <div className="container">
      <p className="page__eyebrow"><Link href="/content/members" className="muted">&larr; Members</Link></p>
      <h1 className="page__title" style={{ marginBottom: 24 }}>Edit member</h1>
      <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
        <MemberForm member={member} />
      </div>
    </div>
  );
}
