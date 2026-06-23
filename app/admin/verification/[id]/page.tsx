import Link from "next/link";
import { notFound } from "next/navigation";
import { getVerificationDetailById } from "@/lib/data/admin-verification";
import { UUID_RE } from "@/lib/auth/require-admin";
import { fmtDate, VerificationBadge, MissionStatusBadge } from "@/components/admin/badges";
import VerificationDecision from "@/components/admin/verification-decision";
import type { MissionStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const card: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(24,32,59,.06)", padding: 20 };
const dt: React.CSSProperties = { fontSize: 12, color: "var(--muted-3)", fontWeight: 600 };
const dd: React.CSSProperties = { fontSize: 14, color: "var(--ink)", marginTop: 2 };

export default async function VerificationDetailPage({ params }: { params: { id: string } }) {
  if (!UUID_RE.test(params.id)) notFound();
  const detail = await getVerificationDetailById(params.id);
  if (!detail) notFound();
  const { item, org, owner, missions, history } = detail;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginBottom: 4 }}>
        <Link href="/admin/verification" style={{ color: "var(--muted-3)" }}>Verification</Link> /{" "}
        <span style={{ color: "var(--muted-1)", fontWeight: 600 }}>{org.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>{org.name}</h2>
        <VerificationBadge status={item.status} />
        {org.isPublic && (
          <Link href={`/org/${org.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)" }}>
            Public page ↗
          </Link>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }} className="detail-split">
        {/* left: profile + missions + history */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 14px" }}>Organization profile</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-2col">
              <div><div style={dt}>TYPE</div><div style={dd}>{org.type ?? "—"}</div></div>
              <div><div style={dt}>LOCATION</div><div style={dd}>{[org.city, org.countryCode].filter(Boolean).join(", ") || "—"}</div></div>
              <div><div style={dt}>OWNER</div><div style={dd}>{owner?.displayName ?? "—"}</div></div>
              <div><div style={dt}>CREATED</div><div style={dd}>{fmtDate(org.createdAt)}</div></div>
            </div>
            <div style={{ marginTop: 14 }}><div style={dt}>SHORT DESCRIPTION</div><div style={dd}>{org.shortDescription ?? "—"}</div></div>
            {org.description && <div style={{ marginTop: 14 }}><div style={dt}>DESCRIPTION</div><div style={{ ...dd, lineHeight: 1.5 }}>{org.description}</div></div>}
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              {org.websiteUrl && <a href={org.websiteUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)" }}>🌐 Website ↗</a>}
              {org.instagramUrl && <a href={org.instagramUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)" }}>📷 Social ↗</a>}
              {!org.websiteUrl && !org.instagramUrl && <span style={{ fontSize: 13, color: "var(--muted-3)" }}>No links provided.</span>}
            </div>
          </div>

          {/* document placeholder — uploads are a later phase */}
          <div style={{ ...card, background: "#fbfcfe" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px" }}>Documents</h3>
            <p style={{ fontSize: 13, color: "var(--muted-2)", margin: 0, lineHeight: 1.5 }}>
              📄 Verification documents are not implemented yet. Review is currently based on the organization profile, links, and admin judgment.
            </p>
          </div>

          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 12px" }}>Missions ({missions.length})</h3>
            {missions.length === 0 ? (
              <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: 0 }}>This organization has no missions yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {missions.map((m, i) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < missions.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none" }}>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{m.title}</span>
                    <span style={{ fontSize: 12.5, color: "var(--muted-3)" }}>{fmtDate(m.startsAt)}</span>
                    <MissionStatusBadge status={m.status as MissionStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 12px" }}>Verification history</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history.map((h) => (
                <div key={h.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <VerificationBadge status={h.status} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: "var(--muted-3)" }}>
                      submitted {fmtDate(h.submittedAt)}{h.reviewedAt ? ` · reviewed ${fmtDate(h.reviewedAt)}` : ""}
                    </div>
                    {h.publicReason && <div style={{ fontSize: 13, marginTop: 2 }}><strong>Public:</strong> {h.publicReason}</div>}
                    {h.internalNote && <div style={{ fontSize: 13, marginTop: 2, color: "var(--muted-1)" }}>🔒 <strong>Internal:</strong> {h.internalNote}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right: decision */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <VerificationDecision verificationId={item.id} status={item.status} />
          {item.internalNote && (
            <div style={{ ...card, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-3)" }}>🔒 CURRENT INTERNAL NOTE</div>
              <div style={{ fontSize: 13.5, color: "var(--ink)", marginTop: 6, lineHeight: 1.5 }}>{item.internalNote}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
