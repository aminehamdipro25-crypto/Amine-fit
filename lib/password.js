import crypto from 'crypto'

// scrypt3 (current): N=16384 (2^14), r=8, p=1, keyLen=64, salt=32 bytes
// Reduced from N=65536 to fix "digital envelope routines::memory limit exceeded" on Vercel serverless.
// N=16384 uses ~16 MB vs 64 MB — still OWASP-compliant (minimum recommended N=2^14).
const SCRYPT3    = { N: 16384, r: 8, p: 1 }
const SCRYPT2    = { N: 65536, r: 8, p: 1 }   // kept only for verifying old hashes
const KEY_LEN    = 64
const SALT_BYTES = 32

export function hashPassword(plain) {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex')
  const hash = crypto.scryptSync(plain, salt, KEY_LEN, SCRYPT3).toString('hex')
  return `scrypt3$${salt}$${hash}`
}

export function verifyPassword(plain, stored) {
  if (!stored || !plain) return false

  // Current format (N=16384)
  if (stored.startsWith('scrypt3$')) {
    const parts = stored.split('$')
    if (parts.length !== 3) return false
    const [, salt, hash] = parts
    try {
      const testHash = crypto.scryptSync(plain, salt, KEY_LEN, SCRYPT3).toString('hex')
      const a = Buffer.from(testHash, 'hex')
      const b = Buffer.from(hash, 'hex')
      if (a.length !== b.length) return false
      return crypto.timingSafeEqual(a, b)
    } catch { return false }
  }

  // Previous format (N=65536) — backward compat for any existing hashes
  if (stored.startsWith('scrypt2$')) {
    const parts = stored.split('$')
    if (parts.length !== 3) return false
    const [, salt, hash] = parts
    try {
      const testHash = crypto.scryptSync(plain, salt, KEY_LEN, SCRYPT2).toString('hex')
      const a = Buffer.from(testHash, 'hex')
      const b = Buffer.from(hash, 'hex')
      if (a.length !== b.length) return false
      return crypto.timingSafeEqual(a, b)
    } catch { return false }
  }

  // Legacy format (scrypt$salt$hash, 32-byte key)
  if (stored.startsWith('scrypt$')) {
    const parts = stored.split('$')
    if (parts.length !== 3) return false
    const [, salt, hash] = parts
    try {
      const testHash = crypto.scryptSync(plain, salt, 32).toString('hex')
      const a = Buffer.from(testHash, 'hex')
      const b = Buffer.from(hash, 'hex')
      if (a.length !== b.length) return false
      return crypto.timingSafeEqual(a, b)
    } catch { return false }
  }

  return false
}
