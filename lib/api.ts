const base =
  process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Server-side only. TripEleven read-only API key: sent as x-api-key, which the
// backend SHA-256 hashes and matches against Tenant.apiKeyHash. The key never
// reaches the browser — anything prefixed NEXT_PUBLIC_ would inline it into the
// client bundle. No x-tenant-slug/x-tenant-host: the key identifies the tenant.
const apiKey = process.env.API_KEY;

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (apiKey) headers.set("x-api-key", apiKey);
  return fetch(`${base}${path}`, { ...init, headers });
}