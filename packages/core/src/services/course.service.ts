import { eq } from "drizzle-orm";
import * as path from "node:path";
import { parseCourse } from "../content/parser.js";
import { db } from "../db/index.js";
import { courses } from "../db/schema.js";

export class CourseService {
  /**
   * Reads a course from the file system, parses its metadata, and upserts it into the database
   */
  static async registerCourse(courseDirPath: string, authorId: string) {
    const metadata = await parseCourse(courseDirPath);
    const slug = path.basename(courseDirPath);

    const courseRecord = {
      id: metadata.id,
      slug,
      title: metadata.title,
      description: metadata.description,
      authorId,
      language: metadata.language,
      level: metadata.level,
      tags: JSON.stringify(metadata.tags || []),
      coursePath: courseDirPath,
      isPublic: true,
    };

    const existing = await db.select().from(courses).where(eq(courses.slug, slug)).get();

    if (existing) {
      return db
        .update(courses)
        .set(courseRecord)
        .where(eq(courses.id, existing.id))
        .returning()
        .get();
    } else {
      return db.insert(courses).values(courseRecord).returning().get();
    }
  }

  static async listPublicCourses() {
    return db.select().from(courses).where(eq(courses.isPublic, true)).all();
  }

  static async getCourse(courseId: string) {
    const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();

    if (!course) return null;

    // Load full metadata from files when getting a specific course
    const metadata = await parseCourse(course.coursePath);
    return { ...course, metadata };
  }
}
