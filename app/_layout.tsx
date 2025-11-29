import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import CactusInit from '@/components/CactusInit.native';
import { AuthProvider } from '@/contexts/AuthContext';
import { EmailProvider } from '@/contexts/EmailContext';
import { EventProvider } from '@/contexts/EventContext';
import { ThemeProvider as AppThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AppThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <EventProvider>
          <EmailProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <CactusInit />
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  <Stack.Screen name="parse/[emailId]" options={{ presentation: 'card', title: 'Parse Email' }} />
                  <Stack.Screen name="edit/[eventId]" options={{ presentation: 'card', title: 'Edit Event' }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </EmailProvider>
          </EventProvider>
        </AuthProvider>
      </ToastProvider>
    </AppThemeProvider>
  );
}
