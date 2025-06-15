type Token = {
    tipo: string;
    valor: string;
    fila: number;
    columna: number;
};

type ErrorLexico = {
    fila: number;
    columna: number;
    caracter: string;
    descripcion: string;
};

class AnalizadorLexico {
    private entrada: string;
    private posicion: number;
    private fila: number;
    private columna: number;
    private tokens: Token[];
    private errores: ErrorLexico[];

    constructor() {
        this.entrada = '';
        this.posicion = 0;
        this.fila = 1;
        this.columna = 1;
        this.tokens = [];
        this.errores = [];
    }

    public analizar(entrada: string): { tokens: Token[], errores: ErrorLexico[] } {
        this.entrada = entrada;
        this.posicion = 0;
        this.fila = 1;
        this.columna = 1;
        this.tokens = [];
        this.errores = [];

        while (this.posicion < this.entrada.length) {
            const caracterActual = this.entrada[this.posicion];
            
            if (this.esEspacio(caracterActual)) {
                this.manejarEspacios();
            } else if (caracterActual === '/' && this.posicion + 1 < this.entrada.length && this.entrada[this.posicion + 1] === '/') {
                this.manejarComentarios();
            } else if (this.esDigito(caracterActual)) {
                this.manejarNumeros();
            } else if (this.esLetra(caracterActual)) {
                this.manejarPalabras();
            } else if (caracterActual === '"') {
                this.manejarCadenas();
            } else if (this.esSimbolo(caracterActual)) {
                this.manejarSimbolos();
            } else {
                // Agregar token de error en lugar de solo registrar error
                this.agregarToken('Error', caracterActual, this.posicion);
                this.agregarError('Carácter desconocido');
                this.posicion++;
                this.columna++;
            }
        }

        return { tokens: this.tokens, errores: this.errores };
    }

    private manejarComentarios(): void {
        // Comentarios de línea //
        while (this.posicion < this.entrada.length && this.entrada[this.posicion] !== '\n') {
            this.posicion++;
            this.columna++;
        }
    }

    private manejarEspacios(): void {
        while (this.posicion < this.entrada.length && this.esEspacio(this.entrada[this.posicion])) {
            const caracter = this.entrada[this.posicion];
            if (caracter === '\n') {
                this.fila++;
                this.columna = 1;
            } else {
                this.columna++;
            }
            this.posicion++;
        }
    }

    private manejarNumeros(): void {
        const inicioColumna = this.columna;
        let valor = '';
        
        while (this.posicion < this.entrada.length && this.esDigito(this.entrada[this.posicion])) {
            valor += this.entrada[this.posicion];
            this.posicion++;
            this.columna++;
        }
        
        this.tokens.push({
            tipo: 'Numero',
            valor,
            fila: this.fila,
            columna: inicioColumna
        });
    }

    private manejarPalabras(): void {
        const inicioColumna = this.columna;
        let valor = '';
        
        while (this.posicion < this.entrada.length && 
               (this.esLetra(this.entrada[this.posicion]) || this.esDigito(this.entrada[this.posicion]))) {
            valor += this.entrada[this.posicion];
            this.posicion++;
            this.columna++;
        }
        
        // Verificar si es palabra reservada - INCLUIR 'Curso'
        const palabrasReservadas = ['Carrera', 'Semestre', 'Curso', 'Nombre', 'Area', 'Prerrequisitos'];
        const tipo = palabrasReservadas.includes(valor) ? 'PalabraReservada' : 'Identificador';
        
        this.tokens.push({
            tipo,
            valor,
            fila: this.fila,
            columna: inicioColumna
        });
    }

    private manejarCadenas(): void {
        const inicioColumna = this.columna;
        let valor = '"';
        this.posicion++;
        this.columna++;
        
        while (this.posicion < this.entrada.length && this.entrada[this.posicion] !== '"') {
            const caracter = this.entrada[this.posicion];
            valor += caracter;
            
            if (caracter === '\n') {
                this.fila++;
                this.columna = 1;
            } else {
                this.columna++;
            }
            this.posicion++;
        }
        
        if (this.posicion < this.entrada.length && this.entrada[this.posicion] === '"') {
            valor += '"';
            this.posicion++;
            this.columna++;
            
            this.tokens.push({
                tipo: 'Cadena',
                valor,
                fila: this.fila,
                columna: inicioColumna
            });
        } else {
            // Cadena no cerrada - agregar como error
            this.tokens.push({
                tipo: 'Error',
                valor,
                fila: this.fila,
                columna: inicioColumna
            });
            this.errores.push({
                fila: this.fila,
                columna: inicioColumna,
                caracter: '"',
                descripcion: 'Cadena no cerrada'
            });
        }
    }

    private manejarSimbolos(): void {
        const caracter = this.entrada[this.posicion];
        let tipo = 'Simbolo';
        
        // Mapear símbolos a tipos específicos
        const simbolosEspeciales: Record<string, string> = {
            ':': 'DosPuntos',
            '[': 'CorcheteApertura',
            ']': 'CorcheteCierre',
            '{': 'LlaveApertura',
            '}': 'LlaveCierre',
            '(': 'ParentesisApertura',
            ')': 'ParentesisCierre',
            ';': 'PuntoComa',
            ',': 'Coma'
        };
        
        tipo = simbolosEspeciales[caracter] || tipo;
        
        this.tokens.push({
            tipo,
            valor: caracter,
            fila: this.fila,
            columna: this.columna
        });
        
        this.posicion++;
        this.columna++;
    }

    private agregarToken(tipo: string, valor: string, posicionInicial: number): void {
        this.tokens.push({
            tipo,
            valor,
            fila: this.fila,
            columna: this.columna - (this.posicion - posicionInicial)
        });
    }

    private agregarError(descripcion: string): void {
        const caracter = this.posicion < this.entrada.length ? this.entrada[this.posicion] : '';
        this.errores.push({
            fila: this.fila,
            columna: this.columna,
            caracter,
            descripcion
        });
    }

    private esEspacio(caracter: string): boolean {
        return /\s/.test(caracter);
    }

    private esDigito(caracter: string): boolean {
        return caracter >= '0' && caracter <= '9';
    }

    private esLetra(caracter: string): boolean {
        return (caracter >= 'a' && caracter <= 'z') || 
               (caracter >= 'A' && caracter <= 'Z') || 
               caracter === '_';
    }

    private esSimbolo(caracter: string): boolean {
        const simbolos = [':', '[', ']', '{', '}', '(', ')', ';', ','];
        return simbolos.includes(caracter);
    }
}

export default AnalizadorLexico;
