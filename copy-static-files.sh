#!/bin/sh
mkdir -p dist/popup dist/settings
echo Copying static files...
cp src/popup/popup.html dist/popup/popup.html
cp src/popup/popup.css dist/popup/popup.css
cp src/settings/settings.html dist/settings/settings.html
cp src/settings/settings.css dist/settings/settings.css
cp manifest.json dist/manifest.json
cp -R assets dist/
cp src/content/ui/tooltip.css dist/content/ui/tooltip.css
cp src/content/ui/confirmPopup.css dist/content/ui/confirmPopup.css
cp src/content/ui/toggle.css dist/content/ui/toggle.css
# Remove 'export {}' lines from compiled content scripts
find dist/content -name '*.js' -exec sed -i '' '/^export {.*};*$/d' {} + 