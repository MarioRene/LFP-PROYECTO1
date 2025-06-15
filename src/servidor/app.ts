import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

// Middleware para parsear JSON y form data (DEBE ir antes de las rutas)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../../public')));

// Importar y usar rutas después de configurar middlewares
import rutas from './rutas';
app.use('/', rutas);

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Error en el servidor:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 Sistema de múltiples carreras activo`);
});
