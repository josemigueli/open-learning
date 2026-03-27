import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { progress, sessions } from "../db/schema.js";

export class ProgressService {
  static async updateProgress(
    userId: string,
    courseId: string,
    moduleId: string,
    lessonId: string,
    score: number
  ) {
    const id = crypto.randomUUID();
    const existing = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.courseId, courseId),
          eq(progress.moduleId, moduleId),
          eq(progress.lessonId, lessonId)
        )
      )
      .get();

    if (existing) {
      return db
        .update(progress)
        .set({
          status: "completed",
          score: Math.max(existing.score || 0, score),
          completedAt: new Date(),
        })
        .where(eq(progress.id, existing.id))
        .returning()
        .get();
    }

    return db
      .insert(progress)
      .values({
        id,
        userId,
        courseId,
        moduleId,
        lessonId,
        status: "completed",
        score,
        completedAt: new Date(),
      })
      .returning()
      .get();
  }

  static async getCourseProgress(userId: string, courseId: string) {
    return db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.courseId, courseId)))
      .all();
  }

  // Session tracking
  static async startSession(userId: string, courseId: string, lessonId: string) {
    const id = crypto.randomUUID();
    return db.insert(sessions).values({ id, userId, courseId, lessonId }).returning().get();
  }

  static async updateSessionStats(sessionId: string, correct: boolean) {
    // Note: In SQLite we need to fetch, update logic, then save.
    // Or write raw queries to increment. We'll do a simple fetch for now.
    const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();

    if (!session) throw new Error("Session not found");

    return db
      .update(sessions)
      .set({
        questionsAsked: (session.questionsAsked || 0) + 1,
        correctAnswers: (session.correctAnswers || 0) + (correct ? 1 : 0),
      })
      .where(eq(sessions.id, sessionId))
      .returning()
      .get();
  }

  static async finishSession(sessionId: string) {
    return db
      .update(sessions)
      .set({ finishedAt: new Date() })
      .where(eq(sessions.id, sessionId))
      .returning()
      .get();
  }
}
