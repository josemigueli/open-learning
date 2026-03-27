import * as path from "node:path";
import { parseCourse, parseLesson } from "@open-learning/core";

async function main() {
  const coursePath = path.resolve("./courses/examples/english-for-devs");

  console.log("Testing Course Parser...");
  try {
    const course = await parseCourse(coursePath);
    console.log("✅ Successfully parsed course metadata:");
    console.log(JSON.stringify(course, null, 2));

    console.log("\nTesting Lesson Parser...");
    const lessonPath = path.join(coursePath, course.modules[0].lessons[0].path!);
    const lesson = await parseLesson(lessonPath);
    console.log("✅ Successfully parsed lesson frontmatter:");
    console.log(JSON.stringify(lesson.frontmatter, null, 2));
    console.log("\n✅ Content snippet:");
    console.log(lesson.content.substring(0, 100) + "...");
  } catch (error) {
    console.error("❌ Failed to parse:", error);
  }
}

main();
