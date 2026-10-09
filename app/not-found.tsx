import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap flex min-h-[70vh] flex-col items-start justify-center py-24">
      <p className="meta text-[12px] text-ink-muted">404</p>
      <h1 className="display mt-4 max-w-[800px] text-[30px] sm:text-[49px]">
        This trail <em>doesn’t go anywhere.</em>
      </h1>
      <p className="standfirst mt-6 max-w-[520px]">The page you’re looking for has moved or never existed.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn-dark">
          Back home
        </Link>
        <Link href="/explore" className="btn-outline">
          Browse journeys
        </Link>
      </div>
    </main>
  );
}
