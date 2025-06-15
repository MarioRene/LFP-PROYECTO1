import { Semestre } from './semestre';
import { Curso } from './curso';

export class Carrera {
    constructor(
        public nombre: string,
        public semestres: Semestre[]
    ) {}

    public obtenerCursoPorCodigo(codigo: number): Curso | undefined {
        for (const semestre of this.semestres) {
            for (const curso of semestre.cursos) {
                if (curso.codigo === codigo) {
                    return curso;
                }
            }
        }
        return undefined;
    }

    public obtenerTodosLosCursos(): Curso[] {
        const cursos: Curso[] = [];
        this.semestres.forEach(semestre => {
            cursos.push(...semestre.cursos);
        });
        return cursos;
    }
}