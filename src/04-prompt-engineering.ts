// On importe le SDK Groq pour pouvoir appeler l'API Groq
import Groq from "groq-sdk";

// On importe dotenv pour lire les variables du fichier .env
import * as dotenv from "dotenv";

// On charge les variables d'environnement (.env) dans process.env
dotenv.config();

// On crée le client Groq avec notre clé API — point d'entrée vers les serveurs
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Fonction utilitaire réutilisable pour tous nos exemples de prompt
// systemPrompt : le rôle de l'IA | userMessage : la question | label : le nom de la technique
async function ask(
  systemPrompt: string,  // Le comportement permanent de l'IA
  userMessage: string,   // La question de l'utilisateur
  label: string          // Le nom affiché dans le terminal pour identifier la technique
): Promise<void> {       // Ne retourne rien — elle affiche directement dans le terminal

  // On affiche une ligne de séparation de 50 "=" pour bien délimiter chaque technique
  console.log(`\n${"=".repeat(50)}`);

  // On affiche le nom de la technique (ex: "ZERO-SHOT", "FEW-SHOT"...)
  console.log(`📌 ${label}`);

  // On affiche une autre ligne de séparation
  console.log(`${"=".repeat(50)}`);

  // On affiche les 80 premiers caractères du system prompt pour voir ce qu'on envoie
  // .slice(0, 80) coupe à 80 caractères pour ne pas surcharger le terminal
  console.log(`System : "${systemPrompt.slice(0, 80)}..."`);

  // On affiche le message utilisateur
  console.log(`User   : "${userMessage}"\n`);

  // On indique que la réponse va commencer
  console.log("Réponse :\n");

  // On appelle l'API Groq en mode streaming — réponse mot par mot
  // "await" car c'est une opération réseau qui prend du temps
  const stream = await client.chat.completions.create({

    // Le modèle IA à utiliser — llama-3.3-70b est le plus puissant chez Groq
    model: "llama-3.3-70b-versatile",

    // Le tableau de messages envoyé à l'IA — c'est toute la conversation
    messages: [
      // Le system prompt définit le rôle et le comportement de l'IA
      { role: "system", content: systemPrompt },

      // Le message utilisateur — la vraie question posée
      { role: "user", content: userMessage }
    ],

    // stream: true = l'IA envoie sa réponse morceau par morceau
    stream: true,
  });

  // On boucle sur chaque morceau (chunk) reçu en temps réel depuis Groq
  for await (const chunk of stream) {

    // On extrait le texte du chunk
    // "?." = optional chaining — évite les erreurs si delta ou content est undefined
    // "|| ''" — si content est undefined/null, on utilise une chaîne vide
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }

  // On saute deux lignes après la réponse pour aérer l'affichage
  console.log("\n");
}

// Fonction principale qui exécute toutes les techniques dans l'ordre
async function main(): Promise<void> {

  // ─────────────────────────────────────────
  // TECHNIQUE 1 : Zero-shot (pas d'exemple)
  // L'IA répond avec ses connaissances générales
  // Résultat : réponse correcte mais générique
  // ─────────────────────────────────────────
  await ask(
    // System prompt minimaliste — aucune instruction précise
    "Tu es un assistant en développement web.",

    // La question posée à l'IA
    "C'est quoi un RAG ?",

    // Le label affiché dans le terminal
    "ZERO-SHOT — réponse générique"
  );

  // ─────────────────────────────────────────
  // TECHNIQUE 2 : Persona précis
  // On définit exactement QUI est l'IA, POUR QUI elle parle, COMMENT elle parle
  // Plus le persona est précis, plus la réponse est adaptée
  // ─────────────────────────────────────────
  await ask(
    // System prompt avec persona détaillé — rôle + audience + style + contrainte de longueur
    `Tu es un professeur de mathématiques expert qui enseigne 
    sur SavoirVivant.fr. Tu t'adresses à des élèves de Terminale.
    Tu utilises toujours des analogies concrètes et des exemples
    tirés du quotidien. Tu es encourageant et bienveillant.
    Tes réponses font maximum 5 lignes.`,

    // Même question qu'avant — comparer la différence de réponse
    "C'est quoi un RAG ?",

    "PERSONA PRÉCIS — réponse adaptée au contexte SavoirVivant"
  );

  // ─────────────────────────────────────────
  // TECHNIQUE 3 : Few-shot (avec exemples)
  // On montre à l'IA le FORMAT EXACT qu'on attend
  // L'IA reproduit le pattern des exemples fournis
  // ─────────────────────────────────────────
  await ask(
    // System prompt avec 2 exemples concrets du format attendu
    // L'IA va copier exactement cette structure
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

    // La demande — l'IA va reproduire le format des exemples
    "Génère un exercice sur les suites arithmétiques niveau Terminale",

    "FEW-SHOT — format contrôlé"
  );

  // ─────────────────────────────────────────
  // TECHNIQUE 4 : Chain of Thought
  // On force l'IA à raisonner ÉTAPE PAR ÉTAPE avant de répondre
  // Donne de meilleurs résultats sur les problèmes complexes
  // ─────────────────────────────────────────
  await ask(
    // System prompt qui impose un processus de raisonnement en 4 étapes
    // L'IA ne peut pas sauter une étape
    `Tu es un expert en architecture logicielle.
    Pour chaque question, tu DOIS :
    1. D'abord analyser le problème
    2. Lister les contraintes
    3. Proposer une solution
    4. Expliquer les avantages et inconvénients
    Ne saute JAMAIS une étape.`,

    // Question complexe — le chain of thought améliore la qualité de la réponse
    "Comment structurer une API Node.js pour SavoirVivant qui doit gérer 10 000 utilisateurs simultanés ?",

    "CHAIN OF THOUGHT — raisonnement structuré"
  );

  // ─────────────────────────────────────────
  // TECHNIQUE 5 : Output JSON forcé
  // L'IA retourne UNIQUEMENT du JSON — pas de texte autour
  // Essentiel pour intégrer l'IA dans une vraie application React/Node
  // ─────────────────────────────────────────
  await ask(
    // System prompt très strict — JSON uniquement, format imposé
    // Dans une vraie app on va parser ce JSON avec JSON.parse()
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

    // La demande — la réponse sera du JSON pur qu'on peut utiliser dans React
    "Génère un exercice sur les logarithmes niveau prépa",

    "OUTPUT JSON — intégration dans une vraie app"
  );
}

// On appelle main() — sans le "await" ici car c'est le point d'entrée du programme
main();