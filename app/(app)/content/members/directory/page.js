import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/require-admin";
import { mediaPublicUrl } from "@/lib/media-url";
import ContentTopbar from "../../content-topbar";

function Avatar({ member }) {
  return (
    <span className="member-row__avatar">
      {mediaPublicUrl(member.media?.storage_key) ? (
        <img src={mediaPublicUrl(member.media?.storage_key)} alt="" />
      ) : (
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
      )}
    </span>
  );
}

function MemberRow({ m }) {
  const sub = [m.major, m.class_of ? `Class of ${m.class_of}` : null].filter(Boolean).join(" / ");
  return (
    <Link href={`/content/members/${m.id}`} className="member-row">
      <Avatar member={m} />
      <span>
        <span className="member-row__name">{m.name}</span>
        <span className="member-row__sub">{sub || "No details yet"}</span>
      </span>
      <span className="member-row__arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" /></svg></span>
    </Link>
  );
}

export default async function MembersDirectoryPage() {
  await requireActiveAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: members }, { count: pendingCount }] = await Promise.all([
    supabase
      .from("members")
      .select("id, name, role, major, class_of, published, media(storage_key)")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true }),
    admin.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const all = members || [];
  const published = all.filter((m) => m.published);

  return (
    <>
      <ContentTopbar title="Panel Members" pendingCount={pendingCount || 0} />
      <div className="container flush-top">
        <div className="panel-columns">
          <div className="panel-column">
            <div className="section-toolbar">
              <h2>Members</h2>
              <span className="panel-column__count">{all.length}</span>
            </div>
            <div className="editorial-list">
              {all.length ? all.map((m) => <MemberRow key={m.id} m={m} />) : <p className="empty">No members yet.</p>}
            </div>
          </div>
          <div className="panel-columns__divider" aria-hidden="true" />
          <div className="panel-column">
            <div className="section-toolbar">
              <h2>Published</h2>
              <span className="panel-column__count">{published.length}</span>
            </div>
            <div className="editorial-list">
              {published.length ? published.map((m) => <MemberRow key={m.id} m={m} />) : <p className="empty">Nothing published yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
