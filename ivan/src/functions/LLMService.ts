import { Ollama } from "ollama";
import config from "../config";

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434",
});

const DEFAULT_MODEL = "llama3.2:3b";
const TIMEOUT_MS = 30_000;

function extractThinking(text: string): { reply: string; thinking?: string } {
  const match = text.match(/<think>(.*?)<\/think>/s);
  const thinking = match?.[1].replace(/\s+/g, " ").trim();
  const reply = text.replace(/<think>.*?<\/think>/gs, "").trim();
  return { reply, thinking: thinking || undefined };
}

export interface ChatContext {
  username: string;
  content: string;
}

export async function llmChat(
  userMessage: string,
  context: ChatContext[] = [],
  model = DEFAULT_MODEL
): Promise<{ reply: string; thinking?: string }> {
  const contextBlock = context.length > 0
    ? `Recent conversation:\n${context.map((m) => `${m.username}: ${m.content}`).join("\n")}\n\n`
    : "";

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Ollama request timed out")), TIMEOUT_MS)
  );

  const result = await Promise.race([
    ollama.chat({
      model,
      messages: [
        { role: "system", content: config.client.personality },
        { role: "user", content: `${contextBlock}${userMessage}` },
      ],
    }),
    timeout,
  ]);

  return extractThinking(result.message.content);
}
