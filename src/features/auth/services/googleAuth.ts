import { Platform } from 'react-native';

// Types for Google User
export interface GoogleUser {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  givenName: string | null;
  familyName: string | null;
}

const WEB_CLIENT_ID = '940433220206-k3u5fqh79ovm1qjatkj6kjgd0bsiebc3.apps.googleusercontent.com';

/**
 * Initialize Google Sign-In for the current platform
 */
export const initializeGoogleSignIn = async () => {
  if (Platform.OS === 'web') {
    return initializeWebGoogleSignIn();
  } else {
    return initializeNativeGoogleSignIn();
  }
};

/**
 * Perform Google Sign-In
 */
export const signInWithGoogle = async (): Promise<GoogleUser | null> => {
  if (Platform.OS === 'web') {
    return signInWeb();
  } else {
    return signInNative();
  }
};

// --- Native Implementation ---

const initializeNativeGoogleSignIn = () => {
  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true,
    });
  } catch (error) {
    console.error('Failed to initialize Native Google Sign-In:', error);
  }
};

const signInNative = async (): Promise<GoogleUser | null> => {
  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    const user = userInfo.data?.user;
    if (user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        givenName: user.givenName,
        familyName: user.familyName,
      };
    }
    return null;
  } catch (error: any) {
    const { statusCodes } = require('@react-native-google-signin/google-signin');
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return null;
    }
    throw error;
  }
};

// --- Web Implementation (Google Identity Services) ---

let webGisInitialized = false;

const initializeWebGoogleSignIn = (): Promise<void> => {
  if (webGisInitialized) return Promise.resolve();

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // @ts-ignore
      window.google?.accounts.id.initialize({
        client_id: WEB_CLIENT_ID,
        callback: (response: any) => {
          // This callback is for One Tap or automatic flows
          console.log('GIS Callback:', response);
        },
      });
      webGisInitialized = true;
      resolve();
    };
    document.head.appendChild(script);
  });
};

const signInWeb = async (): Promise<GoogleUser | null> => {
  await initializeWebGoogleSignIn();

  return new Promise((resolve, reject) => {
    // @ts-ignore
    const client = window.google?.accounts.oauth2.initTokenClient({
      client_id: WEB_CLIENT_ID,
      scope: 'email profile openid',
      callback: async (response: any) => {
        if (response.error) {
          if (response.error === 'access_denied') return resolve(null);
          return reject(new Error(response.error));
        }

        // Fetch user info using the access token
        try {
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` },
          });
          const userInfo = await userInfoResponse.json();

          resolve({
            id: userInfo.sub,
            name: userInfo.name,
            email: userInfo.email,
            photo: userInfo.picture,
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
          });
        } catch (e) {
          reject(e);
        }
      },
    });

    if (client) {
      client.requestAccessToken();
    } else {
      reject(new Error('Google Identity Services not available'));
    }
  });
};
