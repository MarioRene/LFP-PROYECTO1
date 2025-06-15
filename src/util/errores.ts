export class ErrorSintactico {
    constructor(
        public fila: number,
        public columna: number,
        public esperado: string,
        public encontrado: string
    ) {}

    public toString(): string {
        return `Error sintáctico en (${this.fila}, ${this.columna}): Se esperaba ${this.esperado} pero se encontró ${this.encontrado}`;
    }
}

export function generarHTMLErroresSintacticos(errores: ErrorSintactico[]): string {
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
                            <td>Se esperaba ${error.esperado} pero se encontró ${error.encontrado}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
}
