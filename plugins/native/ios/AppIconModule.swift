import UIKit

@objc(AppIcon)
class AppIconModule: NSObject {

  // No main-queue setup needed — we dispatch to main inside the method
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc func changeIcon(
    _ iconName: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // nil means "reset to default"
    let name: String? = iconName.isEmpty ? nil : iconName

    DispatchQueue.main.async {
      guard UIApplication.shared.supportsAlternateIcons else {
        reject("NOT_SUPPORTED", "Alternate icons are not supported on this device", nil)
        return
      }

      UIApplication.shared.setAlternateIconName(name) { error in
        if let error = error {
          reject("ICON_CHANGE_ERROR", error.localizedDescription, error)
        } else {
          resolve(name ?? "default")
        }
      }
    }
  }
}
