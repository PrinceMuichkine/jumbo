#!/bin/bash
set -e

# Update the lock file instead of using frozen-lockfile
echo "Installing dependencies..."
pnpm install --no-frozen-lockfile

# Build the application
echo "Building application..."
pnpm run build

# Output success message
echo "Build completed successfully!"
