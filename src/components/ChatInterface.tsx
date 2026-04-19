import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";
import { Message, sendMessageStream } from "../lib/gemini";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Greetings. I am Aether AI. How may I assist your journey today? I can now manifest visions through the Aether (generate images)." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage];
      let fullResponse = "";
      
      // Add a placeholder for the model response
      setMessages(prev => [...prev, { role: "model", content: "" }]);

      const stream = sendMessageStream(chatHistory);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: "model", content: fullResponse };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "model", content: "I apologize, but my connection to the Aether has been momentarily disrupted. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto relative px-4 pb-12 pt-8">
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 space-y-8 scroll-smooth"
      >
        {messages.length === 1 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl font-bold tracking-tight mb-4 text-clean-text">
              Good afternoon, Alex.
            </h1>
            <p className="text-xl text-clean-muted max-w-lg leading-relaxed mb-12">
              How can I assist your creative or technical workflow today? I'm ready to analyze, generate, or manifest visions into form.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            // Skip the first greeting if we show the hero greeting above
            i === 0 && messages.length === 1 ? null : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`mt-1 h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-clean-accent text-white" : "bg-clean-muted/10 text-clean-muted"}`}>
                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === "user" 
                      ? "bg-clean-accent text-white shadow-sm" 
                      : "bg-clean-card border border-clean-border shadow-sm text-clean-text"
                  }`}>
                    <div className="markdown-body prose prose-invert max-w-none">
                      <Markdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          img: ({ ...props }) => (
                            <img 
                              {...props} 
                              className="rounded-xl mt-4 border border-clean-border shadow-lg" 
                              referrerPolicy="no-referrer"
                            />
                          )
                        }}
                      >
                        {msg.content || (isLoading && i === messages.length - 1 ? "..." : "")}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
        
        {isLoading && messages[messages.length - 1].content === "" && (
          <div className="flex justify-start">
            <div className="flex gap-4 animate-pulse">
              <div className="mt-1 h-8 w-8 rounded-full bg-clean-muted/10 flex items-center justify-center text-clean-muted">
                <Bot size={16} />
              </div>
              <div className="py-4 px-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-clean-muted rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-clean-muted rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-clean-muted rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="mt-auto pt-6 bg-clean-bg/80 backdrop-blur-sm sticky bottom-0">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto w-full group">
          <div className="clean-input flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aether anything or request an image..."
              className="flex-1 bg-transparent border-none outline-none text-clean-text text-base placeholder:text-clean-muted"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-clean-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-clean-accent/80 transition-colors disabled:opacity-30 flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Send</>}
            </button>
          </div>
          
          <div className="flex gap-2 mt-4 justify-center">
            {[
              { label: "Summarize recent news", icon: <Sparkles size={12} /> },
              { label: "Manifest an image of a cybernetic forest", icon: <ImageIcon size={12} /> },
              { label: "Write a Python script", icon: <Sparkles size={12} /> }
            ].map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => setInput(suggestion.label)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-clean-border text-xs text-clean-muted hover:bg-white/10 transition-colors"
              >
                {suggestion.icon}
                {suggestion.label}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
