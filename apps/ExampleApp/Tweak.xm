%hook SpringBoard
- (void)applicationDidFinishLaunching:(id)application {
  %orig;
  NSLog(@"🔥 TrollStore ExampleApp Injected!");
}
%end