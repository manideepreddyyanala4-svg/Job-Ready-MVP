export default function Loading() {
  return (
    <main className="narrow" style={{ padding: "90px 0" }} aria-busy="true" aria-live="polite">
      <div className="card">
        <div className="eyebrow">Loading JobReady</div>
        <h1 className="display section-title" style={{ marginBottom: 8 }}>Getting your latest state…</h1>
        <p className="section-copy">This should not change your progress or analysis.</p>
      </div>
    </main>
  );
}
