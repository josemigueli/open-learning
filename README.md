# OpenLearning Bot

Bot de Telegram para aprender con cursos potenciados por IA.

## Comandos Disponibles

| Comando       | Descripción                                    |
| ------------- | ---------------------------------------------- |
| `/start`      | Inicia el bot y te registra como usuario       |
| `/cursos`     | Muestra todos los cursos disponibles           |
| `/estudiar`   | Redirige a /cursos para seleccionar un curso   |
| `/progreso`   | Muestra tu progreso en cada curso              |
| `/config`     | Configura tu nivel preferido y proveedor de IA |
| `/flashcards` | Genera flashcards de una lección para repasar  |

## Menú Principal

El menú principal ofrece estos botones de acceso rápido:

| Botón            | Función                             |
| ---------------- | ----------------------------------- |
| 📚 Cursos        | Ver lista de cursos disponibles     |
| ▶️ Continuar     | Reanuda el último curso en progreso |
| 🎯 Repasar       | Genera flashcards para repasar      |
| ⚙️ Configuración | Abre el panel de preferencias       |
| ❓ Ayuda         | Muestra esta guía de uso            |

## Configuración

### Nivel de dificultad

Ajusta la dificultad de las preguntas generadas por IA:

- **Principiante** — Preguntas más simples
- **Intermedio** — Preguntas de nivel medio
- **Avanzado** — Preguntas más complejas

### Proveedor de IA

- **OpenAI** — Requiere una API key de OpenAI válida (configurar en `.env`)

## Desarrollo

```bash
npm install      # Instalar dependencias
npm run dev      # Iniciar bot en modo desarrollo
npm run build    # Compilar TypeScript
npm run db:push  # Sincronizar schema de base de datos
```

## Estructura del Proyecto

```
open-learning/
├── packages/
│   ├── bot/           # Interfaz Telegram (Grammy)
│   └── core/           # Lógica de negocio, servicios, base de datos
├── courses/            # Contenido de cursos en Markdown
└── scripts/            # Scripts de prueba
```
