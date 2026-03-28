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

const linking: any = {
  prefixes: [
    'https://mock-ngrok.ngrok-free.app',
    'com.swipee://',
    'swipee://',
  ],
  config: {
    screens: {
      Main: {
        path: 'main',
        screens: {
          Swipe: 'swipe',
        },
      },
      InviteAccept: 'invite',
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
