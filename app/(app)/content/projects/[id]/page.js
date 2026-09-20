import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { mediaPublicUrl } from "@/lib/media-url";
import ProjectForm from "../form";

export default async function EditProjectPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*, media(storage_key)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  /* RLS hides a private project from anyone but its creator, so this
     is also where a non-creator trying a private project's URL lands —
     same "not found" a real missing row would give, not an error
     that confirms something exists there. */
  if (!project) notFound();

  return (
    <div className="container">
      <p className="page__eyebrow"><Link href="/content/projects" className="muted">&larr; Projects</Link></p>
      <h1 className="page__title" style={{ marginBottom: 24 }}>Edit project</h1>
      <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
        <ProjectForm project={project} imageUrl={mediaPublicUrl(project.media?.storage_key)} />
      </div>
    </div>
  );
}
