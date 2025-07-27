// 🔥 TrollStore ExampleApp - System-level iOS Injection
// This tweak demonstrates full system access available through TrollStore

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#import <SpringBoardServices/SpringBoardServices.h>

// Interface declarations for private APIs
@interface SpringBoard : UIApplication
@end

@interface SBApplicationController : NSObject
+ (instancetype)sharedInstance;
- (void)requestPermissionToManageApplications;
@end

// 🎯 Hook into SpringBoard launch
%hook SpringBoard

- (void)applicationDidFinishLaunching:(id)application {
    %orig; // Call original implementation
    
    NSLog(@"🚀 [TrollStore Factory] ExampleApp injected successfully!");
    
    // Show system notification that we're active
    [self showTrollStoreActiveNotification];
    
    // Initialize our custom functionality
    [self initializeTrollStoreFeatures];
}

// Custom method to show we're running
%new
- (void)showTrollStoreActiveNotification {
    UIAlertController *alert = [UIAlertController 
        alertControllerWithTitle:@"🔥 TrollStore Active" 
        message:@"ExampleApp is running with full system privileges!\n\nBuilt with TrollStore Factory"
        preferredStyle:UIAlertControllerStyleAlert];
    
    UIAlertAction *okAction = [UIAlertAction 
        actionWithTitle:@"Amazing!" 
        style:UIAlertActionStyleDefault 
        handler:nil];
    
    [alert addAction:okAction];
    
    // Present on main thread
    dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *rootVC = [[UIApplication sharedApplication] keyWindow].rootViewController;
        if (rootVC) {
            [rootVC presentViewController:alert animated:YES completion:nil];
        }
    });
}

// Initialize TrollStore-specific features
%new
- (void)initializeTrollStoreFeatures {
    NSLog(@"🛠️ [TrollStore Factory] Initializing system-level features...");
    
    // Example: Access system applications
    [[SBApplicationController sharedInstance] requestPermissionToManageApplications];
    
    // Example: Log system information
    NSString *systemVersion = [[UIDevice currentDevice] systemVersion];
    NSString *deviceModel = [[UIDevice currentDevice] model];
    
    NSLog(@"📱 Device: %@ running iOS %@", deviceModel, systemVersion);
    NSLog(@"🔓 Full system access granted via TrollStore");
    
    // Schedule periodic tasks
    [self scheduleBackgroundTasks];
}

// Schedule background operations
%new
- (void)scheduleBackgroundTasks {
    dispatch_queue_t backgroundQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0);
    
    dispatch_async(backgroundQueue, ^{
        while (true) {
            sleep(30); // Run every 30 seconds
            
            NSLog(@"💖 [TrollStore Factory] Background task running...");
            
            // Add your custom background functionality here
            // This runs with full system privileges
        }
    });
}

%end

// 🎯 Hook into app launches to monitor system activity
%hook SBApplication

- (void)didLaunch {
    %orig;
    
    NSString *bundleID = [self bundleIdentifier];
    NSLog(@"📱 [TrollStore Monitor] App launched: %@", bundleID);
    
    // Custom logic for specific app launches
    if ([bundleID isEqualToString:@"com.apple.Preferences"]) {
        NSLog(@"⚙️ Settings app opened - TrollStore integration available");
    }
}

%end

// 🎯 Constructor - runs when tweak loads
%ctor {
    NSLog(@"🏗️ [TrollStore Factory] ExampleApp tweak loading...");
    NSLog(@"🔥 System injection successful - full iOS access enabled");
    NSLog(@"📦 Built with TrollStore Factory automation");
}
