import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { User } from '../models/user.model.js'

const SALT_ROUNDS = 12

/**
 * Crea el primer usuario SUPER_ADMIN si no existe ninguno en la base de datos.
 * Configurable via variables de entorno:
 *   ADMIN_NOMBRE    (default: Administrador)
 *   ADMIN_APELLIDO  (default: SCOPH)
 *   ADMIN_USERNAME  (default: admin)
 *   ADMIN_CORREO    (requerido si no existe admin)
 *   ADMIN_PASSWORD  (default: se genera uno aleatorio)
 *
 * Se ejecuta una sola vez al inicio. Si ya existe un SUPER_ADMIN, no hace nada.
 */
export async function seedAdmin() {
  const existingAdmin = await User.findOne({ rol: 'SUPER_ADMIN' })

  if (existingAdmin) {
    return
  }

  const correo = process.env.ADMIN_CORREO
  if (!correo) {
    console.warn('')
    console.warn('  ⚠️  No existe ningún SUPER_ADMIN y ADMIN_CORREO no está definido en el .env')
    console.warn('     Agrega ADMIN_CORREO al .env y reinicia el servicio para crear el admin inicial.')
    console.warn('')
    return
  }

  const nombre    = process.env.ADMIN_NOMBRE   || 'Administrador'
  const apellido  = process.env.ADMIN_APELLIDO || 'SCOPH'
  const username  = process.env.ADMIN_USERNAME  || 'admin'
  const password  = process.env.ADMIN_PASSWORD  || randomBytes(8).toString('hex')

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const admin = new User({
    nombre,
    apellido,
    username: username.toLowerCase(),
    correo: correo.toLowerCase(),
    passwordHash,
    rol: 'SUPER_ADMIN',
    mustChangePassword: true,
    emailVerificado: true,
    isActive: true
  })

  await admin.save()

  console.log('')
  console.log('  ╔══════════════════════════════════════════════════╗')
  console.log('  ║        👤  Usuario SUPER_ADMIN creado            ║')
  console.log('  ╠══════════════════════════════════════════════════╣')
  console.log(`  ║  Username  : ${username.padEnd(34)}║`)
  console.log(`  ║  Correo    : ${correo.padEnd(34)}║`)
  console.log(`  ║  Password  : ${password.padEnd(34)}║`)
  console.log('  ╠══════════════════════════════════════════════════╣')
  console.log('  ║  ⚠️  Cambia la contraseña al iniciar sesión       ║')
  console.log('  ╚══════════════════════════════════════════════════╝')
  console.log('')
}
