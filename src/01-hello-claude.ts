// import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import * as dotenv from "dotenv";

dotenv.config();

console.log("Clé chargée :", process.env.ANTHROPIC_API_KEY ? "OUI" : "NON");

// Avec Anthropic (dès que les crédits sont actifs)
// const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Avec Groq (maintenant, gratuit, même résultat)
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askAI(question: string): Promise<void> {
    console.log(`\nQuestion : ${question}\n`);
    console.log("Réponse :\n");
  
    try {
      const stream = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en développement web. Réponds en français, de façon concise."
          },
          { role: "user", content: question }
        ],
        stream: true,
      });
  
      for await (const chunk of stream) {
        process.stdout.write(chunk.choices[0]?.delta?.content || "");
      }
  
      console.log("\n\nTerminé !");
  
    } catch (error) {
      console.error("ERREUR :", error);
    }
  }
  
  (async () => {
    await askAI("Explique-moi c'est quoi un RAG en 5 lignes pour un développeur Node.js");
  })();