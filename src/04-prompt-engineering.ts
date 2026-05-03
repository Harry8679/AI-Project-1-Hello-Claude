import Groq from "groq-sdk";
import * as dotenv from "dotenv";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Fonction utilitaire — on va l'utiliser pour tous les exemples
async function ask(
  systemPrompt: string,
  userMessage: string,
  label: string
): Promise<void> {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📌 ${label}`);
  console.log(`${"=".repeat(50)}`);
  console.log(`System : "${systemPrompt.slice(0, 80)}..."`);
  console.log(`User   : "${userMessage}"\n`);
  console.log("Réponse :\n");

  const stream = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }

  console.log("\n");
}

async function main(): Promise<void> {

  // ─────────────────────────────────────────
  // TECHNIQUE 1 : Zero-shot (pas d'exemple)
  // L'IA répond avec ses connaissances générales
  // ─────────────────────────────────────────
  await ask(
    "Tu es un assistant en développement web.",
    "C'est quoi un RAG ?",
    "ZERO-SHOT — réponse générique"
  );

  // ─────────────────────────────────────────
  // TECHNIQUE 2 : Persona précis
  // On définit exactement QUI est l'IA
  // Plus le persona est précis, meilleure est la réponse
  // ─────────────────────────────────────────
  await ask(
    `Tu es un professeur de mathématiques expert qui enseigne 
    sur SavoirVivant.fr. Tu t'adresses à des élèves de Terminale.
    Tu utilises toujours des analogies concrètes et des exemples
    tirés du quotidien. Tu es encourageant et bienveillant.
    Tes réponses font maximum 5 lignes.`,
    "C'est quoi un RAG ?",
    "PERSONA PRÉCIS — réponse adaptée au contexte SavoirVivant"
  );

  // ─────────────────────────────────────────
  // TECHNIQUE 3 : Few-shot (avec exemples)
  // On montre à l'IA le format exact qu'on veut
  // ─────────────────────────────────────────
  await ask(
    `Tu génères des exercices de mathématiques.
    Voici le format EXACT à respecter :
    
    Exemple 1 :
    ÉNONCÉ: Calculer la dérivée de f(x) = x²
    DIFFICULTÉ: Facile
    INDICE: Utilise la règle de puissance
    SOLUTION: f'(x) = 2x
    
    Exemple 2 :
    ÉNONCÉ: Calculer la limite de sin(x)/x quand x→0
    DIFFICULTÉ: Moyen
    INDICE: Pense au théorème des gendarmes
    SOLUTION: La limite vaut 1
    
    Génère toujours dans ce format exact, rien d'autre.`,
    "Génère un exercice sur les suites arithmétiques niveau Terminale",
    "FEW-SHOT — format contrôlé"
  );

  // ─────────────────────────────────────────
  // TECHNIQUE 4 : Chain of Thought
  // On force l'IA à raisonner étape par étape
  // Donne de meilleurs résultats sur les problèmes complexes
  // ─────────────────────────────────────────
  await ask(
    `Tu es un expert en architecture logicielle.
    Pour chaque question, tu DOIS :
    1. D'abord analyser le problème
    2. Lister les contraintes
    3. Proposer une solution
    4. Expliquer les avantages et inconvénients
    Ne saute JAMAIS une étape.`,
    "Comment structurer une API Node.js pour SavoirVivant qui doit gérer 10 000 utilisateurs simultanés ?",
    "CHAIN OF THOUGHT — raisonnement structuré"
  );

  // ─────────────────────────────────────────
  // TECHNIQUE 5 : Output JSON forcé
  // Essentiel pour intégrer l'IA dans une vraie app
  // ─────────────────────────────────────────
  await ask(
    `Tu es une API qui génère des exercices de maths.
    Tu réponds UNIQUEMENT en JSON valide.
    Pas d'explication, pas de texte avant ou après.
    Format exact :
    {
      "enonce": "string",
      "niveau": "collège|lycée|prépa",
      "difficulté": "facile|moyen|difficile",
      "indice": "string",
      "solution": "string",
      "tags": ["string"]
    }`,
    "Génère un exercice sur les logarithmes niveau prépa",
    "OUTPUT JSON — intégration dans une vraie app"
  );
}

main();