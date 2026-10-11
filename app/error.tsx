"use client";

import Link from "next/link";
import { useEffect } from "react";

// Any page that throws while rendering (e.g. the API is down) lands here
// instead of a blank screen; header and footer stay in place.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="wrap flex min-h-[70vh] flex-col items-start justify-center py-24">
      <p className="meta text-[12px] text-ink-muted">Something went wrong</p>
      <h1 className="display mt-4 max-w-[800px] text-[30px] sm:text-[49px]">We lost the trail for a moment.</h1>
      <p className="standfirst mt-6 max-w-[520px]">This page couldn’t load. Please try again — if it keeps happening, get in touch and we’ll help.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn-dark">
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Back home
        </Link>
      </div>
    </main>
  );
}
