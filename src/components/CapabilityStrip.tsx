import React, { useState } from 'react';

export const CapabilityStrip: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="capability-strip" aria-label="Orbit capabilities">
        <div className="shell strip-inner">
          <button
            type="button"
            className="strip-quote-btn"
            onClick={() => setIsModalOpen(true)}
            aria-label="Learn about Orbit's core philosophy: One clear direction, more momentum at every step"
            title="Click to view Orbit philosophy breakdown"
          >
            <p>
              One clear direction.
              <br />
              <strong>More momentum at every step.</strong>
            </p>
            <span className="strip-info-chip">
              <span>✦</span> Explore Philosophy
            </span>
          </button>

          <div className="strip-items">
            <button
              type="button"
              className="strip-item-btn"
              onClick={() => setIsModalOpen(true)}
              title="Plan with context"
            >
              <i className="strip-icon icon-plan">✳</i> Plan with context
            </button>
            <button
              type="button"
              className="strip-item-btn"
              onClick={() => setIsModalOpen(true)}
              title="Build across your code"
            >
              <i className="strip-icon icon-build">⌘</i> Build across your code
            </button>
            <button
              type="button"
              className="strip-item-btn"
              onClick={() => setIsModalOpen(true)}
              title="Verify what ships"
            >
              <i className="strip-icon icon-check">✓</i> Verify what ships
            </button>
          </div>
        </div>
      </section>

      {/* Cute Aesthetic Philosophy Popover Modal */}
      {isModalOpen && (
        <div
          className="cute-popover-overlay"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="philosophy-title"
        >
          <div
            className="cute-popover-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cute-card-topbar">
              <div className="cute-badge">
                <span className="cute-sparkle">✳</span> ORBIT PHILOSOPHY
              </div>
              <button
                type="button"
                className="cute-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <h3 id="philosophy-title" className="cute-card-title">
              One clear direction.
              <br />
              <span>More momentum at every step.</span>
            </h3>

            <p className="cute-card-desc">
              Most AI dev tools trap you in conversational ping-pong. Orbit treats coding as an autonomous, verified pipeline that gives you complete certainty.
            </p>

            <div className="cute-steps-grid">
              <div className="cute-step-pill step-plan">
                <div className="cute-step-icon">✳</div>
                <div className="cute-step-content">
                  <strong>01 / Plan with Context</strong>
                  <p>
                    Synthesizes codebase architecture, dependencies, and component boundaries upfront. No blind coding.
                  </p>
                </div>
              </div>

              <div className="cute-step-pill step-build">
                <div className="cute-step-icon">⌘</div>
                <div className="cute-step-content">
                  <strong>02 / Build Across Code</strong>
                  <p>
                    Executes atomic changes in isolated git branches with zero drift, respecting your design system.
                  </p>
                </div>
              </div>

              <div className="cute-step-pill step-verify">
                <div className="cute-step-icon">✓</div>
                <div className="cute-step-content">
                  <strong>03 / Verify What Ships</strong>
                  <p>
                    Automated headless browser checks inspect every layout, token, and user interaction before you review.
                  </p>
                </div>
              </div>
            </div>

            <div className="cute-quote-banner">
              <em>&ldquo;You stay the architect. Orbit takes care of the momentum.&rdquo;</em>
            </div>

            <div className="cute-card-actions">
              <button
                type="button"
                className="cute-primary-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Got it, let’s build! ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
