import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AppProvider } from '@/store/AppContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Games' }} />
          <Stack.Screen name="players" options={{ title: 'Select Players' }} />
          <Stack.Screen name="scoring" options={{ title: 'Scoring' }} />
        </Stack>
      </AppProvider>
    </ThemeProvider>
  );
}
