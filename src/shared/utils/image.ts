import { ImageSourcePropType } from 'react-native';

/**
 * Safely converts an image source (URL string or require ID) 
 * into a valid React Native Image source prop.
 * 
 * @param source The image source (string/URL, number/require ID, or null/undefined)
 * @param fallback Optional fallback if source is invalid
 * @returns ImageSourcePropType or undefined
 */
export const getImageSource = (
  source: string | number | null | undefined,
  fallback?: ImageSourcePropType
): ImageSourcePropType | undefined => {
  if (!source) return fallback;

  // If it's a number, it's already a resource ID from require()
  if (typeof source === 'number') {
    return source as ImageSourcePropType;
  }

  // If it's a string, wrap it in a URI object
  return { uri: source } as ImageSourcePropType;
};
