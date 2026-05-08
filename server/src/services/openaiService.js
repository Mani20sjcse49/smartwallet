import OpenAI from "openai";
import { env } from "../config/env.js";

let client;

export function getOpenAIClient() {
  if (!env.openAiApiKey) {
    return null;
  }

  if (!client) {
    client = new OpenAI({ apiKey: env.openAiApiKey });
  }

  return client;
}
