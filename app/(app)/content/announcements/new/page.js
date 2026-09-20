import Link from "next/link";
import AnnouncementForm from "../form";

export default function NewAnnouncementPage() {
  return (
    <div className="container">
      <p className="page__eyebrow"><Link href="/content/announcements" className="muted">&larr; Announcements</Link></p>
      <h1 className="page__title" style={{ marginBottom: 24 }}>New announcement</h1>
      <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
        <AnnouncementForm />
      </div>
    </div>
  );
}
