export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export interface Colors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  white: string;
  card: string;
  error: string;
  success: string;
}

export const lightColors: Colors = {
  primary: '#ef4444',
  background: '#ffffff',
  surface: '#ffffff',
  text: '#101621ff',
  textSecondary: '#6b7280',
  border: '#f3f4f6',
  white: '#ffffff',
  card: '#ffffff',
  error: '#ef4444',
  success: '#10b981',
};

export const darkColors: Colors = {
  primary: '#ef4444',
  background: '#000000ff',
  surface: '#101621ff',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  border: '#374151',
  white: '#ffffff',
  card: '#101621ff',
  error: '#ef4444',
  success: '#10b981',
};
