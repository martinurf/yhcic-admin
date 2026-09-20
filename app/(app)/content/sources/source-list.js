"use client";

import { useMemo, useState } from "react";
import ResourceRow from "./resource-row";

const TYPES = ["ARTICLE", "DATA", "FILINGS", "DOCUMENT", "NOTE"];

export default function SourceList({ resources, commentsByResource, originTitleById, me }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      const matchesQuery = !q || r.title.toLowerCase().includes(q) || (r.file_name || "").toLowerCase().includes(q);
      const matchesType = !type || r.type === type;
      return matchesQuery && matchesType;
    });
  }, [resources, query, type]);

  return (
    <>
      <div className="section-toolbar">
        <h2>Research shelf</h2>
        <span className="eyebrow">{resources.length} saved</span>
      </div>
      <div className="sources-tools">
        <input
          className="search"
          placeholder="Search the library…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search sources"
        />
        <select className="field" value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="editorial-list">
        {!filtered.length ? (
          <p className="empty">
            <strong>{resources.length ? "No matches" : "Nothing saved yet"}</strong>
            {resources.length ? "No sources match that search." : "Add the first article, dataset, or note."}
          </p>
        ) : (
          filtered.map((r) => (
            <ResourceRow
              key={r.id}
              resource={r}
              comments={commentsByResource[r.id] || []}
              originTitle={r.forked_from_id ? originTitleById[r.forked_from_id] : null}
              canEdit={Boolean(me) && r.uploaded_by === me.id}
            />
          ))
        )}
      </div>
    </>
  );
}
