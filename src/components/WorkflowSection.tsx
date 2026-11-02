import React, { useState } from 'react';

export const WorkflowSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isSimulatorExpanded, setIsSimulatorExpanded] = useState(false);

  const steps = [
    {
      num: '01',
      title: 'Describe the destination',
      desc: 'Set the goal in natural language. Add constraints, mockups, or database requirements where it helps.',
      statusActive: 'INTENT PARSED',
      statusInactive: 'PHASE 1',
      detailBadge: 'Requirements Synthesis',
      simulationCode: `// Phase 1: Synthesizing destination\nconst brief = "Create an immersive product gallery with smooth transitions";\nconst intent = AgentEngine.parseIntent(brief);\n// Generated 3 sub-tasks with bounded module scopes`,
    },
    {
      num: '02',
      title: 'Review the plan & diffs',
      desc: 'See the architectural approach before work begins. Steer dependencies, database tables, and component APIs.',
      statusActive: 'DIFFS APPLIED',
      statusInactive: 'PHASE 2',
      detailBadge: 'Branch & File Edits',
      simulationCode: `// Phase 2: Isolated Branch Generation\ngit checkout -b orbit/storefront-refresh\n// Modifying ProductGallery.tsx (+84, -20 lines)\n// Modifying theme.css (+20 lines)\n// Transformed AST with 0 TypeScript errors`,
    },
    {
      num: '03',
      title: 'Follow work through live verification',
      desc: 'Track edits, automated headless browser tests, and responsive reviews as your project comes together.',
      statusActive: 'VERIFIED (12/12)',
      statusInactive: 'PHASE 3',
      detailBadge: 'Automated Headless Test',
      simulationCode: `// Phase 3: Headless Playwright Review\nawait page.goto('http://localhost:3000');\nawait expect(page.locator('.mock-product-grid')).toBeVisible();\n// ✓ Viewport Responsive (390px, 768px, 1200px)\n// ✓ 0 Console Errors | Ready for Release`,
    },
  ];

  const activeStepData = steps[activeStep - 1];

  return (
    <section className="workflow-section" id="workflow" aria-labelledby="workflow-title">
      <div className="shell workflow-inner">
        <div className="workflow-copy">
          <p className="eyebrow eyebrow-light">FROM INTENT TO OUTCOME</p>
          <h2 id="workflow-title">
            Think in outcomes.
            <br />
            <span>Build with clarity.</span>
          </h2>
          <p>
            Describe what you want to achieve. Orbit turns the goal into a visible plan, generates isolated branch diffs, and verifies running code in headless browsers before you merge.
          </p>
          <button
            type="button"
            className="button button-light"
            onClick={() => setIsSimulatorExpanded(!isSimulatorExpanded)}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            {isSimulatorExpanded ? 'Close Workflow Simulator ✕' : 'Explore Workflow Simulator ⚡'}
          </button>
        </div>

        <div className="workflow-steps">
          <div className="workflow-line">
            <span style={{ height: activeStep === 1 ? '24%' : activeStep === 2 ? '62%' : '100%' }}></span>
          </div>
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isSelected = activeStep === stepNum;
            return (
              <article
                key={step.num}
                className={`workflow-step ${isSelected ? 'selected' : ''}`}
                data-step={stepNum}
                onClick={() => setActiveStep(stepNum)}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
              >
                <span className="workflow-number">{step.num}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
                <span className="workflow-status">{isSelected ? step.statusActive : step.statusInactive}</span>
              </article>
            );
          })}
        </div>
      </div>

      {/* Interactive Workflow Simulator Panel */}
      <div className={`shell workflow-simulator-box ${isSimulatorExpanded ? 'is-open' : ''}`}>
        <div className="simulator-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--lime)' }}>⚡</span>
            <strong>Workflow Phase {activeStepData.num}: {activeStepData.title}</strong>
          </div>
          <span className="badge" style={{ background: '#334155', color: '#f8fafc' }}>
            {activeStepData.detailBadge}
          </span>
        </div>
        <div className="simulator-body">
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#cbd5e1' }}>
            {activeStepData.desc}
          </p>
          <pre className="simulator-code-block">
            {activeStepData.simulationCode}
          </pre>
          <div className="simulator-footer-tabs">
            {steps.map((s, idx) => (
              <button
                key={s.num}
                type="button"
                className={`sim-tab-btn ${activeStep === idx + 1 ? 'is-active' : ''}`}
                onClick={() => setActiveStep(idx + 1)}
              >
                Phase {s.num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
