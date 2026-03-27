import { z } from "zod";

export const QuestionSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().describe("The actual question based on the content"),
        options: z.array(z.string()).length(4).describe("4 possible answers"),
        correctIndex: z.number().min(0).max(3).describe("Index of the correct option (0-3)"),
        explanation: z.string().describe("Why the correct answer is correct"),
        difficulty: z.enum(["easy", "medium", "hard"]),
      })
    )
    .min(2)
    .max(5),
});

export const EvaluationSchema = z.object({
  isCorrect: z.boolean(),
  constructiveFeedback: z
    .string()
    .describe("Encouraging explanation of the correct/incorrect answer"),
  score: z.number().min(0).max(10).describe("Score out of 10 for the user's attempt"),
});

export const FlashcardSchema = z.object({
  flashcards: z
    .array(
      z.object({
        front: z.string().describe("Concept or term"),
        back: z.string().describe("Definition or explanation"),
      })
    )
    .max(10),
});
