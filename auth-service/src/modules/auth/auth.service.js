import bcrypt from 'bcryptjs'
import { User } from '../../models/user.model.js'
import { generateCode, generateTempPassword, getExpiresAt, isExpired } from '../../lib/tokens.js'
import { sendCredentialsMail, sendVerificationCodeMail, sendPasswordResetMail } from '../../lib/mailer.js'

const SALT_ROUNDS = 12

/**
 * Autentica un usuario por username o correo.
 * @param {{ username?: string, correo?: string, password: string }} credentials
 * @returns {Promise<import('mongoose').Document>} Usuario autenticado
 */
export async function login({ username, correo, password }) {
  if (!username && !correo) {
    throw new Error('Debes proporcionar un username o correo')
  }

  const query = username ? { username: username.toLowerCase() } : { correo: correo.toLowerCase() }
  const user = await User.findOne(query)

  if (!user) {
    throw new Error('Credenciales inválidas')
  }

  if (!user.isActive) {
    throw new Error('Tu cuenta está desactivada. Contacta al administrador.')
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash)

  if (!isValidPassword) {
    throw new Error('Credenciales inválidas')
  }

  await User.findByIdAndUpdate(user._id, { ultimoAcceso: new Date() })

  return user
}

/**
 * Registra un nuevo usuario (solo puede hacerlo un ADMIN).
 * Genera una contraseña temporal y la envía por correo automáticamente.
 * @param {Object} data - Datos del usuario a crear
 * @returns {Promise<import('mongoose').Document>} Usuario creado
 */
export async function register({ nombre, apellido, username, correo, rol, telefono, creadoPor }) {
  if (telefono && !/^\d{8}$/.test(telefono)) {
    throw new Error('El teléfono debe tener exactamente 8 dígitos')
  }

  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { correo: correo.toLowerCase() }]
  })

  if (existingUser) {
    if (existingUser.username === username.toLowerCase()) {
      throw new Error('El username ya está en uso')
    }
    throw new Error('El correo ya está en uso')
  }

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS)
  const activationCode = generateCode()
  const activationTokenExpires = getExpiresAt()

  const user = new User({
    nombre,
    apellido,
    username,
    correo,
    passwordHash,
    rol,
    telefono: telefono || null,
    creadoPor: creadoPor || null,
    mustChangePassword: true,
    emailVerificado: false,
    isActive: false,
    activationToken: activationCode,
    activationTokenExpires
  })

  await user.save()

  // Enviar credenciales y código de verificación (no bloquean si fallan)
  sendCredentialsMail({ to: correo, nombre, username, password: tempPassword }).catch(() => {})
  sendVerificationCodeMail({ to: correo, nombre, code: activationCode }).catch(() => {})

  return user
}

/**
 * Verifica el correo electrónico usando el código de 6 dígitos enviado al usuario.
 * @param {string} correo
 * @param {string} code
 */
export async function verifyEmail(correo, code) {
  const user = await User.findOne({ correo: correo.toLowerCase() })

  if (!user) {
    throw new Error('Correo no encontrado')
  }

  if (user.emailVerificado) {
    throw new Error('El correo ya fue verificado anteriormente')
  }

  if (!user.activationToken || user.activationToken !== code) {
    throw new Error('Código de verificación incorrecto')
  }

  if (isExpired(user.activationTokenExpires)) {
    throw new Error('El código de verificación ha expirado. Solicita uno nuevo.')
  }

  user.emailVerificado = true
  user.isActive = true
  user.activationToken = null
  user.activationTokenExpires = null
  await user.save()

  return user
}

/**
 * Reenvía el código de verificación de correo al usuario.
 * @param {string} correo
 */
export async function resendVerificationCode(correo) {
  const user = await User.findOne({ correo: correo.toLowerCase() })

  if (!user) return // respuesta genérica por seguridad

  if (user.emailVerificado) {
    throw new Error('El correo ya fue verificado')
  }

  const code = generateCode()
  const activationTokenExpires = getExpiresAt()

  user.activationToken = code
  user.activationTokenExpires = activationTokenExpires
  await user.save()

  await sendVerificationCodeMail({ to: correo, nombre: user.nombre, code })
}

/**
 * Cambia la contraseña del usuario autenticado.
 * Usado principalmente en el primer login cuando mustChangePassword = true.
 * @param {string} id
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export async function changePassword(id, currentPassword, newPassword) {
  const user = await User.findById(id)
  if (!user) throw new Error('Usuario no encontrado')

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) throw new Error('La contraseña actual es incorrecta')

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
  user.passwordHash = passwordHash
  user.mustChangePassword = false
  user.isActive = true
  await user.save()

  return user
}

/**
 * Genera y envía un código de restablecimiento de contraseña.
 * Respuesta siempre genérica para no revelar si el correo existe.
 * @param {string} correo
 */
export async function requestPasswordReset(correo) {
  const user = await User.findOne({ correo: correo.toLowerCase() })

  if (!user || !user.isActive) {
    return
  }

  const code = generateCode()
  const resetPasswordExpires = getExpiresAt()

  user.resetPassword = code
  user.resetPasswordExpires = resetPasswordExpires
  await user.save()

  await sendPasswordResetMail({ to: correo, nombre: user.nombre, code })
}

/**
 * Restablece la contraseña usando el código recibido por correo.
 * @param {string} correo
 * @param {string} code
 * @param {string} newPassword
 */
export async function resetPassword(correo, code, newPassword) {
  const user = await User.findOne({ correo: correo.toLowerCase() })

  if (!user) {
    throw new Error('Correo no encontrado')
  }

  if (!user.resetPassword || user.resetPassword !== code) {
    throw new Error('Código de restablecimiento incorrecto')
  }

  if (isExpired(user.resetPasswordExpires)) {
    throw new Error('El código de restablecimiento ha expirado. Solicita uno nuevo.')
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
  user.passwordHash = passwordHash
  user.mustChangePassword = false
  user.resetPassword = null
  user.resetPasswordExpires = null
  await user.save()

  return user
}

/**
 * Obtiene un usuario por su ID.
 * @param {string} id
 */
export async function getUserById(id) {
  const user = await User.findById(id)
  if (!user) throw new Error('Usuario no encontrado')
  return user
}

/**
 * Lista todos los usuarios (sin passwordHash).
 */
export async function listUsers() {
  return User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 })
}

/**
 * Actualiza datos administrativos de un usuario.
 * @param {string} id
 * @param {Object} data
 */
export async function updateUser(id, data) {
  const allowedFields = ['nombre', 'apellido', 'username', 'correo', 'rol', 'telefono', 'isActive']
  const update = {}

  for (const field of allowedFields) {
    if (data[field] !== undefined) update[field] = data[field]
  }

  if (update.telefono && !/^\d{8}$/.test(update.telefono)) {
    throw new Error('El teléfono debe tener exactamente 8 dígitos')
  }

  if (update.username) update.username = update.username.toLowerCase()
  if (update.correo) update.correo = update.correo.toLowerCase()

  if (update.username || update.correo) {
    const existingUser = await User.findOne({
      _id: { $ne: id },
      $or: [
        ...(update.username ? [{ username: update.username }] : []),
        ...(update.correo ? [{ correo: update.correo }] : [])
      ]
    })

    if (existingUser) {
      if (existingUser.username === update.username) {
        throw new Error('El username ya está en uso')
      }
      throw new Error('El correo ya está en uso')
    }
  }

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true
  })

  if (!user) throw new Error('Usuario no encontrado')
  return user
}

/**
 * Elimina un usuario.
 * @param {string} id
 */
export async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id)
  if (!user) throw new Error('Usuario no encontrado')
  return user
}

/**
 * Activa o desactiva un usuario.
 * @param {string} id
 * @param {boolean} isActive
 */
export async function toggleUserStatus(id, isActive) {
  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true })
  if (!user) throw new Error('Usuario no encontrado')
  return user
}
