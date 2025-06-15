#  Manual de Usuario
## Sistema de Análisis de Pensums Universitarios

---

### **Información del Sistema**
- **Versión**: 2.0.3
- **Fecha**: Diciembre 2024
- **Desarrollado para**: Análisis léxico y sintáctico de pensums universitarios
- **Lenguaje**: PLFP (Pensum Language Format Parser)

---

##  **1. Introducción**

### **¿Qué es el Sistema?**
El Sistema de Análisis de Pensums Universitarios es una aplicación web que permite:
- **Analizar** archivos de pensums universitarios escritos en lenguaje PLFP
- **Validar** la sintaxis de múltiples carreras académicas
- **Generar** pensums interactivos en formato HTML
- **Visualizar** relaciones entre cursos y prerrequisitos

### **¿Para Quién es Este Sistema?**
- **Coordinadores académicos** que gestionan pensums
- **Administradores** de sistemas educativos
- **Desarrolladores** que trabajan con datos académicos
- **Personal académico** que diseña currículos

---

##  **2. Inicio Rápido**

### **Acceso al Sistema**
1. **Abrir navegador** web (Chrome, Firefox, Safari, Edge)
2. **Navegar** a: `http://localhost:3000`
3. **Ver** la interfaz principal del editor

### **Primer Uso - 5 Minutos**
1. **Click** en "📁 Archivo" → "📂 Cargar Archivo"
2. **Seleccionar** archivo `ejemplo_test_debug.plfp`
3. **Click** en "⚡ Analizar"
4. **Ver** vista de universidad generada
5. **Click** en "🎯 Generar Pensum Interactivo"

---

##  **3. Formato de Archivos PLFP**

### **Estructura Básica**
```
Carrera: "Nombre de la Carrera" [
    Semestre: 01 {
        Curso: 101 {
            Nombre: "Nombre del Curso";
            Area: 03;
            Prerrequisitos: ();
        }
    }
]
```

### **Elementos del Lenguaje**

#### **Palabras Reservadas**
- `Carrera` - Define una carrera académica
- `Semestre` - Define un semestre dentro de una carrera
- `Curso` - Define un curso específico
- `Nombre` - Nombre del curso
- `Area` - Área académica (número)
- `Prerrequisitos` - Lista de códigos de cursos requeridos

#### **Símbolos Especiales**
- `:` - Separador de asignación
- `[` `]` - Delimitadores de carrera
- `{` `}` - Delimitadores de semestre/curso
- `(` `)` - Delimitadores de prerrequisitos
- `;` - Terminador de línea
- `,` - Separador de elementos
- `"` - Delimitador de cadenas de texto

#### **Comentarios**
```
// Este es un comentario de línea
// Los comentarios son ignorados por el analizador
```

### **Ejemplo Completo**
```
// Archivo con dos carreras
Carrera: "Ingeniería en Sistemas" [
    Semestre: 01 {
        Curso: 101 {
            Nombre: "Matemática Básica 1";
            Area: 03;
            Prerrequisitos: ();
        }
        Curso: 102 {
            Nombre: "Programación 1";
            Area: 01;
            Prerrequisitos: ();
        }
    }
    Semestre: 02 {
        Curso: 201 {
            Nombre: "Matemática Básica 2";
            Area: 03;
            Prerrequisitos: (101);
        }
        Curso: 202 {
            Nombre: "Programación 2";
            Area: 01;
            Prerrequisitos: (102);
        }
    }
]

Carrera: "Ingeniería Industrial" [
    Semestre: 01 {
        Curso: 111 {
            Nombre: "Química General";
            Area: 04;
            Prerrequisitos: ();
        }
    }
]
```

---

##  **4. Interfaz de Usuario**

### **Editor Principal**
- **Área de Texto**: Donde se escribe o pega el código PLFP
- **Botón Analizar**: Procesa el contenido y genera resultados
- **Tabla de Tokens**: Muestra el análisis léxico detallado
- **Barra de Herramientas**: Acceso a funciones principales

### **Barra de Herramientas**
- **🏠 Home**: Recarga la página principal
- **📁 Archivo**:
  - **📂 Cargar Archivo**: Abre archivos .plfp desde el disco
  - **💾 Guardar Archivo**: Guarda el contenido actual
- **🧹 Limpiar Editor**: Borra todo el contenido
- **📊 Error Report**: Muestra reporte de errores encontrados

---

##  **5. Funciones Principales**

### **5.1 Cargar Archivo**
1. **Click** en "📁 Archivo" → "📂 Cargar Archivo"
2. **Seleccionar** archivo con extensión `.plfp`
3. **Contenido** se carga automáticamente en el editor
4. **Resaltado de sintaxis** se aplica automáticamente

### **5.2 Analizar Contenido**
1. **Escribir o cargar** código PLFP en el editor
2. **Click** en "⚡ Analizar"
3. **Esperar** procesamiento (indicador de carga)
4. **Ver resultados**:
   - **Sin errores**: Se abre vista de universidad
   - **Con errores**: Se muestra reporte de errores

### **5.3 Vista de Universidad**
Cuando el análisis es exitoso:
- **Estadísticas globales**: Total carreras, cursos, áreas
- **Cards de carreras**: Una por cada carrera con estadísticas
- **Información detallada**: Semestres, cursos y áreas por carrera

### **5.4 Generar Pensum Interactivo**
1. **En vista universidad**: Click "🎯 Generar Pensum Interactivo"
2. **Nueva ventana** se abre con el pensum
3. **Funcionalidades**:
   - **Click en curso**: Resalta prerrequisitos
   - **Colores**: Azul (seleccionado), Naranja (prerrequisito)
   - **Navegación**: Por semestres y cursos

---

##  **6. Características Visuales**

### **Resaltado de Sintaxis**
- **Palabras reservadas**: Color azul
- **Números**: Color verde
- **Cadenas de texto**: Color rojo
- **Símbolos**: Color morado
- **Comentarios**: Color gris cursiva

### **Pensum Interactivo**
- **Diseño responsivo**: Se adapta a móviles y tablets
- **Hover effects**: Efectos al pasar el mouse
- **Animaciones suaves**: Transiciones fluidas
- **Colores profesionales**: Paleta corporativa moderna

---

##  **7. Solución de Problemas**

### **Problemas Comunes**

#### **Error: "El editor está vacío"**
- **Causa**: No hay contenido en el editor
- **Solución**: Escribir código PLFP o cargar un archivo

#### **Error: "Se encontraron errores léxicos"**
- **Causa**: Caracteres no reconocidos en el código
- **Solución**: 
  1. Revisar reporte de errores
  2. Corregir caracteres señalados
  3. Verificar uso correcto de símbolos

#### **Error: "Se encontraron errores sintácticos"**
- **Causa**: Estructura incorrecta del código
- **Solución**:
  1. Verificar que todas las llaves `{}` estén balanceadas
  2. Verificar que todos los elementos terminen con `;`
  3. Verificar estructura `Carrera → Semestre → Curso`

#### **No se genera pensum al hacer click**
- **Causa**: Posibles problemas de navegador
- **Solución**:
  1. Verificar que pop-ups no estén bloqueados
  2. Refrescar página con Ctrl + F5
  3. Probar en otro navegador

### **Códigos de Error**

#### **Errores Léxicos**
- **Carácter no reconocido**: Símbolos no válidos en el lenguaje
- **Cadena sin cerrar**: Comillas `"` sin pareja
- **Número mal formado**: Números con formato incorrecto

#### **Errores Sintácticos**
- **Token esperado**: Se esperaba un símbolo específico
- **Estructura incorrecta**: Jerarquía no respetada
- **Elemento faltante**: Campos obligatorios ausentes

---

##  **8. Reportes y Estadísticas**

### **Reporte de Errores**
- **Ubicación exacta**: Fila y columna del error
- **Descripción detallada**: Qué se esperaba vs qué se encontró
- **Tipo de error**: Léxico o sintáctico
- **Sugerencias**: Cómo corregir el error

### **Estadísticas de Universidad**
- **Total de carreras**: Número de carreras analizadas
- **Total de cursos**: Suma de todos los cursos
- **Áreas académicas**: Cantidad de áreas diferentes
- **Promedios**: Cursos y semestres por carrera

### **Validaciones Automáticas**
- **Códigos únicos**: Detecta códigos duplicados entre carreras
- **Prerrequisitos válidos**: Verifica que existan los cursos referenciados
- **Estructura jerárquica**: Valida organización correcta

---

##  **9. Consejos y Mejores Prácticas**

### **Escritura de Código PLFP**
1. **Usar comentarios** para documentar secciones
2. **Mantener indentación** consistente para legibilidad
3. **Verificar balance** de llaves y paréntesis
4. **Nombrar cursos** de forma descriptiva
5. **Organizar prerrequisitos** lógicamente

### **Organización de Archivos**
- **Un archivo por universidad** o institución
- **Nombres descriptivos**: `universidad_usac_2024.plfp`
- **Versioning**: Incluir fecha o versión en nombre
- **Backup**: Mantener copias de seguridad

### **Flujo de Trabajo Recomendado**
1. **Planificar** estructura de carreras
2. **Escribir** carrera por carrera
3. **Probar** frecuentemente con análisis
4. **Corregir** errores inmediatamente
5. **Documentar** con comentarios

---

##  **10. Casos de Uso**

### **Caso 1: Validación de Pensum Nuevo**
1. **Recibir** propuesta de pensum en formato texto
2. **Convertir** a formato PLFP
3. **Analizar** con el sistema
4. **Revisar** errores y estadísticas
5. **Generar** pensum visual para presentación

### **Caso 2: Comparación de Carreras**
1. **Cargar** archivo con múltiples carreras
2. **Analizar** para obtener estadísticas
3. **Generar** pensums individuales
4. **Comparar** estructura y prerrequisitos
5. **Identificar** diferencias y similitudes

### **Caso 3: Migración de Datos**
1. **Preparar** datos existentes en formato PLFP
2. **Validar** estructura con analizador
3. **Corregir** errores encontrados
4. **Exportar** pensums para sistema final
5. **Verificar** integridad de datos

---

##  **11. Soporte y Contacto**

### **Documentación Adicional**
- **Manual Técnico**: Para desarrolladores e administradores
- **Ejemplos**: Archivos de ejemplo en la instalación
- **FAQ**: Preguntas frecuentes en documentación

### **Problemas No Resueltos**
1. **Verificar** manual técnico para detalles avanzados
2. **Revisar** logs del servidor (para administradores)
3. **Probar** con navegador diferente
4. **Contactar** al equipo de desarrollo

---

##  **12. Apéndices**

### **Apéndice A: Atajos de Teclado**
- **Ctrl + A**: Seleccionar todo el texto
- **Ctrl + C/V**: Copiar/Pegar
- **Ctrl + Z**: Deshacer
- **F5**: Refrescar página
- **Ctrl + F5**: Refrescar forzado (limpiar cache)

### **Apéndice B: Compatibilidad de Navegadores**
- **Chrome 90+**: ✅ Totalmente compatible
- **Firefox 88+**: ✅ Totalmente compatible
- **Safari 14+**: ✅ Totalmente compatible
- **Edge 90+**: ✅ Totalmente compatible
- **Internet Explorer**: ❌ No compatible

### **Apéndice C: Limitaciones Conocidas**
- **Tamaño de archivo**: Máximo recomendado 1MB
- **Número de carreras**: Sin límite técnico, pero recomendado máximo 10 para rendimiento
- **Códigos de curso**: Deben ser números enteros positivos
- **Nombres de curso**: Máximo 255 caracteres

---

##  **Resumen**

Este manual proporciona toda la información necesaria para usar efectivamente el Sistema de Análisis de Pensums Universitarios. Para uso básico, seguir la sección de **Inicio Rápido**. Para uso avanzado, consultar secciones específicas según la necesidad.
