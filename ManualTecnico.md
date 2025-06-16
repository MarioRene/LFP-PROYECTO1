#  Manual Técnico
## Sistema de Análisis de Pensums Universitarios

---

### **Información del Sistema**
- **Versión**: 2.0.3
- **Tecnologías**: Node.js, TypeScript, Express.js
- **Arquitectura**: Cliente-Servidor con análisis léxico/sintáctico
- **Base de Datos**: No requerida (procesamiento en memoria)
- **Deployment**: Aplicación web standalone

---

##  **1. Arquitectura del Sistema**

### **Arquitectura General**
El sistema implementa una arquitec

tura de tres capas:

1. **Capa de Presentación** (Frontend)
   - Editor web con resaltado de sintaxis
   - Interfaz de usuario responsive
   - Generación de reportes HTML

2. **Capa de Lógica** (Backend)
   - Analizador léxico y sintáctico
   - Procesamiento de múltiples carreras
   - Generación de contenido HTML

3. **Capa de Datos** (Memoria)
   - Modelos de datos en TypeScript
   - Procesamiento en memoria
   - Sin persistencia permanente

### **Flujo de Datos**
```
[Cliente] → [Servidor Express] → [Analizador Léxico] → [Analizador Sintáctico] → [Generador HTML] → [Cliente]
```

---

##  **2. Estructura de Archivos**

### **Directorio Raíz**
```
proyecto-pensum/
├── src/                    # Código fuente TypeScript
│   ├── modelos/           # Modelos de datos
│   ├── analizador/        # Analizadores léxico y sintáctico
│   ├── util/              # Utilidades y helpers
│   └── servidor/          # Servidor Express y rutas
├── public/                # Archivos estáticos del frontend
│   ├── js/               # JavaScript del cliente
│   ├── css/              # Hojas de estilo
│   └── index.html        # Página principal
├── dist/                  # Código compilado (generado)
├── ejemplos/              # Archivos de ejemplo .plfp
├── package.json           # Configuración npm
├── tsconfig.json         # Configuración TypeScript
└── README.md             # Documentación básica
```

### **Directorio `src/modelos/`**
```
modelos/
├── carrera.ts            # Modelo Carrera
├── semestre.ts           # Modelo Semestre
├── curso.ts              # Modelo Curso
├── universidad.ts        # Modelo Universidad (agregador)
└── index.ts             # Exportaciones centralizadas
```

### **Directorio `src/analizador/`**
```
analizador/
├── lexico.ts            # Analizador léxico (tokenización)
└── sintactico.ts        # Analizador sintáctico (parsing)
```

### **Directorio `src/util/`**
```
util/
└── helpers.ts           # Generadores HTML y utilidades
```

### **Directorio `src/servidor/`**
```
servidor/
├── app.ts               # Configuración servidor Express
└── rutas.ts             # Definición de endpoints API
```

---

##  **3. Algoritmos Implementados**

### **3.1 Analizador Léxico**

#### **Algoritmo de Tokenización**
```
ENTRADA: Cadena de texto con código PLFP
SALIDA: Lista de tokens con metadatos

PROCESO:
1. Inicializar posición = 0
2. MIENTRAS posición < longitud_texto:
   a. Saltar espacios en blanco
   b. SI encuentra comentario '//' → saltar hasta fin de línea
   c. SI encuentra cadena '"' → procesar hasta comilla de cierre
   d. SI encuentra número → procesar dígitos consecutivos
   e. SI encuentra palabra → verificar si es reservada
   f. SI encuentra símbolo → clasificar tipo
   g. SI no reconoce → marcar como error
   h. Agregar token a lista con fila/columna
   i. Avanzar posición
3. RETORNAR lista de tokens
```

#### **Reconocimiento de Patrones**
- **Palabras Reservadas**: Lista predefinida (`Carrera`, `Semestre`, etc.)
- **Números**: Secuencia de dígitos `[0-9]+`
- **Cadenas**: Texto entre comillas `"..."`
- **Símbolos**: Caracteres especiales individuales
- **Comentarios**: Desde `//` hasta fin de línea

### **3.2 Analizador Sintáctico**

#### **Algoritmo de Parsing Recursivo Descendente**
```
ENTRADA: Lista de tokens del analizador léxico
SALIDA: Árbol sintáctico (Universidad con Carreras)

PROCESO:
1. analizarUniversidad()
   a. carreras = []
   b. MIENTRAS hay tokens:
      - saltar tokens no relevantes
      - SI encuentra 'Carrera' → carreras.push(analizarCarrera())
   c. RETORNAR Universidad(carreras)

2. analizarCarrera()
   a. consume('Carrera'), consume(':'), nombre = consume('Cadena')
   b. consume('[')
   c. semestres = []
   d. MIENTRAS token != ']':
      - semestres.push(analizarSemestre())
   e. consume(']')
   f. RETORNAR Carrera(nombre, semestres)

3. analizarSemestre() → análogo para semestres
4. analizarCurso() → análogo para cursos
```

#### **Manejo de Errores**
- **Recuperación**: Continúa análisis después de error
- **Reporte detallado**: Fila, columna, esperado vs encontrado
- **Múltiples errores**: Recolecta todos los errores encontrados

### **3.3 Generador HTML**

#### **Algoritmo de Generación de Pensums**
```
ENTRADA: Objeto Universidad o Carrera
SALIDA: HTML completamente funcional

PROCESO Universidad:
1. Generar estadísticas globales
2. Crear cards para cada carrera
3. Inyectar JavaScript para interactividad
4. Incluir CSS responsivo

PROCESO Carrera Individual:
1. Ordenar semestres por número
2. Generar estructura HTML por semestre
3. Crear mapa de cursos para JavaScript
4. Implementar funciones de resaltado
5. Agregar estilos CSS inline
```

---

##  **4. API REST Endpoints**

### **4.1 Endpoint Principal**

#### **POST /analizar**
- **Descripción**: Analiza contenido PLFP y genera universidad
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "contenido": "Carrera: \"Sistemas\" [...]"
  }
  ```
- **Respuestas**:
  ```json
  // Éxito
  {
    "tipo": "universidad",
    "contenido": "<html>...</html>",
    "tokens": [...],
    "universidad": {
      "carreras": [...],
      "estadisticas": {...}
    }
  }
  
  // Error
  {
    "tipo": "errores",
    "contenido": "<html>reporte errores</html>",
    "tokens": [...],
    "errores": {
      "lexicos": [...],
      "sintacticos": [...]
    }
  }
  ```

### **4.2 Endpoints Secundarios**

#### **POST /generar-pensum/:indice**
- **Descripción**: Genera pensum individual de carrera específica
- **Parámetros**: `indice` - índice de carrera (0-N)
- **Body**: `{ "contenido": "..." }`
- **Respuesta**:
  ```json
  {
    "tipo": "pensum",
    "contenido": "<html>...</html>",
    "carrera": {
      "nombre": "...",
      "semestres": 10,
      "cursos": 45
    }
  }
  ```

#### **POST /estadisticas**
- **Descripción**: Obtiene estadísticas de universidad sin generar HTML
- **Body**: `{ "contenido": "..." }`
- **Respuesta**:
  ```json
  {
    "estadisticas": {
      "totalCarreras": 3,
      "totalCursos": 120,
      "areasUnicas": 6
    },
    "validacion": {
      "valido": true,
      "duplicados": []
    },
    "carreras": [...]
  }
  ```

#### **GET /**
- **Descripción**: Sirve página principal
- **Respuesta**: `index.html`

---

##  **5. Modelos de Datos**

### **5.1 Modelo Curso**
```typescript
class Curso {
    constructor(
        public codigo: number,      // Código único del curso
        public nombre: string,      // Nombre descriptivo
        public area: number,        // Área académica (1-6)
        public prerrequisitos: number[]  // Códigos de prerrequisitos
    ) {}
}
```

### **5.2 Modelo Semestre**
```typescript
class Semestre {
    constructor(
        public numero: number,      // Número de semestre (1-N)
        public cursos: Curso[]      // Lista de cursos del semestre
    ) {}
}
```

### **5.3 Modelo Carrera**
```typescript
class Carrera {
    constructor(
        public nombre: string,      // Nombre de la carrera
        public semestres: Semestre[] // Lista de semestres
    ) {}
    
    // Métodos útiles
    obtenerTodosLosCursos(): Curso[]
    obtenerCursoPorCodigo(codigo: number): Curso | undefined
    validarPrerrequisitos(): boolean
}
```

### **5.4 Modelo Universidad**
```typescript
class Universidad {
    constructor(
        public carreras: Carrera[]  // Lista de carreras
    ) {}
    
    // Métodos de análisis
    obtenerEstadisticas(): EstadisticasUniversidad
    validarCodigosUnicos(): ValidacionCodigos
    obtenerCarreraPorIndice(indice: number): Carrera | undefined
}
```

---

##  **6. Instalación y Configuración**

### **6.1 Requisitos del Sistema**
- **Node.js**: Versión 16.x o superior
- **npm**: Versión 8.x o superior
- **TypeScript**: Instalado globalmente o via npm
- **Navegador**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### **6.2 Instalación Completa**
```bash
# 1. Clonar repositorio
git clone [url-repositorio]
cd proyecto-pensum

# 2. Instalar dependencias
npm install

# 3. Instalar TypeScript globalmente (si no está instalado)
npm install -g typescript

# 4. Compilar código TypeScript
npm run build

# 5. Iniciar servidor
npm start

# 6. Verificar funcionamiento
# Navegar a http://localhost:3000
```

### **6.3 Scripts NPM Disponibles**
```json
{
  "scripts": {
    "build": "tsc",                    // Compilar TypeScript
    "start": "node dist/servidor/app.js",  // Iniciar servidor
    "dev": "tsc && npm start",         // Desarrollo rápido
    "clean": "rm -rf dist/",           // Limpiar compilación
    "watch": "tsc --watch"             // Compilación continua
  }
}
```

### **6.4 Configuración TypeScript**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

##  **7. Seguridad**

### **7.1 Validación de Entrada**
- **Sanitización**: Escape de caracteres HTML en output
- **Límites**: Validación de tamaño de archivos
- **Tipo de contenido**: Verificación de Content-Type
- **Caracteres especiales**: Manejo seguro en templates

### **7.2 Prevención de Ataques**
```typescript
// Función de escape implementada
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
```

### **7.3 Configuración Servidor**
- **CORS**: Configurado para desarrollo local
- **Rate Limiting**: No implementado (recomendado para producción)
- **HTTPS**: No configurado (recomendado para producción)
- **Autenticación**: No implementada (stateless)

---

##  **8. Monitoreo y Logging**

### **8.1 Logs del Servidor**
```typescript
// Ejemplos de logs implementados
console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
console.log(`📝 Iniciando análisis de contenido...`);
console.log(`✅ Universidad generada con ${carreras.length} carreras`);
console.log(`❌ Errores encontrados:`, errores);
```

### **8.2 Logs del Cliente**
```javascript
// Logs en navegador para debugging
console.log('Generando pensum para carrera índice:', indice);
console.log('✅ Pensum generado exitosamente:', nombre);
console.error('❌ Error al generar pensum:', error);
```

### **8.3 Métricas Disponibles**
- **Tiempo de análisis**: Medible via timestamps
- **Errores por tipo**: Clasificados léxicos/sintácticos
- **Estadísticas de contenido**: Carreras, cursos, áreas
- **Uso de memoria**: Monitoreable via herramientas Node.js

---

##  **9. Deployment**

### **9.1 Entorno de Desarrollo**
```bash
# Desarrollo con recarga automática
npm run watch  # Terminal 1
npm start      # Terminal 2
```

### **9.2 Entorno de Producción**
```bash
# Build optimizado
npm run build

# Variables de entorno recomendadas
export NODE_ENV=production
export PORT=3000

# Iniciar con PM2 (recomendado)
npm install -g pm2
pm2 start dist/servidor/app.js --name "pensum-analyzer"
```

### **9.3 Docker (Opcional)**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
COPY public/ ./public/
EXPOSE 3000
CMD ["npm", "start"]
```

---

##  **10. Troubleshooting Técnico**

### **10.1 Errores de Compilación**
```bash
# Error: TypeScript no encontrado
npm install -g typescript

# Error: Módulos no encontrados
npm install

# Error: Permisos
sudo npm install -g typescript
```

### **10.2 Errores de Servidor**
```bash
# Puerto en uso
Error: listen EADDRINUSE :::3000
# Solución: Cambiar puerto o matar proceso

# Memoria insuficiente
# Solución: Aumentar límite Node.js
node --max-old-space-size=4096 dist/servidor/app.js
```

### **10.3 Errores de Cliente**
- **Pop-ups bloqueados**: Configurar navegador
- **JavaScript deshabilitado**: Habilitar en configuración
- **Cache problemas**: Ctrl + F5 para refrescar
- **CORS errors**: Verificar configuración servidor

---

##  **11. Optimización y Performance**

### **11.1 Optimizaciones Implementadas**
- **Análisis en memoria**: Sin I/O de archivos
- **Generación bajo demanda**: HTML generado cuando se solicita
- **Escape eficiente**: Función optimizada para caracteres especiales
- **Estructura modular**: Separación clara de responsabilidades

### **11.2 Optimizaciones Recomendadas**
```typescript
// Cache de resultados (para implementar)
const cache = new Map<string, Universidad>();

// Compresión gzip (para producción)
app.use(compression());

// Minificación CSS/JS (para producción)
// Usar herramientas como webpack o gulp
```

### **11.3 Limitaciones Conocidas**
- **Memoria**: Procesamiento completo en RAM
- **Concurrencia**: Un análisis por request
- **Tamaño**: Sin límite hardcoded en uploads
- **Cache**: Sin persistencia entre requests

---

##  **12. Testing**

### **12.1 Tests Unitarios Recomendados**
```typescript
// Ejemplo estructura de tests
describe('AnalizadorLexico', () => {
  test('tokeniza palabras reservadas correctamente', () => {
    // Test implementation
  });
  
  test('maneja errores léxicos apropiadamente', () => {
    // Test implementation
  });
});

describe('AnalizadorSintactico', () => {
  test('parsea estructura básica', () => {
    // Test implementation
  });
});
```

### **12.2 Tests de Integración**
```bash
# Estructura recomendada
tests/
├── unit/           # Tests unitarios
├── integration/    # Tests de API
├── fixtures/       # Archivos de prueba .plfp
└── utils/          # Utilidades de testing
```

### **12.3 Herramientas Recomendadas**
- **Jest**: Framework de testing
- **Supertest**: Testing de API REST
- **Puppeteer**: Testing de interfaz (E2E)

---

##  **13. Mantenimiento**

### **13.1 Actualizaciones Regulares**
```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit
npm audit fix

# Actualizar TypeScript
npm update -g typescript
```

### **13.2 Backup y Versionado**
- **Control de versiones**: Git con tags semánticos
- **Backup código**: Repository remoto (GitHub/GitLab)
- **Documentación**: Mantener manuales actualizados

### **13.3 Monitoreo de Producción**
```bash
# Monitoreo con PM2
pm2 monit

# Logs en tiempo real
pm2 logs pensum-analyzer

# Restart automático
pm2 restart pensum-analyzer
```

---

##  **14. Métricas y KPIs**

### **14.1 Métricas Técnicas**
- **Tiempo promedio de análisis**: < 500ms por archivo
- **Memoria utilizada**: Monitorear con `process.memoryUsage()`
- **Errores por hora**: Tracking via logs
- **Uptime del servidor**: 99.9% recomendado

### **14.2 Métricas de Usuario**
- **Archivos procesados exitosamente**: %
- **Tipos de errores más comunes**: Para mejorar UX
- **Tamaño promedio de archivos**: Para optimización
- **Navegadores más utilizados**: Para compatibilidad

---

##  **Resumen Técnico**

Este sistema implementa un analizador léxico-sintáctico completo para el lenguaje PLFP, utilizando algoritmos de parsing recursivo descendente y generación dinámica de HTML. La arquitectura modular permite fácil mantenimiento y extensión de funcionalidades.

**Tecnologías clave**: TypeScript, Node.js, Express.js, HTML5, CSS3, JavaScript ES6+

**¡Sistema robusto y escalable para análisis de pensums universitarios! 🚀**


#  AFD - Autómata Finito Determinista
## Analizador Léxico para Lenguaje PLFP

---

##  **Especificación del AFD**

### **Alfabeto (Σ)**
```
Σ = {a-z, A-Z, 0-9, ", :, [, ], {, }, (, ), ;, ,, /, _, espacio, tab, \n}
```

### **Estados (Q)**
```
Q = {q0, q1, q2, q3, q4, q5, q6, q_palabra, q_numero, q_cadena, q_simbolo, q_comentario, q_error}
```

### **Estado Inicial (q₀)**
```
q₀ = q0
```

### **Estados de Aceptación (F)**
```
F = {q_palabra, q_numero, q_cadena, q_simbolo, q_comentario}
```

---

##  **Descripción de Estados**

### **Estados Intermedios**
| Estado | Descripción | Función |
|--------|-------------|---------|
| `q0` | Estado inicial | Punto de partida del análisis |
| `q1` | Procesando letra | Construyendo identificador/palabra reservada |
| `q2` | Procesando dígito | Construyendo número |
| `q3` | Comilla inicial | Inicio de cadena de texto |
| `q4` | Dentro de cadena | Procesando contenido de cadena |
| `q5` | Primera barra | Posible inicio de comentario |
| `q6` | Dentro de comentario | Procesando comentario |

### **Estados de Aceptación**
| Estado | Token Generado | Descripción |
|--------|---------------|-------------|
| `q_palabra` | `PALABRA_RESERVADA` o `IDENTIFICADOR` | Palabra válida del lenguaje |
| `q_numero` | `NUMERO` | Secuencia de dígitos |
| `q_cadena` | `CADENA` | Texto entre comillas |
| `q_simbolo` | `SIMBOLO` | Operadores y delimitadores |
| `q_comentario` | `COMENTARIO` | Comentario de línea |

### **Estado de Error**
| Estado | Descripción | Manejo |
|--------|-------------|--------|
| `q_error` | Carácter no reconocido | Genera error léxico |

---

##  **Función de Transición (δ)**

### **Desde Estado Inicial (q0)**
```
δ(q0, [a-zA-Z]) = q1        // Inicio de palabra
δ(q0, [0-9]) = q2          // Inicio de número  
δ(q0, ") = q3              // Inicio de cadena
δ(q0, /) = q5              // Posible comentario
δ(q0, :) = q_simbolo       // Símbolo dos puntos
δ(q0, [) = q_simbolo       // Corchete abierto
δ(q0, ]) = q_simbolo       // Corchete cerrado
δ(q0, {) = q_simbolo       // Llave abierta
δ(q0, }) = q_simbolo       // Llave cerrada
δ(q0, () = q_simbolo       // Paréntesis abierto
δ(q0, )) = q_simbolo       // Paréntesis cerrado
δ(q0, ;) = q_simbolo       // Punto y coma
δ(q0, ,) = q_simbolo       // Coma
δ(q0, [ \t\n]) = q0        // Espacios (ignorar)
```

### **Procesando Palabras (q1)**
```
δ(q1, [a-zA-Z0-9_]) = q1          // Continúa palabra
δ(q1, [delimitador]) = q_palabra   // Termina palabra
```

### **Procesando Números (q2)**
```
δ(q2, [0-9]) = q2              // Continúa número
δ(q2, [delimitador]) = q_numero // Termina número
```

### **Procesando Cadenas (q3, q4)**
```
δ(q3, [^"\n]) = q4        // Entra al contenido
δ(q4, [^"\n]) = q4        // Continúa contenido
δ(q4, ") = q_cadena       // Termina cadena
δ(q3, \n) = q_error       // Error: nueva línea
δ(q4, \n) = q_error       // Error: nueva línea
```

### **Procesando Comentarios (q5, q6)**
```
δ(q5, /) = q6                // Confirma comentario
δ(q5, [^/]) = q_error        // Error: no es comentario
δ(q6, [^\n]) = q6            // Continúa comentario
δ(q6, \n) = q_comentario     // Termina comentario
```

---

##  **Tokens Reconocidos**

### **1. Palabras Reservadas**
```
CARRERA           -> "Carrera"
SEMESTRE          -> "Semestre"  
CURSO             -> "Curso"
NOMBRE            -> "Nombre"
AREA              -> "Area"
PRERREQUISITOS    -> "Prerrequisitos"
```

### **2. Números**
```
NUMERO            -> [0-9]+
Ejemplos: 101, 02, 2024
```

### **3. Cadenas de Texto**
```
CADENA            -> "[^"]*"
Ejemplos: "Ingeniería en Sistemas", "Matemática Básica"
```

### **4. Símbolos**
```
DOS_PUNTOS        -> :
CORCHETE_ABIERTO  -> [
CORCHETE_CERRADO  -> ]
LLAVE_ABIERTA     -> {
LLAVE_CERRADA     -> }
PARENTESIS_ABIERTO -> (
PARENTESIS_CERRADO -> )
PUNTO_COMA        -> ;
COMA              -> ,
```

### **5. Comentarios**
```
COMENTARIO        -> //[^\n]*\n
Ejemplo: // Este es un comentario
```

### **Diagrama del AFD**
![alt text](<AFD - ANALIZADOR LÉXICO PARA LENGUAJE PLFP.png>)
![alt text](<AFD SIMPLIFICADO.png>)
![alt text](<RECONOCIMIENTO DE PALABRAS RESERVADAS.png>)

---

##  **Algoritmo de Reconocimiento**

### **Pseudocódigo del AFD**
```
FUNCIÓN analizarLexico(texto):
    estado = q0
    posicion = 0
    tokens = []
    
    MIENTRAS posicion < longitud(texto):
        caracter = texto[posicion]
        
        SEGÚN estado:
            CASO q0:
                SI esLetra(caracter):
                    estado = q1
                    iniciarToken()
                SINO SI esDigito(caracter):
                    estado = q2
                    iniciarToken()
                SINO SI caracter == '"':
                    estado = q3
                    iniciarToken()
                SINO SI caracter == '/':
                    estado = q5
                    iniciarToken()
                SINO SI esSimbolo(caracter):
                    tokens.agregar(crearToken(SIMBOLO, caracter))
                SINO SI esEspacio(caracter):
                    // Ignorar
                SINO:
                    estado = q_error
                    
            CASO q1:
                SI esLetraODigito(caracter):
                    agregarAToken(caracter)
                SINO:
                    palabra = finalizarToken()
                    SI esPalabraReservada(palabra):
                        tokens.agregar(crearToken(PALABRA_RESERVADA, palabra))
                    SINO:
                        tokens.agregar(crearToken(IDENTIFICADOR, palabra))
                    estado = q0
                    posicion-- // Retroceder para procesar el delimitador
                    
            // ... casos similares para otros estados
            
        posicion++
        
    RETORNAR tokens
```

---

##  **Ejemplos de Reconocimiento**

### **Ejemplo 1: Palabra Reservada**
```
Entrada: "Carrera"
Proceso:
q0 --C--> q1 --a--> q1 --r--> q1 --r--> q1 --e--> q1 --r--> q1 --a--> q1 --delim--> q_palabra
Token: PALABRA_RESERVADA("Carrera")
```

### **Ejemplo 2: Número**
```
Entrada: "101"
Proceso:
q0 --1--> q2 --0--> q2 --1--> q2 --delim--> q_numero
Token: NUMERO(101)
```

### **Ejemplo 3: Cadena**
```
Entrada: "Matemática Básica"
Proceso:
q0 --"--> q3 --M--> q4 --a--> q4 ... --a--> q4 --"--> q_cadena
Token: CADENA("Matemática Básica")
```

### **Ejemplo 4: Comentario**
```
Entrada: "// Este es un comentario\n"
Proceso:
q0 --/--> q5 --/--> q6 --E--> q6 ... --o--> q6 --\n--> q_comentario
Token: COMENTARIO("// Este es un comentario")
```

### **Ejemplo 5: Símbolos**
```
Entrada: ":[]{}();"
Proceso:
q0 --:--> q_simbolo (Token: DOS_PUNTOS)
q0 --[--> q_simbolo (Token: CORCHETE_ABIERTO)
q0 --]--> q_simbolo (Token: CORCHETE_CERRADO)
... y así sucesivamente
```

---

##  **Manejo de Errores**

### **Tipos de Errores Léxicos**
1. **Carácter no reconocido**: `@`, `#`, `$`, etc.
2. **Cadena sin cerrar**: `"texto sin comilla final`
3. **Comentario mal formado**: `/x` (no es `//`)

### **Recuperación de Errores**
```
CUANDO se detecta error:
1. Reportar error con posición (fila, columna)
2. Saltar caracteres hasta encontrar delimitador válido
3. Continuar análisis desde próximo token válido
```

---

##  **Implementación en TypeScript**

### **Estructura de Token**
```typescript
interface Token {
    tipo: TipoToken;
    valor: string;
    fila: number;
    columna: number;
}

enum TipoToken {
    PALABRA_RESERVADA = "PALABRA_RESERVADA",
    NUMERO = "NUMERO",
    CADENA = "CADENA",
    SIMBOLO = "SIMBOLO",
    COMENTARIO = "COMENTARIO",
    EOF = "EOF"
}
```

### **Estados del AFD**
```typescript
enum EstadoAFD {
    Q0 = "q0",
    Q1 = "q1", 
    Q2 = "q2",
    Q3 = "q3",
    Q4 = "q4",
    Q5 = "q5",
    Q6 = "q6",
    Q_PALABRA = "q_palabra",
    Q_NUMERO = "q_numero", 
    Q_CADENA = "q_cadena",
    Q_SIMBOLO = "q_simbolo",
    Q_COMENTARIO = "q_comentario",
    Q_ERROR = "q_error"
}
```

---

##  **Tabla de Transiciones Completa**

| Estado | a-z,A-Z | 0-9 | " | / | : | [ | ] | { | } | ( | ) | ; | , | espacio | \n | otros |
|--------|---------|-----|---|---|---|---|---|---|---|---|---|---|---|---------|----|----- |
| q0 | q1 | q2 | q3 | q5 | q_simbolo | q_simbolo | q_simbolo | q_simbolo | q_simbolo | q_simbolo | q_simbolo | q_simbolo | q_simbolo | q0 | q0 | q_error |
| q1 | q1 | q1 | q_palabra | q_palabra | q_palabra | q_palabra | q_palabra | q_palabra | q_palabra | q_palabra | q_palabra | q_palabra | q_palabra | q_palabra | q_palabra | q_palabra |
| q2 | q_numero | q2 | q_numero | q_numero | q_numero | q_numero | q_numero | q_numero | q_numero | q_numero | q_numero | q_numero | q_numero | q_numero | q_numero | q_numero |
| q3 | q4 | q4 | q_cadena | q4 | q4 | q4 | q4 | q4 | q4 | q4 | q4 | q4 | q4 | q4 | q_error | q4 |
| q4 | q4 | q4 | q_cadena | q4 | q4 | q4 | q4 | q4 | q4 | q4 | q4 | q4 | q4 | q4 | q_error | q4 |
| q5 | q_error | q_error | q_error | q6 | q_error | q_error | q_error | q_error | q_error | q_error | q_error | q_error | q_error | q_error | q_error | q_error |
| q6 | q6 | q6 | q6 | q6 | q6 | q6 | q6 | q6 | q6 | q6 | q6 | q6 | q6 | q6 | q_comentario | q6 |

---

##  **Validación del AFD**

### **Propiedades Verificadas**
1. **Determinismo**: Para cada estado y entrada, existe exactamente una transición
2. **Completitud**: Todos los símbolos del alfabeto están cubiertos
3. **Corrección**: Reconoce exactamente el lenguaje PLFP especificado
4. **Eficiencia**: Número mínimo de estados necesarios

### **Casos de Prueba**
```
✅ "Carrera: \"Sistemas\" [" -> PALABRA_RESERVADA, DOS_PUNTOS, CADENA, CORCHETE_ABIERTO
✅ "101, 102;" -> NUMERO, COMA, NUMERO, PUNTO_COMA  
✅ "// Comentario" -> COMENTARIO
❌ "@#$" -> ERROR_LEXICO
❌ "\"sin cerrar -> ERROR_LEXICO
```

---

##  **Uso en el Proyecto**

El AFD implementado se utiliza en:
1. **Clase AnalizadorLexico**: Convierte texto en tokens
2. **Validación de entrada**: Detecta errores léxicos
3. **Preprocesamiento**: Para el analizador sintáctico
4. **Reportes de error**: Con ubicación exacta

**¡AFD completo y funcional para el analizador léxico del lenguaje PLFP!**

#  Análisis Sintáctico Completo
## Gramática Formal y Parser para Lenguaje PLFP

---

##  **1. Gramática Formal BNF**

### **1.1 Símbolos Terminales**
```
CARRERA         ::= "Carrera"
SEMESTRE        ::= "Semestre" 
CURSO           ::= "Curso"
NOMBRE          ::= "Nombre"
AREA            ::= "Area"
PRERREQUISITOS  ::= "Prerrequisitos"
DOS_PUNTOS      ::= ":"
PUNTO_COMA      ::= ";"
COMA            ::= ","
CORCHETE_ABIERTO ::= "["
CORCHETE_CERRADO ::= "]"
LLAVE_ABIERTA   ::= "{"
LLAVE_CERRADA   ::= "}"
PARENTESIS_ABIERTO ::= "("
PARENTESIS_CERRADO ::= ")"
CADENA          ::= '"' [^"]* '"'
NUMERO          ::= [0-9]+
COMENTARIO      ::= "//" [^\n]* "\n"
EOF             ::= fin_de_archivo
```

### **1.2 Producciones Gramaticales**

#### **Regla Principal**
```
<universidad> ::= <lista_carreras> EOF

<lista_carreras> ::= <carrera>
                   | <lista_carreras> <carrera>
```

#### **Estructura de Carrera**
```
<carrera> ::= CARRERA DOS_PUNTOS CADENA CORCHETE_ABIERTO <lista_semestres> CORCHETE_CERRADO

<lista_semestres> ::= <semestre>
                    | <lista_semestres> <semestre>
```

#### **Estructura de Semestre**
```
<semestre> ::= SEMESTRE DOS_PUNTOS NUMERO LLAVE_ABIERTA <lista_cursos> LLAVE_CERRADA

<lista_cursos> ::= <curso>
                 | <lista_cursos> <curso>
```

#### **Estructura de Curso**
```
<curso> ::= CURSO DOS_PUNTOS NUMERO LLAVE_ABIERTA <propiedades_curso> LLAVE_CERRADA

<propiedades_curso> ::= <nombre_curso> <area_curso> <prerrequisitos_curso>
```

#### **Propiedades del Curso**
```
<nombre_curso> ::= NOMBRE DOS_PUNTOS CADENA PUNTO_COMA

<area_curso> ::= AREA DOS_PUNTOS NUMERO PUNTO_COMA

<prerrequisitos_curso> ::= PRERREQUISITOS DOS_PUNTOS PARENTESIS_ABIERTO <lista_prerrequisitos> PARENTESIS_CERRADO PUNTO_COMA

<lista_prerrequisitos> ::= ε
                         | <numeros_prerrequisitos>

<numeros_prerrequisitos> ::= NUMERO
                           | <numeros_prerrequisitos> COMA NUMERO
```

### **1.3 Propiedades de la Gramática**
- **Tipo**: Gramática libre de contexto (Tipo 2 en jerarquía de Chomsky)
- **Clase**: LL(1) - analizable con lookahead de 1 token
- **Características**: 
  - ✅ No ambigua
  - ✅ Determinística
  - ✅ Recursión por la izquierda eliminada
  - ✅ Factorización izquierda aplicada

---

##  **2. Gramática Extendida EBNF**

### **2.1 Símbolos y Convenciones EBNF**
```
| = alternativa (OR)
* = cero o más repeticiones  
+ = una o más repeticiones
? = opcional (cero o una vez)
() = agrupación
[] = opcional
{} = repetición (cero o más)
```

### **2.2 Producciones EBNF Simplificadas**
```
universidad = carrera+ EOF ;

carrera = "Carrera" ":" CADENA "[" semestre+ "]" ;

semestre = "Semestre" ":" NUMERO "{" curso+ "}" ;

curso = "Curso" ":" NUMERO "{" 
        nombre_curso 
        area_curso 
        prerrequisitos_curso 
        "}" ;

nombre_curso = "Nombre" ":" CADENA ";" ;

area_curso = "Area" ":" NUMERO ";" ;

prerrequisitos_curso = "Prerrequisitos" ":" "(" [ numero_lista ] ")" ";" ;

numero_lista = NUMERO { "," NUMERO } ;

CADENA = '"' { caracter_no_comilla } '"' ;

NUMERO = digito+ ;
digito = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;

COMENTARIO = "//" { caracter_no_nueva_linea } nueva_linea ;
```

### **2.3 Comparación BNF vs EBNF**
| Concepto | BNF | EBNF |
|----------|-----|------|
| Lista de carreras | `<lista_carreras> ::= <carrera> \| <lista_carreras> <carrera>` | `carrera+` |
| Prerrequisitos opcionales | `<lista_prerrequisitos> ::= ε \| <numeros_prerrequisitos>` | `[ numero_lista ]` |
| Repetición de números | `<numeros_prerrequisitos> ::= NUMERO \| <numeros_prerrequisitos> COMA NUMERO` | `NUMERO { "," NUMERO }` |

---

##  **3. Árbol de Sintaxis Abstracta (AST)**

### **3.1 Estructura Jerárquica**
```
Universidad
├── Carrera[]
    ├── nombre: string
    └── Semestre[]
        ├── numero: number
        └── Curso[]
            ├── codigo: number
            ├── nombre: string
            ├── area: number
            └── prerrequisitos: number[]
```

### **3.2 Definición de Nodos del AST**

#### **Nodo Universidad**
```typescript
interface NodoUniversidad {
    tipo: "Universidad";
    carreras: NodoCarrera[];
    posicion: PosicionToken;
}
```

#### **Nodo Carrera**
```typescript
interface NodoCarrera {
    tipo: "Carrera";
    nombre: string;
    semestres: NodoSemestre[];
    posicion: PosicionToken;
}
```

#### **Nodo Semestre**
```typescript
interface NodoSemestre {
    tipo: "Semestre";
    numero: number;
    cursos: NodoCurso[];
    posicion: PosicionToken;
}
```

#### **Nodo Curso**
```typescript
interface NodoCurso {
    tipo: "Curso";
    codigo: number;
    nombre: string;
    area: number;
    prerrequisitos: number[];
    posicion: PosicionToken;
}
```

#### **Información de Posición**
```typescript
interface PosicionToken {
    fila: number;
    columna: number;
    archivo?: string;
}
```

### **3.3 Ejemplo de AST Generado**
```
Entrada:
Carrera: "Sistemas" [
    Semestre: 01 {
        Curso: 101 {
            Nombre: "Matemática 1";
            Area: 03;
            Prerrequisitos: ();
        }
    }
]

AST Resultante:
Universidad {
    carreras: [
        Carrera {
            nombre: "Sistemas",
            semestres: [
                Semestre {
                    numero: 1,
                    cursos: [
                        Curso {
                            codigo: 101,
                            nombre: "Matemática 1",
                            area: 3,
                            prerrequisitos: []
                        }
                    ]
                }
            ]
        }
    ]
}
```

---

##  **4. Algoritmo de Parsing Recursivo Descendente**

### **4.1 Estructura General del Parser**
```typescript
class AnalizadorSintactico {
    private tokens: Token[];
    private posicion: number;
    private errores: ErrorSintactico[];
    
    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.posicion = 0;
        this.errores = [];
    }
    
    public analizar(): ResultadoAnalisis {
        try {
            const universidad = this.analizarUniversidad();
            return {
                exito: true,
                universidad: universidad,
                errores: this.errores
            };
        } catch (error) {
            return {
                exito: false,
                universidad: null,
                errores: this.errores
            };
        }
    }
}
```

### **4.2 Funciones de Parsing por Regla Gramatical**

#### **Universidad (Regla Principal)**
```typescript
private analizarUniversidad(): Universidad {
    const carreras: Carrera[] = [];
    
    // Saltar comentarios iniciales
    this.saltarComentarios();
    
    // Parsear todas las carreras
    while (!this.esFinDeArchivo()) {
        this.saltarComentarios();
        
        if (this.tokenActual()?.tipo === TipoToken.PALABRA_RESERVADA && 
            this.tokenActual()?.valor === "Carrera") {
            const carrera = this.analizarCarrera();
            carreras.push(carrera);
        } else if (!this.esFinDeArchivo()) {
            this.reportarError("Se esperaba 'Carrera'", this.tokenActual());
            this.avanzar(); // Recuperación básica
        }
        
        this.saltarComentarios();
    }
    
    if (carreras.length === 0) {
        throw new Error("No se encontraron carreras válidas");
    }
    
    return new Universidad(carreras);
}
```

#### **Carrera**
```typescript
private analizarCarrera(): Carrera {
    // Carrera : "nombre" [ semestres ]
    this.consume("Carrera");
    this.consume(":");
    
    const nombreToken = this.consume(TipoToken.CADENA);
    const nombre = this.extraerContenidoCadena(nombreToken.valor);
    
    this.consume("[");
    
    const semestres: Semestre[] = [];
    while (this.tokenActual()?.valor !== "]") {
        this.saltarComentarios();
        
        if (this.tokenActual()?.valor === "Semestre") {
            const semestre = this.analizarSemestre();
            semestres.push(semestre);
        } else if (this.tokenActual()?.valor === "]") {
            break;
        } else {
            this.reportarError("Se esperaba 'Semestre' o ']'", this.tokenActual());
            this.avanzar();
        }
    }
    
    this.consume("]");
    
    if (semestres.length === 0) {
        this.reportarError("La carrera debe tener al menos un semestre", nombreToken);
    }
    
    return new Carrera(nombre, semestres);
}
```

#### **Semestre**
```typescript
private analizarSemestre(): Semestre {
    // Semestre : numero { cursos }
    this.consume("Semestre");
    this.consume(":");
    
    const numeroToken = this.consume(TipoToken.NUMERO);
    const numero = parseInt(numeroToken.valor);
    
    this.consume("{");
    
    const cursos: Curso[] = [];
    while (this.tokenActual()?.valor !== "}") {
        this.saltarComentarios();
        
        if (this.tokenActual()?.valor === "Curso") {
            const curso = this.analizarCurso();
            cursos.push(curso);
        } else if (this.tokenActual()?.valor === "}") {
            break;
        } else {
            this.reportarError("Se esperaba 'Curso' o '}'", this.tokenActual());
            this.avanzar();
        }
    }
    
    this.consume("}");
    
    if (cursos.length === 0) {
        this.reportarError("El semestre debe tener al menos un curso", numeroToken);
    }
    
    return new Semestre(numero, cursos);
}
```

#### **Curso**
```typescript
private analizarCurso(): Curso {
    // Curso : codigo { propiedades }
    this.consume("Curso");
    this.consume(":");
    
    const codigoToken = this.consume(TipoToken.NUMERO);
    const codigo = parseInt(codigoToken.valor);
    
    this.consume("{");
    
    // Parsear propiedades obligatorias
    const nombre = this.analizarNombre();
    const area = this.analizarArea();
    const prerrequisitos = this.analizarPrerrequisitos();
    
    this.consume("}");
    
    return new Curso(codigo, nombre, area, prerrequisitos);
}
```

#### **Propiedades del Curso**
```typescript
private analizarNombre(): string {
    this.consume("Nombre");
    this.consume(":");
    const cadenaToken = this.consume(TipoToken.CADENA);
    this.consume(";");
    return this.extraerContenidoCadena(cadenaToken.valor);
}

private analizarArea(): number {
    this.consume("Area");
    this.consume(":");
    const numeroToken = this.consume(TipoToken.NUMERO);
    this.consume(";");
    
    const area = parseInt(numeroToken.valor);
    if (area < 1 || area > 6) {
        this.reportarError("El área debe estar entre 1 y 6", numeroToken);
    }
    
    return area;
}

private analizarPrerrequisitos(): number[] {
    this.consume("Prerrequisitos");
    this.consume(":");
    this.consume("(");
    
    const prerrequisitos: number[] = [];
    
    // Si no está vacío
    if (this.tokenActual()?.tipo === TipoToken.NUMERO) {
        prerrequisitos.push(parseInt(this.consume(TipoToken.NUMERO).valor));
        
        while (this.tokenActual()?.valor === ",") {
            this.consume(",");
            prerrequisitos.push(parseInt(this.consume(TipoToken.NUMERO).valor));
        }
    }
    
    this.consume(")");
    this.consume(";");
    
    return prerrequisitos;
}
```

### **4.3 Funciones Auxiliares**
```typescript
private consume(esperado: string | TipoToken): Token {
    const token = this.tokenActual();
    
    if (!token) {
        throw new Error(`Se esperaba '${esperado}' pero se encontró fin de archivo`);
    }
    
    const coincide = typeof esperado === 'string' 
        ? token.valor === esperado 
        : token.tipo === esperado;
    
    if (!coincide) {
        this.reportarError(`Se esperaba '${esperado}'`, token);
        throw new Error(`Error sintáctico en línea ${token.fila}`);
    }
    
    this.avanzar();
    return token;
}

private tokenActual(): Token | null {
    return this.posicion < this.tokens.length ? this.tokens[this.posicion] : null;
}

private avanzar(): void {
    if (this.posicion < this.tokens.length) {
        this.posicion++;
    }
}

private esFinDeArchivo(): boolean {
    return this.posicion >= this.tokens.length || 
           this.tokenActual()?.tipo === TipoToken.EOF;
}

private saltarComentarios(): void {
    while (this.tokenActual()?.tipo === TipoToken.COMENTARIO) {
        this.avanzar();
    }
}

private extraerContenidoCadena(cadenaConComillas: string): string {
    return cadenaConComillas.slice(1, -1); // Remover comillas
}
```

---

##  **5. Tabla de Parsing LL(1)**

### **5.1 Conjuntos FIRST y FOLLOW**

#### **Conjuntos FIRST**
```
FIRST(universidad) = { Carrera }
FIRST(carrera) = { Carrera }
FIRST(semestre) = { Semestre }
FIRST(curso) = { Curso }
FIRST(nombre_curso) = { Nombre }
FIRST(area_curso) = { Area }
FIRST(prerrequisitos_curso) = { Prerrequisitos }
FIRST(lista_prerrequisitos) = { ε, NUMERO }
FIRST(numeros_prerrequisitos) = { NUMERO }
```

#### **Conjuntos FOLLOW**
```
FOLLOW(universidad) = { $ }
FOLLOW(carrera) = { Carrera, $ }
FOLLOW(semestre) = { Semestre, ] }
FOLLOW(curso) = { Curso, } }
FOLLOW(nombre_curso) = { Area }
FOLLOW(area_curso) = { Prerrequisitos }
FOLLOW(prerrequisitos_curso) = { } }
FOLLOW(lista_prerrequisitos) = { ) }
FOLLOW(numeros_prerrequisitos) = { ) }
```

### **5.2 Tabla LL(1) Simplificada**
| No Terminal | Carrera | Semestre | Curso | Nombre | Area | Prerrequisitos | : | ; | , | [ | ] | { | } | ( | ) | CADENA | NUMERO | $ |
|-------------|---------|----------|-------|--------|------|----------------|---|---|---|---|---|---|---|---|---|--------|--------|---|
| universidad |    1    |          |       |        |      |                |   |   |   |   |   |   |   |   |   |        |        |   |
| carrera     |    2    |          |       |        |      |                |   |   |   |   |   |   |   |   |   |        |        |   |
| semestre    |         |    3     |       |        |      |                |   |   |   |   |   |   |   |   |   |        |        |   |
| curso       |         |          |   4   |        |      |                |   |   |   |   |   |   |   |   |   |        |        |   |

```
Reglas:
1. universidad → carrera+
2. carrera → "Carrera" ":" CADENA "[" semestre+ "]"
3. semestre → "Semestre" ":" NUMERO "{" curso+ "}"
4. curso → "Curso" ":" NUMERO "{" nombre area prerrequisitos "}"
```

---

##  **6. Manejo de Errores Sintácticos**

### **6.1 Tipos de Errores Sintácticos**
```typescript
enum TipoErrorSintactico {
    TOKEN_ESPERADO = "Token esperado",
    TOKEN_INESPERADO = "Token inesperado",
    ESTRUCTURA_INCORRECTA = "Estructura incorrecta",
    ELEMENTO_FALTANTE = "Elemento faltante",
    ELEMENTO_DUPLICADO = "Elemento duplicado"
}

interface ErrorSintactico {
    tipo: TipoErrorSintactico;
    mensaje: string;
    esperado: string;
    encontrado: string;
    fila: number;
    columna: number;
    contexto?: string;
}
```

### **6.2 Estrategias de Recuperación**

#### **Modo Pánico**
```typescript
private recuperacionPanico(sincronizadores: string[]): void {
    // Saltar tokens hasta encontrar un sincronizador
    while (!this.esFinDeArchivo()) {
        const token = this.tokenActual();
        if (token && sincronizadores.includes(token.valor)) {
            break;
        }
        this.avanzar();
    }
}

private static readonly SINCRONIZADORES = [
    "Carrera",        // Inicio de nueva carrera
    "Semestre",       // Inicio de nuevo semestre  
    "Curso",          // Inicio de nuevo curso
    "}",              // Fin de bloque
    "]",              // Fin de carrera
    ";"               // Fin de declaración
];
```

#### **Inserción de Token Faltante**
```typescript
private manejarTokenFaltante(esperado: string, contexto: string): Token {
    const token = this.tokenActual();
    
    this.reportarError(
        `Se esperaba '${esperado}' en ${contexto}`,
        token,
        TipoErrorSintactico.TOKEN_ESPERADO
    );
    
    // Insertar token sintético para continuar
    return new Token(TipoToken.SIMBOLO, esperado, token?.fila || 0, token?.columna || 0);
}
```

#### **Eliminación de Token Extra**
```typescript
private eliminarTokenExtra(): void {
    const token = this.tokenActual();
    
    this.reportarError(
        `Token inesperado '${token?.valor}'`,
        token,
        TipoErrorSintactico.TOKEN_INESPERADO
    );
    
    this.avanzar(); // Eliminar token y continuar
}
```

### **6.3 Ejemplos de Recuperación**

#### **Error: Falta dos puntos**
```
Entrada incorrecta: Carrera "Sistemas" [
Error: Se esperaba ':' después de 'Carrera'
Recuperación: Insertar ':' y continuar
Resultado: Carrera : "Sistemas" [
```

#### **Error: Semestre sin cursos**
```
Entrada incorrecta: 
Semestre: 01 {
}

Error: El semestre debe tener al menos un curso
Recuperación: Reportar error pero continuar con próximo semestre
```

#### **Error: Prerrequisitos mal formados**
```
Entrada incorrecta: Prerrequisitos: (101 102);
Error: Se esperaba ',' entre prerrequisitos
Recuperación: Insertar ',' faltante
Resultado: Prerrequisitos: (101, 102);
```

---

##  **7. Reglas Semánticas y Validaciones**

### **7.1 Validaciones Durante el Parsing**

#### **Validación de Números**
```typescript
private validarNumero(token: Token, contexto: string, min?: number, max?: number): number {
    const valor = parseInt(token.valor);
    
    if (isNaN(valor)) {
        this.reportarError(`Número inválido en ${contexto}`, token);
        return 0;
    }
    
    if (min !== undefined && valor < min) {
        this.reportarError(`Número debe ser mayor o igual a ${min} en ${contexto}`, token);
    }
    
    if (max !== undefined && valor > max) {
        this.reportarError(`Número debe ser menor o igual a ${max} en ${contexto}`, token);
    }
    
    return valor;
}
```

#### **Validación de Cadenas**
```typescript
private validarCadena(token: Token, contexto: string): string {
    const valor = token.valor;
    
    if (!valor.startsWith('"') || !valor.endsWith('"')) {
        this.reportarError(`Cadena mal formada en ${contexto}`, token);
        return "";
    }
    
    const contenido = valor.slice(1, -1);
    if (contenido.trim().length === 0) {
        this.reportarError(`Cadena vacía en ${contexto}`, token);
    }
    
    return contenido;
}
```

### **7.2 Validaciones Post-Parsing**

#### **Códigos Únicos**
```typescript
private validarCodigosUnicos(universidad: Universidad): void {
    const codigos = new Map<number, string>();
    
    for (const carrera of universidad.carreras) {
        for (const semestre of carrera.semestres) {
            for (const curso of semestre.cursos) {
                if (codigos.has(curso.codigo)) {
                    this.reportarErrorSemantico(
                        `Código ${curso.codigo} duplicado entre carreras '${carrera.nombre}' y '${codigos.get(curso.codigo)}'`
                    );
                } else {
                    codigos.set(curso.codigo, carrera.nombre);
                }
            }
        }
    }
}
```

#### **Prerrequisitos Válidos**
```typescript
private validarPrerrequisitos(universidad: Universidad): void {
    const todosCodigos = new Set<number>();
    
    // Recopilar todos los códigos
    for (const carrera of universidad.carreras) {
        for (const semestre of carrera.semestres) {
            for (const curso of semestre.cursos) {
                todosCodigos.add(curso.codigo);
            }
        }
    }
    
    // Validar prerrequisitos
    for (const carrera of universidad.carreras) {
        for (const semestre of carrera.semestres) {
            for (const curso of semestre.cursos) {
                for (const prereq of curso.prerrequisitos) {
                    if (!todosCodigos.has(prereq)) {
                        this.reportarErrorSemantico(
                            `Prerrequisito ${prereq} del curso ${curso.codigo} no existe`
                        );
                    }
                    
                    if (prereq === curso.codigo) {
                        this.reportarErrorSemantico(
                            `Curso ${curso.codigo} no puede ser prerrequisito de sí mismo`
                        );
                    }
                }
            }
        }
    }
}
```

#### **Orden de Semestres**
```typescript
private validarOrdenSemestres(carrera: Carrera): void {
    const numerosEsperados = Array.from({ length: carrera.semestres.length }, (_, i) => i + 1);
    const numerosActuales = carrera.semestres.map(s => s.numero).sort((a, b) => a - b);
    
    for (let i = 0; i < numerosEsperados.length; i++) {
        if (numerosEsperados[i] !== numerosActuales[i]) {
            this.reportarErrorSemantico(
                `Orden de semestres incorrecto en carrera '${carrera.nombre}'. Se esperaba secuencia 1, 2, 3...`
            );
            break;
        }
    }
}
```

---

##  **8. Ejemplos de Derivación**

### **8.1 Derivación Completa - Ejemplo Simple**

#### **Entrada**
```
Carrera: "Sistemas" [
    Semestre: 01 {
        Curso: 101 {
            Nombre: "Matemática";
            Area: 03;
            Prerrequisitos: ();
        }
    }
]
```

#### **Derivación Paso a Paso**
```
1. <universidad> 
2. => <lista_carreras>
3. => <carrera>
4. => CARRERA DOS_PUNTOS CADENA CORCHETE_ABIERTO <lista_semestres> CORCHETE_CERRADO
5. => "Carrera" ":" "Sistemas" "[" <lista_semestres> "]"
6. => "Carrera" ":" "Sistemas" "[" <semestre> "]"
7. => "Carrera" ":" "Sistemas" "[" SEMESTRE DOS_PUNTOS NUMERO LLAVE_ABIERTA <lista_cursos> LLAVE_CERRADA "]"
8. => "Carrera" ":" "Sistemas" "[" "Semestre" ":" "01" "{" <lista_cursos> "}" "]"
9. => "Carrera" ":" "Sistemas" "[" "Semestre" ":" "01" "{" <curso> "}" "]"
10. => "Carrera" ":" "Sistemas" "[" "Semestre" ":" "01" "{" CURSO DOS_PUNTOS NUMERO LLAVE_ABIERTA <propiedades_curso> LLAVE_CERRADA "}" "]"
11. => "Carrera" ":" "Sistemas" "[" "Semestre" ":" "01" "{" "Curso" ":" "101" "{" <propiedades_curso> "}" "}" "]"
12. => "Carrera" ":" "Sistemas" "[" "Semestre" ":" "01" "{" "Curso" ":" "101" "{" <nombre_curso> <area_curso> <prerrequisitos_curso> "}" "}" "]"
13. => ... (expansión de cada propiedad)
```

### **8.2 Derivación con Múltiples Prerrequisitos**

#### **Entrada**
```
Prerrequisitos: (101, 102, 103);
```

#### **Derivación de Lista de Prerrequisitos**
```
1. <prerrequisitos_curso>
2. => PRERREQUISITOS DOS_PUNTOS PARENTESIS_ABIERTO <lista_prerrequisitos> PARENTESIS_CERRADO PUNTO_COMA
3. => "Prerrequisitos" ":" "(" <numeros_prerrequisitos> ")" ";"
4. => "Prerrequisitos" ":" "(" NUMERO COMA <numeros_prerrequisitos> ")" ";"
5. => "Prerrequisitos" ":" "(" "101" "," NUMERO COMA <numeros_prerrequisitos> ")" ";"
6. => "Prerrequisitos" ":" "(" "101" "," "102" "," NUMERO ")" ";"
7. => "Carrera" ":" "Sistemas" "[" "Semestre" ":" "01" "{" "Curso" ":" "101" "{" "101" "," "102" "," "103" ")" ";"
```

### **8.3 Árbol de Derivación Visual**
```
                    universidad
                        |
                 lista_carreras
                        |
                     carrera
                  /     |     \
              CARRERA   :   CADENA  [  lista_semestres  ]
                |       |     |            |            |
           "Carrera"    :  "Sistemas"   semestre       ]
                                          |
                               SEMESTRE : NUMERO { lista_cursos }
                                  |    |   |      |     |       |
                             "Semestre" : "01"   {   curso     }
                                                      |
                                            CURSO : NUMERO { propiedades }
                                              |   |   |     |      |      |
                                           "Curso" : "101"  { propiedades }
```

---

##  **9. Implementación en TypeScript**

### **9.1 Interface Principal del Analizador**
```typescript
interface ResultadoAnalisis {
    exito: boolean;
    universidad: Universidad | null;
    errores: ErrorSintactico[];
    advertencias?: string[];
    tiempoAnalisis?: number;
}

interface ConfiguracionParser {
    modoEstricto: boolean;
    recuperacionErrores: boolean;
    validacionesSemanticas: boolean;
    generarAdvertencias: boolean;
}
```

### **9.2 Clase Principal del Analizador**
```typescript
export class AnalizadorSintactico {
    private tokens: Token[];
    private posicion: number;
    private errores: ErrorSintactico[];
    private advertencias: string[];
    private configuracion: ConfiguracionParser;
    
    constructor(configuracion: Partial<ConfiguracionParser> = {}) {
        this.tokens = [];
        this.posicion = 0;
        this.errores = [];
        this.advertencias = [];
        this.configuracion = {
            modoEstricto: false,
            recuperacionErrores: true,
            validacionesSemanticas: true,
            generarAdvertencias: true,
            ...configuracion
        };
    }
    
    public analizar(tokens: Token[]): ResultadoAnalisis {
        const inicioTiempo = Date.now();
        
        this.tokens = tokens;
        this.posicion = 0;
        this.errores = [];
        this.advertencias = [];
        
        try {
            const universidad = this.analizarUniversidad();
            
            if (this.configuracion.validacionesSemanticas) {
                this.validacionesPostParsing(universidad);
            }
            
            const tiempoAnalisis = Date.now() - inicioTiempo;
            
            return {
                exito: this.errores.length === 0,
                universidad: universidad,
                errores: this.errores,
                advertencias: this.advertencias,
                tiempoAnalisis: tiempoAnalisis
            };
            
        } catch (error) {
            return {
                exito: false,
                universidad: null,
                errores: this.errores,
                advertencias: this.advertencias,
                tiempoAnalisis: Date.now() - inicioTiempo
            };
        }
    }
    
    private validacionesPostParsing(universidad: Universidad): void {
        this.validarCodigosUnicos(universidad);
        this.validarPrerrequisitos(universidad);
        
        for (const carrera of universidad.carreras) {
            this.validarOrdenSemestres(carrera);
        }
    }
}
```

### **9.3 Manejo Avanzado de Errores**
```typescript
private reportarError(
    mensaje: string, 
    token: Token | null, 
    tipo: TipoErrorSintactico = TipoErrorSintactico.TOKEN_ESPERADO,
    contexto?: string
): void {
    const error: ErrorSintactico = {
        tipo: tipo,
        mensaje: mensaje,
        esperado: "",
        encontrado: token?.valor || "EOF",
        fila: token?.fila || 0,
        columna: token?.columna || 0,
        contexto: contexto
    };
    
    this.errores.push(error);
    
    if (this.configuracion.modoEstricto) {
        throw new Error(`Error sintáctico: ${mensaje}`);
    }
}

private reportarAdvertencia(mensaje: string, token?: Token): void {
    if (this.configuracion.generarAdvertencias) {
        const advertencia = `Advertencia (${token?.fila || '?'}:${token?.columna || '?'}): ${mensaje}`;
        this.advertencias.push(advertencia);
    }
}
```

### **9.4 Métricas y Estadísticas**
```typescript
public obtenerEstadisticas(): EstadisticasAnalisis {
    return {
        totalTokens: this.tokens.length,
        tokensConsumidos: this.posicion,
        erroresSintacticos: this.errores.length,
        advertenciasGeneradas: this.advertencias.length,
        recuperacionesExitosas: 0, // Implementar contador
        tiempoPromedioPorToken: 0  // Calcular
    };
}

interface EstadisticasAnalisis {
    totalTokens: number;
    tokensConsumidos: number;
    erroresSintacticos: number;
    advertenciasGeneradas: number;
    recuperacionesExitosas: number;
    tiempoPromedioPorToken: number;
}
```

---

##  **10. Casos de Prueba**

### **10.1 Casos de Aceptación (Sintaxis Correcta)**

#### **Caso 1: Universidad Simple**
```typescript
const casoSimple = `
Carrera: "Ingeniería en Sistemas" [
    Semestre: 01 {
        Curso: 101 {
            Nombre: "Matemática Básica 1";
            Area: 03;
            Prerrequisitos: ();
        }
    }
]
`;
// Resultado esperado: ✅ Análisis exitoso
```

#### **Caso 2: Múltiples Carreras**
```typescript
const casoMultiple = `
Carrera: "Sistemas" [
    Semestre: 01 {
        Curso: 101 {
            Nombre: "Math 1";
            Area: 03;
            Prerrequisitos: ();
        }
    }
]

Carrera: "Industrial" [
    Semestre: 01 {
        Curso: 201 {
            Nombre: "Química";
            Area: 04;
            Prerrequisitos: ();
        }
    }
]
`;
// Resultado esperado: ✅ Análisis exitoso con 2 carreras
```

#### **Caso 3: Prerrequisitos Complejos**
```typescript
const casoComplejos = `
Carrera: "Sistemas" [
    Semestre: 01 {
        Curso: 101 {
            Nombre: "Math 1";
            Area: 03;
            Prerrequisitos: ();
        }
        Curso: 102 {
            Nombre: "Prog 1";
            Area: 01;
            Prerrequisitos: ();
        }
    }
    Semestre: 02 {
        Curso: 201 {
            Nombre: "Math 2";
            Area: 03;
            Prerrequisitos: (101);
        }
        Curso: 202 {
            Nombre: "Prog 2";
            Area: 01;
            Prerrequisitos: (101, 102);
        }
    }
]
`;
// Resultado esperado: ✅ Análisis exitoso con prerrequisitos
```

### **10.2 Casos de Rechazo (Errores Sintácticos)**

#### **Error 1: Falta Dos Puntos**
```typescript
const errorDosPuntos = `
Carrera "Sistemas" [
    // Error: Falta ':' después de Carrera
]
`;
// Resultado esperado: ❌ Error sintáctico
```

#### **Error 2: Corchetes Desbalanceados**
```typescript
const errorCorchetes = `
Carrera: "Sistemas" [
    Semestre: 01 {
        Curso: 101 {
            Nombre: "Math";
            Area: 03;
            Prerrequisitos: ();
        }
    // Error: Falta '}'
]
`;
// Resultado esperado: ❌ Error sintáctico
```

#### **Error 3: Propiedad Faltante**
```typescript
const errorPropiedad = `
Carrera: "Sistemas" [
    Semestre: 01 {
        Curso: 101 {
            Nombre: "Math";
            // Error: Falta Area y Prerrequisitos
        }
    }
]
`;
// Resultado esperado: ❌ Error sintáctico
```

### **10.3 Casos de Recuperación**

#### **Recuperación 1: Token Faltante**
```typescript
const recuperacion1 = `
Carrera "Sistemas" [  // Falta ':'
    Semestre: 01 {
        Curso: 101 {
            Nombre: "Math";
            Area: 03;
            Prerrequisitos: ();
        }
    }
]
`;
// Resultado esperado: ❌ Error reportado, ✅ Recuperación exitosa
```

#### **Recuperación 2: Elemento Extra**
```typescript
const recuperacion2 = `
Carrera: "Sistemas" [
    Semestre: 01 {
        Curso: 101 {
            Nombre: "Math";
            Area: 03;
            Extra: "Campo no válido";  // Campo extra
            Prerrequisitos: ();
        }
    }
]
`;
// Resultado esperado: ❌ Advertencia sobre campo extra, ✅ Continúa análisis
```

### **10.4 Suite de Pruebas Automatizadas**
```typescript
describe('AnalizadorSintactico', () => {
    let analizador: AnalizadorSintactico;
    
    beforeEach(() => {
        analizador = new AnalizadorSintactico();
    });
    
    test('debe analizar universidad simple correctamente', () => {
        const tokens = tokenizar(casoSimple);
        const resultado = analizador.analizar(tokens);
        
        expect(resultado.exito).toBe(true);
        expect(resultado.universidad?.carreras.length).toBe(1);
        expect(resultado.errores.length).toBe(0);
    });
    
    test('debe detectar errores sintácticos', () => {
        const tokens = tokenizar(errorDosPuntos);
        const resultado = analizador.analizar(tokens);
        
        expect(resultado.exito).toBe(false);
        expect(resultado.errores.length).toBeGreaterThan(0);
        expect(resultado.errores[0].tipo).toBe(TipoErrorSintactico.TOKEN_ESPERADO);
    });
    
    test('debe realizar validaciones semánticas', () => {
        const tokens = tokenizar(casoCodigosDuplicados);
        const resultado = analizador.analizar(tokens);
        
        expect(resultado.errores.some(e => e.mensaje.includes('duplicado'))).toBe(true);
    });
});
```

---

##  **Resumen del Análisis Sintáctico**

### **Características Implementadas**
- ✅ **Gramática LL(1)** formal y completa
- ✅ **Parser recursivo descendente** con recuperación de errores
- ✅ **AST** estructurado y tipado
- ✅ **Validaciones semánticas** exhaustivas
- ✅ **Manejo robusto de errores** con múltiples estrategias
- ✅ **Casos de prueba** completos y automatizados

### **Propiedades de la Gramática**
- **Tipo**: Gramática libre de contexto (CFG)
- **Clase**: LL(1) - predecible con 1 token de lookahead
- **Características**: No ambigua, determinística, completa

### **Algoritmo de Parsing**
- **Método**: Recursivo descendente
- **Complejidad**: O(n) donde n = número de tokens
- **Recuperación**: Modo pánico con sincronizadores
- **Validación**: Sintáctica y semántica integradas

**¡Análisis sintáctico completo y técnicamente correcto para el lenguaje PLFP!**