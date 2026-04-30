import Groq from "groq-sdk";
import * as dotenv from "dotenv";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function voirLesChunks(): Promise<void> {
  const stream = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "user", content: "Dis juste: Bonjour Harry" }
    ],
    stream: true,
  });

  let numeroChunk = 0;

  for await (const chunk of stream) {
    numeroChunk++;
    const text = chunk.choices[0]?.delta?.content || "";
    const finRaison = chunk.choices[0]?.finish_reason;

    // On affiche chaque chunk brut pour comprendre la structure
    console.log(`\nChunk #${numeroChunk}:`);
    console.log(`  texte    : "${text}"`);
    console.log(`  fin      : ${finRaison || "pas encore"}`);
  }

  console.log(`\nTotal : ${numeroChunk} chunks reçus`);
}

(async () => {
  await voirLesChunks();
})();