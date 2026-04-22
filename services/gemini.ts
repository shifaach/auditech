
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, LogType } from "../types";

const getGeminiApiKey = () => {
  if (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  if (typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_GEMINI_API_KEY?: string } })?.env?.VITE_GEMINI_API_KEY) {
    return (import.meta as { env: { VITE_GEMINI_API_KEY: string } }).env.VITE_GEMINI_API_KEY;
  }
  return "";
};

const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
interface GeminiRawResult {
  transcript?: {
    urdu?: string;
    english?: string;
  };
  summary?: string;
  keywords?: string[];
  tags?: string[];
  topics?: string[];
  emotion?: string;
  noise_level?: string;
  chapters?: {
    title?: string;
    timestamp?: string;
    description?: string;
    transcript_segment?: string;
  }[];
  compliance_flags?: {
    category?: string;
    detected_text?: string;
    confidence?: number;
    timestamp?: string;
  }[];
  confidence_score?: number;
}
/**
 * Structured Flow: transcribeAndAnalyze
 * Mimics a Genkit flow logic using Gemini 3 models.
 */
export const transcribeAndAnalyze = async (
  fileData: string, // base64
  mimeType: string,
  type: LogType
): Promise<AnalysisResult> => {
  const modelName = 'gemini-2.5-flash'; // Stable model with audio support
  
  const systemInstruction = `
    You are an expert media compliance analyst for PEMRA (Pakistan Electronic Media Regulatory Authority).
    Analyze the provided ${type} content.
    Tasks:
    1. Provide full transcript in structured JSON format:
   {
     "urdu": "Full Urdu transcript",
     "english": "Full English translation"
   }
   Do NOT mix both languages in one string.
    2. Provide a 5-6-line summary.
    3. Extract keywords and relevant tags with the following strict rules:
   KEYWORDS:
   - Extract ONLY important words or keywords that appear EXACTLY in the English transcript text.
   - Keywords MUST be literal substrings copied from the English transcript.
   - Do NOT generate abstract concepts.
   - Do NOT include emotional tone words (e.g., frustration, helplessness, anger, etc.)
   - Maximum 8 keywords.
    4. Detect the overall emotional tone and background noise level.
    5. Generate automatic chapters with timestamps.
    For each chapter you MUST include:
   - title
   - timestamp (MM:SS format)
   - description (short summary of that segment)
   - transcript_segment (EXACT lines from transcript belonging to that chapter.
     This must be copied exactly from the transcript. 
     Do NOT paraphrase. Do NOT summarize. Use original wording.)
    6. CRITICAL: Identify any vulgar, abusive, or inappropriate language. Flag specific words and provide a confidence score.
    7. Return the response strictly as valid JSON according to the schema.
  `;

  const prompt = `Please analyze this ${type} content for media compliance logging.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      transcript: {
        type: Type.OBJECT,
        properties: {
          urdu: { type: Type.STRING },
          english: { type: Type.STRING }
        },
        required: ['urdu', 'english']
      },
      summary: { type: Type.STRING },
      keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      topics: { type: Type.ARRAY, items: { type: Type.STRING } },
      emotion: { type: Type.STRING },
      noise_level: { type: Type.STRING },
      chapters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            timestamp: { type: Type.STRING },
            description: { type: Type.STRING },
            transcript_segment: { type: Type.STRING }
          },
          required: ['title', 'timestamp', 'description']
        }
      },
      compliance_flags: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            detected_text: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            timestamp: { type: Type.STRING }
          },
          required: ['category', 'detected_text', 'confidence']
        }
      },
      confidence_score: { type: Type.NUMBER }
    },
    required: ['transcript', 'summary', 'keywords', 'tags', 'compliance_flags']
  };

  let genAIResponse;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    genAIResponse = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data: fileData, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    break; // ✅ success → exit loop

  } catch (err: any) {
    console.warn(`Gemini attempt ${attempt} failed`, err);

    if (attempt === 3) {
      throw new Error("AI service is busy. Please try again.");
    }

    // ⏳ wait before retry
    await new Promise(res => setTimeout(res, 2000));
  }
}

  if (!genAIResponse.text) {
    throw new Error("AI failed to generate a response.");
  }

  let result: GeminiRawResult;
  try {
    result = JSON.parse(genAIResponse.text) as GeminiRawResult;
  } catch {
    throw new Error("AI returned invalid JSON.");
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    log_id: '',
    transcript: {
       urdu: result.transcript?.urdu ?? "",
  english: result.transcript?.english ?? ""
    },
    summary: String(result.summary ?? ''),
    keywords: Array.isArray(result.keywords) ? (result.keywords as string[]) : [],
    tags: Array.isArray(result.tags) ? (result.tags as string[]) : [],
    topics: Array.isArray(result.topics) ? (result.topics as string[]) : [],
    emotion: String(result.emotion ?? 'neutral'),
    noise_level: String(result.noise_level ?? 'unknown'),
    chapters: Array.isArray(result.chapters)
    ? result.chapters.map((ch: any) => ({
        title: ch.title || "",
        timestamp: ch.timestamp || "00:00",
        description: ch.description || "",
        transcript_segment: ch.transcript_segment || ""
      }))
    : [],    compliance_flags: Array.isArray(result.compliance_flags) ? (result.compliance_flags as AnalysisResult['compliance_flags']) : [{ category: 'safe' as const, detected_text: 'No issues found', confidence: 1 }],
    confidence_score: typeof result.confidence_score === 'number' ? result.confidence_score : 1
  };
};
