import { Curso } from './curso';

export class Semestre {
    constructor(
        public numero: number,
        public cursos: Curso[]
    ) {}
}