"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="narrow" style={{ padding: "90px 0" }}>
      <div className="empty-state">
        <div className="empty-icon">!</div>
        <div className="eyebrow">Something went wrong</div>
        <h1 className="display section-title">We could not load this part of JobReady.</h1>
        <p className="section-copy" style={{ margin: "0 auto 22px" }}>Your data has not been replaced. Try the request again. If the problem continues, return to the dashboard.</p>
        <button className="btn btn-dark" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
