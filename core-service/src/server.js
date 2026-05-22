import 'dotenv/config';
import connectDb from './config/database.js'
import app from './app.js';

const start = async () => {
    try {
        await connectDb();

        await app.listen({
            port: process.env.PORT,
            host: '0.0.0.0'
        });

        console.log(`Servicio principal corriendo en el puerto ${process.env.PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
