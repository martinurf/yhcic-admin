import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/require-admin";
import UploadForm from "./upload-form";
import SourceList from "./source-list";

export default async function SourcesPage() {
  const me = await requireActiveAdmin();
  if (!me) redirect("/login");

  const admin = createAdminClient();
  const { data: resources } = await admin
    .from("resources")
    .select("id, title, file_name, file_size, storage_key, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="container">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">Sources &amp; Research</h1>
          <p className="page__sub">A shared library for articles, filings, datasets, and notes.</p>
        </div>
      </div>

      <p className="fld__hint" style={{ marginBottom: 14 }}>
        Private to officers &mdash; never shown on the public site.
      </p>

      <div className="panel" style={{ padding: 20, marginBottom: 28 }}>
        <UploadForm />
      </div>

      <SourceList resources={resources || []} />
    </div>
  );
}
