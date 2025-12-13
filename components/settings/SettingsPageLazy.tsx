"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton component for settings page loading state
 */
function SettingsSkeleton() {
  return (
    <div className="container max-w-4xl py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-48 bg-muted rounded-md mb-2" />
        <div className="h-5 w-64 bg-muted/60 rounded-md" />
      </div>

      <div className="grid gap-6">
        {/* Card skeleton 1 - Notifications */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-purple-400/30 rounded" />
              <div className="h-6 w-32 bg-muted rounded-md" />
            </div>
            <div className="h-4 w-56 bg-muted/60 rounded-md mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-40 bg-muted rounded-md" />
                  <div className="h-3 w-56 bg-muted/60 rounded-md" />
                </div>
                <div className="h-6 w-11 bg-muted rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card skeleton 2 - Appearance */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-purple-400/30 rounded" />
              <div className="h-6 w-28 bg-muted rounded-md" />
            </div>
            <div className="h-4 w-48 bg-muted/60 rounded-md mt-1" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-4 w-16 bg-muted rounded-md" />
                <div className="h-3 w-44 bg-muted/60 rounded-md" />
              </div>
              <div className="h-10 w-40 bg-muted rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Card skeleton 3 - Language */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-purple-400/30 rounded" />
              <div className="h-6 w-20 bg-muted rounded-md" />
            </div>
            <div className="h-4 w-52 bg-muted/60 rounded-md mt-1" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-4 w-32 bg-muted rounded-md" />
                <div className="h-3 w-48 bg-muted/60 rounded-md" />
              </div>
              <div className="h-10 w-40 bg-muted rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Save button skeleton */}
        <div className="flex justify-end">
          <div className="h-10 w-40 bg-purple-600/30 rounded-md" />
        </div>

        {/* Danger zone skeleton */}
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-red-400/30 rounded" />
              <div className="h-6 w-36 bg-red-400/20 rounded-md" />
            </div>
            <div className="h-4 w-52 bg-muted/60 rounded-md mt-1" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-4 w-32 bg-muted rounded-md" />
                <div className="h-3 w-64 bg-muted/60 rounded-md" />
              </div>
              <div className="h-10 w-32 bg-red-600/30 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Lazy-loaded Settings Content component
 * Uses dynamic import to reduce initial bundle size
 */
const SettingsContent = dynamic(
  () => import("./SettingsContent").then((mod) => ({ default: mod.SettingsContent })),
  {
    loading: () => <SettingsSkeleton />,
    ssr: false,
  }
);

/**
 * Lazy wrapper for SettingsContent
 * Displays skeleton while the main component loads
 */
export function SettingsPageLazy() {
  return <SettingsContent />;
}

export { SettingsSkeleton };

