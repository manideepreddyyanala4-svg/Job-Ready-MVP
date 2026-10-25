import Link from "next/link";

export default function NotFound() {
  return (
    <main className="narrow" style={{ padding: "90px 0" }}>
      <div className="empty-state">
        <div className="empty-icon">?</div>
        <div className="eyebrow">Page not found</div>
        <h1 className="display section-title">That JobReady page is not available.</h1>
        <p className="section-copy" style={{ margin: "0 auto 22px" }}>The link may be outdated, the project may not be available in this beta, or the page may have moved.</p>
        <Link className="btn btn-dark" href="/">Go to JobReady</Link>
      </div>
    </main>
  );
}
