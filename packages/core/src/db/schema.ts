import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  telegramId: text("telegram_id").unique(),
  name: text("name").notNull(),
  preferredLevel: text("preferred_level").default("beginner"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  authorId: text("author_id").references(() => users.id),
  language: text("language").notNull(),
  level: text("level").notNull(),
  tags: text("tags"), // serialized JSON array
  coursePath: text("course_path").notNull(),
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const progress = sqliteTable("progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  courseId: text("course_id")
    .references(() => courses.id)
    .notNull(),
  moduleId: text("module_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  status: text("status").notNull(), // not_started | in_progress | completed
  score: integer("score"), // 0-100
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  courseId: text("course_id")
    .references(() => courses.id)
    .notNull(),
  lessonId: text("lesson_id").notNull(),
  questionsAsked: integer("questions_asked").default(0),
  correctAnswers: integer("correct_answers").default(0),
  startedAt: integer("started_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  finishedAt: integer("finished_at", { mode: "timestamp" }),
});

export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  courseId: text("course_id")
    .references(() => courses.id)
    .notNull(),
  issuedAt: integer("issued_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
