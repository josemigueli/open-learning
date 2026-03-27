import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import "dotenv/config";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function getOpenAIModel(modelId: string, apiKey: string): LanguageModel {
  const provider = createOpenAI({ apiKey });
  return provider(modelId);
}

export async function generateWithModel<T>(
  generateFn: (model: LanguageModel) => Promise<T>
): Promise<T> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not configured.");
  }

  const model = getOpenAIModel(DEFAULT_MODEL, process.env.OPENAI_API_KEY);
  return generateFn(model);
}
