import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import SafeScreen from "../components/SafeScreen";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { checkAuth, user, token, hasCheckedAuth } = useAuthStore();

  // 1) start auth check on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // 2) only redirect when segments exist AND auth check is finished
  useEffect(() => {
    // WAIT: segments must be loaded
    if (!segments || segments.length === 0) return;

    // WAIT: auth check must complete (avoid redirect while checkAuth is running)
    if (!hasCheckedAuth) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isSignedIn = !!(user && token);

    if (!inAuthGroup && !isSignedIn) {
      router.replace("/(auth)");
    } else if (inAuthGroup && isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [user, token, segments, hasCheckedAuth]);

  return (
    <>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </>
  );
}
