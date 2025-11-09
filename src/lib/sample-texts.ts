
import type { DifficultyLevel, Language } from "@/types";

const commonWords: Record<Language, string[]> = {
  en: [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "person", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think",
    "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day",
    "most", "us", "is", "people", "go", "see", "make", "use", "very", "great", "where", "much", "many", "more", "life", "world", "school", "state", "family",
    "student", "group", "country", "problem", "hand", "part", "place", "case", "week", "company", "system", "program", "question", "work", "government",
    "number", "night", "point", "home", "water", "room", "mother", "area", "money", "story", "fact", "month", "lot", "right", "study", "book", "eye", "job"
  ],
  es: [
    "el", "ser", "a", "de", "y", "un", "en", "que", "tener", "yo", "lo", "para", "no", "en", "con", "él", "como", "tú", "hacer", "en",
    "esto", "pero", "su", "por", "de", "ellos", "nosotros", "decir", "su", "ella", "o", "un", "voluntad", "mi", "uno", "todos", "haría", "allí", "su", "qué",
    "así", "arriba", "fuera", "si", "sobre", "quién", "obtener", "cuál", "ir", "me", "cuándo", "hacer", "poder", "gustar", "tiempo", "no", "solo", "él", "saber", "tomar",
    "persona", "en", "año", "tu", "bueno", "algunos", "podría", "ellos", "ver", "otro", "que", "entonces", "ahora", "mirar", "solo", "venir", "su", "sobre", "pensar",
    "también", "atrás", "después", "usar", "dos", "cómo", "nuestro", "trabajo", "primero", "bien", "camino", "incluso", "nuevo", "querer", "porque", "cualquier", "estos", "dar", "día",
    "más", "nos", "es", "gente", "ir", "ver", "hacer", "usar", "muy", "genial", "dónde", "mucho", "muchos", "más", "vida", "mundo", "escuela", "estado", "familia",
    "estudiante", "grupo", "país", "problema", "mano", "parte", "lugar", "caso", "semana", "empresa", "sistema", "programa", "pregunta", "trabajo", "gobierno",
    "número", "noche", "punto", "casa", "agua", "habitación", "madre", "área", "dinero", "historia", "hecho", "mes", "lote", "derecho", "estudio", "libro", "ojo", "trabajo"
  ],
  de: [
    "der", "sein", "zu", "von", "und", "ein", "in", "dass", "haben", "ich", "es", "für", "nicht", "auf", "mit", "er", "als", "du", "tun", "bei",
    "dies", "aber", "sein", "von", "aus", "sie", "wir", "sagen", "ihr", "sie", "oder", "ein", "wird", "mein", "ein", "alle", "würde", "dort", "ihr", "was",
    "so", "hoch", "raus", "wenn", "über", "wer", "bekommen", "welche", "gehen", "mich", "wann", "machen", "können", "mögen", "zeit", "nein", "nur", "ihn", "wissen", "nehmen",
    "person", "in", "jahr", "dein", "gut", "einige", "könnte", "sie", "sehen", "andere", "als", "dann", "jetzt", "schauen", "nur", "kommen", "sein", "über", "denken",
    "auch", "zurück", "nach", "benutzen", "zwei", "wie", "unser", "arbeit", "erste", "gut", "weg", "sogar", "neu", "wollen", "weil", "jede", "diese", "geben", "tag",
    "die meisten", "uns", "ist", "menschen", "gehen", "sehen", "machen", "benutzen", "sehr", "groß", "wo", "viel", "viele", "mehr", "leben", "welt", "schule", "staat", "familie",
    "student", "gruppe", "land", "problem", "hand", "teil", "ort", "fall", "woche", "firma", "system", "programm", "frage", "arbeit", "regierung",
    "nummer", "nacht", "punkt", "zuhause", "wasser", "zimmer", "mutter", "bereich", "geld", "geschichte", "tatsache", "monat", "menge", "recht", "studie", "buch", "auge", "job"
  ],
  fr: [
    "le", "être", "à", "de", "et", "un", "dans", "que", "avoir", "je", "il", "pour", "pas", "sur", "avec", "il", "comme", "vous", "faire", "à",
    "ce", "mais", "son", "par", "de", "ils", "nous", "dire", "elle", "ou", "un", "volonté", "mon", "un", "tous", "serait", "là", "leur", "quoi",
    "si", "haut", "dehors", "si", "environ", "qui", "obtenir", "lequel", "aller", "moi", "quand", "faire", "pouvoir", "aimer", "temps", "non", "juste", "lui", "savoir", "prendre",
    "personne", "dans", "année", "votre", "bon", "quelques", "pourrait", "eux", "voir", "autre", "que", "puis", "maintenant", "regarder", "seulement", "venir", "son", "sur", "penser",
    "aussi", "retour", "après", "utiliser", "deux", "comment", "notre", "travail", "premier", "bien", "chemin", "même", "nouveau", "vouloir", "parce que", "tout", "ces", "donner", "jour",
    "le plus", "nous", "est", "gens", "aller", "voir", "faire", "utiliser", "très", "grand", "où", "beaucoup", "nombreux", "plus", "vie", "monde", "école", "état", "famille",
    "étudiant", "groupe", "pays", "problème", "main", "partie", "endroit", "cas", "semaine", "entreprise", "système", "programme", "question", "travail", "gouvernement",
    "nombre", "nuit", "point", "maison", "eau", "chambre", "mère", "zone", "argent", "histoire", "fait", "mois", "lot", "droit", "étude", "livre", "œil", "emploi"
  ],
};


const generateRandomWords = (count: number, lang: Language): string => {
  const wordList = commonWords[lang] || commonWords.en;
  
  let resultWords: string[] = [];
  while(resultWords.length < count) {
    const shuffledWords = [...wordList].sort(() => 0.5 - Math.random());
    resultWords.push(...shuffledWords);
  }

  return resultWords.slice(0, count).join(" ");
};

// A curated list of tricky but more common words for the expert level.
export const expertWords: string[] = [
  "awkward", "bungalow", "crypt", "dwarves", "fjord", "gizmo", "haiku", "jinx", "kayak", "lynx", "myth", "nymph", "pixel", "quartz", "rhythm",
  "sphinx", "waxy", "yacht", "zombie", "abruptly", "absurd", "abyss", "affix", "askew", "avenue", "axiom", "azure", "bagpipes", "bandwagon",
  "banjo", "bayou", "bikini", "blitz", "blizzard", "boggle", "bookworm", "boxcar", "buckaroo", "buzzard", "cobweb", "cockiness", "croquet",
  "daiquiri", "disavow", "dizzying", "duplex", "espionage", "exodus", "faking", "fishhook", "fixable", "fluffiness", "frazzled", "frizzled",
  "galaxy", "galvanize", "gazebo", "glowworm", "gnarly", "gossip", "grogginess", "hyphen", "icebox", "injury", "ivory", "jackpot", "jaundice",
  "jawbreaker", "jaywalk", "jazziest", "jelly", "jigsaw", "jockey", "jogging", "joking", "jovial", "joyful", "juicy", "jukebox", "jumbo",
  "kitsch", "kiwifruit", "klutz", "knapsack", "larynx", "lengths", "lucky", "luxury", "lymph", "matrix", "megahertz", "microwave", "mnemonic",
  "mystify", "naphtha", "nightclub", "nowadays", "numbskull", "onyx", "ovary", "oxidize", "oxygen", "pajama", "peekaboo", "phlegm", "pizazz",
  "pneumonia", "polka", "psyche", "puppy", "puzzling", "quixotic", "razzmatazz", "rhubarb", "schnapps", "scratch", "shiv", "snazzy",
  "strengths", "stretch", "stronghold", "stymied", "subway", "swivel", "syndrome", "thriftless", "thumbscrew", "topaz", "transcript",
  "transgress", "transplant", "twelfth", "unknown", "unworthy", "unzip", "uptown", "vaporize", "vixen", "vodka", "voodoo", "vortex",
  "voyeurism", "walkway", "waltz", "wave", "wavy", "wellspring", "wheezy", "whiskey", "whizzing", "whomever", "wimpy", "witchcraft", "wizard",
  "wristwatch", "xylophone", "yachtsman", "zephyr", "zigzag", "zilch", "zipper"
];

const generateExpertWords = (count: number): string => {
  let resultWords: string[] = [];
  while(resultWords.length < count) {
      const shuffled = [...expertWords].sort(() => 0.5 - Math.random());
      resultWords.push(...shuffled);
  }
  return resultWords.slice(0, count).join(" ");
};

const generateMixedText = (wordCount: number, lang: Language): string => {
    const words = (commonWords[lang] || commonWords.en);
    const punctuation = ['.', ',', ';', ':', '!', '?'];
    const quotes = ['"', "'"];
    
    let result = [];
    let currentWordIndex = 0;
    
    for (let i = 0; i < wordCount; i++) {
        // Use a circular index for words to avoid running out
        let word = words[currentWordIndex % words.length];
        currentWordIndex++;

        const rand = Math.random();

        if (rand < 0.15 && i < wordCount - 1) { // Add punctuation at the end of a word, 15% chance
            word += punctuation[Math.floor(Math.random() * punctuation.length)];
        } else if (rand < 0.25) { // Make it a number, 10% chance
            word = String(Math.floor(Math.random() * 900) + 100);
        } else if (rand < 0.35) { // Wrap in quotes, 10% chance
            const quoteChar = quotes[Math.floor(Math.random() * quotes.length)];
            word = `${quoteChar}${word}${quoteChar}`;
        }
        
        result.push(word);
    }
    
    return result.join(' ');
};


export function getRandomText(level: DifficultyLevel, language: Language = 'en', wordCount?: number): string {
  if (wordCount) {
    if (level === 'expert' && language === 'en') {
      return generateExpertWords(wordCount);
    }
    if (level === 'mixed') {
        return generateMixedText(wordCount, language);
    }
    // For 'simple', 'intermediate', 'time' with wordCount
    return generateRandomWords(wordCount, language);
  }

  // Fallback for timed tests or simple level default
  switch (level) {
    case "simple":
      return generateRandomWords(30, language); 
    case "intermediate":
      return generateRandomWords(45, language);
    case "expert":
       if (language === 'en') {
        return generateExpertWords(50);
      }
      return generateRandomWords(50, language);
    case "mixed":
      return generateMixedText(40, language);
    case "time": // Provide a default text for timed tests if no wordCount is specified
      return generateRandomWords(100, language);
    default:
      return generateRandomWords(30, language);
  }
}
