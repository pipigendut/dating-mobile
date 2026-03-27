#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AppIcon, NSObject)

RCT_EXTERN_METHOD(
  changeIcon:(NSString *)iconName
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

@end
