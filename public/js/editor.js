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
    const homeBtn = document.getElementById('home');
    
    let ultimosTokens = [];
    let ultimosErrores = {
        lexicos: [],
        sintacticos: []
    };
    let ultimaUniversidad = null;
    let ultimoContenido = '';
    
    // Home - recargar página
    homeBtn.addEventListener('click', () => {
        window.location.reload();
    });
    
    // Resaltado de sintaxis mientras escribe
    editor.addEventListener('input', () => {
        resaltarSintaxis();
    });
    
    // Analizar contenido
    analizarBtn.addEventListener('click', () => {
        const contenido = editor.innerText;
        
        if (!contenido.trim()) {
            mostrarNotificacion('El editor está vacío', 'error');
            return;
        }
        
        // Guardar contenido para uso posterior
        ultimoContenido = contenido;
        
        // Mostrar estado de carga
        analizarBtn.classList.add('loading');
        analizarBtn.disabled = true;
        analizarBtn.textContent = 'Analizando...';
        
        fetch('/analizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contenido })
        })
        .then(response => response.json())
        .then(data => {
            // Quitar estado de carga
            analizarBtn.classList.remove('loading');
            analizarBtn.disabled = false;
            analizarBtn.innerHTML = '⚡ Analizar';
            
            // Limpiar tabla de tokens
            tablaTokens.innerHTML = '';
            ultimosTokens = data.tokens || [];
            
            // Limpiar errores anteriores
            ultimosErrores = data.errores || {
                lexicos: [],
                sintacticos: []
            };
            
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
                
                // Resaltar errores en la tabla
                if (token.tipo === 'Error') {
                    row.style.backgroundColor = '#ffebee';
                }
                
                tablaTokens.appendChild(row);
            });
            
            // Manejar resultado según el tipo
            if (data.tipo === 'errores') {
                modalBody.innerHTML = data.contenido;
                modal.style.display = 'block';
                mostrarNotificacion('Se encontraron errores en el análisis', 'error');
            } else if (data.tipo === 'universidad') {
                // Guardar datos de la universidad
                ultimaUniversidad = data.universidad;
                
                // Abrir página principal de universidad
                const ventana = window.open('', '_blank');
                ventana.document.write(data.contenido);
                ventana.document.close();
                
                const numCarreras = data.universidad.carreras.length;
                mostrarNotificacion(`Universidad generada con ${numCarreras} carrera${numCarreras !== 1 ? 's' : ''}`, 'success');
                
                // Mostrar estadísticas en consola
                console.log('📊 Estadísticas de la universidad:', data.universidad.estadisticas);
                
            } else {
                // Formato anterior (una sola carrera) - mantener compatibilidad
                const ventana = window.open('', '_blank');
                ventana.document.write(data.contenido);
                ventana.document.close();
                mostrarNotificacion('Pensum generado exitosamente', 'success');
            }
        })
        .catch(error => {
            analizarBtn.classList.remove('loading');
            analizarBtn.disabled = false;
            analizarBtn.innerHTML = '⚡ Analizar';
            console.error('Error:', error);
            mostrarNotificacion('Ocurrió un error al analizar el contenido', 'error');
        });
    });
    
    // Limpiar editor
    limpiarEditorBtn.addEventListener('click', () => {
        editor.innerHTML = '';
        editor.innerText = '';
        tablaTokens.innerHTML = '';
        ultimosTokens = [];
        ultimosErrores = { lexicos: [], sintacticos: [] };
        ultimaUniversidad = null;
        ultimoContenido = '';
        mostrarNotificacion('Editor limpiado', 'success');
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
                mostrarNotificacion(`Archivo ${file.name} cargado exitosamente`, 'success');
            };
            reader.readAsText(file);
        } else {
            mostrarNotificacion('Por favor seleccione un archivo con extensión .plfp', 'error');
        }
        // Limpiar el input para permitir cargar el mismo archivo nuevamente
        e.target.value = '';
    });
    
    // Guardar archivo
    guardarArchivoBtn.addEventListener('click', () => {
        const contenido = editor.innerText;
        if (!contenido.trim()) {
            mostrarNotificacion('El editor está vacío', 'error');
            return;
        }
        
        const blob = new Blob([contenido], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'universidad.plfp';
        a.click();
        URL.revokeObjectURL(url);
        mostrarNotificacion('Archivo guardado exitosamente', 'success');
    });
    
    // Mostrar reporte de errores
    errorReportBtn.addEventListener('click', () => {
        // Recopilar todos los errores
        const erroresLexicos = [
            ...ultimosErrores.lexicos,
            ...ultimosTokens
                .filter(token => token.tipo === 'Error')
                .map(token => ({
                    fila: token.fila,
                    columna: token.columna,
                    caracter: token.valor,
                    descripcion: 'Token no reconocido'
                }))
        ];
        
        const erroresSintacticos = ultimosErrores.sintacticos || [];
        
        if (erroresLexicos.length > 0 || erroresSintacticos.length > 0) {
            const ventanaErrores = window.open('', '_blank');
            const htmlErrores = generarHTMLErroresCompleto(erroresLexicos, erroresSintacticos);
            ventanaErrores.document.write(htmlErrores);
            ventanaErrores.document.close();
        } else {
            mostrarNotificacion('No se encontraron errores', 'success');
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
        
        // Guardar posición del cursor
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        let cursorOffset = 0;
        if (range) {
            cursorOffset = range.startOffset;
        }
        
        // Limpiar contenido anterior
        editor.innerHTML = '';
        
        const palabrasReservadas = ['Carrera', 'Semestre', 'Curso', 'Nombre', 'Area', 'Prerrequisitos'];
        const simbolos = [':', '[', ']', '{', '}', '(', ')', ';', ','];
        
        let i = 0;
        let newCursorOffset = 0;
        let elementoActual = 0;
        
        while (i < texto.length) {
            const char = texto[i];
            
            // Manejar comentarios //
            if (char === '/' && i + 1 < texto.length && texto[i + 1] === '/') {
                let comentario = '';
                while (i < texto.length && texto[i] !== '\n') {
                    comentario += texto[i];
                    i++;
                }
                
                const span = document.createElement('span');
                span.style.color = '#6a737d';
                span.style.fontStyle = 'italic';
                span.textContent = comentario;
                editor.appendChild(span);
                
                if (elementoActual <= cursorOffset) {
                    newCursorOffset = editor.childNodes.length - 1;
                }
                elementoActual += comentario.length;
            } else if (char === '"') {
                // Manejar cadenas de texto
                let cadena = '"';
                i++;
                while (i < texto.length && texto[i] !== '"') {
                    cadena += texto[i];
                    i++;
                }
                if (i < texto.length) {
                    cadena += texto[i];
                    i++;
                }
                
                const span = document.createElement('span');
                span.className = 'token-cadena';
                span.textContent = cadena;
                editor.appendChild(span);
                
                if (elementoActual <= cursorOffset) {
                    newCursorOffset = editor.childNodes.length - 1;
                }
                elementoActual += cadena.length;
            } else if (/\s/.test(char)) {
                // Manejar espacios en blanco
                const span = document.createElement('span');
                span.textContent = char;
                editor.appendChild(span);
                
                if (elementoActual <= cursorOffset) {
                    newCursorOffset = editor.childNodes.length - 1;
                }
                elementoActual++;
                i++;
            } else if (simbolos.includes(char)) {
                // Manejar símbolos
                const span = document.createElement('span');
                span.className = 'token-simbolo';
                span.textContent = char;
                editor.appendChild(span);
                
                if (elementoActual <= cursorOffset) {
                    newCursorOffset = editor.childNodes.length - 1;
                }
                elementoActual++;
                i++;
            } else {
                // Manejar palabras y números
                let palabra = '';
                while (i < texto.length && !/\s/.test(texto[i]) && !simbolos.includes(texto[i]) && 
                       texto[i] !== '"' && !(texto[i] === '/' && i + 1 < texto.length && texto[i + 1] === '/')) {
                    palabra += texto[i];
                    i++;
                }
                
                if (palabra) {
                    const span = document.createElement('span');
                    
                    if (palabrasReservadas.includes(palabra)) {
                        span.className = 'token-palabra-reservada';
                    } else if (/^\d+$/.test(palabra)) {
                        span.className = 'token-numero';
                    }
                    
                    span.textContent = palabra;
                    editor.appendChild(span);
                    
                    if (elementoActual <= cursorOffset) {
                        newCursorOffset = editor.childNodes.length - 1;
                    }
                    elementoActual += palabra.length;
                }
            }
        }
        
        // Restaurar posición del cursor
        if (range && editor.childNodes.length > 0) {
            try {
                const newRange = document.createRange();
                const nodeIndex = Math.min(newCursorOffset, editor.childNodes.length - 1);
                const targetNode = editor.childNodes[nodeIndex];
                
                if (targetNode && targetNode.textContent) {
                    const offset = Math.min(cursorOffset, targetNode.textContent.length);
                    newRange.setStart(targetNode.firstChild || targetNode, offset);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            } catch (e) {
                // Si hay error restaurando el cursor, simplemente continúa
            }
        }
    }
    
    function generarHTMLErroresCompleto(erroresLexicos, erroresSintacticos) {
        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reporte Completo de Errores - USAC</title>
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
                    
                    .stats {
                        display: flex;
                        justify-content: center;
                        gap: 40px;
                        padding: 20px;
                        background: #f8f9fa;
                        border-bottom: 1px solid #e9ecef;
                    }
                    
                    .stat {
                        text-align: center;
                    }
                    
                    .stat-number {
                        font-size: 2.5em;
                        font-weight: bold;
                        color: #e74c3c;
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
                    
                    .error-section {
                        margin-bottom: 30px;
                    }
                    
                    .section-title {
                        background: #34495e;
                        color: white;
                        padding: 15px;
                        margin: 0;
                        font-size: 1.2em;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        background: white;
                        margin-bottom: 20px;
                    }
                    
                    th {
                        background: #2c3e50;
                        color: white;
                        padding: 12px;
                        text-align: left;
                        font-weight: 600;
                    }
                    
                    td {
                        padding: 10px 12px;
                        border-bottom: 1px solid #e9ecef;
                    }
                    
                    tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    
                    tr:hover {
                        background-color: #e3f2fd;
                    }
                    
                    .no-errors {
                        text-align: center;
                        padding: 40px;
                        color: #28a745;
                        font-size: 1.1em;
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
                        <h1>🚨 Reporte Completo de Errores</h1>
                        <p>Análisis léxico y sintáctico completado</p>
                    </div>
                    
                    <div class="stats">
                        <div class="stat">
                            <div class="stat-number">${erroresLexicos.length + erroresSintacticos.length}</div>
                            <div class="stat-label">Total Errores</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${erroresLexicos.length}</div>
                            <div class="stat-label">Léxicos</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${erroresSintacticos.length}</div>
                            <div class="stat-label">Sintácticos</div>
                        </div>
                    </div>
                    
                    <div class="content">
                        ${erroresLexicos.length > 0 ? `
                        <div class="error-section">
                            <h2 class="section-title">🔍 Errores Léxicos</h2>
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
                                    ${erroresLexicos.map((error, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${error.fila}</td>
                                            <td>${error.columna}</td>
                                            <td><code>${escapeHtml(error.caracter || '-')}</code></td>
                                            <td>${escapeHtml(error.descripcion)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        ` : ''}
                        
                        ${erroresSintacticos.length > 0 ? `
                        <div class="error-section">
                            <h2 class="section-title">🔧 Errores Sintácticos</h2>
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
                                    ${erroresSintacticos.map((error, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${error.fila}</td>
                                            <td>${error.columna}</td>
                                            <td><code>${escapeHtml(error.esperado || '-')}</code></td>
                                            <td><code>${escapeHtml(error.encontrado || '-')}</code></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        ` : ''}
                        
                        ${erroresLexicos.length === 0 && erroresSintacticos.length === 0 ? `
                        <div class="no-errors">
                            <h3>✅ ¡Sin errores encontrados!</h3>
                            <p>El análisis se completó exitosamente.</p>
                        </div>
                        ` : ''}
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
    
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Función global para notificaciones (definida en el HTML)
    window.mostrarNotificacion = function(mensaje, tipo = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.textContent = mensaje;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    };
});
