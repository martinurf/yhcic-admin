import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { mediaPublicUrl } from "@/lib/media-url";
import { requireActiveAdmin } from "@/lib/require-admin";
import { loadComments, loadForks } from "@/lib/thread";
import ProjectForm from "../form";
import { forkProject } from "../actions";
import Thread from "../../thread";

export default async function EditProjectPage({ params }) {
  const { id } = await params;
  const me = await requireActiveAdmin();
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*, media(storage_key), original:projects!forked_from_id(id, title)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  /* RLS hides a private project from anyone but its creator, so this
     is also where a non-creator trying a private project's URL lands —
     same "not found" a real missing row would give, not an error
     that confirms something exists there. */
  if (!project) notFound();

  const isFork = Boolean(project.forked_from_id);
  const canEdit = me && (!isFork || project.created_by === me.id);

  const [forks, comments] = await Promise.all([
    loadForks(supabase, "projects", id),
    loadComments(supabase, "projects", id),
  ]);

  return (
    <div className="container">
      <p className="page__eyebrow"><Link href="/content/projects" className="muted">&larr; Projects</Link></p>
      {project.original ? (
        <p className="fld__hint" style={{ marginTop: -8, marginBottom: 16 }}>
          A copy of <Link href={`/content/projects/${project.original.id}`}>{project.original.title}</Link>
        </p>
      ) : null}
      <h1 className="page__title" style={{ marginBottom: 24 }}>{canEdit ? "Edit project" : project.title}</h1>
      <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
        {canEdit ? (
          <ProjectForm project={project} imageUrl={mediaPublicUrl(project.media?.storage_key)} />
        ) : (
          <div className="stack">
            <p className="fld__hint">This is {project.original ? "a copy someone else made" : "someone else's copy"} — only they can edit it. You can still comment below.</p>
            <div className="fld"><label>Status</label><p>{project.status}</p></div>
            <div className="fld"><label>Description</label><p style={{ whiteSpace: "pre-wrap" }}>{project.body}</p></div>
            {project.notes ? <div className="fld"><label>Notes</label><p style={{ whiteSpace: "pre-wrap" }}>{project.notes}</p></div> : null}
          </div>
        )}
      </div>

      <Thread
        parentTable="projects"
        parentId={id}
        forks={forks}
        comments={comments}
        forkHref={(forkId) => `/content/projects/${forkId}`}
        canFork={Boolean(me)}
        forkAction={forkProject.bind(null, id)}
      />
    </div>
  );
}
