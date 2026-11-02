import React, { useState, useRef } from 'react';
import { AgentStep } from '../types';

interface HeroProps {
  currentBuilderRole?: string;
  onOpenQuickStart?: () => void;
  onOpenPlatformDemo?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentBuilderRole: _currentBuilderRole = 'fullstack',
  onOpenQuickStart,
  onOpenPlatformDemo,
}) => {
  const [prompt, setPrompt] = useState(
    'Give the product page a calmer layout and make the gallery feel more immersive.'
  );
  const [projectName] = useState('atlas / storefront-refresh');
  const [activeBranch, setActiveBranch] = useState<'main' | 'staging' | 'feat/storefront-refresh'>('main');
  const [workspaceTab, setWorkspaceTab] = useState<'editor' | 'plan' | 'search' | 'settings'>('editor');
  
  const [isRunning, setIsRunning] = useState(false);
  const [runStage, setRunStage] = useState<'idle' | 'planning' | 'building' | 'verifying' | 'completed'>('idle');
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  // Micro-modals for hero tags
  const [activeModal, setActiveModal] = useState<'plan' | 'verify' | 'menu' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const [steps, setSteps] = useState<AgentStep[]>([
    {
      step_number: 1,
      title: 'Plan ready',
      description: 'Mapped the page structure and component boundaries',
      status: 'done',
      time_label: '2m',
    },
    {
      step_number: 2,
      title: 'Building gallery',
      description: 'Updating 3 components with smooth transitions',
      status: 'active',
      time_label: 'now',
    },
    {
      step_number: 3,
      title: 'Check in browser',
      description: 'Waiting for build completion',
      status: 'pending',
      time_label: '—',
    },
  ]);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const handleRunAgent = () => {
    if (!prompt.trim() || isRunning) return;
    clearAllTimers();
    setIsRunning(true);
    setCompletedMessage(null);
    setWorkspaceTab('editor');

    // STAGE 1: Planning
    setRunStage('planning');
    setSteps([
      {
        step_number: 1,
        title: 'Synthesizing requirements',
        description: 'Parsing design tokens and component hierarchy...',
        status: 'active',
        time_label: 'running',
      },
      {
        step_number: 2,
        title: 'Building gallery components',
        description: 'Queued behind plan approval',
        status: 'pending',
        time_label: 'queued',
      },
      {
        step_number: 3,
        title: 'Headless browser validation',
        description: 'Queued behind build',
        status: 'pending',
        time_label: 'queued',
      },
    ]);

    // Transition to STAGE 2: Building after 1.8s
    const t1 = setTimeout(() => {
      setRunStage('building');
      setSteps([
        {
          step_number: 1,
          title: 'Plan approved',
          description: 'Architecture mapped across 3 modules',
          status: 'done',
          time_label: '✓ done',
        },
        {
          step_number: 2,
          title: 'Writing component diffs',
          description: 'Updating ProductGallery.tsx, Carousel.tsx (+142, -38)...',
          status: 'active',
          time_label: 'running',
        },
        {
          step_number: 3,
          title: 'Headless browser validation',
          description: 'Queued behind build',
          status: 'pending',
          time_label: 'queued',
        },
      ]);
    }, 1800);

    // Transition to STAGE 3: Verifying after 3.8s
    const t2 = setTimeout(() => {
      setRunStage('verifying');
      setSteps([
        {
          step_number: 1,
          title: 'Plan approved',
          description: 'Architecture mapped across 3 modules',
          status: 'done',
          time_label: '✓ done',
        },
        {
          step_number: 2,
          title: 'Gallery components compiled',
          description: '+142 lines committed to branch ' + activeBranch,
          status: 'done',
          time_label: '✓ done',
        },
        {
          step_number: 3,
          title: 'Headless browser verification',
          description: 'Automated Playwright checks running across 3 viewports...',
          status: 'active',
          time_label: 'running',
        },
      ]);
    }, 3800);

    // FINAL STAGE: Completion after 5.4s
    const t3 = setTimeout(() => {
      setRunStage('completed');
      setSteps([
        {
          step_number: 1,
          title: 'Plan approved',
          description: 'Architecture mapped across 3 modules',
          status: 'done',
          time_label: '✓ done',
        },
        {
          step_number: 2,
          title: 'Gallery components compiled',
          description: '+142 lines committed to branch ' + activeBranch,
          status: 'done',
          time_label: '✓ done',
        },
        {
          step_number: 3,
          title: 'Layout & review passed',
          description: '12/12 visual checks verified in headless browser',
          status: 'done',
          time_label: '✓ done',
        },
      ]);
      setCompletedMessage('✓ All 3 checks verified: Storefront refresh applied cleanly to live preview.');
      setIsRunning(false);
    }, 5400);

    timersRef.current.push(t1, t2, t3);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunAgent();
    }
  };

  const handleCycleBranch = () => {
    const branches: Array<'main' | 'staging' | 'feat/storefront-refresh'> = ['main', 'staging', 'feat/storefront-refresh'];
    const nextIdx = (branches.indexOf(activeBranch) + 1) % branches.length;
    const nextBranch = branches[nextIdx];
    setActiveBranch(nextBranch);
    showNotice(`Switched active git workspace to '${nextBranch}'`);
  };

  const scrollToExplore = () => {
    const target = document.getElementById('workflow') || document.getElementById('platform');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const mockFiles = [
    { name: 'ProductGallery.tsx', path: 'src/components/ProductGallery.tsx', lines: '+84, -12' },
    { name: 'ImageCarousel.tsx', path: 'src/components/ImageCarousel.tsx', lines: '+38, -6' },
    { name: 'theme.css', path: 'src/styles/theme.css', lines: '+20, -0' },
    { name: 'orbitStore.ts', path: 'src/services/orbitStore.ts', lines: 'clean' },
    { name: 'server.ts', path: 'server.ts', lines: 'verified' },
  ];

  const filteredFiles = mockFiles.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="live-dot"></span> THE AGENT-FIRST WORKSPACE
        </p>
        <h1 id="hero-title">
          Make room
          <br />
          for <span>what’s next.</span>
        </h1>
        <p className="hero-description">
          Bring your best ideas. Orbit’s AI agents plan, build, and verify your code in real time while you stay in full control of the outcome.
        </p>
        <div className="hero-actions">
          {onOpenPlatformDemo ? (
            <button
              type="button"
              className="button button-dark"
              onClick={onOpenPlatformDemo}
              style={{ cursor: 'pointer' }}
            >
              Explore the platform <span aria-hidden="true">↗</span>
            </button>
          ) : (
            <a className="button button-dark" href="#platform">
              Explore the platform <span aria-hidden="true">↗</span>
            </a>
          )}
          {onOpenQuickStart && (
            <button
              type="button"
              className="button"
              onClick={onOpenQuickStart}
              style={{ cursor: 'pointer', background: 'var(--lime)', color: '#171820', fontWeight: 700 }}
            >
              Start on Win / Mac <span>⚡</span>
            </button>
          )}
          <a className="text-link" href="#workflow">
            See how it works <span aria-hidden="true">↓</span>
          </a>
        </div>

        {/* Rich verified proof points */}
        <div className="hero-proof-list" aria-label="Verified platform capabilities">
          <div className="proof-item">
            <span className="proof-check" aria-hidden="true">✓</span>
            <span>Zero configuration — 1-click startup on Windows & Mac</span>
          </div>
          <div className="proof-item">
            <span className="proof-check" aria-hidden="true">✓</span>
            <span>Autonomous multi-step planning, atomic coding & git isolation</span>
          </div>
          <div className="proof-item">
            <span className="proof-check" aria-hidden="true">✓</span>
            <span>Headless browser verification with live visual checks</span>
          </div>
          <div className="proof-item">
            <span className="proof-check" aria-hidden="true">✓</span>
            <span>Local SQLite persistence (orbit.db) & production cloud exports</span>
          </div>
        </div>
      </div>

      <div className="hero-art" aria-label="Illustration of an AI agent planning, building, and checking a project">
        <div className="orbit-glow"></div>
        <div className="orbit-ring orbit-ring-one"></div>
        <div className="orbit-ring orbit-ring-two"></div>

        {/* Floating action notice */}
        {actionNotice && (
          <div className="hero-floating-notice">
            <span>◈</span> {actionNotice}
          </div>
        )}

        <div className="hero-window">
          <div className="window-topbar">
            <div
              className="window-dots"
              onClick={() => showNotice('Orbit Window: Workspace active and listening on port 3000')}
              title="Window Controls"
              role="button"
              tabIndex={0}
            >
              <i></i>
              <i></i>
              <i></i>
            </div>
            <div className="window-path">
              <span className="path-icon">◈</span> {projectName}
            </div>
            <button
              type="button"
              className="window-menu-btn"
              onClick={() => setActiveModal(activeModal === 'menu' ? null : 'menu')}
              aria-label="Workspace Actions Menu"
              title="Workspace actions"
            >
              •••
            </button>

            {/* Quick Actions Dropdown */}
            {activeModal === 'menu' && (
              <div className="hero-quick-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    handleRunAgent();
                  }}
                >
                  <span>✳</span> Re-run Agent Simulation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setActiveModal('plan');
                  }}
                >
                  <span>▤</span> View Full Architecture Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setActiveModal('verify');
                  }}
                >
                  <span>✓</span> Inspect Playwright Test Suite
                </button>
                {onOpenPlatformDemo && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      onOpenPlatformDemo();
                    }}
                  >
                    <span>↗</span> Open Full Sandbox Workspace
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="workspace-layout">
            {/* Interactive Left Rail Buttons */}
            <aside className="workspace-rail" aria-label="Workspace Navigation">
              <button
                type="button"
                className="rail-logo-btn"
                onClick={() => setWorkspaceTab('editor')}
                title="Orbit Home"
              >
                ◉
              </button>
              <button
                type="button"
                className={`rail-icon-btn ${workspaceTab === 'editor' ? 'selected' : ''}`}
                onClick={() => setWorkspaceTab('editor')}
                title="Editor & Agent Prompt (⌘)"
              >
                ⌘
              </button>
              <button
                type="button"
                className={`rail-icon-btn ${workspaceTab === 'plan' ? 'selected' : ''}`}
                onClick={() => setWorkspaceTab('plan')}
                title="Architecture & Plan Specs (▤)"
              >
                ▤
              </button>
              <button
                type="button"
                className={`rail-icon-btn ${workspaceTab === 'search' ? 'selected' : ''}`}
                onClick={() => setWorkspaceTab('search')}
                title="Search Codebase & AST (⌕)"
              >
                ⌕
              </button>
              <button
                type="button"
                className={`rail-icon-btn rail-bottom ${workspaceTab === 'settings' ? 'selected' : ''}`}
                onClick={() => setWorkspaceTab('settings')}
                title="Workspace Agent Settings (⚙)"
              >
                ⚙
              </button>
            </aside>

            {/* Main Interactive Workspace Area */}
            <div className="workspace-main">
              <div className="project-heading">
                <div>
                  <span className="mini-label">PROJECT</span>
                  <h2>Storefront refresh</h2>
                </div>
                <button
                  type="button"
                  className="branch-pill-btn"
                  onClick={handleCycleBranch}
                  title="Click to cycle active git branch"
                >
                  <span></span> {activeBranch} <i>⇄</i>
                </button>
              </div>

              {/* TAB 1: Main Editor & Agent Prompt View */}
              {workspaceTab === 'editor' && (
                <>
                  <div className="task-prompt-interactive">
                    <span className="sparkle" style={{ color: 'var(--violet)', fontSize: '13px' }}>
                      ✳
                    </span>
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe what you want the agent to build..."
                      aria-label="Agent execution prompt"
                      disabled={isRunning}
                    />
                    <button
                      type="button"
                      className="task-run-btn"
                      onClick={handleRunAgent}
                      disabled={isRunning}
                      aria-label="Run AI agent"
                      title="Click to simulate live agent execution across 3 stages"
                    >
                      {isRunning ? (
                        <>
                          <span>{runStage === 'planning' ? 'Planning...' : runStage === 'building' ? 'Building...' : 'Verifying...'}</span>
                          <i className="spinner-dot"></i>
                        </>
                      ) : (
                        <>
                          Run <span>✳</span>
                        </>
                      )}
                    </button>
                  </div>

                  {completedMessage && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      fontSize: '8px',
                      color: '#15803d',
                      marginBottom: '8px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {completedMessage}
                    </div>
                  )}

                  <div className="activity-label">
                    <span>AGENT ORCHESTRATION TIMELINE</span>
                    <span>
                      {isRunning ? (
                        <span style={{ color: 'var(--violet)', fontWeight: 700 }}>STAGE: {runStage.toUpperCase()}</span>
                      ) : (
                        <>LIVE <i></i></>
                      )}
                    </span>
                  </div>
                  <div className="agent-list">
                    {steps.map((step, idx) => (
                      <div key={idx} className={`agent-step ${step.status}`}>
                        <span className="step-symbol">
                          {step.status === 'done' ? (
                            '✓'
                          ) : step.status === 'active' ? (
                            <i></i>
                          ) : (
                            '○'
                          )}
                        </span>
                        <div>
                          <strong>{step.title}</strong>
                          <small>{step.description}</small>
                        </div>
                        <span className="step-time">{step.time_label || 'now'}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* TAB 2: Plan View (▤) */}
              {workspaceTab === 'plan' && (
                <div className="hero-rail-tab-content">
                  <div className="tab-title-row">
                    <span className="tab-badge">ARCHITECTURE SPECIFICATION</span>
                    <span className="tab-timestamp">v2.4 • synchronized</span>
                  </div>
                  <div className="plan-modules-list">
                    <div className="plan-module-item">
                      <div className="module-header">
                        <strong>1. ProductGallery.tsx</strong>
                        <span className="module-tag">React / TypeScript</span>
                      </div>
                      <p>Implements multi-angle thumbnail carousel with smooth CSS spring transitions and keyboard controls.</p>
                    </div>
                    <div className="plan-module-item">
                      <div className="module-header">
                        <strong>2. theme.css</strong>
                        <span className="module-tag">Design Tokens</span>
                      </div>
                      <p>Defines responsive container queries and relaxed spacing scale (--gallery-gap: 24px).</p>
                    </div>
                    <div className="plan-module-item">
                      <div className="module-header">
                        <strong>3. Headless Verification</strong>
                        <span className="module-tag">Playwright</span>
                      </div>
                      <p>Visual screenshot diff checks across desktop (1280px), tablet (768px), and mobile (390px).</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-tab-action"
                    onClick={() => setActiveModal('plan')}
                  >
                    Open Deep Plan Inspector ↗
                  </button>
                </div>
              )}

              {/* TAB 3: Search AST View (⌕) */}
              {workspaceTab === 'search' && (
                <div className="hero-rail-tab-content">
                  <div className="search-bar-row">
                    <span>⌕</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search files, symbols, hooks..."
                      autoFocus
                    />
                  </div>
                  <div className="search-results-list">
                    {filteredFiles.map((file, i) => (
                      <div key={i} className="search-result-item" onClick={() => showNotice(`Selected ${file.name}`)}>
                        <div>
                          <strong>{file.name}</strong>
                          <small>{file.path}</small>
                        </div>
                        <span className="file-stat-chip">{file.lines}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Settings View (⚙) */}
              {workspaceTab === 'settings' && (
                <div className="hero-rail-tab-content">
                  <div className="tab-title-row">
                    <span className="tab-badge">AGENT ENGINE CONFIG</span>
                  </div>
                  <div className="settings-options-list">
                    <div className="setting-row">
                      <span>LLM Orchestrator</span>
                      <strong>Gemini 2.5 Flash</strong>
                    </div>
                    <div className="setting-row">
                      <span>Git Isolation</span>
                      <strong>Atomic ({activeBranch})</strong>
                    </div>
                    <div className="setting-row">
                      <span>Verification Suite</span>
                      <strong>Headless Playwright CLI</strong>
                    </div>
                    <div className="setting-row">
                      <span>Local Persistence</span>
                      <strong>SQLite (orbit.db)</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-tab-action"
                    onClick={() => {
                      showNotice('Configured Orbit Agent Engine');
                      setWorkspaceTab('editor');
                    }}
                  >
                    Apply & Back to Prompt
                  </button>
                </div>
              )}

              <div className="workspace-footer">
                <span className="footer-avatar">O</span>
                <span>
                  {isRunning
                    ? 'Orchestrating agent workflows sequentially...'
                    : workspaceTab === 'plan'
                    ? 'Architecture plan is approved and ready'
                    : workspaceTab === 'search'
                    ? 'AST Index synchronized across 48 modules'
                    : 'Orbit is ready for your next prompt'}
                </span>
                <span className="footer-pulse"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Float Card */}
        <div
          className="preview-float"
          onClick={() => {
            if (onOpenPlatformDemo) onOpenPlatformDemo();
            else showNotice('Live preview rendered on port 3000');
          }}
          role="button"
          tabIndex={0}
          title="Click to expand Sandbox Preview"
        >
          <div className="preview-label">
            <span className="preview-dot"></span> LIVE PREVIEW
          </div>
          <div className="preview-image">
            <div className="preview-sun"></div>
            <div className="preview-product"></div>
            <div className="preview-copy">
              <i></i>
              <i></i>
              <b></b>
            </div>
          </div>
          <div className="preview-caption">
            <span>Product detail</span>
            {onOpenPlatformDemo ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPlatformDemo();
                }}
                className="btn-open-preview-link"
                title="Open Sandbox"
              >
                ↗ Open
              </button>
            ) : (
              <span>↗</span>
            )}
          </div>
        </div>

        {/* Active Violet Tag Button ("Plan") */}
        <button
          type="button"
          className="floating-tag tag-plan tag-interactive-btn"
          onClick={() => setActiveModal('plan')}
          title="Click to view Architecture Plan"
        >
          <span>✳</span> Plan
        </button>

        {/* Active Mint Tag Button ("Verify") */}
        <button
          type="button"
          className="floating-tag tag-verify tag-interactive-btn"
          onClick={() => setActiveModal('verify')}
          title="Click to view Browser Verification Results"
        >
          <span>✓</span> Verify
        </button>
      </div>

      {/* MODAL 1: Violet Button Plan Inspector */}
      {activeModal === 'plan' && (
        <div className="cute-popover-overlay" onClick={() => setActiveModal(null)} role="dialog">
          <div className="cute-popover-card" onClick={(e) => e.stopPropagation()}>
            <div className="cute-card-topbar">
              <div className="cute-badge" style={{ background: 'var(--violet)', color: '#fff' }}>
                <span>✳</span> ORBIT ARCHITECTURE PLAN
              </div>
              <button type="button" className="cute-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>
            <h3 className="cute-card-title">
              Autonomous Plan for <span>storefront-refresh</span>
            </h3>
            <p className="cute-card-desc">
              Orbit synthesizes your prompt into verified architectural requirements before touching code:
            </p>
            <div className="cute-steps-grid">
              <div className="cute-step-pill" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                <div className="cute-step-icon" style={{ background: 'var(--violet)', color: '#fff' }}>1</div>
                <div className="cute-step-content">
                  <strong>Component Boundaries</strong>
                  <p>Refactors ProductGallery into decoupled ImageCarousel and SpecSummary.</p>
                </div>
              </div>
              <div className="cute-step-pill" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                <div className="cute-step-icon" style={{ background: 'var(--violet)', color: '#fff' }}>2</div>
                <div className="cute-step-content">
                  <strong>Design Token Upgrades</strong>
                  <p>Applies relaxed ambient padding (--gallery-gap: 32px) and warm sand gradients.</p>
                </div>
              </div>
              <div className="cute-step-pill" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                <div className="cute-step-icon" style={{ background: 'var(--violet)', color: '#fff' }}>3</div>
                <div className="cute-step-content">
                  <strong>Git Isolation Safety</strong>
                  <p>Branch staged on feat/storefront-refresh to prevent regressions on main.</p>
                </div>
              </div>
            </div>
            <div className="cute-card-actions">
              <button
                type="button"
                className="cute-primary-btn"
                onClick={() => {
                  setActiveModal(null);
                  handleRunAgent();
                }}
              >
                Execute Plan Now ✳
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Mint Button Verify Inspector */}
      {activeModal === 'verify' && (
        <div className="cute-popover-overlay" onClick={() => setActiveModal(null)} role="dialog">
          <div className="cute-popover-card" onClick={(e) => e.stopPropagation()}>
            <div className="cute-card-topbar">
              <div className="cute-badge" style={{ background: '#10b981', color: '#fff' }}>
                <span>✓</span> PLAYWRIGHT VERIFICATION RESULTS
              </div>
              <button type="button" className="cute-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>
            <h3 className="cute-card-title">
              12/12 Automated Visual Checks <span>Passed</span>
            </h3>
            <p className="cute-card-desc">
              Orbit verified your live preview across viewports with zero manual browser testing needed:
            </p>
            <div className="cute-steps-grid">
              <div className="cute-step-pill" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <div className="cute-step-icon" style={{ background: '#10b981', color: '#fff' }}>✓</div>
                <div className="cute-step-content">
                  <strong>Viewport Layout Stability</strong>
                  <p>Desktop (1280px), Tablet (768px), and Mobile (390px) rendered with 0 CLS.</p>
                </div>
              </div>
              <div className="cute-step-pill" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <div className="cute-step-icon" style={{ background: '#10b981', color: '#fff' }}>✓</div>
                <div className="cute-step-content">
                  <strong>WCAG 2.1 AA Accessibility</strong>
                  <p>Color contrast ratio: 8.4:1 on warm sand swatches, focus rings active.</p>
                </div>
              </div>
              <div className="cute-step-pill" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <div className="cute-step-icon" style={{ background: '#10b981', color: '#fff' }}>✓</div>
                <div className="cute-step-content">
                  <strong>Zero Console Errors</strong>
                  <p>React 19 hydration cleanly passed without warnings or memory leaks.</p>
                </div>
              </div>
            </div>
            <div className="cute-card-actions">
              <button
                type="button"
                className="cute-primary-btn"
                style={{ background: '#10b981' }}
                onClick={() => setActiveModal(null)}
              >
                Close Verification Suite ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Scroll to explore button */}
      <button
        type="button"
        className="hero-scroll-btn"
        onClick={scrollToExplore}
        aria-label="Scroll down to explore architecture and workflows"
      >
        <span className="scroll-indicator"></span>
        <span>SCROLL TO EXPLORE WORKFLOWS ↓</span>
      </button>
    </section>
  );
};
