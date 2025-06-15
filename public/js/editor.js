// public/js/editor.js

document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const analizarBtn = document.getElementById('analizar-btn');
    const tablaTokens = document.getElementById('tabla-tokens').querySelector('tbody');
    const limpiarEditorBtn = document.getElementById('limpiar-editor');
    const cargarArchivoBtn = document.getElementById('cargar-archivo');
    const guardarArchivoBtn = document.getElementById('guardar-archivo');
    const fileInput = document.getElementById('file-input');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close');
    const errorReportBtn = document.getElementById('error-report');
    
    // Resaltado de sintaxis mientras escribe
    editor.addEventListener('input', () => {
        resaltarSintaxis();
    });
    
    // Analizar contenido
    analizarBtn.addEventListener('click', () => {
        const contenido = editor.innerText;
        
        fetch('/analizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contenido })
        })
        .then(response => response.json())
        .then(data => {
            // Limpiar tabla de tokens
            tablaTokens.innerHTML = '';
            
            // Mostrar tokens en la tabla
            data.tokens.forEach((token, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${token.fila}</td>
                    <td>${token.columna}</td>
                    <td>${escapeHtml(token.valor)}</td>
                    <td>${token.tipo}</td>
                `;
                tablaTokens.appendChild(row);
            });
            
            // Mostrar resultado (pensum o errores)
            if (data.tipo === 'errores') {
                modalBody.innerHTML = data.contenido;
                modal.style.display = 'block';
            } else {
                // Abrir pensum en nueva pestaña
                const ventana = window.open('', '_blank');
                ventana.document.write(data.contenido);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al analizar el contenido');
        });
    });
    
    // Limpiar editor
    limpiarEditorBtn.addEventListener('click', () => {
        editor.innerHTML = '';
        tablaTokens.innerHTML = '';
    });
    
    // Cargar archivo
    cargarArchivoBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.name.endsWith('.plfp')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                editor.innerText = event.target.result;
                resaltarSintaxis();
            };
            reader.readAsText(file);
        } else {
            alert('Por favor seleccione un archivo con extensión .plfp');
        }
    });
    
    // Guardar archivo
    guardarArchivoBtn.addEventListener('click', () => {
        const contenido = editor.innerText;
        if (!contenido.trim()) {
            alert('El editor está vacío');
            return;
        }
        
        const blob = new Blob([contenido], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pensum.plfp';
        a.click();
        URL.revokeObjectURL(url);
    });
    
    // Mostrar reporte de errores
    errorReportBtn.addEventListener('click', () => {
        if (tablaTokens.children.length > 0) {
            const errores = Array.from(tablaTokens.querySelectorAll('tr'))
                .filter(row => row.querySelector('td:nth-child(5)').textContent === 'Error')
                .map(row => ({
                    fila: row.querySelector('td:nth-child(2)').textContent,
                    columna: row.querySelector('td:nth-child(3)').textContent,
                    caracter: row.querySelector('td:nth-child(4)').textContent,
                    descripcion: 'Token no reconocido'
                }));
            
            if (errores.length > 0) {
                const htmlErrores = generarHTMLErrores(errores);
                modalBody.innerHTML = htmlErrores;
                modal.style.display = 'block';
            } else {
                alert('No se encontraron errores léxicos');
            }
        } else {
            alert('Primero debe analizar el contenido');
        }
    });
    
    // Cerrar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Función para resaltar sintaxis
    function resaltarSintaxis() {
        const texto = editor.innerText;
        if (!texto.trim()) return;
        
        // Limpiar clases anteriores
        editor.innerHTML = '';
        
        // Aquí iría la lógica para dividir el texto en tokens y aplicar clases CSS
        // Esto es un ejemplo simplificado
        const palabrasReservadas = ['Carrera', 'Semestre', 'Nombre', 'Area', 'Prerrequisitos'];
        const simbolos = [':', '[', ']', '{', '}', '(', ')', ';', ','];
        
        let span = document.createElement('span');
        editor.appendChild(span);
        
        let palabraActual = '';
        let enCadena = false;
        
        for (let i = 0; i < texto.length; i++) {
            const char = texto[i];
            
            if (char === '"') {
                if (enCadena) {
                    palabraActual += char;
                    const spanCadena = document.createElement('span');
                    spanCadena.className = 'token-cadena';
                    spanCadena.textContent = palabraActual;
                    editor.appendChild(spanCadena);
                    palabraActual = '';
                    enCadena = false;
                } else {
                    if (palabraActual) {
                        span.textContent = palabraActual;
                        editor.appendChild(span);
                        span = document.createElement('span');
                    }
                    palabraActual = char;
                    enCadena = true;
                }
            } else if (enCadena) {
                palabraActual += char;
            } else if (/\s/.test(char)) {
                if (palabraActual) {
                    span.textContent = palabraActual;
                    aplicarClaseToken(span, palabraActual);
                    editor.appendChild(span);
                    span = document.createElement('span');
                    palabraActual = '';
                }
                span.textContent = char;
                editor.appendChild(span);
                span = document.createElement('span');
            } else if (simbolos.includes(char)) {
                if (palabraActual) {
                    span.textContent = palabraActual;
                    aplicarClaseToken(span, palabraActual);
                    editor.appendChild(span);
                    span = document.createElement('span');
                    palabraActual = '';
                }
                span.textContent = char;
                span.className = 'token-simbolo';
                editor.appendChild(span);
                span = document.createElement('span');
            } else {
                palabraActual += char;
            }
        }
        
        if (palabraActual) {
            span.textContent = palabraActual;
            aplicarClaseToken(span, palabraActual);
            editor.appendChild(span);
        }
    }
    
    function aplicarClaseToken(span, palabra) {
        const palabrasReservadas = ['Carrera', 'Semestre', 'Nombre', 'Area', 'Prerrequisitos'];
        
        if (palabrasReservadas.includes(palabra)) {
            span.className = 'token-palabra-reservada';
        } else if (/^\d+$/.test(palabra)) {
            span.className = 'token-numero';
        }
    }
    
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    function generarHTMLErrores(errores) {
        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Errores</title>
                <style>
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <h1>Reporte de Errores Léxicos</h1>
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
                                <td>${error.caracter || ' '}</td>
                                <td>${error.descripcion}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
    }
});
