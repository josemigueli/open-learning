# OpenLearning — Arquitectura y Plan de Desarrollo

## 1. Resumen del Proyecto

**OpenLearning** es una plataforma de aprendizaje de código abierto que permite crear, compartir y consumir cursos personalizados a través de un **bot de Telegram** (frontend principal) y un **backend API** que orquesta la lógica de negocio y las interacciones con IA.

### Principios fundamentales

| Principio                                                               | Descripción                                                                      |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Accesibilidad**                                                       | Priorizar usuarios con recursos limitados (smartphone + datos móviles)           |
| **IA estratégica**                                                      | La IA se usa en puntos específicos, no como agente libre                         |
| **Contenido abierto**                                                   | Los cursos son archivos Markdown que cualquiera puede crear, mejorar y compartir |
| **Uso de modelo pequeño y rápido para evitar latencia e inestabilidad** | Modelo pequeño y confiable (gpt-4o-mini) por defecto                             |
| **App estructurada**                                                    | La lógica de negocio la controla la app, no el LLM                               |

---

## 2. Decisión: ¿Bot de Telegram o App Web?

### Recomendación: **Bot de Telegram para la hackathon, con arquitectura lista para web**

| Criterio                      | Telegram Bot                 | App Web               |
| ----------------------------- | ---------------------------- | --------------------- |
| Tiempo de desarrollo          | ⭐ Muy rápido                | Más lento             |
| Accesibilidad (datos móviles) | ⭐ Bajo consumo              | Mayor consumo         |
| Costo de infraestructura      | ⭐ Solo backend              | Backend + CDN/hosting |
| UX (interactividad)           | Limitada pero suficiente     | Superior              |
| Impacto en hackathon          | ⭐ Narrativa poderosa        | Más genérica          |
| Escalabilidad futura          | Se puede agregar web después | —                     |

**Justificación**: Un bot de Telegram transmite mejor la historia de accesibilidad ("aprender desde un teléfono básico, con datos limitados"). Además, la API de Telegram ofrece inline keyboards, menús, y respuestas formateadas en Markdown que son suficientes para una experiencia rica.

> La clave es que el backend sea **agnóstico al canal** — un servicio API que pueda ser consumido tanto por el bot de Telegram como por una futura app web o bot de WhatsApp.

---

## 3. Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Telegram Bot  │  │  Web App     │  │ WhatsApp Bot │  │
│  │  (Fase 1) ✅  │  │  (Futuro)    │  │  (Futuro)    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────┬───────┘─────────────────┘           │
│                   ▼                                     │
│         ┌─────────────────┐                             │
│         │   API Gateway   │                             │
│         │   (Express.js)  │                             │
│         └────────┬────────┘                             │
└──────────────────┼──────────────────────────────────────┘
                   │
┌──────────────────┼──────────────────────────────────────┐
│                  ▼         BACKEND                      │
│  ┌───────────────────────────────────┐                  │
│  │         Core Services             │                  │
│  │  ┌────────────┐ ┌──────────────┐  │                  │
│  │  │  Learning   │ │   Course     │  │                  │
│  │  │  Engine     │ │   Manager    │  │                  │
│  │  └─────┬──────┘ └──────┬───────┘  │                  │
│  │        │               │          │                  │
│  │  ┌─────┴──────┐ ┌──────┴───────┐  │                  │
│  │  │  AI Service│ │  Content     │  │                  │
│  │  │ (Vercel AI │ │  Parser      │  │                  │
│  │  │  SDK)      │ │ (Markdown)   │  │                  │
│  │  └─────┬──────┘ └──────────────┘  │                  │
│  └────────┼──────────────────────────┘                  │
│           │                                             │
│  ┌────────┼──────────────────────────┐                  │
│  │        ▼     AI Providers         │                  │
│  │  ┌──────────┐                     │                  │
│  │  │OpenAI│                     │                  │
│  │  │ (free)   │                     │                  │
│  │  └──────────┘                     │                  │
│  └───────────────────────────────────┘                  │
│                                                         │
│  ┌───────────────────────────────────┐                  │
│  │         Base de Datos             │                  │
│  │         (SQLite + Drizzle ORM)    │                  │
│  └───────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Stack Tecnológico

| Capa               | Tecnología                    | Justificación                                                       |
| ------------------ | ----------------------------- | ------------------------------------------------------------------- |
| **Runtime**        | Node.js + TypeScript          | Ecosistema maduro, tipado fuerte, experiencia del dev               |
| **Bot Telegram**   | grammY                        | Framework moderno, tipado, middleware, buen manejo de sesiones      |
| **API**            | Express.js                    | Ligero, flexible, permite desacoplar bot del core                   |
| **IA**             | Vercel AI SDK                 | Abstrae múltiples proveedores, streaming, tool calling              |
| **Proveedores IA** | OpenAI                        | Uso de modelo pequeño y rápido para evitar latencia e inestabilidad |
| **Base de datos**  | SQLite (via better-sqlite3)   | Sin servidor externo, un solo archivo, ideal para MVP               |
| **ORM**            | Drizzle ORM                   | Typesafe, ligero, SQL-first, excelente con SQLite                   |
| **Contenido**      | Markdown + YAML frontmatter   | Estándar, portable, fácil de crear y versionar                      |
| **Monorepo**       | Estructura de carpetas simple | Sin overhead de tools como Turborepo para el MVP                    |

---

## 5. Estructura del Proyecto

```
open-learning/
├── docs/                          # Documentación del proyecto
│   ├── idea.md
│   └── architecture.md
├── packages/
│   ├── core/                      # Lógica de negocio (agnóstica al canal)
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   ├── learning.service.ts    # Motor de aprendizaje
│   │   │   │   ├── course.service.ts      # CRUD de cursos
│   │   │   │   ├── ai.service.ts          # Interacción con LLMs
│   │   │   │   ├── user.service.ts        # Gestión de usuarios
│   │   │   │   └── progress.service.ts    # Progreso del estudiante
│   │   │   ├── content/
│   │   │   │   ├── parser.ts              # Parser de Markdown + frontmatter
│   │   │   │   └── validator.ts           # Validación de estructura de cursos
│   │   │   ├── db/
│   │   │   │   ├── schema.ts              # Esquema Drizzle
│   │   │   │   ├── migrations/
│   │   │   │   └── index.ts               # Conexión
│   │   │   ├── ai/
│   │   │   │   ├── providers.ts           # Configuración de proveedores
│   │   │   │   └── prompts.ts             # Prompts estructurados
│   │   │   └── types/
│   │   │       └── index.ts               # Tipos compartidos
│   │   └── package.json
│   ├── bot/                       # Bot de Telegram
│   │   ├── src/
│   │   │   ├── bot.ts                     # Instancia del bot
│   │   │   ├── commands/                  # Comandos (/start, /cursos, etc.)
│   │   │   ├── conversations/             # Flujos conversacionales
│   │   │   ├── keyboards/                 # Inline keyboards
│   │   │   ├── middleware/                # Auth, logging, rate-limit
│   │   │   └── index.ts
│   │   └── package.json
│   └── api/                       # API REST (futuro, para app web)
│       ├── src/
│       │   ├── routes/
│       │   └── index.ts
│       └── package.json
├── courses/                       # Repositorio local de cursos
│   └── examples/
│       └── english-for-devs/
│           ├── course.yaml                # Metadatos del curso
│           ├── modules/
│           │   ├── 01-basics/
│           │   │   ├── lesson-01.md
│           │   │   └── lesson-02.md
│           │   └── 02-intermediate/
│           │       └── lesson-01.md
│           └── README.md
├── package.json                   # Workspace root
├── tsconfig.json
└── .env.example
```

---

## 6. Formato de un Curso

### 6.1 Metadatos del curso (`course.yaml`)

```yaml
id: english-for-devs
title: "Inglés para Desarrolladores de Software"
description: "Curso de inglés técnico orientado a programadores"
author: "miguel"
language: "es" # idioma de instrucción
target_language: "en" # idioma que se enseña (si aplica)
level: beginner # beginner | intermediate | advanced
tags:
  - english
  - programming
  - software-development
version: "1.0.0"
modules:
  - id: "01-basics"
    title: "Fundamentos"
    lessons:
      - id: "lesson-01"
        title: "Variables y tipos de datos en inglés"
      - id: "lesson-02"
        title: "Funciones y métodos"
  - id: "02-intermediate"
    title: "Nivel Intermedio"
    lessons:
      - id: "lesson-01"
        title: "Code reviews en inglés"
```

### 6.2 Contenido de una lección (`lesson-01.md`)

```markdown
---
title: "Variables y tipos de datos en inglés"
objectives:
  - "Aprender vocabulario técnico sobre variables"
  - "Practicar lectura de documentación en inglés"
  - "Escribir comentarios de código en inglés"
difficulty: 1
estimated_time: 20 # minutos
---

# Variables y Tipos de Datos en Inglés

## Vocabulario Clave

| Español         | English  | Ejemplo                   |
| --------------- | -------- | ------------------------- |
| Variable        | Variable | `let userName = "Miguel"` |
| Cadena de texto | String   | `"Hello, World!"`         |
| Número entero   | Integer  | `42`                      |
| Booleano        | Boolean  | `true` / `false`          |

## Lectura

In programming, a **variable** is a container that stores data values.
Variables are declared using keywords like `let`, `const`, or `var` in JavaScript...

## Práctica

### Ejercicio 1

Traduce los siguientes comentarios de código al inglés:

1. `// Esto declara una variable de tipo texto`
2. `// Esta función devuelve un número entero`
3. `// Verificar si el usuario está autenticado`
```

---

## 7. Motor de Aprendizaje (Learning Engine)

El motor de aprendizaje es la pieza central. **No es un agente libre** — es una máquina de estados que usa IA en puntos específicos.

### 7.1 Flujo de una sesión de estudio

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐
│  START   │────▶│ Seleccionar  │────▶│  Cargar     │
│          │     │ Lección      │     │  Contenido  │
└─────────┘     └──────────────┘     └──────┬──────┘
                                            │
                                            ▼
                                   ┌────────────────┐
                              ┌───▶│   Presentar    │
                              │    │   Sección      │
                              │    └───────┬────────┘
                              │            │
                              │            ▼
                              │    ┌────────────────┐
                              │    │   IA genera    │──── Punto de IA #1
                              │    │   preguntas    │     (generateObject)
                              │    └───────┬────────┘
                              │            │
                              │            ▼
                              │    ┌────────────────┐
                              │    │   Estudiante   │
                              │    │   responde     │
                              │    └───────┬────────┘
                              │            │
                              │            ▼
                              │    ┌────────────────┐
                              │    │   IA evalúa    │──── Punto de IA #2
                              │    │   respuesta    │     (generateObject)
                              │    └───────┬────────┘
                              │            │
                              │            ▼
                              │    ┌────────────────┐
                              │    │   Feedback +   │
                              │    │   Progreso     │
                              │    └───────┬────────┘
                              │            │
                              │     ┌──────┴──────┐
                              │     │ ¿Más        │
                              │     │ secciones?  │
                              │     └──────┬──────┘
                              │        Sí  │  No
                              └────────────┘  │
                                              ▼
                                     ┌────────────────┐
                                     │   Resumen de   │──── Punto de IA #3
                                     │   la sesión    │     (generateText)
                                     └────────────────┘
```

### 7.2 Puntos de uso de IA (controlados por la app)

| #   | Punto              | Método Vercel AI SDK | Input                                                 | Output                          |
| --- | ------------------ | -------------------- | ----------------------------------------------------- | ------------------------------- |
| 1   | Generar preguntas  | `generateObject()`   | Contenido de la sección + nivel del usuario           | Array de preguntas con opciones |
| 2   | Evaluar respuesta  | `generateObject()`   | Pregunta + respuesta del usuario + respuesta correcta | Evaluación + explicación        |
| 3   | Resumen de sesión  | `generateText()`     | Progreso de la sesión + respuestas                    | Resumen motivacional            |
| 4   | Generar flashcards | `generateObject()`   | Contenido de la lección                               | Array de flashcards             |

> **Nota**: Se usa `generateObject()` (no `generateText()`) con schemas Zod para obtener respuestas estructuradas y predecibles. Esto es clave para que la app controle la lógica, no el LLM.

### 7.3 Ejemplo de prompt estructurado

```typescript
// La IA NO decide qué hacer. La app le dice exactamente qué generar.
const questions = await generateObject({
  model: getAIModel(), // OpenAI
  schema: z.object({
    questions: z
      .array(
        z.object({
          question: z.string(),
          options: z.array(z.string()).length(4),
          correctIndex: z.number().min(0).max(3),
          explanation: z.string(),
          difficulty: z.enum(["easy", "medium", "hard"]),
        })
      )
      .min(3)
      .max(5),
  }),
  prompt: `Basándote en el siguiente contenido educativo, genera preguntas 
de opción múltiple para evaluar la comprensión del estudiante.

Nivel del estudiante: ${userLevel}
Contenido:
${lessonContent}

Genera entre 3 y 5 preguntas variadas.`,
});
```

---

## 8. Esquema de Base de Datos

```typescript
// packages/core/src/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  telegramId: text("telegram_id").unique(),
  name: text("name").notNull(),
  preferredLevel: text("preferred_level").default("beginner"),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  slug: text("slug").unique().notNull(), // english-for-devs
  title: text("title").notNull(),
  description: text("description"),
  authorId: text("author_id").references(() => users.id),
  language: text("language").notNull(),
  level: text("level").notNull(),
  tags: text("tags"), // JSON array serializado
  coursePath: text("course_path").notNull(), // ruta al directorio del curso
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const progress = sqliteTable("progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  courseId: text("course_id").references(() => courses.id),
  moduleId: text("module_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  status: text("status").notNull(), // not_started | in_progress | completed
  score: integer("score"), // 0-100
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  courseId: text("course_id").references(() => courses.id),
  lessonId: text("lesson_id").notNull(),
  questionsAsked: integer("questions_asked").default(0),
  correctAnswers: integer("correct_answers").default(0),
  startedAt: integer("started_at", { mode: "timestamp" }),
  finishedAt: integer("finished_at", { mode: "timestamp" }),
});
```

---

## 9. Configuración de Proveedores de IA

```typescript
// packages/core/src/ai/providers.ts
import { createOpenAI } from "@ai-sdk/openai";

// Modelo gratuito por defecto (OpenAI small model)
const DEFAULT_MODEL = "gpt-4o-mini";

export function getAIModel() {
  const provider = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return provider(DEFAULT_MODEL);
}
```

---

## 10. Flujo del Bot de Telegram

### Comandos principales

| Comando       | Descripción                                             |
| ------------- | ------------------------------------------------------- |
| `/start`      | Bienvenida + registro de usuario                        |
| `/cursos`     | Ver cursos disponibles (inline keyboard con categorías) |
| `/estudiar`   | Continuar última sesión de estudio o elegir lección     |
| `/progreso`   | Ver progreso en cursos activos                          |
| `/config`     | Configurar nivel preferido                              |
| `/flashcards` | Practicar con flashcards de una lección completada      |

### Ejemplo de interacción

```
Usuario: /start

Bot: 👋 ¡Bienvenido a OpenLearning!

Soy tu asistente de aprendizaje personalizado.
Aquí puedes aprender cualquier tema con cursos
creados por la comunidad y potenciados por IA.

¿Qué te gustaría hacer?

[📚 Ver cursos]  [🎓 Mi progreso]
[⚙️ Configurar]  [❓ Ayuda]

---

Usuario: [📚 Ver cursos]

Bot: 📚 Cursos disponibles:

🇬🇧 Inglés para Desarrolladores
   ⭐ Principiante · 2 módulos · por @miguel

📐 Cálculo para IA
   ⭐ Intermedio · 3 módulos · por @ana

[Inscribirme ▶️ Inglés para Devs]
[Inscribirme ▶️ Cálculo para IA]

---

Usuario: [Inscribirme ▶️ Inglés para Devs]

Bot: ✅ Te has inscrito en "Inglés para Desarrolladores"

📖 Módulo 1: Fundamentos
   Lección 1: Variables y tipos de datos en inglés

¿Empezamos?

[▶️ Comenzar lección]  [⬅️ Volver]
```

---

## 11. Fases de Desarrollo

### Fase 1 — MVP para la Hackathon ⏱️

**Objetivo**: Demostrar la idea central con un flujo funcional completo.

| Tarea                       | Prioridad | Descripción                                     |
| --------------------------- | --------- | ----------------------------------------------- |
| Setup del proyecto          | 🔴 Alta   | Monorepo, TypeScript, dependencias              |
| Parser de cursos            | 🔴 Alta   | Leer Markdown + YAML frontmatter                |
| Motor de aprendizaje básico | 🔴 Alta   | Flujo: presentar → preguntar → evaluar          |
| Integración IA              | 🔴 Alta   | OpenAI + Vercel AI SDK                          |
| Bot Telegram básico         | 🔴 Alta   | `/start`, `/cursos`, `/estudiar`                |
| Base de datos               | 🔴 Alta   | SQLite + schema inicial                         |
| Curso de ejemplo            | 🔴 Alta   | "Inglés para Desarrolladores" con 2-3 lecciones |
| Progreso del estudiante     | 🟡 Media  | Tracking básico de lecciones completadas        |

**Entregable**: Bot funcional que permite estudiar un curso con preguntas generadas por IA.

---

### Fase 2 — Compartir y Descubrir 🌐

| Tarea                    | Descripción                               |
| ------------------------ | ----------------------------------------- |
| Hub de cursos            | Plataforma estilo Docker Hub para cursos  |
| Importar/Exportar cursos | Subir/descargar cursos desde el bot o web |
| Reseñas y calificaciones | Los usuarios pueden calificar cursos      |
| Fork de cursos           | Copiar y modificar un curso existente     |

### Fase 3 — Escalar y Expandir 🚀

| Tarea                              | Descripción                                          |
| ---------------------------------- | ---------------------------------------------------- |
| App Web                            | Frontend web como canal alternativo                  |
| Bot WhatsApp                       | Para mayor alcance en América Latina                 |
| Flashcards + Spaced Repetition     | Sistema de repaso espaciado                          |
| Creación de cursos asistida por IA | Usar un modelo de frontera para generar el contenido |
| Gamificación                       | Racha de estudio, puntos, niveles                    |
| Multilingüe                        | Soporte para múltiples idiomas de interfaz           |

---

## 12. Variables de Entorno

```env
# .env.example

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# IA - OpenAI (modelo rapido)
OPENAI_API_KEY=your_openai_api_key

# Base de datos
DATABASE_URL=./data/openlearning.db

# Entorno
NODE_ENV=development
```

---

## 13. Dependencias Principales (Fase 1)

```json
{
  "dependencies": {
    "grammy": "^1.35.0",
    "ai": "^4.3.0",
    "@ai-sdk/openai": "^0.4.3",
    "drizzle-orm": "^0.39.0",
    "better-sqlite3": "^11.0.0",
    "gray-matter": "^4.0.3",
    "marked": "^15.0.0",
    "zod": "^3.24.0",
    "uuid": "^11.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "drizzle-kit": "^0.30.0",
    "@types/better-sqlite3": "^7.6.0",
    "@types/node": "^22.0.0",
    "tsx": "^4.0.0"
  }
}
```

---

## 14. Comandos para iniciar

```bash
# Crear el proyecto
mkdir -p packages/{core,bot}/{src}
npm init -y
npm install grammy ai @ai-sdk/openai drizzle-orm better-sqlite3 gray-matter marked zod uuid dotenv
npm install -D typescript drizzle-kit @types/better-sqlite3 @types/node tsx

# Configurar TypeScript
npx tsc --init

# Crear base de datos
npx drizzle-kit push

# Iniciar el bot (desarrollo)
npx tsx packages/bot/src/index.ts
```

---

## Notas Finales

1. **Esta arquitectura está diseñada para crecer** — empezamos con un bot de Telegram + SQLite y podemos escalar a una app web + PostgreSQL sin reescribir la lógica core.

2. **La IA es una herramienta, no el producto** — los cursos (Markdown) son el producto. La IA solo mejora la experiencia de aprendizaje.

3. **El contenido es portátil** — cualquiera puede tomar los archivos Markdown de un curso y usarlos en otra plataforma. No hay vendor lock-in.

4. **El costo para el estudiante es cero** — modelos eficientes y economicos de OpenAI + Telegram = acceso sin barreras económicas.
