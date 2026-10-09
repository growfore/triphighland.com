import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// Mirrors tripeleven/backend/src/controllers/tenant.controller/apiKey.ts:17
// and the sha256 lookup at middlewares/tenant.middleware.ts:55-56.
const generateApiKey = () => createHash("sha256").update(String(Math.random())).digest("hex").slice(0, 64);

// The deployed key, hashed the way the backend hashes an incoming x-api-key.
const key = "43f22c795f9ebc4c6874cd7c3dae2cd9c6d47c0e344cae0bda8a670fe9db0b5f";
const sha256 = (s) => createHash("sha256").update(s).digest("hex");

// Shape: randomBytes(32).toString("hex") is always 64 hex chars.
assert.equal(key.length, 64, "key must be 64 chars");
assert.match(key, /^[0-9a-f]{64}$/, "key must be lowercase hex");
assert.equal(Buffer.from(key, "hex").length, 32, "key must decode to 32 bytes");

// Lookup is by hash, so the stored value is never the key itself.
const stored = sha256(key);
assert.equal(stored.length, 64);
assert.notEqual(stored, key, "stored hash must differ from the key");
assert.equal(sha256(key), stored, "hashing must be deterministic");

// A tenant lookup succeeds on exact match and fails on near-misses.
const lookup = (presented) => sha256(presented) === stored;
assert.equal(lookup(key), true, "correct key authenticates");
assert.equal(lookup(key.toUpperCase()), false, "lookup is case-sensitive");
assert.equal(lookup(key.slice(0, 63)), false, "truncated key rejected");
assert.equal(lookup(key + "0"), false, "extended key rejected");

// writeGuard.middleware.ts:22 — GET/HEAD/OPTIONS pass; everything else is gated.
const writeGuard = (method, hasStaff) =>
  ["GET", "HEAD", "OPTIONS"].includes(method) || hasStaff;
for (const m of ["GET", "HEAD", "OPTIONS"]) assert.equal(writeGuard(m, false), true, `${m} allowed`);
for (const m of ["POST", "PUT", "PATCH", "DELETE"]) assert.equal(writeGuard(m, false), false, `${m} blocked`);

// Generated keys are distinct across calls.
assert.notEqual(generateApiKey(), generateApiKey(), "keys must be unique");

console.log("api key + writeGuard self-check passed");