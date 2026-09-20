import Link from "next/link";
import ProjectForm from "../form";

export default function NewProjectPage() {
  return (
    <div className="container">
      <p className="page__eyebrow"><Link href="/content/projects" className="muted">&larr; Projects</Link></p>
      <h1 className="page__title" style={{ marginBottom: 24 }}>New project</h1>
      <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
        <ProjectForm />
      </div>
    </div>
  );
}
