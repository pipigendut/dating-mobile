if (__DEV__) {
  import('./src/shared/config/reactotron');
}
// Silence RN Firebase namespaced warnings as the modular migration is in progress
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
import { registerRootComponent } from 'expo';
import notifee, { EventType } from '@notifee/react-native';

import App from './src/app/App';

// Notifee MUST have a background handler registered at the root level.
// Navigation is unavailable here — routing happens via FCM's onNotificationOpenedApp.
// This handler prevents the "no background handler" warning/crash.
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('[Notifee BG] Notification pressed:', detail.notification?.data);
    // Routing is handled by messaging().onNotificationOpenedApp in FCMService
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App).
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

