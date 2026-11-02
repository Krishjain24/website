import React, { useState } from 'react';

export type BuilderType = 'frontend' | 'backend' | 'fullstack' | 'teams';

interface BuildersSectionProps {
  onRoleChange?: (role: BuilderType) => void;
}

export const BuildersSection: React.FC<BuildersSectionProps> = ({ onRoleChange }) => {
  const [activeTab, setActiveTab] = useState<BuilderType>('frontend');

  const builderContent: Record<
    BuilderType,
    { kicker: string; title: string; description: string; points: string[] }
  > = {
    frontend: {
      kicker: 'FOR FRONTEND DEVELOPERS',
      title: 'Shape the user experience while agents handle repetitive markup.',
      description: 'Explore visual directions, refine design tokens, and review responsive components right beside your code with real-time browser preview synchronization.',
      points: [
        'Iterate on real browser previews with live HMR',
        'Keep design intent synchronized with CSS variables',
        'Review responsive viewports (Mobile, Tablet, Desktop) as changes land',
        'Atomic component scaffolding for React, Vue, and Tailwind',
      ],
    },
    backend: {
      kicker: 'FOR BACKEND ARCHITECTS & ENGINEERS',
      title: 'Orchestrate robust APIs, database migrations, and microservice contracts.',
      description: 'Let agents generate typed OpenAPI specs, optimize SQL queries, and implement authentication while you supervise system performance, database integrity, and data safety.',
      points: [
        'Auto-generate REST & GraphQL endpoints with type-safe schema contracts',
        'Manage SQLite (orbit.db), Postgres, and Cloud SQL with rollbacks',
        'Enforce RBAC security, JWT claims, and rate-limiting middleware',
        'Automated database audit logs and schema health checks',
      ],
    },
    fullstack: {
      kicker: 'FOR FULL STACK BUILDERS',
      title: 'Keep the whole system in view from interface to database.',
      description: 'Give agents context across your entire project so they can trace a feature change seamlessly from the frontend UI through to the Express API and SQLite data layer.',
      points: [
        'Trace edits across connected frontend and backend files',
        'Keep API contracts and React client hooks synchronized',
        'Inspect SQLite queries and real-time network payloads in one window',
        'Export unified Docker containers and production cloud artifacts',
      ],
    },
    teams: {
      kicker: 'FOR ENGINEERING & PRODUCT TEAMS',
      title: 'Move together from product brief to verified release.',
      description: 'Make execution plans, branch diffs, and visual reviews transparent so engineers, designers, and managers collaborate with a shared mental model.',
      points: [
        'Centralize project briefs and PR acceptance criteria',
        'Isolate agent work to dedicated Git branches before merging',
        'Automated visual regression tests and reviewer sign-offs',
        'Live multi-role activity feeds and collaborative task queues',
      ],
    },
  };

  const handleTabChange = (role: BuilderType) => {
    setActiveTab(role);
    if (onRoleChange) onRoleChange(role);
  };

  const content = builderContent[activeTab];

  return (
    <section className="builders-section shell section-space" id="for-builders" aria-labelledby="builders-title">
      <div className="builders-heading">
        <div>
          <p className="eyebrow">MADE FOR HOW YOU BUILD</p>
          <h2 id="builders-title">
            Your craft stays
            <br />
            at the center.
          </h2>
        </div>
        <p>
          Whether you are crafting an interface, architecting scalable APIs, shipping a complete full-stack product, or coordinating work across an engineering team, Orbit adapts to your flow.
        </p>
      </div>

      <div className="builder-tabs" role="tablist" aria-label="Ways to work with Orbit">
        <button
          type="button"
          className={`builder-tab ${activeTab === 'frontend' ? 'is-active' : ''}`}
          id="tab-frontend"
          role="tab"
          aria-selected={activeTab === 'frontend'}
          aria-controls="builder-panel"
          onClick={() => handleTabChange('frontend')}
        >
          Frontend
        </button>
        <button
          type="button"
          className={`builder-tab ${activeTab === 'backend' ? 'is-active' : ''}`}
          id="tab-backend"
          role="tab"
          aria-selected={activeTab === 'backend'}
          aria-controls="builder-panel"
          onClick={() => handleTabChange('backend')}
        >
          Backend
        </button>
        <button
          type="button"
          className={`builder-tab ${activeTab === 'fullstack' ? 'is-active' : ''}`}
          id="tab-fullstack"
          role="tab"
          aria-selected={activeTab === 'fullstack'}
          aria-controls="builder-panel"
          onClick={() => handleTabChange('fullstack')}
        >
          Full stack
        </button>
        <button
          type="button"
          className={`builder-tab ${activeTab === 'teams' ? 'is-active' : ''}`}
          id="tab-teams"
          role="tab"
          aria-selected={activeTab === 'teams'}
          aria-controls="builder-panel"
          onClick={() => handleTabChange('teams')}
        >
          Teams
        </button>
      </div>

      <div className="builder-panel" id="builder-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={0}>
        <div className="builder-panel-copy">
          <span className="panel-kicker" id="panel-kicker">
            {content.kicker}
          </span>
          <h3 id="panel-title">{content.title}</h3>
          <p id="panel-description">{content.description}</p>
          <ul id="panel-points">
            {content.points.map((pt, i) => (
              <li key={i}>
                <span>✓</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>

        {/* DISTINCTIVE CUSTOM VISUAL ILLUSTRATIONS FOR EACH ROLE */}
        <div className="builder-visual-custom" aria-label={`${activeTab} architecture visual representation`}>
          {activeTab === 'frontend' && (
            <div className="visual-card-frontend">
              <div className="visual-topbar">
                <span className="visual-tag-badge">UI COMPONENT TREE</span>
                <span className="visual-status-pill">HMR LIVE</span>
              </div>
              <div className="visual-content-box">
                <div className="component-hierarchy">
                  <div className="tree-node is-root">
                    <span>◈</span> &lt;StorefrontView&gt;
                  </div>
                  <div className="tree-node is-child">
                    <span>↳</span> &lt;HeroSection&gt;
                  </div>
                  <div className="tree-node is-child active">
                    <span>↳</span> &lt;ProductGallery palette="sand" /&gt;
                  </div>
                  <div className="tree-node is-grandchild">
                    <span>•</span> &lt;ImageCarousel smooth /&gt;
                  </div>
                </div>
                <div className="visual-token-pills">
                  <span className="token-pill" style={{ background: '#eeebff', color: '#5746dc' }}>
                    --radius: 14px
                  </span>
                  <span className="token-pill" style={{ background: '#dcfce7', color: '#166534' }}>
                    --swatch: #e5c7a5
                  </span>
                  <span className="token-pill" style={{ background: '#fef3c7', color: '#92400e' }}>
                    --glow: 0.12
                  </span>
                </div>
              </div>
              <div className="visual-caption-bar">
                <span>Viewport: Desktop (1200px) • CSS Grid 2-Col</span>
                <span style={{ color: '#10b981' }}>✓ 0 Visual Regressions</span>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="visual-card-backend">
              <div className="visual-topbar">
                <span className="visual-tag-badge">API ROUTER & SQLITE SCHEMA</span>
                <span className="visual-status-pill" style={{ background: '#dcfce7', color: '#166534' }}>
                  200 OK
                </span>
              </div>
              <div className="visual-content-box">
                <div className="api-route-list">
                  <div className="route-row">
                    <span className="http-badge post">POST</span>
                    <code>/api/v1/auth/login</code>
                    <span className="route-ms">18ms</span>
                  </div>
                  <div className="route-row">
                    <span className="http-badge get">GET</span>
                    <code>/api/v1/waitlist?status=pending</code>
                    <span className="route-ms">12ms</span>
                  </div>
                  <div className="route-row">
                    <span className="http-badge patch">PATCH</span>
                    <code>/api/v1/waitlist/:id/status</code>
                    <span className="route-ms">24ms</span>
                  </div>
                </div>
                <div className="db-schema-chip">
                  <span>SQLite</span> <code>orbit.db &gt; waitlist (id, email, status, priority)</code>
                </div>
              </div>
              <div className="visual-caption-bar">
                <span>Database Engine: better-sqlite3 with WAL mode</span>
                <span style={{ color: '#5746dc' }}>⚡ 0.8ms Query Avg</span>
              </div>
            </div>
          )}

          {activeTab === 'fullstack' && (
            <div className="visual-card-fullstack">
              <div className="visual-topbar">
                <span className="visual-tag-badge">END-TO-END STACK PIPELINE</span>
                <span className="visual-status-pill" style={{ background: '#eeebff', color: '#5746dc' }}>
                  TYPE-SAFE
                </span>
              </div>
              <div className="visual-content-box fullstack-diagram">
                <div className="stack-tier">
                  <div className="tier-header">React 19 SPA</div>
                  <code>src/components/WaitlistModal.tsx</code>
                </div>
                <div className="stack-arrow">↕ Typed Schema Sync ↕</div>
                <div className="stack-tier">
                  <div className="tier-header">Express 5 Controller</div>
                  <code>server.ts &gt; POST /api/v1/waitlist</code>
                </div>
                <div className="stack-arrow">↕ Prepared Statements ↕</div>
                <div className="stack-tier">
                  <div className="tier-header">SQLite Data Engine</div>
                  <code>orbit.db (persistent disk records)</code>
                </div>
              </div>
              <div className="visual-caption-bar">
                <span>Single Process • tsx server.ts • Dev Port 3000</span>
                <span style={{ color: '#10b981' }}>✓ 100% Contract Match</span>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="visual-card-teams">
              <div className="visual-topbar">
                <span className="visual-tag-badge">TEAM COORDINATION MATRIX</span>
                <span className="visual-status-pill" style={{ background: '#fef3c7', color: '#92400e' }}>
                  4 COLLABORATORS
                </span>
              </div>
              <div className="visual-content-box">
                <div className="team-avatars-row">
                  <div className="team-member-pill">
                    <span className="m-avatar" style={{ background: '#5746dc' }}>ER</span>
                    <span>Elena (Lead)</span>
                  </div>
                  <div className="team-member-pill">
                    <span className="m-avatar" style={{ background: '#059669' }}>DK</span>
                    <span>David (Frontend)</span>
                  </div>
                  <div className="team-member-pill">
                    <span className="m-avatar" style={{ background: '#d97706' }}>AO</span>
                    <span>Amara (Product)</span>
                  </div>
                </div>
                <div className="git-branch-graph">
                  <div className="graph-line">
                    <span className="branch-label">main</span>
                    <div className="line-bar"></div>
                  </div>
                  <div className="graph-line branch-sub">
                    <span className="branch-label">orbit/feat-gallery</span>
                    <div className="line-bar sub-bar"></div>
                    <span className="merge-pill">Ready to merge</span>
                  </div>
                </div>
              </div>
              <div className="visual-caption-bar">
                <span>Multi-Agent Task Isolation • Branch main</span>
                <span style={{ color: '#10b981' }}>✓ 2/2 Approvals</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
