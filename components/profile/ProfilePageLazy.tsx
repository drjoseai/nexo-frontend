"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton component for profile page loading state
 */
function ProfileSkeleton() {
  return (
    <div className="container max-w-4xl py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-32 bg-muted rounded-md mb-2" />
        <div className="h-5 w-72 bg-muted/60 rounded-md" />
      </div>

      <div className="grid gap-6">
        {/* Profile Info Card skeleton */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-purple-400/30 rounded" />
                  <div className="h-6 w-44 bg-muted rounded-md" />
                </div>
                <div className="h-4 w-48 bg-muted/60 rounded-md mt-1" />
              </div>
              <div className="h-9 w-20 bg-muted rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-purple-500/20 ring-2 ring-purple-500/30" />
              <div>
                <div className="h-6 w-36 bg-muted rounded-md mb-2" />
                <div className="h-4 w-48 bg-muted/60 rounded-md" />
              </div>
            </div>

            {/* Form fields skeleton */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-36 bg-muted rounded-md" />
                <div className="h-10 w-full bg-muted/60 rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded-md" />
                <div className="h-10 w-full bg-muted/60 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card skeleton */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-purple-400/30 rounded" />
              <div className="h-6 w-28 bg-muted rounded-md" />
            </div>
            <div className="h-4 w-40 bg-muted/60 rounded-md mt-1" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-24 bg-muted rounded-md" />
                  <div className="h-6 w-20 bg-purple-500/30 rounded-full" />
                </div>
                <div className="h-4 w-44 bg-muted/60 rounded-md" />
              </div>
              <div className="h-10 w-28 bg-muted rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Account Info Card skeleton */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-purple-400/30 rounded" />
              <div className="h-6 w-44 bg-muted rounded-md" />
            </div>
            <div className="h-4 w-36 bg-muted/60 rounded-md mt-1" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="h-4 w-28 bg-muted/60 rounded-md mb-1" />
                <div className="h-5 w-40 bg-muted rounded-md" />
              </div>
              <div>
                <div className="h-4 w-36 bg-muted/60 rounded-md mb-1" />
                <div className="h-5 w-32 bg-muted rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Lazy-loaded Profile Content component
 * Uses dynamic import to reduce initial bundle size
 */
const ProfileContent = dynamic(
  () => import("./ProfileContent").then((mod) => ({ default: mod.ProfileContent })),
  {
    loading: () => <ProfileSkeleton />,
    ssr: false,
  }
);

/**
 * Lazy wrapper for ProfileContent
 * Displays skeleton while the main component loads
 */
export function ProfilePageLazy() {
  return <ProfileContent />;
}

export { ProfileSkeleton };

