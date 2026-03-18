import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import ToastContainer from '../shared/components/ui/ToastContainer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from './providers/WebSocketProvider';

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

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
            <ToastContainer />
          </NavigationContainer>
        </WebSocketProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
