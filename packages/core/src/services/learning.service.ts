import { generateObject, generateText } from "ai";
import { type z } from "zod";
import { QuestionSchema, EvaluationSchema, FlashcardSchema } from "../ai/prompts.js";
import { generateWithModel } from "../ai/providers.js";
import type { users } from "../db/schema.js";

type UserConfig = typeof users.$inferSelect;

interface SessionSummaryData {
  questionsAsked: number;
  correctAnswers: number;
}

export class LearningService {
  /**
   * Generates multiple-choice questions based on lesson content
   */
  static async generateQuestions(
    lessonContent: string,
    user: UserConfig
  ): Promise<z.infer<typeof QuestionSchema>["questions"]> {
    const result = await generateWithModel((model) =>
      generateObject({
        model,
        schema: QuestionSchema,
        system:
          "You are an API that only responds with raw, valid JSON. Do not include any markdown formatting, code blocks, conversational text, or explanations outside of the JSON structure.",
        prompt: `Based on the following educational content, generate multiple-choice questions to evaluate the student's understanding.

    Student's preferred level: ${user.preferredLevel || "beginner"}

    Content:
    ${lessonContent}

    Generate between 2 and 5 varied questions appropriate for the student's level.`,
      })
    );
    return result.object.questions;
  }

  /**
   * Evaluates a user's free-text or selected answer
   */
  static async evaluateAnswer(
    question: string,
    correctAnswer: string,
    userAnswer: string,
    _user: UserConfig
  ): Promise<z.infer<typeof EvaluationSchema>> {
    const result = await generateWithModel((model) =>
      generateObject({
        model,
        schema: EvaluationSchema,
        system:
          "You are an API that only responds with raw, valid JSON. Do not include any markdown formatting, code blocks, conversational text, or explanations outside of the JSON structure.",
        prompt: `Evaluate the student's answer to the following question.

Question: ${question}
Correct Answer/Concept: ${correctAnswer}
Student's Answer: ${userAnswer}

Determine if the student is correct, provide a score from 0-10, and give constructive, encouraging feedback explaining why.`,
      })
    );
    return result.object;
  }

  /**
   * Summarizes a study session
   */
  static async generateSessionSummary(
    sessionData: SessionSummaryData,
    language: string
  ): Promise<string> {
    const result = await generateWithModel((model) =>
      generateText({
        model,
        prompt: `Create a brief, motivational summary of the student's study session in ${language}.

Data:
- Questions: ${sessionData.questionsAsked}
- Correct: ${sessionData.correctAnswers}
- Score: ${Math.round((sessionData.correctAnswers / sessionData.questionsAsked) * 100)}%

Write2-3 encouraging sentences in ${language}. Be specific about their achievement.`,
      })
    );
    return result.text;
  }

  /**
   * Generates flashcards for a lesson
   */
  static async generateFlashcards(
    lessonContent: string,
    _user: UserConfig
  ): Promise<z.infer<typeof FlashcardSchema>["flashcards"]> {
    const result = await generateWithModel((model) =>
      generateObject({
        model,
        schema: FlashcardSchema,
        system:
          "You are an API that only responds with raw, valid JSON. Do not include any markdown formatting, code blocks, conversational text, or explanations outside of the JSON structure.",
        prompt: `Extract key concepts and terms from the following lesson content to create study flashcards.
      
Content:
${lessonContent}

Generate up to 10 front/back flashcards. Keep the "front" as a short term or concept, and the "back" as a clear definition.`,
      })
    );
    return result.object.flashcards;
  }
}
