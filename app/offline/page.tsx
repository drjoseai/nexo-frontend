"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Lazy initializer to avoid setState in effect
const getInitialOnlineStatus = () => {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
};

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(getInitialOnlineStatus);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = "/";
    } else {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            {isOnline ? "Back Online!" : "You're Offline"}
          </h1>
          <p className="text-muted-foreground">
            {isOnline
              ? "Reconnecting to NEXO..."
              : "It looks like you've lost your internet connection. Please check your connection and try again."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {isOnline ? "Connected" : "No connection"}
          </span>
        </div>

        {!isOnline && (
          <Button
            onClick={handleRetry}
            variant="default"
            size="lg"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}

        <div className="pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            NEXO will automatically reconnect when your connection is restored.
          </p>
        </div>
      </div>
    </div>
  );
}
