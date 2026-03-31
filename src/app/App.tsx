import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import ToastContainer from '../shared/components/ui/ToastContainer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { useTheme } from '../shared/hooks/useTheme';
import NotificationHandler from '../shared/components/NotificationHandler';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Deep linking configuration
const linking: any = {
  prefixes: [
    'swipee://',
    process.env.EXPO_PUBLIC_API_URL || 'https://swipee.app',
  ],
  config: {
    screens: {
      Main: {
        path: 'main',
        screens: {
          Swipe: 'swipe',
        },
      },
      // Maps /invite/XYZ to InviteAccept screen with {token: 'XYZ'}
      InviteAccept: 'invite/:token',
      GroupManagement: 'group-management',
    },
  },
};

// Inner component so useTheme() can access the theme store (must be inside SafeAreaProvider)
function ThemedNavigationContainer() {
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <AppNavigator />
      <NotificationHandler />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ToastContainer />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <QueryClientProvider client={queryClient}>
          <WebSocketProvider>
            <ThemedNavigationContainer />
          </WebSocketProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
