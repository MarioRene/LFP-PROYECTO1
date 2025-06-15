import AnalizadorLexico from './lexico';
import { Universidad } from '../modelos/universidad';
import { Carrera } from '../modelos/carrera';
import { Semestre } from '../modelos/semestre';
import { Curso } from '../modelos/curso';

class AnalizadorSintactico {
    private tokens: any[];
    private posicion: number;
    private errores: any[];

    constructor() {
        this.tokens = [];
        this.posicion = 0;
        this.errores = [];
    }

    public analizar(tokens: any[]): { universidad: Universidad | null, errores: any[] } {
        this.tokens = tokens;
        this.posicion = 0;
        this.errores = [];

        try {
            const universidad = this.analizarUniversidad();
            return { universidad, errores: this.errores };
        } catch (error) {
            return { universidad: null, errores: this.errores };
        }
    }

    private analizarUniversidad(): Universidad {
        const carreras: Carrera[] = [];
        
        // Analizar múltiples carreras hasta fin de archivo
        while (this.posicion < this.tokens.length) {
            // Saltar tokens que no sean palabras reservadas (comentarios, espacios, etc.)
            while (this.posicion < this.tokens.length && 
                   !(this.tokens[this.posicion].tipo === 'PalabraReservada' && 
                     this.tokens[this.posicion].valor === 'Carrera')) {
                this.posicion++;
            }
            
            // Si llegamos al final, terminar
            if (this.posicion >= this.tokens.length) {
                break;
            }
            
            carreras.push(this.analizarCarrera());
        }
        
        if (carreras.length === 0) {
            this.agregarError('No se encontraron carreras válidas en el archivo');
            throw new Error('No se encontraron carreras válidas');
        }
        
        return new Universidad(carreras);
    }

    private analizarCarrera(): Carrera {
        this.consume('PalabraReservada', 'Carrera');
        this.consume('DosPuntos');
        
        const nombreToken = this.consume('Cadena');
        const nombre = nombreToken.valor.slice(1, -1); // Remover comillas
        
        this.consume('CorcheteApertura');
        
        const semestres: Semestre[] = [];
        while (this.posicion < this.tokens.length && this.tokens[this.posicion].tipo !== 'CorcheteCierre') {
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
        while (this.posicion < this.tokens.length && this.tokens[this.posicion].tipo !== 'LlaveCierre') {
            cursos.push(this.analizarCurso());
        }
        
        this.consume('LlaveCierre');
        
        return new Semestre(numero, cursos);
    }

    private analizarCurso(): Curso {
        // Primero consumir la palabra "Curso:"
        this.consume('PalabraReservada', 'Curso');
        this.consume('DosPuntos');
        
        // Luego el código del curso
        const codigoToken = this.consume('Numero');
        const codigo = parseInt(codigoToken.valor);
        
        this.consume('LlaveApertura');
        
        // Nombre del curso
        this.consume('PalabraReservada', 'Nombre');
        this.consume('DosPuntos');
        const nombreToken = this.consume('Cadena');
        const nombre = nombreToken.valor.slice(1, -1);
        this.consume('PuntoComa');
        
        // Área del curso
        this.consume('PalabraReservada', 'Area');
        this.consume('DosPuntos');
        const areaToken = this.consume('Numero');
        const area = parseInt(areaToken.valor);
        this.consume('PuntoComa');
        
        // Prerrequisitos (siempre presente)
        const prerrequisitos = this.analizarPrerrequisitos();
        
        this.consume('LlaveCierre');
        
        return new Curso(codigo, nombre, area, prerrequisitos);
    }

    private analizarPrerrequisitos(): number[] {
        this.consume('PalabraReservada', 'Prerrequisitos');
        this.consume('DosPuntos');
        this.consume('ParentesisApertura');
        
        const codigos: number[] = [];
        
        // Verificar si hay contenido dentro de los paréntesis
        if (this.posicion < this.tokens.length && this.tokens[this.posicion].tipo === 'Numero') {
            const primerCodigo = this.consume('Numero');
            codigos.push(parseInt(primerCodigo.valor));
            
            // Consumir códigos adicionales separados por comas
            while (this.posicion < this.tokens.length && this.tokens[this.posicion].tipo === 'Coma') {
                this.consume('Coma');
                const codigoToken = this.consume('Numero');
                codigos.push(parseInt(codigoToken.valor));
            }
        }
        
        this.consume('ParentesisCierre');
        this.consume('PuntoComa');
        
        return codigos;
    }

    private consume(tipo: string, valor?: string): any {
        if (this.posicion >= this.tokens.length) {
            const error = {
                fila: this.tokens[this.tokens.length - 1]?.fila || 1,
                columna: this.tokens[this.tokens.length - 1]?.columna || 1,
                esperado: valor ? `${tipo} '${valor}'` : tipo,
                encontrado: 'Fin de archivo'
            };
            this.errores.push(error);
            throw new Error(`Error de sintaxis: Se esperaba ${error.esperado} pero se encontró ${error.encontrado}`);
        }
        
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

    private agregarError(descripcion: string): void {
        const ultimoToken = this.tokens[this.tokens.length - 1] || { fila: 1, columna: 1 };
        this.errores.push({
            fila: ultimoToken.fila,
            columna: ultimoToken.columna,
            esperado: 'Estructura válida',
            encontrado: descripcion
        });
    }
}

export default AnalizadorSintactico;
