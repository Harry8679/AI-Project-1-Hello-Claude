// On importe le SDK Groq — c'est la librairie qui sait parler aux serveurs Groq
import Groq from "groq-sdk";

// On importe dotenv — il va lire notre fichier .env et charger les variables
import * as dotenv from "dotenv";

// On exécute dotenv : charge GROQ_API_KEY dans process.env
dotenv.config();

// On affiche OUI ou NON pour vérifier que la clé est bien chargée
console.log("Clé chargée :", process.env.ANTHROPIC_API_KEY ? "OUI" : "NON");

// On crée le client Groq avec notre clé API — c'est notre connexion aux serveurs
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// On déclare une fonction asynchrone — "async" car on attend une réponse du réseau
// Elle prend une question en string et ne retourne rien (void)
async function askAI(question: string): Promise<void> {

  // On affiche la question dans le terminal
  console.log(`\nQuestion : ${question}\n`);
  console.log("Réponse :\n");

  try {
    // On appelle l'API Groq en mode streaming — la réponse arrive mot par mot
    // "await" car c'est une opération asynchrone qui prend du temps
    const stream = await client.chat.completions.create({

      // Le modèle IA à utiliser — llama-3.3 est le plus puissant chez Groq
      model: "llama-3.3-70b-versatile",

      // Le tableau de messages — c'est toute la conversation envoyée à l'IA
      messages: [
        {
          // "system" = instructions secrètes pour définir le comportement de l'IA
          // L'utilisateur ne voit pas ce message
          role: "system",
          content: "Tu es un expert en développement web. Réponds en français, de façon concise."
        },
        {
          // "user" = le message visible de l'utilisateur
          role: "user",
          content: question
        }
      ],

      // stream: true = l'IA envoie sa réponse mot par mot au lieu d'attendre la fin
      stream: true,
    });

    // On boucle sur chaque morceau (chunk) reçu en temps réel
    for await (const chunk of stream) {

      // On extrait le texte du chunk — le "|| ''" évite les erreurs si le texte est vide
      // process.stdout.write affiche sans retour à la ligne — effet "IA qui écrit en direct"
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }

    // Le stream est terminé — on affiche un message de fin
    console.log("\n\nTerminé !");

  } catch (error) {
    // Si une erreur survient (réseau, clé invalide, quota...) on l'affiche
    console.error("ERREUR :", error);
  }
}

// IIFE (Immediately Invoked Function Expression) — on crée une fonction async
// et on l'appelle immédiatement, car on ne peut pas utiliser "await" directement
// au niveau racine du fichier sans cette astuce
(async () => {
  await askAI("Explique-moi c'est quoi un RAG en 5 lignes pour un développeur Node.js");
})();