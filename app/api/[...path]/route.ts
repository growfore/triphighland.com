import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

// Same-origin proxy so client components can reach the TripEleven API without
// the key ever reaching the browser. apiFetch attaches x-api-key server-side.

// Only public write endpoints are forwarded; everything else is read-only.
const ALLOWED_POSTS = new Set(["email/send", "newsletter/subscribe"]);

type Params = { params: Promise<{ path: string[] }> };

function relay(res: Response) {
  return new Response(res.body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(req: NextRequest, { params }: Params) {
  const { path } = await params;
  const res = await apiFetch(`/${path.join("/")}${req.nextUrl.search}`, {
    cache: "no-store",
  });
  return relay(res);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { path } = await params;
  const joined = path.join("/");
  if (!ALLOWED_POSTS.has(joined)) {
    return Response.json({ message: "Not allowed" }, { status: 403 });
  }
  const res = await apiFetch(`/${joined}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  return relay(res);
}
