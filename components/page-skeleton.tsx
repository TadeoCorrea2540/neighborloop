/**
 * Instant route-transition skeleton. Rendered by loading.tsx boundaries so the
 * sidebar stays put and the content area shows a shimmer immediately on nav,
 * instead of the old page hanging until the destination is ready.
 */
export default function PageSkeleton() {
  return (
    <div>
      <div className="hdr-skel" style={{ height: 30, width: 240, borderRadius: 10, marginBottom: 10 }} />
      <div className="hdr-skel" style={{ height: 15, width: 360, borderRadius: 8, marginBottom: 26 }} />
      <div className="card-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 22 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="hdr-skel" style={{ height: 108, borderRadius: 18 }} />
        ))}
      </div>
      <div className="two-pane" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="hdr-skel" style={{ height: 240, borderRadius: 18 }} />
        <div className="hdr-skel" style={{ height: 240, borderRadius: 18 }} />
      </div>
    </div>
  );
}
