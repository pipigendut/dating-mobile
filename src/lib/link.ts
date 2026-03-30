/**
 * Utility to generate invite links based on the environment-specific scheme.
 * We always return the HTTPS Universal Link format for sharing.
 */
export const generateInviteLink = (token: string): string => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://swipee.app';
  
  // Ensure the base doesn't have a trailing slash before appending path
  const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  
  return `${base}/invite/${token}`;
};
