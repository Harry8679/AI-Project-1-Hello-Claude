import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
dotenv.config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function askClaude(question: string): Promise<void> {
  console.log(`\nQuestion : ${question}\n`);
  console.log("Réponse :\n");

  const stream = client.messages.stream({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: "Tu es un expert en développement web. Réponds en français, de façon concise.",
    messages: [
      { role: "user", content: question }
    ],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      process.stdout.write(chunk.delta.text);
    }
  }

  const finalMessage = await stream.finalMessage();
  console.log("\n\n---");
  console.log(`Tokens : ${finalMessage.usage.input_tokens} input / ${finalMessage.usage.output_tokens} output`);
}

askClaude("Explique-moi c'est quoi un RAG en 5 lignes pour un développeur Node.js");