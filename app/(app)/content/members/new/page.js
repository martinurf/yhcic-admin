import Link from "next/link";
import MemberForm from "../form";

export default function NewMemberPage() {
  return (
    <div>
      <p className="page__eyebrow"><Link href="/content/members" className="muted">&larr; Members</Link></p>
      <h1 className="page__title" style={{ marginBottom: 24 }}>New member</h1>
      <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
        <MemberForm />
      </div>
    </div>
  );
}
