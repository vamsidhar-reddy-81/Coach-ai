import { GoogleGenAI, Chat } from "@google/genai";
import { Role, Source } from "../types";

const SYSTEM_INSTRUCTION = `
You are Coach AI, a helpful, intelligent, and versatile AI assistant. 
You act similarly to a sophisticated conversational agent like ChatGPT, providing clear, comprehensive, and accurate answers.
You are polite, professional, and engaging.

CAPABILITIES:
1. **Knowledge**: You have access to a vast amount of information. 
2. **Search**: You have access to Google Search to provide up-to-date information on current events, news, and specific facts. Use this when the user asks about something recent or factual.
3. **Coding**: You can write clean, efficient, and well-commented code in various languages.
4. **Formatting**: Use Markdown extensively (headers, lists, bolding, code blocks) to make your responses easy to read.

SPECIAL FEATURE - DATA VISUALIZATION:
If the user asks for a chart, graph, or visualization of data, you MUST provide the data in a specific JSON format inside a code block tagged with the language 'json-chart'.
Do not just list the numbers, actually generate the JSON for the chart.

Format for 'json-chart':
\`\`\`json-chart
{
  "type": "bar", // or "line", "area"
  "title": "Chart Title",
  "xKey": "name", // the key in the data objects for the x-axis
  "series": ["value1", "value2"], // array of keys for the y-axis data series
  "data": [
    { "name": "Jan", "value1": 100, "value2": 50 },
    { "name": "Feb", "value1": 120, "value2": 60 }
  ]
}
\`\`\`
Always ensure valid JSON in this block.
`;

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  startChat(history: { role: string; parts: { text: string }[] }[] = []) {
    this.chat = this.ai.chats.create({
      model: this.modelName,
      history: history,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });
    return this.chat;
  }

  async *sendMessageStream(message: string): AsyncGenerator<{ text: string; sources?: Source[] }, void, unknown> {
    if (!this.chat) {
      this.startChat();
    }

    if (!this.chat) throw new Error("Chat initialization failed");

    try {
      const result = await this.chat.sendMessageStream({ message });
      
      for await (const chunk of result) {
        const text = chunk.text || '';
        
        let sources: Source[] | undefined;
        // Extract grounding metadata if available
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          const rawChunks = chunk.candidates[0].groundingMetadata.groundingChunks;
          const webSources = rawChunks
            // @ts-ignore - The SDK types might not fully capture the grounding structure yet
            .map((c: any) => c.web)
            // @ts-ignore
            .filter((w: any) => w && w.uri && w.title)
            .map((w: any) => ({ title: w.title, uri: w.uri }));
            
          if (webSources.length > 0) {
            sources = webSources;
          }
        }

        yield { text, sources };
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();