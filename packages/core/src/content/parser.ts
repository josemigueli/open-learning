import matter from "gray-matter";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  CourseMetadataSchema,
  LessonFrontmatterSchema,
  type CourseMetadata,
  type LessonFrontmatter,
} from "./validator.js";

export interface ParsedLesson {
  frontmatter: LessonFrontmatter;
  content: string;
}

export async function parseCourse(courseDirPath: string): Promise<CourseMetadata> {
  const yamlPath = path.join(courseDirPath, "course.yaml");

  try {
    const yamlContent = await fs.readFile(yamlPath, "utf-8");
    // gray-matter can parse YAML directly if we pass it as a markdown file with only frontmatter
    // or we can just use a yaml parser, but gray-matter is already in deps
    const parsed = matter(`---\n${yamlContent}\n---`);

    // Validate the parsed YAML against our schema
    const metadata = CourseMetadataSchema.parse(parsed.data);
    return metadata;
  } catch (error) {
    throw new Error(
      `Failed to parse course at ${courseDirPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function parseLesson(lessonFilePath: string): Promise<ParsedLesson> {
  try {
    const fileContent = await fs.readFile(lessonFilePath, "utf-8");
    const parsed = matter(fileContent);

    const frontmatter = LessonFrontmatterSchema.parse({
      ...parsed.data,
      // Default ID to filename if not provided
      id: parsed.data.id || path.basename(lessonFilePath, ".md"),
    });

    return {
      frontmatter,
      content: parsed.content,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse lesson at ${lessonFilePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
