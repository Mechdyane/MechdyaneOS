
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Helper to execute a function with exponential backoff and jitter.
 * Specifically targets 429 Quota/Rate limit errors.
 */
async function withRetry<T>(fn: (apiKey: string) => Promise<T>, maxRetries = 5, initialDelay = 3000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const apiKey = process.env.API_KEY || '';
      return await fn(apiKey);
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || '';
      const isRateLimit = errorMsg.includes('429') || error?.status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED');
      const isQuotaError = errorMsg.includes('quota');
      
      if (isRateLimit || isQuotaError || error?.status >= 500) {
        const jitter = Math.random() * 1000;
        const delay = (initialDelay * Math.pow(2, i)) + jitter;
        console.warn(`[Mechdyane Core] Synaptic congestion (Attempt ${i + 1}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`, errorMsg);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error; 
    }
  }
  throw lastError;
}

export const getMechdyaneAssistantResponse = async (history: { role: string; content: string }[], userInput: string) => {
  return withRetry(async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: userInput }] }
      ],
      config: {
        systemInstruction: `You are Mechdyane Core, the intelligent AI engine of Mechdyane OS. 
        Your goal is to assist the user in their growth journey. 
        Be encouraging, intellectual, but use very clear and simple language. 
        Use gamified terminology where appropriate (e.g., "Leveling up your understanding", "Unlocking new mental nodes"). 
        Focus on Mechanics (rules/structure), Dynamics (interaction), and Emotions (feelings).
        Provide concise, structured advice.`,
        temperature: 0.7,
      }
    });

    return response.text || "I am currently processing your request. Please stand by, explorer.";
  }).catch(error => {
    console.error("Gemini Assistant Error after retries:", error);
    return "The Core is experiencing extreme neural load. Please try linking a private API key in Settings if this persists.";
  });
};

export const getLearningRecommendation = async (userProfile: any, currentFocus: string, availableModules: string[]) => {
  return withRetry(async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Profile: Level ${userProfile.level}, XP ${userProfile.xp}. 
      Current Focus: ${currentFocus}.
      
      AVAILABLE KNOWLEDGE NODES:
      ${availableModules.join(', ')}

      TASK:
      Analyze the user's trajectory and recommend ONE specific module from the AVAILABLE KNOWLEDGE NODES list. 
      Format your response to START with the name of the module in [SQUARE BRACKETS], followed by a short, simple justification (under 60 words).`,
      config: {
        systemInstruction: "You are the Mechdyane OS Adaptive Planner. You ONLY recommend modules that exist in the provided catalog."
      }
    });
    return response.text;
  }).catch(() => "Continue with your current trajectory; consistent neural firing leads to mastery.");
};

export const generateDynamicLessonContent = async (moduleTitle: string, lessonNumber: number, userLevel: number) => {
  return withRetry(async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey });
    const sessionId = Date.now().toString(36);
    
    const complexityDescription = lessonNumber <= 3 ? "foundational, very simple, and introductory" 
      : lessonNumber <= 8 ? "intermediate, practical, and hands-on" 
      : "complex, advanced, and mastery-oriented";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `[Session: ${sessionId}] Create Level ${lessonNumber} of 12 for the "${moduleTitle}" module.
      
      CURRICULUM ARCHITECTURE:
      - This lesson is stage ${lessonNumber}/12.
      - Target Complexity: ${complexityDescription}.
      - Language: Simple English (easy to read).

      STRUCTURE REQUIREMENTS for Study Notes:
      1. TITLE: A clear, simple heading.
      2. OBJECTIVES: Exactly 3 bullet points starting with "I will be able to...".
      3. CONTENT: A core introduction and explanation of the primary concepts.
      4. DETAILED NOTES: A technical "Deep Dive" section including advanced details, creative analogies, and a "Synaptic Summary".
      
      ASSESSMENT REQUIREMENTS:
      1. Create exactly 5 multiple-choice questions.
      2. Each question must have 4 options (A-D).
      3. Questions must test the specific notes generated above.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Simple title for the lesson" },
            objectives: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 clear goals for this lesson"
            },
            content: { type: Type.STRING, description: "The primary study notes. Markdown format." },
            detailedNotes: { type: Type.STRING, description: "Advanced, in-depth explanation and technical details. Markdown format." },
            quizzes: {
              type: Type.ARRAY,
              description: "Exactly 5 quiz questions",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        letter: { type: Type.STRING },
                        text: { type: Type.STRING }
                      },
                      required: ["letter", "text"]
                    }
                  },
                  correctLetter: { type: Type.STRING }
                },
                required: ["question", "options", "correctLetter"]
              }
            }
          },
          required: ["title", "objectives", "content", "detailedNotes", "quizzes"]
        },
        systemInstruction: "You are the Mechdyane OS Core Engine. You facilitate high-engagement learning through structured, simple-English notes and rigorous 5-question assessments. You strictly follow the 12-level curriculum roadmap."
      }
    });
    
    return JSON.parse(response.text || '{}');
  }).catch(error => {
    throw error;
  });
};
