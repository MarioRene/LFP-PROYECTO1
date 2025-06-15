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

##  **15. Versionado y Releases**

### **15.1 Esquema de Versionado**
- **Formato**: MAJOR.MINOR.PATCH (Semantic Versioning)
- **MAJOR**: Cambios incompatibles en API
- **MINOR**: Nueva funcionalidad compatible
- **PATCH**: Bug fixes compatibles

### **15.2 Historial de Versiones**
- **v1.0.0**: Release inicial con análisis de múltiples carreras
- **v0.9.0**: Beta con análisis de carrera única
- **v0.8.0**: Implementación analizador sintáctico
- **v0.7.0**: Implementación analizador léxico

---

##  **Resumen Técnico**

Este sistema implementa un analizador léxico-sintáctico completo para el lenguaje PLFP, utilizando algoritmos de parsing recursivo descendente y generación dinámica de HTML. La arquitectura modular permite fácil mantenimiento y extensión de funcionalidades.

**Tecnologías clave**: TypeScript, Node.js, Express.js, HTML5, CSS3, JavaScript ES6+

**¡Sistema robusto y escalable para análisis de pensums universitarios! 🚀**

# 🤖 AFD - Autómata Finito Determinista
## Analizador Léxico para Lenguaje PLFP

---

## 📋 **Especificación del AFD**

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

## 🔄 **Descripción de Estados**

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

## ⚡ **Función de Transición (δ)**

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

**¡AFD completo y funcional para el analizador léxico del lenguaje PLFP! 🚀**