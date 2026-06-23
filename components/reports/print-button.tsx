"use client";

/** Triggers the browser print dialog (→ Save as PDF). Hidden when printing. */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print-hide btn-coral"
      style={{ color: "#fff", fontWeight: 700, fontSize: 14, padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)" }}
    >
      🖨 Print / Save as PDF
    </button>
  );
}
