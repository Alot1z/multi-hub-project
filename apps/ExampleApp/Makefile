# 🎯 TrollStore ExampleApp Makefile
# Builds unsigned IPA ready for TrollStore installation

# Architecture and SDK configuration
ARCHS = arm64
TARGET = iphone:clang:13.5:13.0

# Theos path (relative to project structure)
THEOS = ../../toolchain/theos

# Include Theos common configurations
include $(THEOS)/makefiles/common.mk

# Project configuration
TWEAK_NAME = ExampleApp
BUNDLE_ID = com.factory.exampleapp

# Source files
ExampleApp_FILES = Tweak.xm
ExampleApp_CFLAGS = -fobjc-arc

# Frameworks and libraries
ExampleApp_FRAMEWORKS = UIKit Foundation
ExampleApp_PRIVATE_FRAMEWORKS = SpringBoardServices

# Installation path for TrollStore
ExampleApp_INSTALL_PATH = /Applications

# Include tweak makefile
include $(THEOS_MAKE_PATH)/tweak.mk

# Custom packaging for TrollStore (no signing)
after-package::
	@echo "🎉 TrollStore IPA ready for installation!"
	@echo "📦 Location: packages/$(TWEAK_NAME).ipa"
	@echo "📲 Install with TrollStore for full system access"

# Clean build artifacts
clean::
	@rm -rf packages/
	@rm -rf .theos/
	@echo "🧹 Build artifacts cleaned"
