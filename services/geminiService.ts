import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const transformTextToNoble = async (
  inputText: string, 
  useArchaic: boolean = false,
  targetLanguage: string = 'English',
  era: string = 'Medieval',
  writer: string = 'None'
): Promise<string> => {
  if (!inputText.trim()) return "";

  try {
    const ai = getClient();
    const modelId = "gemini-2.5-flash"; 
    
    // 10 Eras
    let eraInstruction = "";
    switch (era) {
      case 'Renaissance':
        eraInstruction = `Style: High Renaissance. Be poetic, flowery, artistic, and witty. Reference the muses and nature.`;
        break;
      case 'Victorian':
        eraInstruction = `Style: Victorian. Be formal, polite, stiff, precise, and industrial. Use words like "utmost," "indeed."`;
        break;
      case 'Ancient':
        eraInstruction = `Style: Ancient Mythic. Be grand, epic, and resonant. Sound like a translation of a Homeric hymn.`;
        break;
      case 'Enlightenment':
        eraInstruction = `Style: Age of Enlightenment. Be intellectual, reasoned, philosophical, and sophisticated. Focus on logic and clarity.`;
        break;
      case 'Industrial':
        eraInstruction = `Style: Industrial Revolution. Gritty, utilitarian, yet formal. Evoke steam, iron, and progress.`;
        break;
      case 'Roaring 20s':
        eraInstruction = `Style: Roaring 1920s. Spirited, fast-paced, using period slang (old sport, bee's knees), jazz-age energy.`;
        break;
      case 'Wild West':
        eraInstruction = `Style: Wild West. Rugged, folksy, frontier-style. Use cowboy vernacular but keep it somewhat dignified.`;
        break;
      case 'Edo Period':
        eraInstruction = `Style: Edo Period Japan (Translated). Haiku-esque, nature-focused, honorable, serene, and disciplined.`;
        break;
      case 'Cyberpunk':
        eraInstruction = `Style: Cyberpunk. High-tech, low-life, neon-soaked, street slang mixed with technical jargon.`;
        break;
      case 'Medieval':
      default:
        eraInstruction = `Style: Medieval Noble. Be dignified, warm, and eloquent. Evoke parchment, candlelight, and manor gardens.`;
        break;
    }

    // 25 Writers (Expanded List)
    let writerInstruction = "";
    switch (writer) {
      // Original 10
      case 'Shakespeare': writerInstruction = `Influence: William Shakespeare. Use iambic cadences, dramatic flair, rich metaphors, and invented words.`; break;
      case 'Hemingway': writerInstruction = `Influence: Ernest Hemingway. Short, punchy sentences. Direct, stoic, truthful, and simple.`; break;
      case 'Poe': writerInstruction = `Influence: Edgar Allan Poe. Macabre, melancholic, complex syntax, obsession with the darker side.`; break;
      case 'Austen': writerInstruction = `Influence: Jane Austen. Witty, social observation, polite irony, focus on manners and relations.`; break;
      case 'Twain': writerInstruction = `Influence: Mark Twain. Satirical, colloquial, storyteller vibe, sharp wit.`; break;
      case 'Wilde': writerInstruction = `Influence: Oscar Wilde. Aesthetic, paradoxical, flamboyant, incredibly witty and cynical.`; break;
      case 'Lovecraft': writerInstruction = `Influence: H.P. Lovecraft. Eldritch, ancient, adjective-heavy, creeping horror, "indescribable".`; break;
      case 'Homer': writerInstruction = `Influence: Homer. Use epithets (e.g., "rosy-fingered dawn"), grand similes, invocations to muses.`; break;
      case 'Dante': writerInstruction = `Influence: Dante Alighieri. Allegorical, spiritual, solemn, poetic, referencing the divine or infernal.`; break;
      case 'Tolkien': writerInstruction = `Influence: J.R.R. Tolkien. Archaic, mythopoeic, focus on lineage, nature, and high purpose.`; break;
      
      // New 15
      case 'Dostoevsky': writerInstruction = `Influence: Fyodor Dostoevsky. Psychological intensity, philosophical urgency, polyphonic voices, manic energy.`; break;
      case 'Tolstoy': writerInstruction = `Influence: Leo Tolstoy. Epic scope, moralistic tone, detailed realism, omniscient and grand.`; break;
      case 'Kafka': writerInstruction = `Influence: Franz Kafka. Surreal, bureaucratic, alienated, absurd logic, dry and precise description of impossible events.`; break;
      case 'Joyce': writerInstruction = `Influence: James Joyce. Stream of consciousness, complex vocabulary, experimental syntax, rich sensory details.`; break;
      case 'Woolf': writerInstruction = `Influence: Virginia Woolf. Lyrical, impressionistic, internal monologue, fluid transition of time and thought.`; break;
      case 'Dickens': writerInstruction = `Influence: Charles Dickens. Vivid caricatures, social commentary, sentimental, dramatic, and descriptive.`; break;
      case 'Hugo': writerInstruction = `Influence: Victor Hugo. Grand, dramatic, passionate, digressive, romantic, focusing on justice and fate.`; break;
      case 'Melville': writerInstruction = `Influence: Herman Melville. Biblical rhythms, nautical themes, philosophical density, encyclopedic detail.`; break;
      case 'Orwell': writerInstruction = `Influence: George Orwell. Plain, direct, political, journalistic clarity, dystopian undertones.`; break;
      case 'Nabokov': writerInstruction = `Influence: Vladimir Nabokov. Alliterative, complex wordplay, aesthetic obsession, sensory and lyrical.`; break;
      case 'Camus': writerInstruction = `Influence: Albert Camus. Detached, indifferent, observant, absurdist, philosophical plainness.`; break;
      case 'Fitzgerald': writerInstruction = `Influence: F. Scott Fitzgerald. Richly descriptive, romantic, lyrical, evoking the yearning of the Jazz Age.`; break;
      case 'Steinbeck': writerInstruction = `Influence: John Steinbeck. Earthy, realistic, sympathetic to the common man, descriptive of landscapes.`; break;
      case 'Christie': writerInstruction = `Influence: Agatha Christie. Mystery-focused, dialogue-driven, clear, functional, plot-centric.`; break;
      case 'Asimov': writerInstruction = `Influence: Isaac Asimov. Logical, scientific, unadorned, focused on ideas and sociology over stylistic flourish.`; break;

      default: writerInstruction = `Influence: None specific. Adhere strictly to the Era style.`; break;
    }

    const archaicInstruction = useArchaic 
      ? `**Archaic Language**: You MUST use archaic second-person pronouns (e.g., "thou", "thee") and verb forms (e.g., "hast", "art") frequently.`
      : `**Readable**: Use archaic forms sparingly or not at all if it hinders clarity.`;

    const systemInstruction = `
      You are a master scribe transforming text into a specific historical and literary style.
      
      **Target Era**: ${eraInstruction}
      **Target Writer Influence**: ${writerInstruction}

      Your task is to rewrite the user's text into this specific style while keeping the original meaning.
      1.  **Tone**: Combine the Era and Writer influence.
      2.  **Language**: The output MUST be in ${targetLanguage}. If input is different, translate first.
      3.  ${archaicInstruction}
      4.  **Structure**: The output should feel like a snippet from a letter or document of that specific time and author.
      
      Do not add commentary. Only output the rewritten text.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: inputText,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85, 
      }
    });

    return response.text || "Alas, the spirits of the ether remain silent. Pray, try again.";
  } catch (error) {
    console.error("Gemini transformation error:", error);
    throw error;
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    try {
        const ai = getClient();
        const modelId = "gemini-2.5-flash";
        const systemInstruction = `
          You are a master translator. 
          Translate the following text into ${targetLanguage}.
          CRITICAL: You MUST preserve the historical/noble tone, style, and formatting of the original text as much as possible in the new language. 
          Do not make it sound modern. Keep it archaic/fancy if the source is archaic/fancy.
          Do not add commentary.
        `;
        
        const response = await ai.models.generateContent({
            model: modelId,
            contents: text,
            config: { systemInstruction }
        });

        return response.text || text;
    } catch (error) {
        console.error("Translation error:", error);
        return text;
    }
}