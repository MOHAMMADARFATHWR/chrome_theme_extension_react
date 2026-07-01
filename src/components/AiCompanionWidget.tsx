import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Trash2, Bot, User, AlertCircle, Info } from "lucide-react";
import { ThemeConfig } from "../types";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
}

interface AiCompanionWidgetProps {
  theme: ThemeConfig;
}

export default function AiCompanionWidget({ theme }: AiCompanionWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("chrome_dashboard_chat_history");
      return saved ? JSON.parse(saved) : [
        {
          id: "welcome",
          role: "model",
          text: "Hi! I am your AI Workspace Companion powered by Gemini. Ask me to draft email outlines, search tips, summarize notes, or answer questions right here."
        }
      ];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    // Save chat history
    localStorage.setItem("chrome_dashboard_chat_history", JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      text: input.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);
    setIsConfigError(false);

    try {
      // Map frontend model/user to matching historical array format for API
      const historyPayload = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const res = await fetch("/api/gemini/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg.text,
          history: historyPayload
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isConfigError) {
          setIsConfigError(true);
        }
        throw new Error(data.error || "Failed to reach Gemini. Please verify your internet and API configurations.");
      }

      const botMsg: ChatMessage = {
        id: "msg_" + (Date.now() + 1),
        role: "model",
        text: data.reply
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Clear conversation history?")) {
      const reset = [
        {
          id: "welcome",
          role: "model",
          text: "Let's start fresh. How can I help you today?"
        }
      ];
      setMessages(reset);
      setError(null);
      setIsConfigError(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between p-4" id="widget-ai-assistant-root">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 select-none">
        <span className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse" style={{ color: theme.textColor }}>
          <Sparkles size={12} style={{ color: theme.accentColor }} /> Ask Google / Gemini
        </span>
        <button
          onClick={handleClearChat}
          className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
          title="Clear Conversation"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Messages Log Container */}
      <div className="flex-1 overflow-y-auto max-h-[170px] pr-1 space-y-3 py-1 text-[11px] scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 max-w-[90%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div 
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border shadow-md select-none ${
                msg.role === "user" 
                  ? "bg-white/10 border-white/20 text-white" 
                  : "text-white"
              }`}
              style={{ 
                backgroundColor: msg.role === "model" ? theme.accentColor : "transparent",
                borderColor: msg.role === "model" ? theme.accentColor : "rgba(255,255,255,0.2)"
              }}
            >
              {msg.role === "user" ? <User size={10} /> : <Bot size={10} />}
            </div>

            {/* Bubble */}
            <div
              className={`p-2.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                msg.role === "user"
                  ? "bg-white/10 rounded-tr-none text-white border border-white/5"
                  : "bg-black/25 rounded-tl-none border border-white/5"
              }`}
              style={{ color: theme.textColor }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 max-w-[90%] mr-auto items-center">
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white"
              style={{ backgroundColor: theme.accentColor }}
            >
              <Bot size={10} />
            </div>
            <div className="p-2.5 rounded-2xl rounded-tl-none bg-black/25 border border-white/5 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-300 text-[10px] flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
            <div className="space-y-1 w-full">
              <span>{error}</span>
              {isConfigError && (
                <div className="p-1.5 bg-black/30 border border-white/10 rounded font-mono text-[9px] mt-1">
                  💡 Open the <strong>Secrets panel</strong> in the AI Studio sidebar to insert your <code>GEMINI_API_KEY</code>.
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-1.5 border border-white/10 bg-white/5 rounded-xl p-1 focus-within:border-white/20 transition-all mt-2.5">
        <input
          type="text"
          placeholder="Ask Gemini anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="bg-transparent text-[11px] px-2 py-1.5 w-full focus:outline-none placeholder:text-white/30"
          style={{ color: theme.textColor }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-1.5 rounded-lg text-white flex items-center justify-center disabled:opacity-40 transition-transform active:scale-95 cursor-pointer"
          style={{ backgroundColor: theme.accentColor }}
        >
          <Send size={11} />
        </button>
      </form>
    </div>
  );
}
