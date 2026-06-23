import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getCertificateByIdForUser } from "@/lib/data/certificates";
import { UUID_RE } from "@/lib/auth/require-organizer";
import { fmtDate } from "@/components/admin/badges";
import PrintButton from "@/components/certificates/print-button";
import Logo from "@/components/logo";

export const dynamic = "force-dynamic";

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth?redirect=/certificates/${params.id}`);
  if (!UUID_RE.test(params.id)) notFound();

  // RLS-scoped: returns null unless this user may read it (volunteer/org/admin).
  const cert = await getCertificateByIdForUser(params.id, user.id);
  if (!cert) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app, #f7f8fc)", padding: "40px 20px" }}>
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff; } }`}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <Link href="/impact" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--muted-1)" }}>← Back to impact</Link>
          <PrintButton />
        </div>

        {/* certificate */}
        <div
          style={{
            background: "linear-gradient(180deg,#ffffff,#fffaf8)",
            border: "1px solid rgba(255,111,94,.25)",
            borderRadius: 22,
            padding: "48px 44px",
            boxShadow: "0 30px 70px -40px rgba(24,32,59,.45)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, borderRadius: 22, border: "2px solid rgba(255,111,94,.15)", margin: 10, pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 28 }}>
            <Logo size={30} />
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-.01em" }}>NeighborLoop</span>
          </div>

          <p style={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, letterSpacing: ".18em", color: "var(--coral-deep,#e8543f)", margin: 0 }}>
            CERTIFICATE OF PARTICIPATION
          </p>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted-2)", margin: "26px 0 6px" }}>This certifies that</p>
          <h1 style={{ textAlign: "center", fontSize: 34, fontWeight: 800, letterSpacing: "-.02em", margin: "0 0 6px" }}>{cert.volunteerName}</h1>
          <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted-2)", margin: "0 auto", maxWidth: 460, lineHeight: 1.6 }}>
            volunteered with <strong style={{ color: "var(--ink)" }}>{cert.organizationName}</strong> on the mission
            {" "}<strong style={{ color: "var(--ink)" }}>“{cert.missionTitle}”</strong>, contributing
          </p>
          <div style={{ textAlign: "center", margin: "18px 0" }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: "var(--coral-deep,#e8543f)" }}>{cert.hoursCredited}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--muted-1)", marginLeft: 6 }}>volunteer hours</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 34, flexWrap: "wrap", gap: 16, borderTop: "1px solid rgba(24,32,59,.08)", paddingTop: 20 }}>
            <div>
              <div style={{ fontSize: 11.5, color: "var(--muted-3)", fontWeight: 700 }}>CERTIFICATE NUMBER</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{cert.certificateNumber}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11.5, color: "var(--muted-3)", fontWeight: 700 }}>ISSUED</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{fmtDate(cert.issuedAt)}</div>
            </div>
          </div>
        </div>

        <p className="no-print" style={{ textAlign: "center", fontSize: 12.5, color: "var(--muted-3)", marginTop: 16 }}>
          Verified participation record issued through NeighborLoop.
        </p>
      </div>
    </div>
  );
}
