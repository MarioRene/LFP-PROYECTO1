// src/analizador/lexico.ts

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
            } else if (this.esDigito(caracterActual)) {
                this.manejarNumeros();
            } else if (this.esLetra(caracterActual)) {
                this.manejarPalabras();
            } else if (caracterActual === '"') {
                this.manejarCadenas();
            } else if (this.esSimbolo(caracterActual)) {
                this.manejarSimbolos();
            } else {
                this.agregarError('Carácter desconocido');
                this.posicion++;
                this.columna++;
            }
        }

        return { tokens: this.tokens, errores: this.errores };
    }

    private manejarEspacios(): void {
        let caracter = this.entrada[this.posicion];
        while (this.posicion < this.entrada.length && this.esEspacio(caracter)) {
            if (caracter === '\n') {
                this.fila++;
                this.columna = 1;
            } else {
                this.columna++;
            }
            this.posicion++;
            caracter = this.entrada[this.posicion];
        }
    }

    private manejarNumeros(): void {
        const inicio = this.posicion;
        let valor = '';
        let caracter = this.entrada[this.posicion];
        
        while (this.posicion < this.entrada.length && this.esDigito(caracter)) {
            valor += caracter;
            this.posicion++;
            this.columna++;
            caracter = this.posicion < this.entrada.length ? this.entrada[this.posicion] : '';
        }
        
        this.agregarToken('Numero', valor, inicio);
    }

    private manejarPalabras(): void {
        const inicio = this.posicion;
        let valor = '';
        let caracter = this.entrada[this.posicion];
        
        while (this.posicion < this.entrada.length && (this.esLetra(caracter) || this.esDigito(caracter))) {
            valor += caracter;
            this.posicion++;
            this.columna++;
            caracter = this.posicion < this.entrada.length ? this.entrada[this.posicion] : '';
        }
        
        // Verificar si es palabra reservada
        const palabrasReservadas = ['Carrera', 'Semestre', 'Nombre', 'Area', 'Prerrequisitos'];
        const tipo = palabrasReservadas.includes(valor) ? 'PalabraReservada' : 'Identificador';
        
        this.agregarToken(tipo, valor, inicio);
    }

    private manejarCadenas(): void {
        const inicio = this.posicion;
        let valor = '"';
        this.posicion++;
        this.columna++;
        let caracter = this.entrada[this.posicion];
        let escape = false;
        
        while (this.posicion < this.entrada.length && (caracter !== '"' || escape)) {
            if (caracter === '\\' && !escape) {
                escape = true;
            } else {
                valor += caracter;
                escape = false;
            }
            this.posicion++;
            this.columna++;
            caracter = this.posicion < this.entrada.length ? this.entrada[this.posicion] : '';
        }
        
        if (caracter === '"') {
            valor += '"';
            this.posicion++;
            this.columna++;
            this.agregarToken('Cadena', valor, inicio);
        } else {
            this.agregarError('Cadena no cerrada');
        }
    }

    private manejarSimbolos(): void {
        const caracter = this.entrada[this.posicion];
        let tipo = 'Simbolo';
        
        // Mapear símbolos a tipos específicos si es necesario
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
        this.agregarToken(tipo, caracter, this.posicion);
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
        return caracter === ' ' || caracter === '\t' || caracter === '\n' || caracter === '\r';
    }

    private esDigito(caracter: string): boolean {
        return caracter >= '0' && caracter <= '9';
    }

    private esLetra(caracter: string): boolean {
        return (caracter >= 'a' && caracter <= 'z') || (caracter >= 'A' && caracter <= 'Z') || caracter === '_';
    }

    private esSimbolo(caracter: string): boolean {
        const simbolos = [':', '[', ']', '{', '}', '(', ')', ';', ','];
        return simbolos.includes(caracter);
    }
}

export default AnalizadorLexico;