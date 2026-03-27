import { z } from "zod";

export const LessonFrontmatterSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  objectives: z.array(z.string()).optional(),
  difficulty: z.number().min(1).max(5).optional(),
  estimated_time: z.number().optional(), // in minutes
});

export const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  lessons: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      path: z.string().optional(), // the relative file path to the markdown file
    })
  ),
});

export const CourseMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  author: z.string(),
  language: z.string(),
  target_language: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  tags: z.array(z.string()).optional(),
  version: z.string(),
  modules: z.array(ModuleSchema),
});

export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>;
export type CourseModule = z.infer<typeof ModuleSchema>;
export type CourseMetadata = z.infer<typeof CourseMetadataSchema>;
