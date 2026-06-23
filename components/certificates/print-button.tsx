"use client";

/** Triggers the browser print dialog (Save as PDF) for the certificate page. */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-coral no-print"
      style={{
        fontSize: 14, fontWeight: 700, color: "#fff", padding: "12px 22px", borderRadius: 12,
        border: "none", cursor: "pointer", boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)",
      }}
    >
      🖨️ Print / Save as PDF
    </button>
  );
}
