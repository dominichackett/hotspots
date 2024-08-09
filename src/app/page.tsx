"use client";

import { ProfileCard } from "@/components/profile-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ThemeSwitch from "@/components/ui/theme-switch";
import { useSignerStatus } from "@alchemy/aa-alchemy/react";
import { PasskeyCard } from "@/components/signup-passkey";
import { useRouter } from 'next/navigation'
import { useTheme } from "next-themes";
import { useState } from "react";

// [!region using-status]
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  // use the various signer statuses to determine if we are:
  // loading - waiting for a request to resolve
  // connected - the user signed in with an email tied to a smart account
  // unconnected - we need to provide a login UI for the user to sign in
  const { isInitializing, isAuthenticating, isConnected, status } =
    useSignerStatus();
  const isLoading =
    isInitializing || (isAuthenticating && status !== "AWAITING_EMAIL_AUTH");
const router = useRouter()
  if (isConnected)
    router.push("/portals")
  setTheme('dark')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      {isLoading ? (
        <LoadingSpinner />
      ) : isConnected ? (
        <LoadingSpinner />
      ) : (
        <PasskeyCard/>
      )}
      <ThemeSwitch />
    </main>
  );
}
// [!endregion using-status]
