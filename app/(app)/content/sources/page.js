import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireActiveAdmin } from "@/lib/require-admin";
import ContentTopbar from "../content-topbar";
import UploadForm from "./upload-form";
import SourceList from "./source-list";

export default async function SourcesPage() {
  const me = await requireActiveAdmin();
  if (!me) redirect("/login");

  const admin = createAdminClient();
  const supabase = await createClient();
  const [{ data: resources }, { count: pendingCount }] = await Promise.all([
    admin
      .from("resources")
      .select("id, title, type, file_name, file_size, storage_key, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <>
      <ContentTopbar title="Sources & Research" pendingCount={pendingCount || 0} />
      <div className="container flush-top">
        <Link href="/content" className="backlink">
          <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
          Content library
        </Link>
        <div className="section-hero">
          <p className="page__eyebrow">YHCIC workspace</p>
          <h1>Sources &amp; Research.</h1>
          <p className="desc">A shared library for useful articles, datasets, filings, documents, and internal notes.</p>
        </div>

        <p className="fld__hint" style={{ marginBottom: 14 }}>
          Private to officers &mdash; never shown on the public site.
        </p>

        <div className="panel" style={{ padding: 20, marginBottom: 28 }}>
          <UploadForm />
        </div>

        <SourceList resources={resources || []} />
      </div>
    </>
  );
}
