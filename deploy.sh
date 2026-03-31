#!/bin/bash
# CloudPanel deploy script
# Document Root: /home/<user>/htdocs/<domain>/dist

set -e

echo "Installing dependencies..."
npm ci --production=false

echo "Building project..."
npm run build

echo "Build complete! dist/ is ready to serve."
echo "CloudPanel Document Root should point to: $(pwd)/dist"
