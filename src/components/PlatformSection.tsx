import React, { useState } from 'react';

interface PlatformSectionProps {
  onOpenPlatformDemo?: () => void;
}

export const PlatformSection: React.FC<PlatformSectionProps> = ({ onOpenPlatformDemo }) => {
  const [selectedFeature, setSelectedFeature] = useState<'orchestrate' | 'create' | 'verify' | null>(null);

  return (
    <section className="platform-section shell section-space" id="platform" aria-labelledby="platform-title">
      <div className="section-heading">
        <p className="eyebrow">YOUR WORK, IN MOTION</p>
        <h2 id="platform-title">
          A bigger view of
          <br />
          the work ahead.
        </h2>
        <p className="section-intro">
          Move from individual prompts to a whole project in motion. Orbit gives agents the context and tools to carry work across the finish line.
        </p>
      </div>

      <div className="platform-grid">
        <article className="feature-card feature-card-dark">
          <div className="feature-topline">
            <span className="feature-icon icon-orchestrate">✳</span>
            <span>01 / ORCHESTRATE</span>
          </div>
          <div className="constellation" aria-hidden="true">
            <span className="constellation-line line-a"></span>
            <span className="constellation-line line-b"></span>
            <span className="constellation-line line-c"></span>
            <span className="constellation-node node-core">✳</span>
            <span className="constellation-node node-one">⌘</span>
            <span className="constellation-node node-two">▤</span>
            <span className="constellation-node node-three">✓</span>
          </div>
          <h3>
            Keep every agent
            <br />
            on the same page.
          </h3>
          <p>Give a clear brief, then follow each agent’s plan and progress from one focused workspace.</p>
          <button
            type="button"
            className="card-link-btn"
            onClick={() => setSelectedFeature('orchestrate')}
          >
            See orchestration <span aria-hidden="true">↗</span>
          </button>
        </article>

        <article className="feature-card feature-card-lilac">
          <div className="feature-topline">
            <span className="feature-icon icon-editor">⌘</span>
            <span>02 / CREATE</span>
          </div>
          <div className="code-art" aria-hidden="true">
            <div className="code-bar">
              <span></span>
              <span></span>
              <span></span>
              <b>ProductGallery.tsx</b>
            </div>
            <div className="code-lines">
              <span>
                <i>01</i>
                <b className="code-purple">const</b> gallery = <b className="code-blue">&lt;Gallery</b>
              </span>
              <span>
                <i>02</i>&nbsp;&nbsp; images=&#123;product.images&#125;
              </span>
              <span>
                <i>03</i>&nbsp;&nbsp; layout=<b className="code-pink">"immersive"</b>
              </span>
              <span>
                <i>04</i>
                <b className="code-blue">/&gt;</b>
              </span>
              <span>
                <i>05</i>
              </span>
            </div>
            <span className="code-cursor"></span>
          </div>
          <h3>
            Stay close to
            <br />
            the implementation.
          </h3>
          <p>Work in a familiar editor while agents navigate your codebase and make focused changes.</p>
          <button
            type="button"
            className="card-link-btn"
            onClick={() => setSelectedFeature('create')}
          >
            Explore the workspace <span aria-hidden="true">↗</span>
          </button>
        </article>

        <article className="feature-card feature-card-mint">
          <div className="feature-topline">
            <span className="feature-icon icon-browser">◉</span>
            <span>03 / VERIFY</span>
          </div>
          <div className="browser-art" aria-hidden="true">
            <div className="browser-bar">
              <span>◉</span>
              <b>localhost:3000</b>
              <span>↗</span>
            </div>
            <div className="browser-page">
              <div className="browser-nav">
                <i></i>
                <span>STUDIO</span>
                <span>SHOP</span>
                <span>ABOUT</span>
                <i></i>
              </div>
              <div className="browser-hero">
                <div>
                  <b>
                    Objects
                    <br />
                    for living.
                  </b>
                  <i></i>
                  <i></i>
                </div>
                <div className="browser-shape"></div>
              </div>
            </div>
          </div>
          <h3>
            See the result
            <br />
            before it ships.
          </h3>
          <p>Pair code changes with browser checks and visual review, so you can move forward with confidence.</p>
          <button
            type="button"
            className="card-link-btn"
            onClick={() => setSelectedFeature('verify')}
          >
            See browser review <span aria-hidden="true">↗</span>
          </button>
        </article>
      </div>

      {/* Feature Deep Dive Modal */}
      {selectedFeature && (
        <div className="cute-popover-overlay" onClick={() => setSelectedFeature(null)} role="dialog">
          <div className="cute-popover-card" onClick={(e) => e.stopPropagation()}>
            <div className="cute-card-topbar">
              <div className="cute-badge">
                <span>✦</span> ORBIT PLATFORM DEEP DIVE
              </div>
              <button type="button" className="cute-close-btn" onClick={() => setSelectedFeature(null)}>
                ✕
              </button>
            </div>

            {selectedFeature === 'orchestrate' && (
              <>
                <h3 className="cute-card-title">
                  Multi-Agent <span>Orchestration</span>
                </h3>
                <p className="cute-card-desc">
                  Instead of disconnected chat prompts, Orbit runs a coordinated graph of planning, code synthesis, and AST validation agents in sequential lockstep.
                </p>
                <div className="cute-steps-grid">
                  <div className="cute-step-pill">
                    <div className="cute-step-icon">✳</div>
                    <div className="cute-step-content">
                      <strong>Requirement Synthesis</strong>
                      <p>Parses your goal into structured design tokens and API contracts.</p>
                    </div>
                  </div>
                  <div className="cute-step-pill">
                    <div className="cute-step-icon">◈</div>
                    <div className="cute-step-content">
                      <strong>Conflict Resolution</strong>
                      <p>Ensures multiple agents don’t collide on common schema or CSS files.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedFeature === 'create' && (
              <>
                <h3 className="cute-card-title">
                  Close to the <span>Implementation</span>
                </h3>
                <p className="cute-card-desc">
                  Real React, TypeScript, and SQLite code generated directly in your workspace. You can inspect git diffs, modify lines, or undo changes at any time.
                </p>
                <div className="cute-steps-grid">
                  <div className="cute-step-pill">
                    <div className="cute-step-icon">⌘</div>
                    <div className="cute-step-content">
                      <strong>Atomic Diffs</strong>
                      <p>Precise line additions and removals without blowing away your repo.</p>
                    </div>
                  </div>
                  <div className="cute-step-pill">
                    <div className="cute-step-icon">⚡</div>
                    <div className="cute-step-content">
                      <strong>Sub-15ms Hot Reloading</strong>
                      <p>Vite transforms modules in memory so you see edits instantly.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedFeature === 'verify' && (
              <>
                <h3 className="cute-card-title">
                  Automated <span>Browser Verification</span>
                </h3>
                <p className="cute-card-desc">
                  Orbit launches headless Playwright testing on `http://localhost:3000` to inspect responsive layout shifts, color contrast, and hydration errors before shipping.
                </p>
                <div className="cute-steps-grid">
                  <div className="cute-step-pill">
                    <div className="cute-step-icon">◉</div>
                    <div className="cute-step-content">
                      <strong>Multi-Viewport Audit</strong>
                      <p>Checks Desktop, Tablet, and Mobile layouts simultaneously.</p>
                    </div>
                  </div>
                  <div className="cute-step-pill">
                    <div className="cute-step-icon">✓</div>
                    <div className="cute-step-content">
                      <strong>Zero Regressions</strong>
                      <p>Catches visual discrepancies and broken components automatically.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="cute-card-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              {onOpenPlatformDemo && (
                <button
                  type="button"
                  className="cute-primary-btn"
                  onClick={() => {
                    setSelectedFeature(null);
                    onOpenPlatformDemo();
                  }}
                >
                  Open Live Sandbox ↗
                </button>
              )}
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setSelectedFeature(null)}
                style={{ fontSize: '11px', padding: '6px 14px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
