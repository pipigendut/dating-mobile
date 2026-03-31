import 'dotenv/config';

const APP_ENV = process.env.APP_ENV || 'development';

export default ({ config }) => ({
  ...config,
  name: APP_ENV === 'production' ? "Swipee" : "Swipee (Dev)",
  slug: "Swipee",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/icon-splash.png",
    resizeMode: "cover",
    backgroundColor: "#df2c2c"
  },
  ios: {
    bundleIdentifier: APP_ENV === 'production' ? "com.swipee.app" : "com.swipee.app.dev",
    googleServicesFile: APP_ENV === 'production' ? "./GoogleService-Info-prod.plist" : "./GoogleService-Info-dev.plist",
    infoPlist: {
      NSCameraUsageDescription: "Allow $(PRODUCT_NAME) to access your camera to take photos for face verification.",
      NSMicrophoneUsageDescription: "Allow $(PRODUCT_NAME) to access your microphone."
    }
  },
  android: {
    package: APP_ENV === 'production' ? "com.swipee" : "com.swipee.dev",
    googleServicesFile: APP_ENV === 'production' ? "./google-services-prod.json" : "./google-services-dev.json",
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
    ]

  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "./plugins/withNotifee",
    "@react-native-firebase/app",
    "@react-native-firebase/messaging",
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
        }
      }
    ],
    "expo-asset"
  ]
});
