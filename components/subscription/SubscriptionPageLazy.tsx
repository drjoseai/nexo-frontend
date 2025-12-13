"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

/**
 * Skeleton component for subscription page loading state
 */
function SubscriptionSkeleton() {
  return (
    <div className="container max-w-6xl py-8 animate-pulse">
      {/* Header skeleton - centered */}
      <div className="mb-8 text-center">
        <div className="h-9 w-48 bg-muted rounded-md mx-auto mb-2" />
        <div className="h-5 w-80 bg-muted/60 rounded-md mx-auto" />
      </div>

      {/* Plan Cards skeleton - 3 columns */}
      <div className="mb-12 grid gap-6 md:grid-cols-3">
        {/* Free Plan skeleton */}
        <Card className="relative flex flex-col border-2 border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-500/30" />
            <div className="h-7 w-20 bg-muted rounded-md mx-auto mb-2" />
            <div className="h-4 w-40 bg-muted/60 rounded-md mx-auto" />
          </CardHeader>
          <CardContent className="flex-1 text-center">
            <div className="mb-6">
              <div className="h-10 w-16 bg-muted rounded-md mx-auto" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-muted rounded" />
                  <div className="h-4 w-32 bg-muted/60 rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="h-10 w-full bg-muted rounded-md" />
          </CardFooter>
        </Card>

        {/* Plus Plan skeleton - Popular */}
        <Card className="relative flex flex-col border-2 border-purple-500 shadow-lg shadow-purple-500/20">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="h-6 w-24 bg-purple-500/50 rounded-full" />
          </div>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30" />
            <div className="h-7 w-16 bg-muted rounded-md mx-auto mb-2" />
            <div className="h-4 w-44 bg-muted/60 rounded-md mx-auto" />
          </CardHeader>
          <CardContent className="flex-1 text-center">
            <div className="mb-6">
              <div className="h-10 w-24 bg-muted rounded-md mx-auto" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-green-400/30 rounded" />
                  <div className="h-4 w-32 bg-muted/60 rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="h-10 w-full bg-purple-600/30 rounded-md" />
          </CardFooter>
        </Card>

        {/* Premium Plan skeleton */}
        <Card className="relative flex flex-col border-2 border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30" />
            <div className="h-7 w-24 bg-muted rounded-md mx-auto mb-2" />
            <div className="h-4 w-48 bg-muted/60 rounded-md mx-auto" />
          </CardHeader>
          <CardContent className="flex-1 text-center">
            <div className="mb-6">
              <div className="h-10 w-28 bg-muted rounded-md mx-auto" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-green-400/30 rounded" />
                  <div className="h-4 w-32 bg-muted/60 rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="h-10 w-full bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-md" />
          </CardFooter>
        </Card>
      </div>

      {/* Feature Comparison Table skeleton */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="h-6 w-56 bg-muted rounded-md mb-2" />
          <div className="h-4 w-72 bg-muted/60 rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-4 text-left">
                    <div className="h-5 w-28 bg-muted rounded-md" />
                  </th>
                  <th className="pb-4 text-center">
                    <div className="h-5 w-12 bg-muted rounded-md mx-auto" />
                  </th>
                  <th className="pb-4 text-center">
                    <div className="h-5 w-12 bg-purple-400/30 rounded-md mx-auto" />
                  </th>
                  <th className="pb-4 text-center">
                    <div className="h-5 w-16 bg-amber-400/30 rounded-md mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-4">
                      <div className="h-4 w-40 bg-muted/60 rounded-md" />
                    </td>
                    <td className="py-4 text-center">
                      <div className="h-5 w-5 bg-muted rounded mx-auto" />
                    </td>
                    <td className="py-4 text-center">
                      <div className="h-5 w-5 bg-muted rounded mx-auto" />
                    </td>
                    <td className="py-4 text-center">
                      <div className="h-5 w-5 bg-muted rounded mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Lazy-loaded Subscription Content component
 * Uses dynamic import to reduce initial bundle size
 */
const SubscriptionContent = dynamic(
  () => import("./SubscriptionContent").then((mod) => ({ default: mod.SubscriptionContent })),
  {
    loading: () => <SubscriptionSkeleton />,
    ssr: false,
  }
);

/**
 * Lazy wrapper for SubscriptionContent
 * Displays skeleton while the main component loads
 */
export function SubscriptionPageLazy() {
  return <SubscriptionContent />;
}

export { SubscriptionSkeleton };

