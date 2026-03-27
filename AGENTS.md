# Open-Learning Agent Guidelines

Welcome to the Open-Learning codebase! This repository is an AI-powered educational platform with a Telegram bot interface. Follow these guidelines strictly to ensure code consistency and reliability when contributing.

## 🏗️ Architecture & Monorepo

This is an npm workspace monorepo containing:

- `packages/core`: The business logic, AI integrations, file parsers, and database interactions.
- `packages/bot`: The Telegram bot interface built with Grammy.
- `courses`: Markdown-based educational content.

## 🚀 Build, Lint & Test Commands

All development scripts should be run from the root of the project unless specified otherwise.

- **Setup**: `npm install`
- **Start Dev Server**: `npm run dev` (Uses `tsx` to run the bot with `.env`)
- **Build All**: `npm run build`

### Testing

We currently use manual TypeScript test scripts in the `scripts/` directory instead of a test runner like Jest or Vitest.

**To run a single test script:**

```bash
npx tsx scripts/your-test-script.ts
```

**When adding tests:**

1. Create a new file in `scripts/test-<feature>.ts`.
2. Write a `main()` function with clear `console.log` output for success/failure.
3. Use `try/catch` to log errors clearly and run via `tsx`.
4. Import from `@open-learning/core` or other internal packages rather than relative paths.

## 💻 Code Style Guidelines

### 1. TypeScript & ESM (CRITICAL)

- We use `"type": "module"` (ESM) exclusively.
- **Imports MUST include the `.js` extension** when importing local files.
  - ✅ `import { db } from "./db/index.js";`
  - ❌ `import { db } from "./db/index";`
- Use relative imports within the same package, but use workspace imports (`@open-learning/core`) when importing from another package.

### 2. Services & Architecture

- Encapsulate business logic in static classes inside `packages/core/src/services/`.
  - Example: `export class CourseService { static async getCourse(id: string) { ... } }`
- Keep database queries inside these services or dedicated repository files.

### 3. Database (Drizzle ORM & SQLite)

- Use Better SQLite3 with Drizzle ORM.
- Schema definition is in `packages/core/src/db/schema.ts`.
- Prefer explicit drizzle operators like `eq`, `and`, `or`, `inArray` imported from `"drizzle-orm"`.
- Make sure queries return complete typed objects when possible using `.returning()`.

#### Migration Workflow (CRITICAL)

- **NEVER use `db:push`** in production or with real data. Use `db:generate` + `db:migrate` instead.
- `db:push` is restricted to `NODE_ENV=development` and intended for rapid prototyping only.
- **After schema changes**: run `npm run db:generate` to create migration SQL files.
- **To apply migrations**: run `npm run db:migrate`.
- **Commit migration files**: `packages/core/src/db/migrations/` must be versioned in git.

#### Database Scripts

| Script        | Purpose                                    | When to use                              |
| ------------- | ------------------------------------------ | ---------------------------------------- |
| `db:generate` | Creates SQL migration from schema changes  | After modifying `schema.ts`              |
| `db:migrate`  | Applies pending migrations to DB           | Every environment (dev, prod)            |
| `db:push`     | Pushes schema directly to DB (destructive) | Development only, no real data           |
| `db:flush`    | Deletes all data, keeps schema             | Clear test data without resetting schema |
| `db:reset`    | Deletes DB file and re-applies migrations  | Start fresh with clean DB                |

### 4. Telegram Bot (Grammy)

- When writing conversation logic with `@grammyjs/conversations`, any external async call (like DB or API calls) MUST be wrapped in `await conversation.external(...)`.
  - ✅ `const user = await conversation.external(() => UserService.getUser(id));`
  - ❌ `const user = await UserService.getUser(id);`
- Use the predefined context types `BotConversation`, `BaseContext`, and `BotContext` from `packages/bot/src/bot.ts`.
- Do not let errors crash the bot. Use `try/catch` blocks around critical bot actions and reply with user-friendly error messages. The global error handler is in `bot.catch`.

### 5. AI Integrations (AI SDK)

- Use Vercel's `ai` SDK paired with `@openrouter/ai-sdk-provider`.
- Prompts live in `packages/core/src/ai/prompts.ts`.
- Structured data extraction should always be validated using Zod (`z.object({...})`).

### 6. File & Markdown Parsing

- The courses are Markdown files parsed using `gray-matter`.
- Treat the filesystem operations carefully: always resolve paths asynchronously (`fs/promises`) using `path.resolve()` or `path.join()` relative to `process.cwd()` or `__dirname`.

## 🛡️ Error Handling

- Never swallow errors silently. If a function can throw, catch the error, log it using `console.error`, and either:
  1. Return a generic fallback value (if UI requires it).
  2. Throw a custom, descriptive error upwards.
- Validate incoming data with Zod before saving to the database.

## 📝 Naming Conventions

- **Files**: kebab-case. Use suffixes for specific types (e.g., `user.service.ts`, `main.keyboard.ts`, `study.conversation.ts`).
- **Classes**: PascalCase (e.g., `UserService`, `BotError`).
- **Functions & Variables**: camelCase.
- **Database Tables**: snake_case plural (e.g., `courses`, `users`, `user_progress`).
- **Interfaces/Types**: PascalCase. No `I` prefix.

## 🤝 Adding New Features

1. Add core logic, schema updates, and DB functions in `@open-learning/core`.
2. Add a test script in `scripts/test-feature.ts` and verify it runs successfully.
3. If it requires a bot interaction, create a new command/conversation in `@open-learning/bot` and register it in `packages/bot/src/index.ts`.
4. When testing the bot locally, use `npm run dev` and ensure `.env` has valid credentials (`TELEGRAM_BOT_TOKEN`, `OPENROUTER_API_KEY`, etc.).
