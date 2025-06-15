// src/servidor/app.ts

import express from 'express';
import path from 'path';
import rutas from './rutas';
import AnalizadorLexico from '../analizador/lexico';
import AnalizadorSintactico from '../analizador/sintactico';
import { Carrera } from '../modelos/carrera';
import { generarHTMLPensum, generarHTMLErrores, generarHTMLErroresSintacticos } from '../util/helpers';

const app = express();
const PORT = 3000;

// Middleware para parsear JSON y form data
app.use('/', rutas);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../../public')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Ruta para analizar el contenido
app.post('/analizar', (req, res) => {
    const { contenido } = req.body;
    
    // Análisis léxico
    const analizadorLexico = new AnalizadorLexico();
    const { tokens, errores: erroresLexicos } = analizadorLexico.analizar(contenido);
    
    if (erroresLexicos.length > 0) {
        const htmlErrores = generarHTMLErrores(erroresLexicos);
        res.json({ 
            tipo: 'errores',
            contenido: htmlErrores,
            tokens 
        });
        return;
    }
    
    // Análisis sintáctico
    const analizadorSintactico = new AnalizadorSintactico();
    const { carrera, errores: erroresSintacticos } = analizadorSintactico.analizar(tokens);
    
    if (erroresSintacticos.length > 0) {
        const htmlErrores = generarHTMLErroresSintacticos(erroresSintacticos);
        res.json({ 
            tipo: 'errores',
            contenido: htmlErrores,
            tokens 
        });
        return;
    }
    
    // Generar pensum interactivo
    if (carrera) {
        const htmlPensum = generarHTMLPensum(carrera);
        res.json({ 
            tipo: 'pensum',
            contenido: htmlPensum,
            tokens 
        });
    } else {
        res.status(500).json({ error: 'Error al generar el pensum' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
