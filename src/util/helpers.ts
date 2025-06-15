import { Universidad } from '../modelos/universidad';
import { Carrera } from '../modelos/carrera';
import { Curso } from '../modelos/curso';

export function generarHTMLUniversidad(universidad: Universidad, contenidoOriginal: string): { html: string, carreras: any[] } {
    const stats = universidad.obtenerEstadisticas();
    const validacionCodigos = universidad.validarCodigosUnicos();
    
    // Generar información de cada carrera para el frontend
    const carrerasInfo = universidad.carreras.map((carrera, index) => ({
        indice: index,
        nombre: carrera.nombre,
        semestres: carrera.semestres.length,
        cursos: carrera.obtenerTodosLosCursos().length,
        areas: new Set(carrera.obtenerTodosLosCursos().map(c => c.area)).size
    }));

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Universidad - Múltiples Carreras</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                }
                
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                
                .header {
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .header h1 {
                    margin: 0 0 15px 0;
                    font-size: 2.8em;
                    font-weight: 300;
                }
                
                .header p {
                    margin: 0;
                    font-size: 1.2em;
                    opacity: 0.9;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    padding: 30px;
                    background: #f8f9fa;
                }
                
                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    border-left: 4px solid #3498db;
                }
                
                .stat-number {
                    font-size: 2.5em;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }
                
                .stat-label {
                    color: #6c757d;
                    font-size: 0.9em;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .content {
                    padding: 30px;
                }
                
                .carreras-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 25px;
                    margin-bottom: 30px;
                }
                
                .carrera-card {
                    background: white;
                    border-radius: 15px;
                    padding: 25px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    border-left: 5px solid #3498db;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }
                
                .carrera-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #3498db, #9b59b6, #e74c3c);
                }
                
                .carrera-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
                }
                
                .carrera-card h3 {
                    margin: 0 0 15px 0;
                    color: #2c3e50;
                    font-size: 1.3em;
                    line-height: 1.3;
                }
                
                .carrera-stats {
                    display: flex;
                    justify-content: space-between;
                    margin: 15px 0;
                }
                
                .carrera-stat {
                    text-align: center;
                }
                
                .carrera-stat-number {
                    font-size: 1.5em;
                    font-weight: bold;
                    color: #3498db;
                }
                
                .carrera-stat-label {
                    font-size: 0.8em;
                    color: #6c757d;
                }
                
                .btn-generar {
                    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1em;
                    transition: all 0.3s ease;
                    width: 100%;
                    margin-top: 15px;
                }
                
                .btn-generar:hover {
                    background: linear-gradient(135deg, #2980b9 0%, #3498db 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
                }
                
                .actions {
                    text-align: center;
                    padding: 30px;
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                }
                
                .btn-action {
                    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1.1em;
                    margin: 0 10px;
                    transition: all 0.3s ease;
                }
                
                .btn-action:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(39, 174, 96, 0.4);
                }
                
                .btn-secondary {
                    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
                }
                
                .btn-secondary:hover {
                    box-shadow: 0 6px 15px rgba(149, 165, 166, 0.4);
                }
                
                .warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 20px;
                    color: #856404;
                }
                
                .warning h4 {
                    margin: 0 0 10px 0;
                    color: #e17055;
                }
                
                @media (max-width: 768px) {
                    body { padding: 10px; }
                    .header { padding: 20px; }
                    .header h1 { font-size: 2.2em; }
                    .content { padding: 20px; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .carreras-grid { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 Sistema de Pensums Universitarios</h1>
                    <p>Gestión completa de múltiples carreras académicas</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalCarreras}</div>
                        <div class="stat-label">Carreras</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalCursos}</div>
                        <div class="stat-label">Cursos Totales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.areasUnicas}</div>
                        <div class="stat-label">Áreas Académicas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.cursosPromedioPorCarrera}</div>
                        <div class="stat-label">Promedio Cursos/Carrera</div>
                    </div>
                </div>
                
                <div class="content">
                    ${!validacionCodigos.valido ? `
                    <div class="warning">
                        <h4>⚠️ Advertencia: Códigos de curso duplicados</h4>
                        <p>Los siguientes códigos aparecen en múltiples carreras: ${validacionCodigos.duplicados.join(', ')}</p>
                    </div>
                    ` : ''}
                    
                    <h2 style="color: #2c3e50; margin-bottom: 25px;">📚 Carreras Disponibles</h2>
                    
                    <div class="carreras-grid">
                        ${carrerasInfo.map(carrera => `
                            <div class="carrera-card">
                                <h3>${escapeHtml(carrera.nombre)}</h3>
                                <div class="carrera-stats">
                                    <div class="carrera-stat">
                                        <div class="carrera-stat-number">${carrera.semestres}</div>
                                        <div class="carrera-stat-label">Semestres</div>
                                    </div>
                                    <div class="carrera-stat">
                                        <div class="carrera-stat-number">${carrera.cursos}</div>
                                        <div class="carrera-stat-label">Cursos</div>
                                    </div>
                                    <div class="carrera-stat">
                                        <div class="carrera-stat-number">${carrera.areas}</div>
                                        <div class="carrera-stat-label">Áreas</div>
                                    </div>
                                </div>
                                <button class="btn-generar" onclick="generarPensumCarrera(${carrera.indice})">
                                    🎯 Generar Pensum Interactivo
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="actions">
                    <button class="btn-action btn-secondary" onclick="window.print()">
                        🖨️ Imprimir Resumen
                    </button>
                    <button class="btn-action btn-secondary" onclick="window.close()">
                        ❌ Cerrar
                    </button>
                </div>
            </div>
            
            <script>
                // Contenido original del archivo para llamadas al servidor
                window.contenidoOriginal = ${JSON.stringify(contenidoOriginal)};
                
                // Datos de la universidad (para referencia)
                const universidadData = ${JSON.stringify(universidad.carreras.map(carrera => {
                    const cursos = carrera.obtenerTodosLosCursos();
                    return {
                        nombre: carrera.nombre,
                        semestres: carrera.semestres.length,
                        cursos: cursos.length,
                        areas: new Set(cursos.map(c => c.area)).size
                    };
                }))};
                
                // Función para generar pensum de una carrera específica
                function generarPensumCarrera(indice) {
                    console.log('Generando pensum para carrera índice:', indice);
                    
                    // Validar índice
                    if (indice < 0 || indice >= universidadData.length) {
                        console.error('Índice de carrera inválido:', indice);
                        alert('Error: Índice de carrera inválido');
                        return;
                    }
                    
                    const carrera = universidadData[indice];
                    console.log('Datos de carrera:', carrera);
                    
                    // Hacer llamada al servidor para generar el pensum
                    fetch('/generar-pensum/' + indice, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            contenido: window.contenidoOriginal 
                        })
                    })
                    .then(response => {
                        console.log('Respuesta HTTP status:', response.status);
                        if (!response.ok) {
                            throw new Error('Error HTTP ' + response.status + ': ' + response.statusText);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Respuesta del servidor:', data);
                        
                        if (data.tipo === 'pensum') {
                            const ventana = window.open('', '_blank');
                            if (!ventana) {
                                throw new Error('No se pudo abrir nueva ventana. Verifique que no esté bloqueando pop-ups.');
                            }
                            ventana.document.write(data.contenido);
                            ventana.document.close();
                            console.log('✅ Pensum generado exitosamente:', data.carrera.nombre);
                        } else {
                            throw new Error(data.error || 'Respuesta inesperada del servidor');
                        }
                    })
                    .catch(error => {
                        console.error('❌ Error al generar pensum:', error);
                        alert('Error al generar el pensum de ' + carrera.nombre + ': ' + error.message);
                    });
                }
                
                // Función para escapar HTML
                function escapeHtml(unsafe) {
                    return unsafe
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                }
            </script>
        </body>
        </html>
    `;

    return { html, carreras: carrerasInfo };
}

export function generarHTMLPensumIndividual(carrera: Carrera): string {
    // Ordenar semestres por número
    carrera.semestres.sort((a, b) => a.numero - b.numero);
    
    // Generar HTML para cada semestre
    const semestresHTML = carrera.semestres.map(semestre => `
        <div class="semestre">
            <h2>Semestre ${semestre.numero}</h2>
            <div class="cursos-container">
                ${semestre.cursos.map(curso => generarHTMLCurso(curso, carrera)).join('')}
            </div>
        </div>
    `).join('');
    
    // Calcular estadísticas
    const totalCursos = carrera.obtenerTodosLosCursos().length;
    const areas = new Set(carrera.obtenerTodosLosCursos().map(c => c.area));
    
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pensum - ${escapeHtml(carrera.nombre)}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                }
                
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                
                .header {
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .header h1 {
                    margin: 0 0 15px 0;
                    font-size: 2.5em;
                    font-weight: 300;
                }
                
                .stats {
                    display: flex;
                    justify-content: center;
                    gap: 40px;
                    margin-top: 20px;
                }
                
                .stat {
                    text-align: center;
                }
                
                .stat-number {
                    font-size: 2em;
                    font-weight: bold;
                    color: #3498db;
                }
                
                .stat-label {
                    font-size: 0.9em;
                    opacity: 0.8;
                }
                
                .content {
                    padding: 30px;
                }
                
                .semestre {
                    background-color: white;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 25px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                    border-left: 5px solid #3498db;
                }
                
                .semestre h2 {
                    color: #2c3e50;
                    margin-top: 0;
                    margin-bottom: 20px;
                    font-size: 1.5em;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .semestre h2::before {
                    content: '📚';
                    font-size: 1.2em;
                }
                
                .cursos-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 15px;
                }
                
                .curso {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-radius: 10px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    position: relative;
                    overflow: hidden;
                }
                
                .curso::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #3498db, #9b59b6);
                }
                
                .curso:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    border-color: #3498db;
                }
                
                .curso h3 {
                    margin: 0 0 10px 0;
                    color: #2c3e50;
                    font-size: 1em;
                    line-height: 1.3;
                }
                
                .curso p {
                    margin: 8px 0;
                    color: #6c757d;
                    font-size: 0.9em;
                    line-height: 1.4;
                }
                
                .curso-codigo {
                    font-weight: bold;
                    color: #3498db;
                }
                
                .curso-seleccionado {
                    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;
                    color: white !important;
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 12px 30px rgba(52, 152, 219, 0.4);
                }
                
                .curso-seleccionado h3, 
                .curso-seleccionado p {
                    color: white !important;
                }
                
                .prerrequisito {
                    background: linear-gradient(135deg, #e67e22 0%, #d35400 100%) !important;
                    color: white !important;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(230, 126, 34, 0.4);
                }
                
                .prerrequisito h3, 
                .prerrequisito p {
                    color: white !important;
                }
                
                .leyenda {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border-left: 4px solid #17a2b8;
                }
                
                .leyenda h3 {
                    margin-top: 0;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .leyenda h3::before {
                    content: 'ℹ️';
                }
                
                .leyenda-items {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                }
                
                .leyenda-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9em;
                }
                
                .leyenda-color {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                }
                
                .color-normal { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #dee2e6; }
                .color-seleccionado { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); }
                .color-prerrequisito { background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); }
                
                .actions {
                    text-align: center;
                    padding: 20px 30px;
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                }
                
                .btn {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1em;
                    margin: 0 10px;
                    transition: all 0.3s ease;
                }
                
                .btn:hover {
                    background: #2980b9;
                    transform: translateY(-2px);
                }
                
                @media (max-width: 768px) {
                    body { padding: 10px; }
                    .header { padding: 20px; }
                    .header h1 { font-size: 2em; }
                    .content { padding: 20px; }
                    .stats { flex-direction: column; gap: 15px; }
                    .cursos-container { grid-template-columns: 1fr; }
                    .leyenda-items { flex-direction: column; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${escapeHtml(carrera.nombre)}</h1>
                    <div class="stats">
                        <div class="stat">
                            <div class="stat-number">${carrera.semestres.length}</div>
                            <div class="stat-label">Semestres</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${totalCursos}</div>
                            <div class="stat-label">Cursos</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${areas.size}</div>
                            <div class="stat-label">Áreas</div>
                        </div>
                    </div>
                </div>
                
                <div class="content">
                    <div class="leyenda">
                        <h3>Cómo usar el pensum interactivo</h3>
                        <p>Haga clic en cualquier curso para resaltar sus prerrequisitos. Los cursos se colorearán según su relación:</p>
                        <div class="leyenda-items">
                            <div class="leyenda-item">
                                <div class="leyenda-color color-normal"></div>
                                <span>Curso normal</span>
                            </div>
                            <div class="leyenda-item">
                                <div class="leyenda-color color-seleccionado"></div>
                                <span>Curso seleccionado</span>
                            </div>
                            <div class="leyenda-item">
                                <div class="leyenda-color color-prerrequisito"></div>
                                <span>Prerrequisito requerido</span>
                            </div>
                        </div>
                    </div>
                    
                    ${semestresHTML}
                </div>
                
                <div class="actions">
                    <button class="btn" onclick="window.print()">🖨️ Imprimir Pensum</button>
                    <button class="btn" onclick="window.close()">❌ Cerrar</button>
                </div>
            </div>
            
            <script>
                // Mapa de cursos por código
                const cursosMap = {};
                ${carrera.obtenerTodosLosCursos().map(curso => `
                    cursosMap[${curso.codigo}] = {
                        codigo: ${curso.codigo},
                        nombre: "${escapeHtml(curso.nombre)}",
                        area: ${curso.area},
                        prerrequisitos: [${curso.prerrequisitos.join(',')}]
                    };
                `).join('')}
                
                // Función para resaltar curso y prerrequisitos
                function seleccionarCurso(codigo) {
                    // Limpiar selecciones anteriores
                    document.querySelectorAll('.curso-seleccionado, .prerrequisito').forEach(function(el) {
                        el.classList.remove('curso-seleccionado', 'prerrequisito');
                    });
                    
                    // Resaltar curso seleccionado
                    const cursoElement = document.querySelector('.curso[data-codigo="' + codigo + '"]');
                    if (cursoElement) {
                        cursoElement.classList.add('curso-seleccionado');
                        
                        // Resaltar prerrequisitos recursivamente
                        resaltarPrerrequisitos(codigo);
                    }
                }
                
                // Función recursiva para resaltar prerrequisitos
                function resaltarPrerrequisitos(codigo) {
                    const curso = cursosMap[codigo];
                    if (curso && curso.prerrequisitos && curso.prerrequisitos.length > 0) {
                        curso.prerrequisitos.forEach(function(prerreqCodigo) {
                            const prerreqElement = document.querySelector('.curso[data-codigo="' + prerreqCodigo + '"]');
                            if (prerreqElement && !prerreqElement.classList.contains('curso-seleccionado')) {
                                prerreqElement.classList.add('prerrequisito');
                                resaltarPrerrequisitos(prerreqCodigo);
                            }
                        });
                    }
                }
            </script>
        </body>
        </html>
    `;
}

function generarHTMLCurso(curso: Curso, carrera: Carrera): string {
    return `
        <div class="curso" data-codigo="${curso.codigo}" onclick="seleccionarCurso(${curso.codigo})">
            <h3><span class="curso-codigo">${curso.codigo}</span> - ${escapeHtml(curso.nombre)}</h3>
            <p><strong>Área:</strong> ${curso.area}</p>
            <p><strong>Prerrequisitos:</strong> ${curso.prerrequisitos.length > 0 ? 
                curso.prerrequisitos.map(cod => {
                    const c = carrera.obtenerCursoPorCodigo(cod);
                    return c ? `${cod}` : `${cod}`;
                }).join(', ') : 'Ninguno'}
            </p>
        </div>
    `;
}

export function generarHTMLErrores(errores: any[]): string {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Errores Léxicos - USAC</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    min-height: 100vh;
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                
                .header {
                    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .header h1 {
                    margin: 0;
                    font-size: 2.5em;
                    font-weight: 300;
                }
                
                .content {
                    padding: 30px;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                
                th {
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                    color: white;
                    padding: 15px 12px;
                    text-align: left;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: 0.85em;
                }
                
                td {
                    padding: 12px;
                    border-bottom: 1px solid #e9ecef;
                }
                
                tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                
                tr:hover {
                    background-color: #e3f2fd;
                }
                
                .actions {
                    padding: 20px 30px;
                    background: #f8f9fa;
                    text-align: center;
                    border-top: 1px solid #e9ecef;
                }
                
                .btn {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1em;
                    margin: 0 10px;
                    transition: background-color 0.3s;
                }
                
                .btn:hover {
                    background: #2980b9;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚨 Errores Léxicos</h1>
                    <p>Se encontraron ${errores.length} errores durante el análisis léxico</p>
                </div>
                
                <div class="content">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Fila</th>
                                <th>Columna</th>
                                <th>Carácter</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${errores.map((error, index) => `
                                <tr>
                                    <td><strong>${index + 1}</strong></td>
                                    <td>${error.fila}</td>
                                    <td>${error.columna}</td>
                                    <td><code style="background: #f1f3f4; padding: 2px 6px; border-radius: 3px;">${escapeHtml(error.caracter || ' ')}</code></td>
                                    <td>${escapeHtml(error.descripcion)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="actions">
                    <button class="btn" onclick="window.print()">🖨️ Imprimir</button>
                    <button class="btn" onclick="window.close()">❌ Cerrar</button>
                </div>
            </div>
        </body>
        </html>
    `;
}

export function generarHTMLErroresSintacticos(errores: any[]): string {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Errores Sintácticos - USAC</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    min-height: 100vh;
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                
                .header {
                    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .header h1 {
                    margin: 0;
                    font-size: 2.5em;
                    font-weight: 300;
                }
                
                .content {
                    padding: 30px;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                
                th {
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                    color: white;
                    padding: 15px 12px;
                    text-align: left;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: 0.85em;
                }
                
                td {
                    padding: 12px;
                    border-bottom: 1px solid #e9ecef;
                }
                
                tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                
                tr:hover {
                    background-color: #e3f2fd;
                }
                
                .actions {
                    padding: 20px 30px;
                    background: #f8f9fa;
                    text-align: center;
                    border-top: 1px solid #e9ecef;
                }
                
                .btn {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1em;
                    margin: 0 10px;
                    transition: background-color 0.3s;
                }
                
                .btn:hover {
                    background: #2980b9;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔧 Errores Sintácticos</h1>
                    <p>Se encontraron ${errores.length} errores durante el análisis sintáctico</p>
                </div>
                
                <div class="content">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Fila</th>
                                <th>Columna</th>
                                <th>Esperado</th>
                                <th>Encontrado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${errores.map((error, index) => `
                                <tr>
                                    <td><strong>${index + 1}</strong></td>
                                    <td>${error.fila}</td>
                                    <td>${error.columna}</td>
                                    <td><code style="background: #d4edda; padding: 2px 6px; border-radius: 3px;">${escapeHtml(error.esperado)}</code></td>
                                    <td><code style="background: #f8d7da; padding: 2px 6px; border-radius: 3px;">${escapeHtml(error.encontrado)}</code></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="actions">
                    <button class="btn" onclick="window.print()">🖨️ Imprimir</button>
                    <button class="btn" onclick="window.close()">❌ Cerrar</button>
                </div>
            </div>
        </body>
        </html>
    `;
}

function escapeHtml(unsafe: string): string {
    if (typeof unsafe !== 'string') return String(unsafe);
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
