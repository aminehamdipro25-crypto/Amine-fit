import crypto from 'crypto'

export function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(plain, salt, 32).toString('hex')
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(plain, stored) {
  if (!stored || !plain) return false
  if (stored.startsWith('scrypt$')) {
    const parts = stored.split('$')
    if (parts.length !== 3) return false
    const [, salt, hash] = parts
    try {
      const testHash = crypto.scryptSync(plain, salt, 32).toString('hex')
      // Both are 32-byte hex strings — same length, safe for timingSafeEqual
      return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'))
    } catch { return false }
  }
  // Legacy plaintext — migrate on next password set
  if (plain.length !== stored.length) return false
  return crypto.timingSafeEqual(Buffer.from(plain), Buffer.from(stored))
}
