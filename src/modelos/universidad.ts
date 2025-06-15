import { Carrera } from './carrera';
import { Curso } from './curso';

export class Universidad {
    constructor(
        public carreras: Carrera[]
    ) {}

    public obtenerCarreraPorNombre(nombre: string): Carrera | undefined {
        return this.carreras.find(c => c.nombre === nombre);
    }

    public obtenerCarreraPorIndice(indice: number): Carrera | undefined {
        return this.carreras[indice];
    }

    public obtenerTotalCursos(): number {
        return this.carreras.reduce((total, carrera) => {
            return total + carrera.obtenerTodosLosCursos().length;
        }, 0);
    }

    public obtenerTotalSemestres(): number {
        return this.carreras.reduce((total, carrera) => {
            return total + carrera.semestres.length;
        }, 0);
    }

    public obtenerAreasUnicas(): Set<number> {
        const areas = new Set<number>();
        this.carreras.forEach(carrera => {
            carrera.obtenerTodosLosCursos().forEach(curso => {
                areas.add(curso.area);
            });
        });
        return areas;
    }

    public validarCodigosUnicos(): { valido: boolean, duplicados: number[] } {
        const todosLosCodigos = new Map<number, string[]>();
        
        this.carreras.forEach(carrera => {
            carrera.obtenerTodosLosCursos().forEach(curso => {
                if (!todosLosCodigos.has(curso.codigo)) {
                    todosLosCodigos.set(curso.codigo, []);
                }
                todosLosCodigos.get(curso.codigo)!.push(carrera.nombre);
            });
        });

        const duplicados: number[] = [];
        todosLosCodigos.forEach((carreras, codigo) => {
            if (carreras.length > 1) {
                duplicados.push(codigo);
            }
        });

        return {
            valido: duplicados.length === 0,
            duplicados
        };
    }

    public obtenerEstadisticas(): {
        totalCarreras: number;
        totalCursos: number;
        totalSemestres: number;
        areasUnicas: number;
        cursosPromedioPorCarrera: number;
        semestresPromedioPorCarrera: number;
    } {
        const totalCarreras = this.carreras.length;
        const totalCursos = this.obtenerTotalCursos();
        const totalSemestres = this.obtenerTotalSemestres();
        const areasUnicas = this.obtenerAreasUnicas().size;

        return {
            totalCarreras,
            totalCursos,
            totalSemestres,
            areasUnicas,
            cursosPromedioPorCarrera: totalCarreras > 0 ? Math.round(totalCursos / totalCarreras) : 0,
            semestresPromedioPorCarrera: totalCarreras > 0 ? Math.round(totalSemestres / totalCarreras) : 0
        };
    }
}
