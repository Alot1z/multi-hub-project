#!/bin/bash
# 🔧 TrollStore Factory Build Environment Setup
# This script sets up all necessary environment variables for Theos compilation

echo "🚀 Setting up TrollStore build environment..."

# Theos installation path (embedded in repo)
export THEOS="$(pwd)/toolchain/theos"
export THEOS_MAKE_PATH="$THEOS/makefiles"

# iOS SDK version and paths
export SDKVERSION="13.5"
export SYSROOT="$THEOS/sdks/iPhoneOS${SDKVERSION}.sdk"

# Build tools and compiler paths
export PATH="$THEOS/bin:$PATH"
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"

# Architecture and deployment target
export ARCHS="arm64"
export TARGET="iphone:clang:${SDKVERSION}:13.0"

# Signing configuration (disabled for TrollStore)
export CODESIGN_ALLOCATE="/usr/bin/codesign_allocate"
export LDID="ldid"

# Debug output
echo "✅ THEOS: $THEOS"
echo "✅ SDK: $SYSROOT"
echo "✅ Architecture: $ARCHS"
echo "✅ Target: $TARGET"
echo "🎯 Ready for TrollStore app compilation!"
