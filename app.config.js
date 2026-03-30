import 'dotenv/config';

/**
 * Dynamic Expo configuration based on environment variables.
 * Switching between development (ngrok/deep link) and production (universal link)
 * is managed via the EXPO_PUBLIC_APP_ENV variable.
 */
export default ({ config }) => {
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'development';
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
  
  // Extract host for associated domains (e.g. d11a...ngrok-free.app)
  const host = apiUrl.replace('https://', '').replace('http://', '').split('/')[0];

  // Development uses .dev suffix to allow side-by-side installation if needed
  // Always use com.swipee to match existing native build
  const bundleIdentifier = 'com.swipee';

  console.log(`🔗 [${appEnv.toUpperCase()}] Expo Config`);
  console.log(`   - API URL: ${apiUrl}`);
  console.log(`   - Host: ${host}`);
  console.log(`   - Bundle ID: ${bundleIdentifier}`);

  return {
    ...config,
    scheme: 'swipee',
    ios: {
      ...config.ios,
      bundleIdentifier: bundleIdentifier,
      associatedDomains: appEnv === 'production' 
        ? ['applinks:swipee.app'] 
        : [`applinks:${host}`],
    },
    android: {
      ...config.android,
      package: bundleIdentifier,
          intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: appEnv === 'production' ? 'swipee.app' : host,
              pathPrefix: '/invite',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          data: [
            {
              scheme: 'swipee',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
  };
};
