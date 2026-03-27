import * as fs from "node:fs/promises";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { parseCourse, parseLesson } from "../../content/parser.js";

vi.mock("node:fs/promises");

describe("Content Parser", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("parseCourse", () => {
    it("should parse a valid course.yaml file", async () => {
      const mockYaml = `
id: test-course
title: Test Course
description: A course for testing
author: user-1
language: es
level: beginner
version: 1.0.0
modules:
  - id: module-1
    title: First Module
    lessons:
      - id: lesson-1
        title: Intro
        path: intro.md
`;
      vi.mocked(fs.readFile).mockResolvedValueOnce(mockYaml);

      const course = await parseCourse("/path/to/course");

      expect(fs.readFile).toHaveBeenCalledWith("/path/to/course/course.yaml", "utf-8");
      expect(course).toBeDefined();
      expect(course.id).toBe("test-course");
      expect(course.modules.length).toBe(1);
    });

    it("should throw an error if the file cannot be read", async () => {
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error("File not found"));

      await expect(parseCourse("/invalid/path")).rejects.toThrow("Failed to parse course");
    });

    it("should throw an error if the yaml is invalid according to the schema", async () => {
      const invalidYaml = `
id: test-course
title: Test Course
# missing required fields like description, level, etc.
`;
      vi.mocked(fs.readFile).mockResolvedValueOnce(invalidYaml);

      await expect(parseCourse("/path/to/course")).rejects.toThrow("Failed to parse course");
    });
  });

  describe("parseLesson", () => {
    it("should parse a valid markdown file with frontmatter", async () => {
      const mockMarkdown = `---
title: Introduction
objectives:
  - Learn basic concepts
difficulty: 2
estimated_time: 10
---
# Welcome
This is the lesson content.
`;
      vi.mocked(fs.readFile).mockResolvedValueOnce(mockMarkdown);

      const lesson = await parseLesson("/path/to/lesson.md");

      expect(fs.readFile).toHaveBeenCalledWith("/path/to/lesson.md", "utf-8");
      expect(lesson.frontmatter.title).toBe("Introduction");
      expect(lesson.frontmatter.difficulty).toBe(2);
      expect(lesson.frontmatter.id).toBe("lesson"); // Fallback to filename
      expect(lesson.content.trim()).toBe("# Welcome\nThis is the lesson content.");
    });

    it("should use explicit id if provided in frontmatter", async () => {
      const mockMarkdown = `---
id: custom-id
title: Custom ID Lesson
---
Content
`;
      vi.mocked(fs.readFile).mockResolvedValueOnce(mockMarkdown);

      const lesson = await parseLesson("/path/to/lesson.md");
      expect(lesson.frontmatter.id).toBe("custom-id");
    });

    it("should throw an error if frontmatter is invalid", async () => {
      const invalidMarkdown = `---
difficulty: hard
---
Content
`; // missing title, difficulty is not a number
      vi.mocked(fs.readFile).mockResolvedValueOnce(invalidMarkdown);

      await expect(parseLesson("/path/to/lesson.md")).rejects.toThrow("Failed to parse lesson");
    });
  });
});
