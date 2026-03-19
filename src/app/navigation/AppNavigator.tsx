import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Heart, Layers, MessageCircle, User as UserIcon } from 'lucide-react-native';
import { useUserStore } from '../../store/useUserStore';
import { authEvents } from '../../utils/authEvents';
import { useThemeStore } from '../../store/useThemeStore';

// Screens
import HomeScreen from '../../features/dashboard/screens/HomeScreen';
import LikesScreen from '../../features/dashboard/screens/LikesScreen';
import ChatScreen from '../../features/chat/screens/ChatScreen';
import ChatDetailScreen from '../../features/chat/screens/ChatDetailScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import EditProfileScreen from '../../features/profile/screens/EditProfileScreen';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import OnboardingScreen from '../../features/onboarding/screens/OnboardingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator id="ProfileNavigator" screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function ChatNavigator() {
  return (
    <ChatStack.Navigator id="ChatNavigator" screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatScreen} />
      <ChatStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </ChatStack.Navigator>
  );
}

function DashboardTabs() {
  return (
    <Tab.Navigator
      id="DashboardTabs"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          if (route.name === 'Swipe') icon = <Layers color={color} size={size} />;
          else if (route.name === 'Likes') icon = <Heart color={color} size={size} fill={focused ? color : 'none'} />;
          else if (route.name === 'Chats') icon = <MessageCircle color={color} size={size} />;
          else if (route.name === 'Profile') icon = <UserIcon color={color} size={size} />;
          return icon;
        },
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, height: 60 }
      })}
    >
      <Tab.Screen name="Swipe" component={HomeScreen} />
      <Tab.Screen name="Likes" component={LikesScreen} />
      <Tab.Screen name="Chats" component={ChatNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoggedIn, isRegistering, userStatus, initialize, resetUser } = useUserStore();
  const { initialize: initializeTheme } = useThemeStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      initialize(),
      initializeTheme()
    ]).finally(() => setIsInitializing(false));
  }, []);

  // Listen for forced logouts triggered by the axios interceptor (refresh token failure)
  React.useEffect(() => {
    const unsubscribe = authEvents.on('logout', () => {
      resetUser();
    });
    return unsubscribe;
  }, [resetUser]);

  if (isInitializing) {
    return null; // Or a splash screen component
  }

  return (
    <Stack.Navigator id="RootNavigator" screenOptions={{ headerShown: false }}>
      {!isLoggedIn && !isRegistering ? (
        <Stack.Screen name="Auth" component={LoginScreen} />
      ) : userStatus !== 'active' ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <Stack.Group>
          <Stack.Screen name="Main" component={DashboardTabs} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
