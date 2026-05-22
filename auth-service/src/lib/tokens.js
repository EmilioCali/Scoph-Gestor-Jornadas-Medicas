import { randomInt } from 'crypto'

/**
 * Duración en minutos de los tokens de verificación.
 * Configurable vía VERIFICATION_TOKEN_EXPIRES_MINUTES (default: 10).
 */
const EXPIRES_MINUTES = parseInt(process.env.VERIFICATION_TOKEN_EXPIRES_MINUTES || '10', 10)

/**
 * Genera una contraseña temporal legible de 12 caracteres.
 * Evita caracteres ambiguos (0/O, 1/l/I).
 * @returns {string}
 */
export function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () => chars[randomInt(0, chars.length)]).join('')
}

/**
 * Genera un código numérico de 6 dígitos.
 * @returns {string} Código de 6 dígitos
 */
export function generateCode() {
  return String(randomInt(100000, 999999))
}

/**
 * Calcula la fecha de expiración a partir de ahora.
 * @returns {Date}
 */
export function getExpiresAt() {
  const expires = new Date()
  expires.setMinutes(expires.getMinutes() + EXPIRES_MINUTES)
  return expires
}

/**
 * Verifica si una fecha de expiración ya pasó.
 * @param {Date|null} expiresAt
 * @returns {boolean}
 */
export function isExpired(expiresAt) {
  if (!expiresAt) return true
  return new Date() > new Date(expiresAt)
}

export { EXPIRES_MINUTES }
