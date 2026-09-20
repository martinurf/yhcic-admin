import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProjectForm from "../form";

export default async function EditProjectPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!project) notFound();

  return (
    <div className="container">
      <p className="page__eyebrow"><Link href="/content/projects" className="muted">&larr; Projects</Link></p>
      <h1 className="page__title" style={{ marginBottom: 24 }}>Edit project</h1>
      <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
