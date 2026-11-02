import React, { useState } from 'react';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const START_BAT_SCRIPT = `@echo off
setlocal enabledelayedexpansion
title Orbit Workspace - Local Launcher

echo ========================================================
echo     ◈ Orbit - The Agent-First Workspace Launcher
echo ========================================================
echo.
echo [1/4] Setting project directory...
cd /d "%~dp0"

echo [2/4] Checking Node.js runtime...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Node.js is required but was not found.
    echo Please install Node.js (v18 or higher) from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [3/4] Ensuring strictly project-isolated dependencies...
echo Note: Dependencies are installed ONLY into this project directory.
echo No global or system-wide packages will be installed.
echo.

where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    if not exist ".venv\\" (
        echo Creating local Python virtual environment (.venv)...
        python -m venv .venv
    )
    if exist ".venv\\Scripts\\activate.bat" (
        call .venv\\Scripts\\activate.bat
    )
)

if not exist "node_modules\\" (
    echo Local node_modules not found. Installing project dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed. Please check your network and try again.
        pause
        exit /b 1
    )
) else (
    echo Project dependencies are verified in ./node_modules.
)

if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo Created local .env configuration.
    )
)

echo [4/4] Launching Orbit workspace...
echo.
echo ========================================================
echo  Server starting on: http://localhost:3000
echo  Admin Mission Control: http://localhost:3000/admin
echo ========================================================
echo.

start "" "http://localhost:3000"
call npm run dev
pause
`;

const START_SH_SCRIPT = `#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "========================================================"
echo "    ◈ Orbit - The Agent-First Workspace Launcher"
echo "========================================================"
echo ""

if ! command -v node >/dev/null 2>&1; then
    echo "❌ [ERROR] Node.js is required but was not found."
    echo "Please install Node.js (v18+) from https://nodejs.org or run:"
    echo "  brew install node"
    exit 1
fi

echo "📦 Checking project-isolated dependencies..."
echo "Note: Dependencies are strictly scoped to \${PROJECT_DIR} (no global/system pollution)."
echo ""

if command -v python3 >/dev/null 2>&1; then
    if [ ! -d ".venv" ]; then
        echo "Creating local Python virtual environment (.venv)..."
        python3 -m venv .venv
    fi
    if [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    fi
fi

if [ ! -d "node_modules" ]; then
    echo "Local node_modules not detected. Installing project dependencies..."
    npm install
else
    echo "✅ Project dependencies verified in ./node_modules."
fi

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo "Created local .env configuration."
fi

echo ""
echo "🚀 Starting Orbit full-stack server on http://localhost:3000..."
echo "Admin Mission Control: http://localhost:3000/admin"
echo "Press Ctrl+C to terminate."
echo "========================================================"
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 1.2 && open "http://localhost:3000") &
elif command -v xdg-open >/dev/null 2>&1; then
    (sleep 1.2 && xdg-open "http://localhost:3000") &
fi

exec npm run dev
`;

export const QuickStartModal: React.FC<QuickStartModalProps> = ({ isOpen, onClose }) => {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const triggerDownload = (content: string, filename: string, platform: string) => {
    try {
      const blob = new Blob([content], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(platform);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch {
      window.location.href = platform === 'win' ? '/api/v1/download/start-windows' : '/api/v1/download/start-mac';
    }
  };

  return (
    <div
      className={`orbit-modal-overlay ${isOpen ? 'is-active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-quickstart-title"
    >
      <div className="orbit-modal" style={{ maxWidth: '640px' }}>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        <div className="modal-header">
          <span className="eyebrow" style={{ color: 'var(--violet)' }}>
            LOCAL RUNTIME LAUNCHER
          </span>
          <h3 id="modal-quickstart-title">One-Click Start for Windows & Mac</h3>
          <p style={{ marginBottom: '14px' }}>
            Run Orbit locally in one click. Automatically checks Node.js runtime, installs local dependencies, and opens the workspace in your browser.
          </p>
        </div>

        {/* Isolation guarantee banner */}
        <div
          style={{
            background: 'var(--mint)',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#14532d',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>🛡️</span>
          <div>
            <strong>Strictly Project-Isolated:</strong> Dependencies are installed solely into this project's local{' '}
            <code style={{ background: 'rgba(255,255,255,0.7)', padding: '1px 5px', borderRadius: '4px' }}>
              node_modules
            </code>{' '}
            and Python{' '}
            <code style={{ background: 'rgba(255,255,255,0.7)', padding: '1px 5px', borderRadius: '4px' }}>
              .venv
            </code>
            . Zero global packages will be installed on your computer.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {/* WINDOWS CARD */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '12px',
              padding: '18px',
              background: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🪟</span>
                <strong style={{ fontSize: '15px' }}>Windows (One-Click)</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
                Double-click <code style={{ color: 'var(--ink)', fontWeight: 600 }}>start.bat</code> to verify Node.js,
                install local packages, and open the app in your browser.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => triggerDownload(START_BAT_SCRIPT, 'start.bat', 'win')}
                className="button button-dark"
                style={{ width: '100%', minHeight: '42px', fontSize: '12px', marginBottom: '10px', cursor: 'pointer' }}
              >
                {downloadSuccess === 'win' ? '✓ Downloaded start.bat' : 'Download start.bat'} <span>↓</span>
              </button>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#171820',
                  color: '#e2e8f0',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  justifyContent: 'space-between',
                }}
              >
                <span>.\\start.bat</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('.\\start.bat', 'win')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copiedPlatform === 'win' ? 'var(--lime)' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {copiedPlatform === 'win' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* MAC / LINUX CARD */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '12px',
              padding: '18px',
              background: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🍎</span>
                <strong style={{ fontSize: '15px' }}>macOS / Linux (One-Click)</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
                Execute <code style={{ color: 'var(--ink)', fontWeight: 600 }}>start.sh</code> to automatically prepare
                dependencies and boot the full-stack server.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => triggerDownload(START_SH_SCRIPT, 'start.sh', 'mac')}
                className="button button-dark"
                style={{ width: '100%', minHeight: '42px', fontSize: '12px', marginBottom: '10px', cursor: 'pointer' }}
              >
                {downloadSuccess === 'mac' ? '✓ Downloaded start.sh' : 'Download start.sh'} <span>↓</span>
              </button>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#171820',
                  color: '#e2e8f0',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '6px' }}>
                  ./start.sh
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('chmod +x start.sh && ./start.sh', 'mac')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copiedPlatform === 'mac' ? 'var(--lime)' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copiedPlatform === 'mac' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <small style={{ color: 'var(--muted)', fontSize: '12px' }}>
            Both launchers check Node.js automatically and boot the workspace on{' '}
            <code style={{ background: '#e2e8f0', padding: '2px 5px', borderRadius: '4px' }}>
              http://localhost:3000
            </code>
          </small>
        </div>
      </div>
    </div>
  );
};
