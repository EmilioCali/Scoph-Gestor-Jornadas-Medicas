import { buildApp } from './app.js'
import { seedAdmin } from './scripts/seedAdmin.js'

const port = parseInt(process.env.PORT || '8080', 10)
const entorno = process.env.NODE_ENV || 'development'

const app = await buildApp()

// Crea el primer ADMIN si no existe ninguno en la BD
await seedAdmin()

try {
  await app.listen({ port, host: '0.0.0.0' })

  console.log('')
  console.log('  ╔══════════════════════════════════════════╗')
  console.log('  ║         SCOPH — Sistema de Salud         ║')
  console.log('  ╚══════════════════════════════════════════╝')
  console.log(`  Servicio   : AuthService`)
  console.log(`  Puerto     : ${port}`)
  console.log(`  Entorno    : ${entorno}`)
  console.log(`  Base datos : MongoDB conectada`)
  console.log(`  Docs       : http://localhost:${port}/api/docs`)
  console.log('  ──────────────────────────────────────────')
  console.log('')
} catch (err) {
  app.log.error({ err }, 'Error al iniciar el servidor')
  process.exit(1)
}
