"use client";

import { useMemo, useState } from "react";
import ResourceRow from "./resource-row";

const TYPES = ["ARTICLE", "DATA", "FILINGS", "DOCUMENT", "NOTE"];

export default function SourceList({ resources }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      const matchesQuery = !q || r.title.toLowerCase().includes(q) || r.file_name.toLowerCase().includes(q);
      const matchesType = !type || r.type === type;
      return matchesQuery && matchesType;
    });
  }, [resources, query, type]);

  return (
    <>
      {resources.length > 3 ? (
        <div className="sources-tools">
          <input
            className="text-input"
            placeholder="Search sources…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search sources"
          />
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t[0] + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
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
