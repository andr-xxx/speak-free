#!/bin/sh

# Compile TypeScript (except content script)
tsccode=0
npx tsc || tsccode=$?
if [ $tsccode -ne 0 ]; then
  echo "TypeScript compilation failed."
  exit $tsccode
fi

echo "\n[Build] Bundling content script with esbuild and injecting API keys from .env...\n"

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

echo "OPENAI_API_KEY=$(mask "$OPENAI_API_KEY")"
echo "GEMINI_API_KEY=$(mask "$GEMINI_API_KEY")"

# Bundle content script with esbuild and inject API keys from .env
npx esbuild src/content/contentScript.ts \
  --bundle \
  --outfile=dist/content/contentScript.js \
  --format=iife \
  --platform=browser \
  --define:OPENAI_API_KEY='"'$OPENAI_API_KEY'"' \
  --define:GEMINI_API_KEY='"'$GEMINI_API_KEY'"'

# Copy static files and assets
echo "\n[Build] Copying static files and assets...\n"
./copy-static-files.sh 