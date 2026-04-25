import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "kyma-dev-secret-change-in-production-environment-please";

if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
  console.warn(
    "[auth-server] AUTH_SECRET is not set in production. Set AUTH_SECRET environment variable."
  );
}

const SCRYPT_KEYLEN = 64;
const SESSION_COOKIE_NAME = "kyma_session";
const SESSION_TTL_DAYS = 30;

export const SESSION_COOKIE = SESSION_COOKIE_NAME;
export const SESSION_MAX_AGE = SESSION_TTL_DAYS * 24 * 60 * 60;

/**
 * Hash a plaintext password using Node's built-in scrypt.
 * Format: <salt-hex>:<hash-hex>
 */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plaintext password against a stored hash.
 */
export function verifyPassword(plain: string, stored: string): boolean {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hashHex] = stored.split(":");
  try {
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(plain, salt, SCRYPT_KEYLEN);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

interface SessionPayload {
  uid: string;
  exp: number;
}

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

/**
 * Sign a session token: <base64url(payload)>.<base64url(hmac)>
 */
export function signSession(userId: string): string {
  const payload: SessionPayload = {
    uid: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const payloadStr = base64UrlEncode(JSON.stringify(payload));
  const sig = createHmac("sha256", SECRET).update(payloadStr).digest();
  return `${payloadStr}.${base64UrlEncode(sig)}`;
}

/**
 * Verify a session token; returns userId on success, null on failure.
 */
export function verifySession(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadStr, sigStr] = parts;

  const expectedSig = createHmac("sha256", SECRET).update(payloadStr).digest();
  const givenSig = base64UrlDecode(sigStr);
  if (expectedSig.length !== givenSig.length) return null;
  if (!timingSafeEqual(expectedSig, givenSig)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadStr).toString("utf-8")) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.uid;
  } catch {
    return null;
  }
}
