#!/bin/bash
# ignore-build-step.sh for apps/widget
# Vercel runs this to decide if a build is needed.
# Exit 1 = skip build, Exit 0 = build.
# Docs: https://vercel.com/docs/projects/overview#ignored-build-step
#
# Only build when files relevant to the widget app change.

echo "🔍 Checking if widget app needs to rebuild..."

# Always build if package.json or lockfile changed
if git diff --quiet HEAD^ HEAD -- pnpm-lock.yaml package.json; then
  echo "  Root config unchanged"
else
  echo "  ✅ Root config changed — building"
  exit 0
fi

# Build if widget app files changed
if git diff --quiet HEAD^ HEAD -- apps/widget/; then
  echo "  apps/widget/ unchanged"
else
  echo "  ✅ apps/widget/ changed — building"
  exit 0
fi

# Build if shared packages changed
if git diff --quiet HEAD^ HEAD -- packages/; then
  echo "  packages/ unchanged"
else
  echo "  ✅ packages/ changed — building"
  exit 0
fi

# Build if turbo config changed
if git diff --quiet HEAD^ HEAD -- turbo.json; then
  echo "  turbo.json unchanged"
else
  echo "  ✅ turbo.json changed — building"
  exit 0
fi

echo "  ⏭️  No relevant changes — skipping build"
exit 1
