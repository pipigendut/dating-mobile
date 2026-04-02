import 'dotenv/config';
import fs from 'fs';

const APP_ENV = process.env.APP_ENV || 'development';

export default ({ config }) => ({
  ...config,
  name: APP_ENV === 'production' ? "Swipee" : "Swipee (BETA)",
  slug: "Swipee",
  scheme: "swipee",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  extra: {
    eas: {
      projectId: "5a781063-3b95-4175-948c-f72a74e0e2f8"
    }
  },
  splash: {
    image: "./assets/icon-splash.png",
    resizeMode: "cover",
    backgroundColor: "#df2c2c"
  },
  ios: {
    bundleIdentifier: APP_ENV === 'production' ? "com.swipee.app" : "com.swipee.app.dev",
    googleServicesFile: fs.existsSync(APP_ENV === 'production' ? "./GoogleService-Info-prod.plist" : "./GoogleService-Info-dev.plist")
      ? (APP_ENV === 'production' ? "./GoogleService-Info-prod.plist" : "./GoogleService-Info-dev.plist")
      : undefined,
    infoPlist: {
      NSCameraUsageDescription: "Allow $(PRODUCT_NAME) to access your camera to take photos for face verification.",
      NSMicrophoneUsageDescription: "Allow $(PRODUCT_NAME) to access your microphone."
    }
  },
  android: {
    package: APP_ENV === 'production' ? "com.swipee" : "com.swipee.dev",
    googleServicesFile: fs.existsSync(APP_ENV === 'production' ? "./google-services-prod.json" : "./google-services-dev.json")
      ? (APP_ENV === 'production' ? "./google-services-prod.json" : "./google-services-dev.json")
      : undefined,
    adaptiveIcon: {
      foregroundImage: "./assets/icon-splash.png",
      backgroundColor: "#df2c2c"
    },
    edgeToEdgeEnabled: true,
    softwareKeyboardLayoutMode: "resize",
    permissions: [
      "CAMERA",
      "RECORD_AUDIO",
      "POST_NOTIFICATIONS"
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "swipee"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "./plugins/withNotifee",
    "./plugins/withFirebaseModularHeaders",
    ...(fs.existsSync(APP_ENV === 'production' ? "./google-services-prod.json" : "./google-services-dev.json")
      || fs.existsSync(APP_ENV === 'production' ? "./GoogleService-Info-prod.plist" : "./GoogleService-Info-dev.plist") ? [
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
    ] : []),
    [
      "expo-camera",
      {
        "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
      }
    ],
    "@react-native-google-signin/google-signin",
    "expo-secure-store",
    "@maplibre/maplibre-react-native",
    [
      "expo-build-properties",
      {
        "android": {
          "minSdkVersion": 26,
          "compileSdkVersion": 36,
          "targetSdkVersion": 36,
          "buildToolsVersion": "36.0.0"
        },
        "ios": {
          "useModularHeaders": true
        }
      }
    ],
    "expo-asset",
    [
      "react-native-google-mobile-ads",
      {
        "android_app_id": "ca-app-pub-3940256099942544~3347511713",
        "ios_app_id": "ca-app-pub-3940256099942544~1458002511",
        "androidAppId": "ca-app-pub-3940256099942544~3347511713",
        "iosAppId": "ca-app-pub-3940256099942544~1458002511"
      }
    ]
  ]
});
