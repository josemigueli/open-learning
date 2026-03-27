import { describe, expect, it } from "vitest";
import {
  CourseMetadataSchema,
  LessonFrontmatterSchema,
  ModuleSchema,
} from "../../content/validator.js";

describe("Content Validators", () => {
  describe("LessonFrontmatterSchema", () => {
    it("should validate a valid frontmatter", () => {
      const data = {
        id: "lesson-1",
        title: "Introduction",
        objectives: ["Learn X", "Understand Y"],
        difficulty: 3,
        estimated_time: 15,
      };

      const result = LessonFrontmatterSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should fail if title is missing", () => {
      const data = {
        id: "lesson-1",
      };

      const result = LessonFrontmatterSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should fail if difficulty is out of bounds", () => {
      const data = {
        title: "Test",
        difficulty: 6, // max is 5
      };

      const result = LessonFrontmatterSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("ModuleSchema", () => {
    it("should validate a valid module", () => {
      const data = {
        id: "module-1",
        title: "Basics",
        lessons: [
          {
            id: "lesson-1",
            title: "Intro",
            path: "intro.md",
          },
        ],
      };

      const result = ModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should fail if lessons array is missing", () => {
      const data = {
        id: "module-1",
        title: "Basics",
      };

      const result = ModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("CourseMetadataSchema", () => {
    it("should validate a valid course metadata", () => {
      const data = {
        id: "course-1",
        title: "Test Course",
        description: "A test course",
        author: "John Doe",
        language: "en",
        level: "beginner",
        version: "1.0.0",
        modules: [],
      };

      const result = CourseMetadataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should fail if an invalid level is provided", () => {
      const data = {
        id: "course-1",
        title: "Test Course",
        description: "A test course",
        author: "John Doe",
        language: "en",
        level: "expert", // invalid level
        version: "1.0.0",
        modules: [],
      };

      const result = CourseMetadataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
