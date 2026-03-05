#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(NexoAppleAuthPlugin, "NexoAppleAuth",
    CAP_PLUGIN_METHOD(authorize, CAPPluginReturnPromise);
)
