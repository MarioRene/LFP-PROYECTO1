import { Router } from 'express';
import path from 'path';
import AnalizadorLexico from '../analizador/lexico';
import AnalizadorSintactico from '../analizador/sintactico';
import { generarHTMLUniversidad, generarHTMLPensumIndividual, generarHTMLErrores, generarHTMLErroresSintacticos } from '../util/helpers';

const router = Router();

// Ruta para la página principal (GET /)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Ruta para analizar el contenido (POST /analizar)
router.post('/analizar', (req, res) => {
    const { contenido } = req.body;
    
    if (!contenido || contenido.trim() === '') {
        res.status(400).json({ error: 'El contenido está vacío' });
        return;
    }
    
    console.log('📝 Iniciando análisis de contenido...');
    
    // Análisis léxico
    const analizadorLexico = new AnalizadorLexico();
    const { tokens, errores: erroresLexicos } = analizadorLexico.analizar(contenido);
    
    console.log(`🔍 Análisis léxico completado: ${tokens.length} tokens, ${erroresLexicos.length} errores`);
    
    if (erroresLexicos.length > 0) {
        console.log('❌ Errores léxicos encontrados:', erroresLexicos);
        const htmlErrores = generarHTMLErrores(erroresLexicos);
        res.json({ 
            tipo: 'errores',
            contenido: htmlErrores,
            tokens,
            errores: {
                lexicos: erroresLexicos,
                sintacticos: []
            }
        });
        return;
    }
    
    // Análisis sintáctico
    const analizadorSintactico = new AnalizadorSintactico();
    const { universidad, errores: erroresSintacticos } = analizadorSintactico.analizar(tokens);
    
    console.log(`🔧 Análisis sintáctico completado: ${erroresSintacticos.length} errores`);
    
    if (erroresSintacticos.length > 0) {
        console.log('❌ Errores sintácticos encontrados:', erroresSintacticos);
        const htmlErrores = generarHTMLErroresSintacticos(erroresSintacticos);
        res.json({ 
            tipo: 'errores',
            contenido: htmlErrores,
            tokens,
            errores: {
                lexicos: [],
                sintacticos: erroresSintacticos
            }
        });
        return;
    }
    
    // Generar universidad con múltiples carreras
    if (universidad) {
        console.log(`✅ Universidad generada con ${universidad.carreras.length} carreras`);
        
        // Validar códigos únicos entre carreras
        const validacion = universidad.validarCodigosUnicos();
        if (!validacion.valido) {
            console.log('⚠️ Advertencia: Códigos duplicados entre carreras:', validacion.duplicados);
        }
        
        const { html: htmlUniversidad, carreras: carrerasInfo } = generarHTMLUniversidad(universidad, contenido);
        
        res.json({ 
            tipo: 'universidad',
            contenido: htmlUniversidad,
            tokens,
            universidad: {
                carreras: carrerasInfo,
                estadisticas: universidad.obtenerEstadisticas(),
                validacion
            }
        });
    } else {
        console.log('❌ Error al generar la universidad');
        res.status(500).json({ error: 'Error al generar la universidad' });
    }
});

// Nueva ruta para generar pensum individual de una carrera
router.post('/generar-pensum/:indice', (req, res) => {
    const { indice } = req.params;
    const { contenido } = req.body;
    
    console.log(`📚 [${new Date().toISOString()}] Generando pensum individual para carrera índice: ${indice}`);
    
    if (!contenido || contenido.trim() === '') {
        console.log('❌ Error: Contenido vacío');
        res.status(400).json({ error: 'El contenido está vacío' });
        return;
    }
    
    try {
        // Re-analizar el contenido para obtener la universidad
        const analizadorLexico = new AnalizadorLexico();
        const { tokens, errores: erroresLexicos } = analizadorLexico.analizar(contenido);
        
        if (erroresLexicos.length > 0) {
            console.log('❌ Errores léxicos encontrados:', erroresLexicos.length);
            res.status(400).json({ error: 'Errores léxicos en el contenido', errores: erroresLexicos });
            return;
        }
        
        const analizadorSintactico = new AnalizadorSintactico();
        const { universidad, errores: erroresSintacticos } = analizadorSintactico.analizar(tokens);
        
        if (erroresSintacticos.length > 0 || !universidad) {
            console.log('❌ Errores sintácticos encontrados:', erroresSintacticos.length);
            res.status(400).json({ error: 'Errores sintácticos en el contenido', errores: erroresSintacticos });
            return;
        }
        
        const indiceCarrera = parseInt(indice);
        if (isNaN(indiceCarrera) || indiceCarrera < 0) {
            console.log('❌ Índice de carrera inválido:', indice);
            res.status(400).json({ error: 'Índice de carrera inválido' });
            return;
        }
        
        const carrera = universidad.obtenerCarreraPorIndice(indiceCarrera);
        
        if (!carrera) {
            console.log('❌ Carrera no encontrada en índice:', indiceCarrera, 'Total carreras:', universidad.carreras.length);
            res.status(404).json({ 
                error: `Carrera no encontrada en índice ${indiceCarrera}. Total de carreras: ${universidad.carreras.length}` 
            });
            return;
        }
        
        console.log(`✅ Carrera encontrada: "${carrera.nombre}" (${carrera.semestres.length} semestres, ${carrera.obtenerTodosLosCursos().length} cursos)`);
        
        const htmlPensum = generarHTMLPensumIndividual(carrera);
        
        res.json({
            tipo: 'pensum',
            contenido: htmlPensum,
            carrera: {
                nombre: carrera.nombre,
                semestres: carrera.semestres.length,
                cursos: carrera.obtenerTodosLosCursos().length
            }
        });
        
        console.log(`📄 Pensum generado exitosamente para: ${carrera.nombre}`);
        
    } catch (error) {
        console.error('❌ Error al generar pensum individual:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            detalle: error instanceof Error ? error.message : String(error)
        });
    }
});

// Ruta para obtener estadísticas de la universidad
router.post('/estadisticas', (req, res) => {
    const { contenido } = req.body;
    
    if (!contenido || contenido.trim() === '') {
        res.status(400).json({ error: 'El contenido está vacío' });
        return;
    }
    
    try {
        // Analizar el contenido
        const analizadorLexico = new AnalizadorLexico();
        const { tokens, errores: erroresLexicos } = analizadorLexico.analizar(contenido);
        
        if (erroresLexicos.length > 0) {
            res.json({ 
                error: 'Errores léxicos encontrados',
                errores: erroresLexicos 
            });
            return;
        }
        
        const analizadorSintactico = new AnalizadorSintactico();
        const { universidad, errores: erroresSintacticos } = analizadorSintactico.analizar(tokens);
        
        if (erroresSintacticos.length > 0 || !universidad) {
            res.json({ 
                error: 'Errores sintácticos encontrados',
                errores: erroresSintacticos 
            });
            return;
        }
        
        const estadisticas = universidad.obtenerEstadisticas();
        const validacion = universidad.validarCodigosUnicos();
        
        res.json({
            estadisticas,
            validacion,
            carreras: universidad.carreras.map(carrera => ({
                nombre: carrera.nombre,
                semestres: carrera.semestres.length,
                cursos: carrera.obtenerTodosLosCursos().length,
                areas: new Set(carrera.obtenerTodosLosCursos().map(c => c.area)).size
            }))
        });
        
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;