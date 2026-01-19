"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  const throwError = () => {
    throw new Error("Sentry Frontend Test Error");
  };

  const captureMessage = () => {
    Sentry.captureMessage("Test message from NEXO frontend");
    alert("Message sent to Sentry!");
  };

  // Only render in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold">Sentry Test Page</h1>
      <p className="text-gray-400">Use these buttons to test Sentry integration</p>
      
      <div className="flex gap-4 mt-4">
        <button
          onClick={throwError}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
        >
          Throw Error
        </button>
        
        <button
          onClick={captureMessage}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Capture Message
        </button>
      </div>
    </div>
  );
}

