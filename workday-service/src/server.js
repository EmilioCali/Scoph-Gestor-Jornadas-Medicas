import 'dotenv/config';
import connectDb from './config/database.js'
import app from './app.js';

const port = parseInt(process.env.PORT || '3002', 10);
const entorno = process.env.NODE_ENV || 'development';

const start = async () => {
    try {
        await connectDb();

        await app.listen({
            port,
            host: '0.0.0.0'
        });

        console.log('');
        console.log('  ╔══════════════════════════════════════════╗');
        console.log('  ║         SCOPH — Sistema de Salud         ║');
        console.log('  ╚══════════════════════════════════════════╝');
        console.log(`  Servicio   : WorkdayService`);
        console.log(`  Puerto     : ${port}`);
        console.log(`  Entorno    : ${entorno}`);
        console.log(`  Base datos : MongoDB conectada`);
        console.log(`  Docs       : http://localhost:${port}/api/docs`);
        console.log('  ──────────────────────────────────────────');
        console.log('');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();