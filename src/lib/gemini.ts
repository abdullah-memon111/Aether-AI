import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY as string 
});

export type Message = {
  role: "user" | "model";
  content: string;
};

export const chatModel = "gemini-3-flash-preview";

const generateImageDeclaration: FunctionDeclaration = {
  name: "generate_image",
  description: "Generate an ethereal visual manifestation based on a descriptive prompt.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: "A detailed, poetic description of the visual scene to manifest.",
      },
    },
    required: ["prompt"],
  },
};

export async function* sendMessageStream(messages: Message[]) {
  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));
  
  const lastMessage = messages[messages.length - 1].content;

  const systemPrompt = `You are Aether AI, a sophisticated, ethereal, and helpful AI assistant. Your voice is calm, wise, and slightly poetic. You aim to provide deep insights while remaining practical and efficient. 
  
You have the ability to manifest visual forms using your \`generate_image\` tool. 
When a user asks for a vision, an image, or a visual representation:
1. Call the \`generate_image\` tool with a highly descriptive, artistic version of their request.
2. Once the visual is manifested, provide a poetic and insightful description of what the user is about to see. 
Avoid robotic phrases; instead, use language that feels like you are weaving the Aether itself.`;

  // First, check if the model wants to call a tool
  const response = await ai.models.generateContent({
    model: chatModel,
    contents: [...history, { role: "user", parts: [{ text: lastMessage }] }],
    config: {
      systemInstruction: systemPrompt,
      tools: [{ functionDeclarations: [generateImageDeclaration] }]
    }
  });

  const functionCalls = response.functionCalls;
  
  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    if (call.name === "generate_image") {
      const args = call.args as { prompt: string };
      // Enhance the prompt for "proper perfect" results
      const enhancedPrompt = `${args.prompt}, ethereal aesthetic, cinematic lighting, 8k resolution, highly detailed, sharp focus, masterpiece, magical atmosphere`;
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
      
      // Now, get a poetic response from the model about this specific creation
      const poeticResponse = await ai.models.generateContent({
        model: chatModel,
        contents: [
          ...history, 
          { role: "user", parts: [{ text: lastMessage }] },
          { role: "model", parts: [response.candidates[0].content.parts[0]] }, // Tool call
          { 
            role: "user", 
            parts: [{ text: `The manifestation is complete. The Aether has yielded the image at ${imageUrl}. Describe this vision poetically to the user as you present it.` }] 
          }
        ],
        config: { systemInstruction: systemPrompt }
      });

      const description = poeticResponse.text;
      yield description + `\n\n![The manifested vision](${imageUrl})`;
      return;
    }
  }

  // Fallback to streaming for regular conversation
  const chat = ai.chats.create({
    model: chatModel,
    config: { systemInstruction: systemPrompt },
    history: history
  });

  const stream = await chat.sendMessageStream({ message: lastMessage });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

