import React, { useState, useRef } from 'react';

interface PlatformDemoPageProps {
  onBackToWebsite: () => void;
  onOpenQuickStart?: () => void;
  onOpenWaitlist?: () => void;
}

export const PlatformDemoPage: React.FC<PlatformDemoPageProps> = ({
  onBackToWebsite,
  onOpenQuickStart,
  onOpenWaitlist,
}) => {
  const [activeBranch, setActiveBranch] = useState<'main' | 'staging' | 'feat/storefront-refresh'>('main');
  const [activeFile, setActiveFile] = useState('ProductGallery.tsx');
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<'sand' | 'obsidian' | 'sage'>('sand');
  const [cartCount, setCartCount] = useState(1);
  const [activeRailTab, setActiveRailTab] = useState<'code' | 'plan' | 'search' | 'settings'>('code');

  const [prompt, setPrompt] = useState(
    'Give the product page a calmer layout and make the gallery feel more immersive.'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<'idle' | 'planning' | 'building' | 'verifying' | 'done'>('done');
  const [liveLogs, setLiveLogs] = useState<string[]>([
    '09:42:10 [AST Analyzer] Parsed 3 modules: ProductGallery.tsx, Carousel.tsx, theme.css',
    '09:42:12 [Git Isolation] Created atomic branch checkout main -> staging',
    '09:42:14 [Vite HMR] Transformed 3 modules in 14ms (39.8kb gzip)',
    '09:42:15 [Headless Playwright] Verified layout across desktop, tablet, and mobile viewports',
    '09:42:16 [Orbit Engine] ✓ Ready for builder supervision',
  ]);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const handleRunSimulation = () => {
    if (!prompt.trim() || isRunning) return;
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setIsRunning(true);
    setCurrentStage('planning');

    setLiveLogs(prev => [
      `--:--:-- [Brief Received] "${prompt.slice(0, 48)}..."`,
      '--:--:-- [Step 1/3] Synthesizing component hierarchy & token boundaries...',
      ...prev.slice(0, 4),
    ]);

    const t1 = setTimeout(() => {
      setCurrentStage('building');
      setLiveLogs(prev => [
        '--:--:-- [Step 2/3] Writing atomic diffs across ProductGallery.tsx (+142, -38)',
        ...prev.slice(0, 5),
      ]);
    }, 1800);

    const t2 = setTimeout(() => {
      setCurrentStage('verifying');
      setLiveLogs(prev => [
        '--:--:-- [Step 3/3] Running headless Playwright checks across 3 viewports...',
        ...prev.slice(0, 5),
      ]);
    }, 3600);

    const t3 = setTimeout(() => {
      setCurrentStage('done');
      setIsRunning(false);
      setLiveLogs(prev => [
        '--:--:-- [Orbit Engine] ✓ 12/12 checks verified • Deployed to live preview',
        ...prev.slice(0, 6),
      ]);
    }, 5200);

    timersRef.current.push(t1, t2, t3);
  };

  const images = [
    { title: 'Front Angle', bg: 'linear-gradient(135deg, #f5ebd9, #d4b28c)' },
    { title: 'Top Down', bg: 'linear-gradient(135deg, #e2e8f0, #94a3b8)' },
    { title: 'Side Profile', bg: 'linear-gradient(135deg, #dcfce7, #86efac)' },
  ];

  return (
    <div className="sandbox-workspace-container">
      {/* Top Navigation Bar - Exact Light Paper Aesthetic */}
      <header className="sandbox-light-topbar">
        <div className="sandbox-topbar-left">
          <button type="button" onClick={onBackToWebsite} className="btn-light-back">
            <span>←</span> Back to Homepage
          </button>
          <div className="sandbox-brand-group">
            <span className="brand-mark">◈</span>
            <span className="sandbox-brand-name">orbit</span>
            <span className="sandbox-paper-pill">PLATFORM SANDBOX</span>
          </div>
          <div className="sandbox-path-pill">
            <span className="path-icon">◈</span> atlas / storefront-refresh
          </div>
          <div className="sandbox-branch-switcher">
            <label htmlFor="sandbox-branch-select">Branch:</label>
            <select
              id="sandbox-branch-select"
              value={activeBranch}
              onChange={(e) => setActiveBranch(e.target.value as any)}
              className="sandbox-select"
            >
              <option value="main">main (production)</option>
              <option value="staging">staging</option>
              <option value="feat/storefront-refresh">feat/storefront-refresh</option>
            </select>
          </div>
        </div>

        <div className="sandbox-topbar-right">
          <div className="sandbox-status-indicator">
            <span className="live-dot"></span>
            <span>Agent Engine Live</span>
          </div>
          {onOpenQuickStart && (
            <button type="button" onClick={onOpenQuickStart} className="btn-light-secondary">
              1-Click Win/Mac Launch ⚡
            </button>
          )}
          {onOpenWaitlist && (
            <button type="button" onClick={onOpenWaitlist} className="btn-light-primary">
              Get Early Access ↗
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="sandbox-inner-stage shell">
        <div className="sandbox-window-frame">
          {/* Window Topbar */}
          <div className="window-topbar">
            <div className="window-dots" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </div>
            <div className="window-path">
              <span className="path-icon">◈</span> atlas / storefront-refresh • branch {activeBranch}
            </div>
            <span className="window-menu" aria-hidden="true">
              •••
            </span>
          </div>

          <div className="sandbox-workspace-columns">
            {/* LEFT RAIL */}
            <aside className="workspace-rail" aria-label="Workspace tool selector">
              <div className="rail-logo">◉</div>
              <button
                type="button"
                className={`rail-icon-btn ${activeRailTab === 'code' ? 'selected' : ''}`}
                onClick={() => setActiveRailTab('code')}
                title="Code & Pipeline (⌘)"
              >
                ⌘
              </button>
              <button
                type="button"
                className={`rail-icon-btn ${activeRailTab === 'plan' ? 'selected' : ''}`}
                onClick={() => setActiveRailTab('plan')}
                title="Architecture Plan (▤)"
              >
                ▤
              </button>
              <button
                type="button"
                className={`rail-icon-btn ${activeRailTab === 'search' ? 'selected' : ''}`}
                onClick={() => setActiveRailTab('search')}
                title="AST File Explorer (⌕)"
              >
                ⌕
              </button>
              <button
                type="button"
                className={`rail-icon-btn rail-bottom ${activeRailTab === 'settings' ? 'selected' : ''}`}
                onClick={() => setActiveRailTab('settings')}
                title="Settings (⚙)"
              >
                ⚙
              </button>
            </aside>

            {/* CENTER COLUMN: Prompt, Steps, and Code Explorer */}
            <section className="sandbox-center-flow">
              <div className="project-heading">
                <div>
                  <span className="mini-label">PROJECT</span>
                  <h2>Storefront refresh</h2>
                </div>
                <span className="branch-pill">
                  <span></span> {activeBranch}
                </span>
              </div>

              {/* Task Prompt Box - Exactly matching hero window lilac card */}
              <div className="task-prompt-interactive">
                <span className="sparkle" style={{ color: 'var(--violet)', fontSize: '14px' }}>
                  ✳
                </span>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want the agent to build..."
                  disabled={isRunning}
                />
                <button
                  type="button"
                  className="task-run-btn"
                  onClick={handleRunSimulation}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <span>Running</span>
                      <i className="spinner-dot"></i>
                    </>
                  ) : (
                    <>
                      Run <span>✳</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Goal Presets */}
              <div className="sandbox-presets-row">
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>PRESETS:</span>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => setPrompt('Give the product page a calmer layout and make the gallery feel more immersive.')}
                >
                  ✦ Immersive gallery
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => setPrompt('Add dark theme tokens and responsive swatch transitions.')}
                >
                  ✦ Design tokens
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => setPrompt('Optimize mobile layout with smooth accordion specs.')}
                >
                  ✦ Mobile accordion
                </button>
              </div>

              {/* 3-Stage Orchestration Pipeline */}
              <div className="activity-label">
                <span>SEQUENTIAL ORCHESTRATION PIPELINE</span>
                <span>
                  {isRunning ? (
                    <span style={{ color: 'var(--violet)', fontWeight: 700 }}>
                      STAGE: {currentStage.toUpperCase()}
                    </span>
                  ) : (
                    <span style={{ color: '#15803d', fontWeight: 700 }}>
                      ✓ VERIFIED LIVE
                    </span>
                  )}
                </span>
              </div>

              <div className="agent-list">
                <div className={`agent-step ${currentStage === 'planning' ? 'active' : 'done'}`}>
                  <span className="step-symbol">
                    {currentStage === 'planning' ? <i></i> : '✓'}
                  </span>
                  <div>
                    <strong>01 / Requirement & Architecture Plan</strong>
                    <small>Synthesizes component boundaries, design tokens, and state flows</small>
                  </div>
                  <span className="step-time">
                    {currentStage === 'planning' ? 'running' : 'done'}
                  </span>
                </div>

                <div className={`agent-step ${currentStage === 'building' ? 'active' : currentStage === 'planning' ? 'pending' : 'done'}`}>
                  <span className="step-symbol">
                    {currentStage === 'building' ? <i></i> : currentStage === 'planning' ? '○' : '✓'}
                  </span>
                  <div>
                    <strong>02 / Atomic Code Synthesis</strong>
                    <small>Applies +142 lines across ProductGallery.tsx & theme.css with git isolation</small>
                  </div>
                  <span className="step-time">
                    {currentStage === 'building' ? 'running' : currentStage === 'planning' ? 'queued' : 'done'}
                  </span>
                </div>

                <div className={`agent-step ${currentStage === 'verifying' ? 'active' : currentStage === 'done' ? 'done' : 'pending'}`}>
                  <span className="step-symbol">
                    {currentStage === 'verifying' ? <i></i> : currentStage === 'done' ? '✓' : '○'}
                  </span>
                  <div>
                    <strong>03 / Headless Browser Verification</strong>
                    <small>Playwright CLI verifies zero layout shifts, color contrast, and hydration</small>
                  </div>
                  <span className="step-time">
                    {currentStage === 'verifying' ? 'running' : currentStage === 'done' ? 'done' : 'queued'}
                  </span>
                </div>
              </div>

              {/* Code Editor & File Tabs Card */}
              <div className="sandbox-code-card">
                <div className="code-card-tabs">
                  <button
                    type="button"
                    className={`code-tab-btn ${activeFile === 'ProductGallery.tsx' ? 'active' : ''}`}
                    onClick={() => setActiveFile('ProductGallery.tsx')}
                  >
                    <span>⚛️</span> ProductGallery.tsx
                    <span className="diff-pill green">+84</span>
                  </button>
                  <button
                    type="button"
                    className={`code-tab-btn ${activeFile === 'ImageCarousel.tsx' ? 'active' : ''}`}
                    onClick={() => setActiveFile('ImageCarousel.tsx')}
                  >
                    <span>⚛️</span> ImageCarousel.tsx
                    <span className="diff-pill green">+38</span>
                  </button>
                  <button
                    type="button"
                    className={`code-tab-btn ${activeFile === 'theme.css' ? 'active' : ''}`}
                    onClick={() => setActiveFile('theme.css')}
                  >
                    <span>🎨</span> theme.css
                    <span className="diff-pill green">+20</span>
                  </button>
                  <button
                    type="button"
                    className={`code-tab-btn ${activeFile === 'server.ts' ? 'active' : ''}`}
                    onClick={() => setActiveFile('server.ts')}
                  >
                    <span>⚙️</span> server.ts
                  </button>
                </div>

                <div className="code-card-editor">
                  <pre className="light-code-block">
                    {activeFile === 'ProductGallery.tsx' && (
`// Generated by Orbit Autonomous Agent • TypeScript + React 19
import React, { useState } from 'react';
import { ImageCarousel } from './ImageCarousel';

export const ProductGallery: React.FC = () => {
  const [activeThumb, setActiveThumb] = useState(0);
  const [palette, setPalette] = useState<'sand' | 'obsidian' | 'sage'>('sand');

  return (
    <section className="product-stage" data-theme={palette}>
      <div className="gallery-layout grid-2col">
        <ImageCarousel 
          activeIndex={activeThumb} 
          onSelect={setActiveThumb}
          smoothTransitions={true} 
        />
        <aside className="product-summary">
          <span className="eyebrow">NEW RELEASE</span>
          <h2>Minimalist Horizon Speaker</h2>
          <span className="price">$349.00 USD</span>
          <p>Calm acoustic resonance with ambient light feedback.</p>
        </aside>
      </div>
    </section>
  );
};`
                    )}
                    {activeFile === 'ImageCarousel.tsx' && (
`// Smooth Spring Transition Component
export const ImageCarousel = ({ activeIndex, onSelect, smoothTransitions }) => {
  return (
    <div className="carousel-stage relative overflow-hidden rounded-xl">
      <div className="active-view-port transition-transform duration-300">
        {/* Responsive Aspect-Ratio Viewport */}
      </div>
    </div>
  );
};`
                    )}
                    {activeFile === 'theme.css' && (
`/* Orbit Design Tokens */
:root {
  --gallery-radius: 14px;
  --gallery-glow: rgba(117, 100, 245, 0.12);
  --swatch-sand: #e5c7a5;
  --swatch-obsidian: #1e293b;
  --swatch-sage: #059669;
}

.product-stage[data-theme="sand"] {
  background: radial-gradient(circle at 60% 40%, #fbf8f5, #f1ece4);
}`
                    )}
                    {activeFile === 'server.ts' && (
`// Local Express + SQLite Backend API
app.get('/api/v1/products/atlas-refresh', (req, res) => {
  res.json({ id: 'atlas_01', status: 'verified', hmr: true });
});`
                    )}
                  </pre>
                </div>
              </div>

              {/* Execution Log Stream */}
              <div className="sandbox-log-stream">
                <div className="log-stream-header">
                  <span>ORBIT AGENT LOG STREAM</span>
                  <span style={{ color: '#15803d', fontWeight: 700 }}>● SYNCHRONIZED</span>
                </div>
                <div className="log-stream-content">
                  {liveLogs.map((log, idx) => (
                    <div key={idx} className="log-stream-line">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: Live Browser Preview (Matching Hero Window floating preview) */}
            <aside className="sandbox-right-preview">
              <div className="preview-control-bar">
                <div className="viewport-buttons-group">
                  <button
                    type="button"
                    className={`viewport-tab ${deviceViewport === 'desktop' ? 'active' : ''}`}
                    onClick={() => setDeviceViewport('desktop')}
                  >
                    🖥️ Desktop
                  </button>
                  <button
                    type="button"
                    className={`viewport-tab ${deviceViewport === 'tablet' ? 'active' : ''}`}
                    onClick={() => setDeviceViewport('tablet')}
                  >
                    📱 Tablet
                  </button>
                  <button
                    type="button"
                    className={`viewport-tab ${deviceViewport === 'mobile' ? 'active' : ''}`}
                    onClick={() => setDeviceViewport('mobile')}
                  >
                    📱 Mobile
                  </button>
                </div>
                <span className="live-preview-tag">
                  <span className="preview-dot"></span> LIVE 3000
                </span>
              </div>

              {/* Browser Preview Frame */}
              <div className={`light-browser-frame viewport-${deviceViewport}`}>
                <div className="browser-chrome-light">
                  <div className="browser-dots">
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>
                  <div className="browser-url-input">
                    <span>https://atlas-storefront.local:3000/products/horizon</span>
                  </div>
                  <span className="browser-refresh-icon">↺</span>
                </div>

                <div className="browser-body-content">
                  {/* Storefront Refresh Interactive App */}
                  <div className="preview-storefront-header">
                    <strong>ATLAS ACOUSTICS</strong>
                    <span className="cart-chip">Cart ({cartCount})</span>
                  </div>

                  <div className="preview-product-layout">
                    <div
                      className="preview-hero-image"
                      style={{
                        background:
                          selectedColor === 'sand'
                            ? images[selectedImage].bg
                            : selectedColor === 'obsidian'
                            ? 'linear-gradient(135deg, #475569, #1e293b)'
                            : 'linear-gradient(135deg, #10b981, #065f46)',
                      }}
                    >
                      <div className="preview-speaker-silhouette"></div>
                      <span className="preview-angle-tag">{images[selectedImage].title}</span>
                    </div>

                    <div className="preview-info-box">
                      <span className="preview-badge">NEW RELEASE</span>
                      <h3>Horizon Soundstage Speaker</h3>
                      <div className="preview-price">$349.00 USD</div>
                      <p>
                        Sculpted matte acoustic enclosure with spatial multi-room driver array. Designed with Orbit layout agents.
                      </p>

                      <div className="preview-swatches-area">
                        <label>Finish Color:</label>
                        <div className="swatches-buttons">
                          <button
                            type="button"
                            className={`swatch-circle ${selectedColor === 'sand' ? 'is-selected' : ''}`}
                            style={{ background: '#e5c7a5' }}
                            onClick={() => setSelectedColor('sand')}
                            title="Warm Sand"
                          />
                          <button
                            type="button"
                            className={`swatch-circle ${selectedColor === 'obsidian' ? 'is-selected' : ''}`}
                            style={{ background: '#1e293b' }}
                            onClick={() => setSelectedColor('obsidian')}
                            title="Obsidian Night"
                          />
                          <button
                            type="button"
                            className={`swatch-circle ${selectedColor === 'sage' ? 'is-selected' : ''}`}
                            style={{ background: '#059669' }}
                            onClick={() => setSelectedColor('sage')}
                            title="Deep Sage"
                          />
                        </div>
                      </div>

                      <div className="preview-angle-thumbnails">
                        {images.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`angle-thumb-btn ${selectedImage === i ? 'is-active' : ''}`}
                            onClick={() => setSelectedImage(i)}
                          >
                            {img.title}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="preview-add-cart-btn"
                        onClick={() => setCartCount(c => c + 1)}
                      >
                        Add to Cart <span>+</span>
                      </button>
                    </div>
                  </div>

                  <div className="preview-footer-checks">
                    <span>✓ 0 Layout Shifts (CLS)</span>
                    <span>✓ AA Contrast Passed</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
