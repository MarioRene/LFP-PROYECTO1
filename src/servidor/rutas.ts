import { Router } from 'express';
import AnalizadorLexico from '../analizador/lexico';
import AnalizadorSintactico from '../analizador/sintactico';
import { Carrera } from '../modelos/carrera';
import { generarHTMLPensum, generarHTMLErrores, generarHTMLErroresSintacticos } from '../util/helpers';

const router = Router();

// Ruta para analizar el contenido (POST /analizar)
router.post('/analizar', (req, res) => {
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

// Ruta para la página principal (GET /)
router.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../../public') });
});

export default router;