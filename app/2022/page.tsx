export default function ArchivePage() {
  return (
    <main className="archive-shell">
      <div className="archive-header">
        <div>
          <p className="archive-kicker">Web Archive</p>
          <h1>2022 portfolio snapshot</h1>
        </div>
        <a href="/" className="archive-back-link">
          Back to current portfolio
        </a>
      </div>

      <div className="archive-browser">
        <div className="browser-toolbar">
          <div className="browser-actions" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="browser-address">
            <span>https://ch-monish.github.io/</span>
          </div>

          <div className="browser-controls">
            <span className="browser-tag">Saved archive</span>
            <a href="/" className="browser-link">
              Current site
            </a>
          </div>
        </div>

        <div className="browser-panel">
          <aside className="browser-sidebar">
            <div className="sidebar-title">Archive</div>
            <ul>
              <li className="active">Portfolio / 2022</li>
              <li>College era</li>
              <li>Projects & internships</li>
              <li>Resume notes</li>
            </ul>
          </aside>

          <div className="browser-viewport-wrap">
            <div className="browser-meta-bar">
              <span>Archived view</span>
              <span>Captured from 2022</span>
            </div>
            <iframe src="/archive/2022/index.html" title="2022 portfolio archive" className="archive-frame" />
          </div>
        </div>
      </div>
    </main>
  );
}
