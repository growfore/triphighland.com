"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold text-red-600">An error occurred</h2>
      <p className="mt-4 text-gray-700">{error.message}</p>
      <Button
        onClick={reset}
        className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary/70"
      >
        Try Again
      </Button>
    </div>
  );
}
