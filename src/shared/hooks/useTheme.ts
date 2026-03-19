import { useColorScheme } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { lightColors, darkColors, Colors } from '../theme/theme';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const { themeMode } = useThemeStore();

  const isDark = 
    themeMode === 'system' 
      ? systemColorScheme === 'dark' 
      : themeMode === 'dark';

  const colors: Colors = isDark ? darkColors : lightColors;

  return {
    colors,
    isDark,
    themeMode,
  };
};
