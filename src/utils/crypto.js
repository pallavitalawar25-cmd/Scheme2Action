// DEMO ONLY. Hashing in the browser does NOT make a login secure: anyone with access to this browser's storage
// can read or replace it. Real authentication must hash passwords on the server (argon2/bcrypt).
const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export function randomSalt() {
  const c = globalThis.crypto;
  if (c?.getRandomValues) return toHex(c.getRandomValues(new Uint8Array(12)));
  return Math.random().toString(16).slice(2, 14);
}

export async function hashPassword(password, salt) {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const data = new TextEncoder().encode(`${salt}:${password}`);
    return `sha256:${toHex(await subtle.digest('SHA-256', data))}`;
  }
  // Non-secure contexts (plain http) have no SubtleCrypto: weak fallback, demo only.
  let h = 5381; const s = `${salt}:${password}`;
  for (let i = 0; i < s.length; i += 1) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `weak:${h}`;
}
