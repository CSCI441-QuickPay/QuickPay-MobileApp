import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Load login state on app start
  useEffect(() => {
    AsyncStorage.getItem("isLoggedIn").then((value) => {
      setIsLoggedIn(value === "true");
    });
  }, []);

  // Still checking storage (avoid flicker)
  if (isLoggedIn === null) return null;

  // Redirect based on stored login state
  return isLoggedIn ? <Redirect href="/home" /> : <Redirect href="/login" />;
}
