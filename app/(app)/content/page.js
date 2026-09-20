import Link from "next/link";

const TYPES = ["Announcements", "Projects", "Goals"];

export default function ContentHubPage() {
  return (
    <div className="container">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">Content</h1>
        </div>
      </div>

      <div className="list" style={{ marginBottom: 14 }}>
        {TYPES.map((label) => (
          <div key={label} className="list__row">
            <span className="list__title">{label}</span>
            <span className="badge badge--draft">Soon</span>
          </div>
        ))}
      </div>

      <p className="fld__hint">
        Members already has its own section &mdash; see the Members tab below.{" "}
        <Link href="/content/members" style={{ color: "var(--purple)", fontWeight: 600 }}>
          Go to Members &rarr;
        </Link>
      </p>
    </div>
  );
}
