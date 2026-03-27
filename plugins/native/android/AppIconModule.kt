package com.swipee

import android.content.ComponentName
import android.content.pm.PackageManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppIconModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "AppIcon"

  @ReactMethod
  fun changeIcon(iconName: String, promise: Promise) {
    val activity = getCurrentActivity()
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "No current activity found")
      return
    }

    val packageName = reactApplicationContext.packageName
    val pm = reactApplicationContext.packageManager

    // Map iconName (from JS) to the activity-alias suffix in AndroidManifest
    val targetSuffix = when (iconName.lowercase().trim()) {
      "lightning" -> "Lightning"
      "compass"   -> "Compass"
      else        -> "Default"  // null / "" / "default" all fall here
    }

    val allSuffixes = listOf("Default", "Lightning", "Compass")

    try {
      allSuffixes.forEach { suffix ->
        val component = ComponentName(packageName, "$packageName.MainActivity$suffix")
        val state = if (suffix == targetSuffix) {
          PackageManager.COMPONENT_ENABLED_STATE_ENABLED
        } else {
          PackageManager.COMPONENT_ENABLED_STATE_DISABLED
        }
        pm.setComponentEnabledSetting(component, state, PackageManager.DONT_KILL_APP)
      }
      promise.resolve(targetSuffix)
    } catch (e: Exception) {
      promise.reject("ICON_CHANGE_ERROR", e.message ?: "Failed to change icon", e)
    }
  }
}
