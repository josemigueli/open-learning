import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as path from "node:path";
import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";
import { db } from "../../../src/db/index.js";
import { courses, users } from "../../../src/db/schema.js";
import { CourseService } from "../../../src/services/course.service.js";

// Mock the parser so we don't need real files
vi.mock("../../../src/content/parser.js", () => ({
  parseCourse: vi.fn().mockResolvedValue({
    id: "test-course-id",
    title: "Database Test Course",
    description: "A course to test DB insertions",
    author: "user-1",
    language: "es",
    level: "intermediate",
    tags: ["test", "db"],
    version: "1.0.0",
    modules: [],
  }),
}));

describe("CourseService", () => {
  beforeAll(async () => {
    // Apply migrations to the in-memory database
    const migrationsFolder = path.resolve(__dirname, "../../../src/db/migrations");
    migrate(db, { migrationsFolder });

    // Seed a user to satisfy foreign key constraints
    db.insert(users)
      .values({
        id: "user-1",
        telegramId: "123456",
        name: "Test User",
      })
      .run();
    db.insert(users)
      .values({
        id: "user-2",
        telegramId: "654321",
        name: "Another User",
      })
      .run();
  });

  afterAll(() => {
    // Optional: close or clear if necessary, but it's an in-memory DB
    // that lives within this Node process, so it will be GC'd when done.
    db.delete(courses).run();
  });

  describe("registerCourse", () => {
    it("should insert a new course into the database", async () => {
      const result = await CourseService.registerCourse("/fake/path/to/course", "user-1");

      expect(result).toBeDefined();
      expect(result.id).toBe("test-course-id");
      expect(result.title).toBe("Database Test Course");
      expect(result.coursePath).toBe("/fake/path/to/course");
      expect(result.authorId).toBe("user-1");
      expect(result.slug).toBe("course"); // because basename("/fake/path/to/course") is "course"
      expect(result.isPublic).toBe(true);

      // Verify it exists in the database
      const found = await db.select().from(courses).where(eq(courses.id, "test-course-id")).get();
      expect(found).toBeDefined();
      expect(found?.title).toBe("Database Test Course");
    });

    it("should update an existing course if it has the same slug", async () => {
      // Assuming it was already inserted by the previous test
      // Let's modify the mock to return a different title
      const { parseCourse } = await import("../../../src/content/parser.js");
      vi.mocked(parseCourse).mockResolvedValueOnce({
        id: "test-course-id",
        title: "Updated Course Title",
        description: "Updated description",
        author: "user-1",
        language: "es",
        level: "intermediate",
        tags: ["test"],
        version: "2.0.0",
        modules: [],
      });

      const result = await CourseService.registerCourse("/fake/path/to/course", "user-2");

      expect(result).toBeDefined();
      expect(result.title).toBe("Updated Course Title");
      expect(result.authorId).toBe("user-2");

      // Verify only one record exists with this slug
      const allCourses = await db.select().from(courses).where(eq(courses.slug, "course")).all();
      expect(allCourses.length).toBe(1);
    });
  });

  describe("listPublicCourses", () => {
    it("should return public courses", async () => {
      const publicCourses = await CourseService.listPublicCourses();
      expect(publicCourses.length).toBeGreaterThanOrEqual(1);
      expect(publicCourses[0].isPublic).toBe(true);
    });
  });

  describe("getCourse", () => {
    it("should return the course with its metadata", async () => {
      const course = await CourseService.getCourse("test-course-id");
      expect(course).toBeDefined();
      expect(course?.title).toBe("Updated Course Title");

      // Since getCourse also calls parseCourse internally, the mock will return
      // the default value for the next call unless overwritten
      expect(course?.metadata).toBeDefined();
      expect(course?.metadata.id).toBe("test-course-id");
    });

    it("should return null if course does not exist", async () => {
      const course = await CourseService.getCourse("non-existent");
      expect(course).toBeNull();
    });
  });
});
