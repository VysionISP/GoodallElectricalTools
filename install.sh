#!/usr/bin/env bash
# Installs and sets up Field Compliance for local use on macOS.
# Run this from inside the cloned repo: ./install.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

echo "== Field Compliance installer =="

# 1. Homebrew
if ! command -v brew >/dev/null 2>&1; then
  echo "-- Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"
fi

# 2. Node.js + git
if ! command -v node >/dev/null 2>&1; then
  echo "-- Installing Node.js..."
  brew install node
fi
if ! command -v git >/dev/null 2>&1; then
  echo "-- Installing git..."
  brew install git
fi

# 3. Xcode Command Line Tools (needed to build the native SQLite driver)
if ! xcode-select -p >/dev/null 2>&1; then
  echo "-- Installing Xcode Command Line Tools (finish the popup, then re-run this script)..."
  xcode-select --install || true
  exit 0
fi

# 4. Install dependencies
echo "-- Installing npm dependencies..."
npm install

# 5. Approve any install scripts npm blocked (some npm setups gate native
#    module builds like better-sqlite3 behind an explicit approval step)
if npm install-scripts ls >/dev/null 2>&1; then
  echo "-- Approving required install scripts..."
  npm install-scripts approve better-sqlite3 prisma @prisma/engines unrs-resolver 2>/dev/null || true
  npm install
fi

# 6. Environment file
if [ ! -f .env ]; then
  echo "-- Creating .env..."
  SECRET=$(openssl rand -hex 32)
  cat > .env <<EOF
DATABASE_URL="file:./dev.db"
AUTH_SECRET="$SECRET"
EOF
else
  echo "-- .env already exists, leaving it as-is."
fi

# 7. Prisma client + database
echo "-- Setting up the database..."
npx prisma generate
npx prisma migrate deploy

echo ""
echo "Done. Start the app with:"
echo "  npm run dev"
echo "Then open http://localhost:3000 and click 'Create an account'."
