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

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

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

/**
 * Perform Google Sign-Out
 */
export const signOutWithGoogle = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return signOutWeb();
  } else {
    return signOutNative();
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
    if (error.code === statusCodes.DEVELOPER_ERROR) {
      console.error('Google Sign-In DEVELOPER_ERROR:',
        'This usually means your Web Client ID is incorrect, or your SHA-1 fingerprint is not registered in Firebase/Google Console for this specific build (debug/release).');
    }
    throw error;
  }
};

const signOutNative = async (): Promise<void> => {
  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Failed to clear Native Google Sign-In:', error);
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

const signOutWeb = async (): Promise<void> => {
  // @ts-ignore
  if (window.google?.accounts?.id) {
    // @ts-ignore
    window.google.accounts.id.disableAutoSelect();
  }
};
