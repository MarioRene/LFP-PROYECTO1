// src/modelos/curso.ts

export class Curso {
    constructor(
        public codigo: number,
        public nombre: string,
        public area: number,
        public prerrequisitos: number[]
    ) {}

    public tienePrerrequisitos(): boolean {
        return this.prerrequisitos.length > 0;
    }
}
