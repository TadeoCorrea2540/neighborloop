/**
 * Instant chat-shaped skeleton for the conversation route (loading.tsx). Mirrors
 * MessageThread's layout so opening a conversation shows a matching shimmer
 * immediately instead of the generic page skeleton or a blank wait.
 */
const BUBBLES = [
  { me: false, w: 180 },
  { me: true, w: 230 },
  { me: false, w: 150 },
  { me: true, w: 200 },
  { me: false, w: 170 },
  { me: true, w: 120 },
];

export default function ThreadSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", minHeight: 420, background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, overflow: "hidden" }}>
      {/* header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(24,32,59,.06)", display: "flex", alignItems: "center", gap: 12 }}>
        <span className="hdr-skel" style={{ width: 18, height: 18, borderRadius: 6 }} />
        <div style={{ flex: 1 }}>
          <div className="hdr-skel" style={{ width: 130, height: 14, borderRadius: 7, marginBottom: 6 }} />
          <div className="hdr-skel" style={{ width: 200, height: 11, borderRadius: 6 }} />
        </div>
      </div>

      {/* bubbles */}
      <div style={{ flex: 1, padding: 18, background: "#fbfcfe", display: "flex", flexDirection: "column", gap: 12 }}>
        {BUBBLES.map((b, i) => (
          <div key={i} className="hdr-skel" style={{ alignSelf: b.me ? "flex-end" : "flex-start", width: b.w, height: 40, borderRadius: 14 }} />
        ))}
      </div>

      {/* composer */}
      <div style={{ borderTop: "1px solid rgba(24,32,59,.06)", padding: 12, display: "flex", gap: 9 }}>
        <div className="hdr-skel" style={{ flex: 1, height: 42, borderRadius: 12 }} />
        <div className="hdr-skel" style={{ width: 84, height: 42, borderRadius: 12 }} />
      </div>
    </div>
  );
}
