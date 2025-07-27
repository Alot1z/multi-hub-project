ARCHS = arm64
TARGET = iphone:clang:13.5:latest
THEOS = ../../toolchain/theos

include $(THEOS)/makefiles/common.mk

TWEAK_NAME = ExampleApp
ExampleApp_FILES = Tweak.xm

include $(THEOS_MAKE_PATH)/tweak.mk