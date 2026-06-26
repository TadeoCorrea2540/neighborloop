import Link from "next/link";
import Icon from "@/components/icons";
import { fmtDate } from "@/components/admin/badges";
import type { CertificateItem } from "@/lib/data/certificates";
import ImpactEmptyState from "./impact-empty-state";

export default function CertificatesSection({ certificates }: { certificates: CertificateItem[] }) {
  return (
    <section style={{ marginBottom: 22 }} aria-labelledby="certs-heading">
      <h2 id="certs-heading" className="impact-section-title">
        Certificates
      </h2>
      <p className="impact-section-sub">Official records of your completed missions</p>

      {certificates.length === 0 ? (
        <ImpactEmptyState
          icon="award"
          title="No certificates yet"
          body="Certificates appear here after organizers confirm your attendance on completed missions."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {certificates.map((c) => (
            <Link key={c.id} href={`/certificates/${c.id}`} className="impact-cert-card">
              <span className="impact-cert-seal" aria-hidden>
                <Icon name="award" size={16} />
              </span>
              <div style={{ paddingRight: 36 }}>
                <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3 }}>{c.missionTitle}</div>
                <div style={{ fontSize: 12, color: "var(--muted-3)", marginTop: 3 }}>{c.organizationName}</div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px 12px",
                    marginTop: 8,
                    fontSize: 12,
                    color: "var(--muted-2)",
                    fontWeight: 600,
                  }}
                >
                  <span>{c.hoursCredited}h credited</span>
                  <span>Issued {fmtDate(c.issuedAt)}</span>
                  <span style={{ color: "var(--coral-deep)" }}>{c.certificateNumber}</span>
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--coral-deep)", marginTop: 8, display: "inline-block" }}>
                View certificate →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
