"use client";

import { useMemo, useState } from "react";
import ResourceRow from "./resource-row";

export default function SourceList({ resources }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter(
      (r) => r.title.toLowerCase().includes(q) || r.file_name.toLowerCase().includes(q)
    );
  }, [resources, query]);

  return (
    <>
      {resources.length > 4 ? (
        <input
          className="text-input"
          style={{ width: "100%", marginBottom: 14 }}
          placeholder="Search sources…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search sources"
        />
      ) : null}
      <div className="list">
        {!filtered.length ? (
          <p className="list__empty">{resources.length ? "No sources match that search." : "Nothing uploaded yet."}</p>
        ) : (
          filtered.map((r) => <ResourceRow key={r.id} resource={r} />)
        )}
      </div>
    </>
  );
}
