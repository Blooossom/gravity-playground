#!/bin/zsh
set -euo pipefail
cd "${0:A:h}/.."
swift build --build-system native -c release --product GravityPlayground
app_path="$PWD/build/맘대로 중력 놀이터.app"
mkdir -p "$app_path/Contents/MacOS" "$app_path/Contents/Resources"
cp .build/release/GravityPlayground "$app_path/Contents/MacOS/GravityPlayground.new"
mv -f "$app_path/Contents/MacOS/GravityPlayground.new" "$app_path/Contents/MacOS/GravityPlayground"
python3 scripts/bundle.py "$app_path/Contents/Resources"
swift scripts/icon.swift "$PWD/build/AppIcon.iconset"
iconutil -c icns "$PWD/build/AppIcon.iconset" -o "$app_path/Contents/Resources/AppIcon.icns"
cat > "$app_path/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>GravityPlayground</string>
<key>CFBundleIdentifier</key><string>com.blooossom.gravity-playground</string>
<key>CFBundleName</key><string>맘대로 중력 놀이터</string>
<key>CFBundleDisplayName</key><string>맘대로 중력 놀이터</string>
<key>CFBundleIconFile</key><string>AppIcon</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>1.0</string>
<key>CFBundleVersion</key><string>1</string>
<key>LSMinimumSystemVersion</key><string>13.0</string>
<key>NSHighResolutionCapable</key><true/>
<key>NSPrincipalClass</key><string>NSApplication</string>
</dict></plist>
PLIST
codesign --force --sign - --identifier com.blooossom.gravity-playground "$app_path"
codesign --verify --deep --strict "$app_path"
print "Built: $app_path"
