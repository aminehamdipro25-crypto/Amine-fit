import crypto from 'crypto'

// scrypt params: N=65536 (2^16), r=8, p=1, keyLen=64, salt=32 bytes
// Meets OWASP 2024 recommendations for scrypt password hashing
const SCRYPT_PARAMS = { N: 65536, r: 8, p: 1 }
const KEY_LEN = 64
const SALT_BYTES = 32

export function hashPassword(plain) {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex')
  const hash = crypto.scryptSync(plain, salt, KEY_LEN, SCRYPT_PARAMS).toString('hex')
  return `scrypt2$${salt}$${hash}`
}

export function verifyPassword(plain, stored) {
  if (!stored || !plain) return false

  if (stored.startsWith('scrypt2$')) {
    const parts = stored.split('$')
    if (parts.length !== 3) return false
    const [, salt, hash] = parts
    try {
      const testHash = crypto.scryptSync(plain, salt, KEY_LEN, SCRYPT_PARAMS).toString('hex')
      const a = Buffer.from(testHash, 'hex')
      const b = Buffer.from(hash, 'hex')
      if (a.length !== b.length) return false
      return crypto.timingSafeEqual(a, b)
    } catch { return false }
  }

  // Legacy scrypt (old format scrypt$salt$hash with 32-byte key) — still verifies, rehash on next login
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
