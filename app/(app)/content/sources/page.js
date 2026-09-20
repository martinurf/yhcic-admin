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
  const [{ data: resources }, { count: pendingCount }, { data: comments }] = await Promise.all([
    admin
      .from("resources")
      .select("id, title, description, type, url, file_name, file_size, storage_key, created_at, uploaded_by, forked_from_id, uploader:admin_profiles!uploaded_by(display_name, username)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("content_comments")
      .select("id, parent_id, body, created_at, author:admin_profiles!author_id(display_name, username)")
      .eq("parent_table", "resources")
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
  ]);

  const commentsByResource = {};
  for (const c of comments || []) {
    (commentsByResource[c.parent_id] ||= []).push(c);
  }
  const originTitleById = Object.fromEntries((resources || []).map((r) => [r.id, r.title]));

  return (
    <>
      <ContentTopbar title="Sources & Research" pendingCount={pendingCount || 0} />
      <div className="container flush-top">
        <div className="section-hero">
          <Link href="/content" className="backlink">
            <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
            Content library
          </Link>
          <div className="section-hero-row">
            <div>
              <p className="page__eyebrow">YHCIC workspace</p>
              <h1>Sources &amp; Research.</h1>
              <p className="desc">A shared library for useful articles, datasets, filings, documents, and internal notes. Private to officers — never shown on the public site.</p>
            </div>
            <UploadForm />
          </div>
        </div>

        <div className="workspace">
          <SourceList resources={resources || []} commentsByResource={commentsByResource} originTitleById={originTitleById} me={me} />
        </div>
      </div>
    </>
  );
}
