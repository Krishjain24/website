#!/usr/bin/env bash
set -e

# Resolve current script directory as project root
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "========================================================"
echo "    ◈ Orbit - The Agent-First Workspace Launcher"
echo "========================================================"
echo ""

# 1. Check Node.js runtime
if ! command -v node >/dev/null 2>&1; then
    echo "❌ [ERROR] Node.js is required but was not found."
    echo "Please install Node.js (v18+) from https://nodejs.org or run:"
    echo "  brew install node"
    exit 1
fi

echo "📦 Checking project-isolated dependencies..."
echo "Note: Dependencies are strictly scoped to ${PROJECT_DIR} (no global/system pollution)."
echo ""

# 2. Check and setup Python virtual environment if python3 is present
if command -v python3 >/dev/null 2>&1; then
    if [ ! -d ".venv" ]; then
        echo "Creating local Python virtual environment (.venv)..."
        python3 -m venv .venv
    fi
    if [ -f ".venv/bin/activate" ]; then
        # shellcheck disable=SC1091
        source .venv/bin/activate
    fi
fi

# 3. Check and install local node_modules
if [ ! -d "node_modules" ]; then
    echo "Local node_modules not detected. Installing project dependencies..."
    npm install
else
    echo "✅ Project dependencies verified in ./node_modules."
fi

# 4. Copy .env if missing
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

# Automatically open default browser in the background
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 1.2 && open "http://localhost:3000") &
elif command -v xdg-open >/dev/null 2>&1; then
    (sleep 1.2 && xdg-open "http://localhost:3000") &
fi

exec npm run dev
