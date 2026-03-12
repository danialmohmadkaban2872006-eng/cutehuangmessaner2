// Credential generation utilities for Cute Huang Messenger

/**
 * Generates a unique 10-digit numeric internal user ID.
 * Format: CHM + 7 random digits (e.g. CHM1234567)
 * Stored as string, displayed to user as their login identifier.
 */
export function generateInternalId(): string {
  const digits = Math.floor(1000000 + Math.random() * 9000000).toString()
  return `CHM${digits}`
}

/**
 * Generates a secure random password using a mix of
 * uppercase, lowercase, digits, and safe symbols.
 * 12 characters long — memorable but strong.
 */
export function generatePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '@#$!'

  const all = upper + lower + digits + symbols
  let password = ''

  // Guarantee at least one of each character class
  password += upper[Math.floor(Math.random() * upper.length)]
  password += lower[Math.floor(Math.random() * lower.length)]
  password += digits[Math.floor(Math.random() * digits.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill remaining 8 characters
  for (let i = 0; i < 8; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  // Shuffle
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('')
}

/**
 * Converts an internal ID to a synthetic email for Supabase Auth.
 * Users never see this email — it's an internal implementation detail.
 */
export function internalIdToEmail(internalId: string): string {
  return `${internalId.toLowerCase()}@cutehuang.internal`
}

/**
 * Validates internal ID format.
 */
export function isValidInternalId(id: string): boolean {
  return /^CHM\d{7}$/.test(id)
}
