import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AnnouncementForm from "../form";

export default async function EditAnnouncementPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: announcement } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!announcement) notFound();

  return (
    <div className="container">
      <p className="page__eyebrow"><Link href="/content/announcements" className="muted">&larr; Announcements</Link></p>
      <h1 className="page__title" style={{ marginBottom: 24 }}>Edit announcement</h1>
      <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
        <AnnouncementForm announcement={announcement} />
      </div>
    </div>
  );
}
