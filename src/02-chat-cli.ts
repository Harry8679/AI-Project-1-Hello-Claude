import Groq from "groq-sdk";
import * as readline from "readline";
import * as dotenv from "dotenv";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// L'historique — tableau qui grandit à chaque échange
// C'est CE tableau qu'on renvoie entier à chaque appel API
type Message = { role: "user" | "assistant"; content: string };
const history: Message[] = [];

// readline permet de lire ce que l'utilisateur tape dans le terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chat(userInput: string): Promise<void> {
  // On ajoute le message utilisateur à l'historique
  history.push({ role: "user", content: userInput });

  process.stdout.write("\n🤖 ");

  let assistantResponse = "";

  const stream = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "Tu es un expert en développement web. Réponds en français, de façon concise."
      },
      // On spread tout l'historique — c'est comme ça que l'IA "se souvient"
      ...history
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    process.stdout.write(text);
    assistantResponse += text;
  }

  // On sauvegarde la réponse de l'IA dans l'historique
  history.push({ role: "assistant", content: assistantResponse });
  console.log("\n");
}

// Boucle infinie — relance la question après chaque réponse
function prompt(): void {
  rl.question("💬 Toi : ", async (input) => {
    const trimmed = input.trim();
    if (trimmed.toLowerCase() === "exit") {
      console.log("👋 À demain !");
      rl.close();
      return;
    }
    if (trimmed) await chat(trimmed);
    prompt(); // Relance la boucle
  });
}

console.log("🚀 Chat IA démarré — tape 'exit' pour quitter\n");
prompt();