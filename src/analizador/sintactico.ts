// src/analizador/sintactico.ts

import AnalizadorLexico from './lexico';
import { Carrera, Semestre, Curso } from '../modelos';

class AnalizadorSintactico {
    private tokens: any[];
    private posicion: number;
    private errores: any[];

    constructor() {
        this.tokens = [];
        this.posicion = 0;
        this.errores = [];
    }

    public analizar(tokens: any[]): { carrera: Carrera | null, errores: any[] } {
        this.tokens = tokens;
        this.posicion = 0;
        this.errores = [];

        try {
            const carrera = this.analizarCarrera();
            return { carrera, errores: this.errores };
        } catch (error) {
            return { carrera: null, errores: this.errores };
        }
    }

    private analizarCarrera(): Carrera {
        this.consume('PalabraReservada', 'Carrera');
        this.consume('DosPuntos');
        
        const nombreToken = this.consume('Cadena');
        const nombre = nombreToken.valor.slice(1, -1); // Remover comillas
        
        this.consume('CorcheteApertura');
        
        const semestres: Semestre[] = [];
        while (this.tokens[this.posicion].tipo !== 'CorcheteCierre') {
            semestres.push(this.analizarSemestre());
        }
        
        this.consume('CorcheteCierre');
        
        return new Carrera(nombre, semestres);
    }

    private analizarSemestre(): Semestre {
        this.consume('PalabraReservada', 'Semestre');
        this.consume('DosPuntos');
        
        const numeroToken = this.consume('Numero');
        const numero = parseInt(numeroToken.valor);
        
        this.consume('LlaveApertura');
        
        const cursos: Curso[] = [];
        while (this.tokens[this.posicion].tipo !== 'LlaveCierre') {
            cursos.push(this.analizarCurso());
        }
        
        this.consume('LlaveCierre');
        
        return new Semestre(numero, cursos);
    }

    private analizarCurso(): Curso {
        const codigoToken = this.consume('Numero');
        const codigo = parseInt(codigoToken.valor);
        
        this.consume('LlaveApertura');
        
        this.consume('PalabraReservada', 'Nombre');
        this.consume('DosPuntos');
        const nombreToken = this.consume('Cadena');
        const nombre = nombreToken.valor.slice(1, -1);
        this.consume('PuntoComa');
        
        this.consume('PalabraReservada', 'Area');
        this.consume('DosPuntos');
        const areaToken = this.consume('Numero');
        const area = parseInt(areaToken.valor);
        this.consume('PuntoComa');
        
        let prerrequisitos: number[] = [];
        if (this.tokens[this.posicion].valor === 'Prerrequisitos') {
            prerrequisitos = this.analizarPrerrequisitos();
        }
        
        this.consume('LlaveCierre');
        
        return new Curso(codigo, nombre, area, prerrequisitos);
    }

    private analizarPrerrequisitos(): number[] {
        this.consume('PalabraReservada', 'Prerrequisitos');
        this.consume('DosPuntos');
        this.consume('ParentesisApertura');
        
        const codigos: number[] = [];
        if (this.tokens[this.posicion].tipo === 'Numero') {
            const primerCodigo = this.consume('Numero');
            codigos.push(parseInt(primerCodigo.valor));
            
            while (this.tokens[this.posicion].tipo === 'Coma') {
                this.consume('Coma');
                const codigoToken = this.consume('Numero');
                codigos.push(parseInt(codigoToken.valor));
            }
        }
        
        this.consume('ParentesisCierre');
        
        return codigos;
    }

    private consume(tipo: string, valor?: string): any {
        const token = this.tokens[this.posicion];
        
        if (token.tipo === tipo && (!valor || token.valor === valor)) {
            this.posicion++;
            return token;
        }
        
        const error = {
            fila: token.fila,
            columna: token.columna,
            esperado: valor ? `${tipo} '${valor}'` : tipo,
            encontrado: `${token.tipo} '${token.valor}'`
        };
        
        this.errores.push(error);
        throw new Error(`Error de sintaxis: Se esperaba ${error.esperado} pero se encontró ${error.encontrado}`);
    }
}

export default AnalizadorSintactico;