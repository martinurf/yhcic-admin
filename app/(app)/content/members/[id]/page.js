import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { mediaPublicUrl } from "@/lib/media-url";
import MemberForm from "../form";

export default async function MemberDetailPage({ params, searchParams }) {
  const { id } = await params;
  const { edit } = await searchParams;
  const supabase = await createClient();
  const { data: member } = await supabase
    .from("members")
    .select("*, media(storage_key)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!member) notFound();

  const imageUrl = mediaPublicUrl(member.media?.storage_key);

  if (edit) {
    return (
      <div className="container">
        <p className="page__eyebrow"><Link href={`/content/members/${id}`} className="muted">&larr; {member.name}</Link></p>
        <h1 className="page__title" style={{ marginBottom: 24 }}>Edit member</h1>
        <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
          <MemberForm member={member} imageUrl={imageUrl} />
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <p className="page__eyebrow"><Link href="/content/members" className="muted">&larr; Members</Link></p>

      <span className="leadership-card" style={{ pointerEvents: "none" }}>
        <span className="leadership-card__photo">
          {imageUrl ? (
            <img src={imageUrl} alt="" />
          ) : (
            <span className="leadership-card__photo-default" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
            </span>
          )}
        </span>
        <span className="leadership-card__content">
          <span className="leadership-card__info">
            <span className="leadership-card__name">{member.name}</span>
            {member.role ? <span className="leadership-card__role">{member.role}</span> : <span className="leadership-card__add">No role yet</span>}
            {member.major ? (
              <>
                <span className="leadership-card__field-label">Major</span>
                <span className="leadership-card__field">{member.major}</span>
              </>
            ) : null}
            {member.class_of ? <span className="leadership-card__class">Class of {member.class_of}</span> : null}
            {member.team ? <span className="leadership-card__class">{member.team}</span> : null}
            {member.focus ? <span className="leadership-card__field">{member.focus}</span> : null}
            {member.phone ? <span className="leadership-card__field">{member.phone}</span> : null}
          </span>
          <span className="leadership-card__tagline">
            <em>Students.</em>
            <em>Markets.</em>
            <em>A Stronger Tomorrow.</em>
          </span>
        </span>
      </span>

      <div className="form__actions" style={{ marginTop: 18, pointerEvents: "auto" }}>
        <Link href={`/content/members/${id}?edit=1`} className="primary">Edit</Link>
      </div>
    </div>
  );
}
