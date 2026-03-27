# Guía de Gestión de Contenidos - OpenLearning

Esta guía explica cómo agregar nuevos cursos y lecciones al sistema OpenLearning.

## Estructura de Directorios

Los cursos se almacenan en `courses/examples/`. Cada curso es una carpeta que contiene:

```text
nombre-del-curso/
├── course.yaml           # Metadatos del curso y estructura de módulos
└── modules/              # Carpetas para cada módulo
    └── 01-basics/        # Ejemplo de módulo
        ├── lesson-01.md  # Archivo de lección
        └── lesson-02.md
```

## Reglas para Lecciones (.md)

Cada lección debe ser un archivo Markdown con un bloque de **Frontmatter** al inicio.

### Formato del Frontmatter

```markdown
---
title: "Título de la Lección"
objectives:
  - "Objetivo 1"
  - "Objetivo 2"
difficulty: 2 # Escala del 1 al 5
estimated_time: 20 # En minutos
---
```

### Contenido

El contenido debe estar bien estructurado con encabezados (`#`, `##`).
**Nota Importante:** El sistema utiliza Inteligencia Artificial para generar las preguntas de evaluación basándose exclusivamente en el texto de este archivo. Asegúrate de que los conceptos clave estén bien explicados.

## Cómo Agregar una Lección

1. Crea el archivo `.md` en la subcarpeta del módulo correspondiente.
2. Abre el archivo `course.yaml` en la raíz del curso.
3. Localiza el módulo al que pertenece la lección y agrégala a la lista `lessons`:

```yaml
- id: "01-basics"
  title: "Fundamentos"
  lessons:
    - id: "mi-nueva-leccion"
      title: "Título de la Lección"
      path: "modules/01-basics/mi-nueva-leccion.md"
```

## Cómo Agregar un Curso Completo

1. Crea una nueva carpeta dentro de `courses/examples/`.
2. Crea un archivo `course.yaml` con la siguiente estructura:

```yaml
id: mi-curso-id
title: "Título del Curso"
description: "Descripción detallada del curso."
author: "Tu Nombre"
language: "es" # Idioma base
target_language: "en" # Idioma objetivo (opcional)
level: beginner # beginner, intermediate, advanced
version: "1.0.0"
tags:
  - tag1
  - tag2
modules:
  - id: "modulo-1"
    title: "Primer Módulo"
    lessons: [] # Lista de lecciones como se explicó arriba
```

3. Agrega las carpetas de módulos y archivos `.md`.
4. **Reinicia el Bot**: El bot escanea la carpeta `courses/examples/` al iniciar y registra automáticamente cualquier curso nuevo o cambio en los existentes.

## Sincronización

El proceso de "registro" (metadatos) ocurre durante el arranque del bot (`npm run dev` o `npm start`). Sin embargo, el **contenido** de las lecciones se lee del disco en tiempo real cuando un usuario inicia una sesión de estudio, por lo que puedes editar el contenido de un `.md` sin necesidad de reiniciar el bot.
