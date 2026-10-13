import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

// Same-origin proxy so client components can reach the TripEleven API without
// the key ever reaching the browser. apiFetch attaches x-api-key server-side.

// Only the endpoints the site's client components call are forwarded, so the
// proxy can't be used as an open relay to the rest of the keyed API.
const ALLOWED_POSTS = new Set(["email/send", "newsletter/subscribe"]);
const ALLOWED_GETS = new Set(["activity", "blogs/published", "extras"]);

function allowedGet(path: string[]): boolean {
  if (path.some((p) => p === "" || p === "." || p === "..")) return false;
  const joined = path.join("/");
  if (ALLOWED_GETS.has(joined)) return true;
  // /activity/slug/:slug, used by the enquiry form to prefill a trip.
  return path.length === 3 && path[0] === "activity" && path[1] === "slug";
}

type Params = { params: Promise<{ path: string[] }> };

// The site's enquiry forms are the only legitimate senders; cap what the open
// endpoint will relay so it can't be used to push bulk mail.
const MAX_BODY_BYTES = 32_000;
const EMAIL_FIELDS = ["subject", "text", "html", "replyTo"] as const;

function emailPayload(raw: string): string | null {
  if (raw.length > MAX_BODY_BYTES) return null;
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof body.subject !== "string" || !body.subject.trim() || typeof body.text !== "string" || !body.text.trim()) return null;
  if (body.replyTo != null && (typeof body.replyTo !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.replyTo))) delete body.replyTo;
  // Only known fields go through: the recipient is always the tenant's own.
  return JSON.stringify(Object.fromEntries(EMAIL_FIELDS.filter((k) => body[k] != null).map((k) => [k, body[k]])));
}

function relay(res: Response, cacheControl?: string) {
  const headers = new Headers({
    "content-type": res.headers.get("content-type") ?? "application/json",
  });
  if (cacheControl && res.ok) headers.set("cache-control", cacheControl);
  return new Response(res.body, { status: res.status, headers });
}

export async function GET(req: NextRequest, { params }: Params) {
  const { path } = await params;
  if (!allowedGet(path)) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }
  const res = await apiFetch(`/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`, {
    next: { revalidate: 60 },
  });
  return relay(res, "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
}

export async function POST(req: NextRequest, { params }: Params) {
  const { path } = await params;
  const joined = path.join("/");
  if (!ALLOWED_POSTS.has(joined)) {
    return Response.json({ message: "Not allowed" }, { status: 403 });
  }
  let body = await req.text();
  if (body.length > MAX_BODY_BYTES) return Response.json({ message: "Payload too large" }, { status: 413 });
  if (joined === "email/send") {
    const clean = emailPayload(body);
    if (!clean) return Response.json({ message: "Invalid email payload" }, { status: 400 });
    body = clean;
  }
  const res = await apiFetch(`/${joined}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return relay(res);
}
