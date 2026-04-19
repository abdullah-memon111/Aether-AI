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
  description: "Generate an image based on a descriptive prompt using the Pollinations.ai API.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: "A detailed description of the image to generate.",
      },
      width: {
        type: Type.NUMBER,
        description: "The width of the image. Default is 1024.",
      },
      height: {
        type: Type.NUMBER,
        description: "The height of the image. Default is 1024.",
      },
      seed: {
        type: Type.NUMBER,
        description: "A random seed for reproducibility.",
      }
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

  const chat = ai.chats.create({
    model: chatModel,
    config: {
      systemInstruction: "You are Aether AI, a sophisticated, ethereal, and helpful AI assistant. Your voice is calm, wise, and slightly poetic. You aim to provide deep insights while remaining practical and efficient. You have the ability to generate images upon request using your `generate_image` tool. When you generate an image, always explain what you are creating.",
    },
    history: history
  });

  const response = await ai.models.generateContent({
    model: chatModel,
    contents: [...history, { role: "user", parts: [{ text: lastMessage }] }],
    config: {
      systemInstruction: "You are Aether AI, a sophisticated, ethereal, and helpful AI assistant. Your voice is calm, wise, and slightly poetic. You aim to provide deep insights while remaining practical and efficient. You have the ability to generate images upon request using your `generate_image` tool. When you generate an image, always explain what you are creating.",
      tools: [{ functionDeclarations: [generateImageDeclaration] }]
    }
  });

  // Handle Function Calling
  const functionCalls = response.functionCalls;
  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    if (call.name === "generate_image") {
      const args = call.args as { prompt: string; width?: number; height?: number; seed?: number };
      const seed = args.seed || Math.floor(Math.random() * 1000000);
      const width = args.width || 1024;
      const height = args.height || 1024;
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(args.prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
      
      yield `I am manifesting your vision into visual form... \n\n![Generated Image](${imageUrl})`;
      return;
    }
  }

  // If no function call, do regular streaming
  const stream = await chat.sendMessageStream({ message: lastMessage });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

