import { getAuditEvents, type AuditCategory } from "@/lib/data/admin-audit";
import { fmtDate, FilterChips } from "@/components/admin/badges";

export const dynamic = "force-dynamic";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "verification", label: "Verification" },
  { value: "reports", label: "Reports" },
  { value: "missions", label: "Missions" },
  { value: "organizations", label: "Organizations" },
];

function readableEvent(eventType: string): string {
  return eventType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseCategory(v: string | string[] | undefined): AuditCategory {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "verification" || s === "reports" || s === "missions" || s === "organizations" ? s : "all";
}

function metaSummary(meta: Record<string, unknown>): string {
  const keys = Object.keys(meta);
  if (keys.length === 0) return "";
  return keys.map((k) => `${k}: ${typeof meta[k] === "object" ? JSON.stringify(meta[k]) : String(meta[k])}`).join(" · ");
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: { category?: string | string[] };
}) {
  const category = parseCategory(searchParams.category);
  const events = await getAuditEvents({ category, limit: 150 });

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Audit log</h2>
        <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>Every admin decision, newest first. Admin-only.</p>
      </div>

      <FilterChips options={FILTERS} active={category} hrefFor={(v) => `/admin/audit?category=${v}`} />

      {events.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 16, padding: "40px 24px", textAlign: "center", color: "var(--muted-3)" }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>🧾</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--muted-1)" }}>No audit events yet</div>
          <p style={{ fontSize: 13.5, marginTop: 4 }}>Admin decisions will appear here as they happen.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 16, overflow: "hidden" }}>
          {events.map((e, i) => {
            const summary = metaSummary(e.metadata);
            return (
              <div key={e.id} style={{ padding: "14px 18px", borderBottom: i < events.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none", display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{readableEvent(e.eventType)}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginTop: 2 }}>
                    {e.entityType}{e.entityId ? ` · ${e.entityId.slice(0, 8)}…` : ""}
                  </div>
                  {summary && (
                    <details style={{ marginTop: 6 }}>
                      <summary style={{ fontSize: 12, color: "var(--blue)", cursor: "pointer" }}>details</summary>
                      <div style={{ fontSize: 12, color: "var(--muted-1)", marginTop: 4, wordBreak: "break-word" }}>{summary}</div>
                    </details>
                  )}
                </div>
                <div style={{ textAlign: "right", minWidth: 120 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{e.actorName ?? "—"}</div>
                  <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{fmtDate(e.createdAt)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
