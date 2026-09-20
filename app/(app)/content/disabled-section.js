export default function DisabledSection({ title }) {
  return (
    <div>
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">{title}</h1>
        </div>
      </div>
      <div className="panel" style={{ padding: 32 }}>
        <p className="list__empty" style={{ padding: 0 }}>
          This section isn&rsquo;t enabled yet — coming soon.
        </p>
      </div>
    </div>
  );
}
