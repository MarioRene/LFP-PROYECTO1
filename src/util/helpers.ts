// src/util/helpers.ts

import { Carrera } from '../modelos/carrera';
import { Curso } from '../modelos/curso';

export function generarHTMLPensum(carrera: Carrera): string {
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
    
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Pensum Interactivo - ${carrera.nombre}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #f9f9f9;
                }
                h1 {
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 30px;
                }
                .semestre {
                    background-color: white;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .semestre h2 {
                    color: #3498db;
                    margin-top: 0;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                .cursos-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                .curso {
                    background-color: #f1f1f1;
                    border-radius: 6px;
                    padding: 10px 15px;
                    cursor: pointer;
                    transition: all 0.3s;
                    width: calc(33% - 15px);
                    box-sizing: border-box;
                }
                .curso:hover {
                    background-color: #e0e0e0;
                    transform: translateY(-2px);
                }
                .curso h3 {
                    margin: 0 0 5px 0;
                    color: #2c3e50;
                }
                .curso p {
                    margin: 5px 0;
                    color: #7f8c8d;
                    font-size: 14px;
                }
                .curso-seleccionado {
                    background-color: #3498db;
                    color: white;
                }
                .curso-seleccionado h3, .curso-seleccionado p {
                    color: white;
                }
                .prerrequisito {
                    background-color: #e67e22;
                    color: white;
                }
                .prerrequisito h3, .prerrequisito p {
                    color: white;
                }
                .info-carrera {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
            </style>
        </head>
        <body>
            <div class="info-carrera">
                <h1>Pensum de la carrera: ${carrera.nombre}</h1>
                <p>Total de semestres: ${carrera.semestres.length}</p>
                <p>Total de cursos: ${carrera.semestres.reduce((total, semestre) => total + semestre.cursos.length, 0)}</p>
            </div>
            
            ${semestresHTML}
            
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
                    document.querySelectorAll('.curso-seleccionado, .prerrequisito').forEach(el => {
                        el.classList.remove('curso-seleccionado', 'prerrequisito');
                    });
                    
                    // Resaltar curso seleccionado
                    const cursoElement = document.querySelector(\`.curso[data-codigo="\${codigo}"]\`);
                    if (cursoElement) {
                        cursoElement.classList.add('curso-seleccionado');
                        
                        // Resaltar prerrequisitos recursivamente
                        resaltarPrerrequisitos(codigo);
                    }
                }
                
                // Función recursiva para resaltar prerrequisitos
                function resaltarPrerrequisitos(codigo) {
                    const curso = cursosMap[codigo];
                    if (curso && curso.prerrequisitos) {
                        curso.prerrequisitos.forEach(prerreqCodigo => {
                            const prerreqElement = document.querySelector(\`.curso[data-codigo="\${prerreqCodigo}"]\`);
                            if (prerreqElement) {
                                prerreqElement.classList.add('prerrequisito');
                                resaltarPrerrequisitos(prerreqCodigo);
                            }
                        });
                    }
                }
                
                // Escapar HTML para prevenir XSS
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
}

function generarHTMLCurso(curso: Curso, carrera: Carrera): string {
    return `
        <div class="curso" data-codigo="${curso.codigo}" onclick="seleccionarCurso(${curso.codigo})">
            <h3>${curso.codigo} - ${escapeHtml(curso.nombre)}</h3>
            <p>Área: ${curso.area}</p>
            <p>Prerrequisitos: ${curso.prerrequisitos.length > 0 ? 
                curso.prerrequisitos.map(cod => {
                    const c = carrera.obtenerCursoPorCodigo(cod);
                    return c ? `${cod} (${escapeHtml(c.nombre)})` : `${cod}`;
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
            <title>Errores Léxicos</title>
            <style>
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <h1>Errores Léxicos</h1>
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
                            <td>${index + 1}</td>
                            <td>${error.fila}</td>
                            <td>${error.columna}</td>
                            <td>${escapeHtml(error.caracter || ' ')}</td>
                            <td>${escapeHtml(error.descripcion)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
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
            <title>Errores Sintácticos</title>
            <style>
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <h1>Errores Sintácticos</h1>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Fila</th>
                        <th>Columna</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
                    ${errores.map((error, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${error.fila}</td>
                            <td>${error.columna}</td>
                            <td>Se esperaba ${escapeHtml(error.esperado)} pero se encontró ${escapeHtml(error.encontrado)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}