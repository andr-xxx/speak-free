#!/bin/sh

echo "[Build] Starting fresh build..."

# Completely remove previous build
echo "[Build] Removing previous build..."
rm -rf dist/

# Create fresh dist directory structure
echo "[Build] Creating fresh dist directory structure..."
mkdir -p dist/content dist/popup dist/settings dist/assets

# Compile TypeScript (except content script)
echo "[Build] Compiling TypeScript..."
tsccode=0
npx tsc || tsccode=$?
if [ $tsccode -ne 0 ]; then
  echo "TypeScript compilation failed."
  exit $tsccode
fi

echo "[Build] Bundling content script with esbuild and injecting API keys from .env..."

# Load .env variables into the shell
export $(grep -v '^#' .env | xargs)

# Log the API keys (masked for security)
mask() {
  local key="$1"
  if [ -z "$key" ]; then
    echo "(empty)"
  elif [ ${#key} -le 8 ]; then
    echo "****"
  else
    echo "${key:0:4}****${key: -3}"
  fi
}

echo "OpenAI API Key: $(mask "$OPENAI_API_KEY")"
echo "Gemini API Key: $(mask "$GEMINI_API_KEY")"

# Bundle content script with esbuild and inject API keys from .env
npx esbuild src/content/contentScript.ts \
  --bundle \
  --outfile=dist/content/contentScript.js \
  --format=iife \
  --platform=browser \
  --define:OPENAI_API_KEY='"'$OPENAI_API_KEY'"' \
  --define:GEMINI_API_KEY='"'$GEMINI_API_KEY'"'

# Copy static files and assets
echo "[Build] Copying static files and assets..."
./copy-static-files.sh

echo "[Build] Build completed successfully!" 