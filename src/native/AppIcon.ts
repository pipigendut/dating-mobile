import { NativeModules } from 'react-native';

const { AppIcon } = NativeModules;

/**
 * Changes the app icon dynamically.
 *
 * @param iconName - 'lightning', 'compass', or null / '' for the default icon
 */
export function changeAppIcon(iconName: string | null): Promise<string> {
  if (!AppIcon) {
    return Promise.reject(
      new Error(
        'AppIcon native module is not available. ' +
        'Run "npx expo prebuild" to regenerate native files.'
      )
    );
  }
  // Pass empty string to native layer to indicate "default"
  return AppIcon.changeIcon(iconName ?? '');
}
