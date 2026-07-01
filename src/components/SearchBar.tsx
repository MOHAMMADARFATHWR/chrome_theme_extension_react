import React, { useState, useEffect, useRef } from "react";
import { Search, Camera, Mic, Sparkles, X, Globe, Bot, Image, AlertCircle, Volume2 } from "lucide-react";
import { ThemeConfig } from "../types";

interface SearchBarProps {
  theme: ThemeConfig;
  onFocusChange?: (focused: boolean) => void;
  onLensActiveChange?: (active: boolean) => void;
}

export default function SearchBar({ theme, onFocusChange, onLensActiveChange }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"web" | "gemini">("web");
  
  // Voice Search states
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Google Lens states
  const [lensImage, setLensImage] = useState<string | null>(null);
  const [lensLoading, setLensLoading] = useState(false);
  const [lensResult, setLensResult] = useState<string | null>(null);
  const [lensError, setLensError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Notify parent on Lens/Ask results visibility
  useEffect(() => {
    const isLensActive = !!(lensImage || lensLoading || lensResult || lensError);
    if (onLensActiveChange) {
      onLensActiveChange(isLensActive);
    }
  }, [lensImage, lensLoading, lensResult, lensError, onLensActiveChange]);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        // If web search, auto fire
        if (searchMode === "web") {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(transcript)}`, "_blank");
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [searchMode]);

  const triggerVoiceSearch = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } else {
      alert("Voice Search is not supported or blocked in this browser. Try opening the app in a new tab.");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (searchMode === "web") {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    } else {
      // Trigger Ask Google (Gemini search query modal popup)
      triggerLensOrGeminiAnalysis(query);
    }
  };

  // Google Lens: Image Selection
  const handleLensIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLensImage(event.target.result as string);
          setLensResult(null);
          setLensError(null);
          // Auto analyze upload
          analyzeWithLens(event.target.result as string, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeWithLens = async (base64Data: string, mimeType: string) => {
    setLensLoading(true);
    setLensError(null);
    try {
      const res = await fetch("/api/gemini/lens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Identify the object(s) in this image. Give a descriptive breakdown, search queries, and 3 specific search keywords at the end.",
          imageBase64: base64Data,
          mimeType: mimeType
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lens API failed. Ensure API key is configured.");
      }
      setLensResult(data.reply);
    } catch (err: any) {
      console.error(err);
      setLensError(err.message || "Failed to analyze image with Google Lens.");
    } finally {
      setLensLoading(false);
    }
  };

  // Trigger text analysis via Search (when in Gemini mode)
  const triggerLensOrGeminiAnalysis = async (textPrompt: string) => {
    setLensImage(null);
    setLensLoading(true);
    setLensResult(null);
    setLensError(null);
    try {
      const res = await fetch("/api/gemini/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textPrompt })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to ask Gemini.");
      }
      setLensResult(data.reply);
    } catch (err: any) {
      console.error(err);
      setLensError(err.message || "Ask Google failed to retrieve AI result.");
    } finally {
      setLensLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-10 text-center" id="search-bar-root">
      {/* Search Mode Toggles */}
      <div className="flex justify-center gap-3 mb-3 text-xs font-mono">
        <button
          onClick={() => { setSearchMode("web"); setLensResult(null); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
            searchMode === "web"
              ? "bg-white/10 text-white font-bold"
              : "bg-transparent text-white/50 border-transparent hover:text-white/80"
          }`}
          style={{ borderColor: searchMode === "web" ? theme.accentColor : "transparent" }}
        >
          <Globe size={11} style={{ color: searchMode === "web" ? theme.accentColor : "inherit" }} />
          <span>Google Search</span>
        </button>
        <button
          onClick={() => setSearchMode("gemini")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
            searchMode === "gemini"
              ? "bg-white/10 text-white font-bold"
              : "bg-transparent text-white/50 border-transparent hover:text-white/80"
          }`}
          style={{ borderColor: searchMode === "gemini" ? theme.accentColor : "transparent" }}
        >
          <Bot size={11} style={{ color: searchMode === "gemini" ? theme.accentColor : "inherit" }} />
          <span>Ask Google AI</span>
        </button>
      </div>

      {/* Main Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex items-center w-full px-4 py-3 border rounded-full shadow-2xl transition-all duration-300 group"
        style={{
          backgroundColor: `${theme.theme === 'light' ? 'rgba(255,255,255,0.75)' : 'rgba(20,20,20,0.75)'}`,
          borderColor: theme.borderColor,
          backdropFilter: `blur(${theme.glassBlur}px)`,
          boxShadow: theme.glowEffect ? `0 0 25px ${theme.accentColor}26` : "none"
        }}
      >
        <Search size={18} className="mr-3 opacity-60" style={{ color: theme.textColor }} />

        <input
          type="text"
          placeholder={searchMode === "web" ? "Search Google or type a URL..." : "Ask Google (Gemini) anything..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => onFocusChange && onFocusChange(true)}
          onBlur={() => onFocusChange && onFocusChange(false)}
          className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-white/35 font-sans"
          style={{ color: theme.textColor }}
        />

        {/* Action icons */}
        <div className="flex items-center gap-2.5 ml-3">
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 hover:bg-white/10 rounded-full cursor-pointer"
              style={{ color: theme.textColor }}
            >
              <X size={14} />
            </button>
          )}

          {/* Hidden File Input for Google Lens */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleLensIconClick}
            className="p-1.5 hover:bg-white/10 rounded-full transition-transform hover:scale-110 cursor-pointer"
            style={{ color: theme.textColor }}
            title="Google Lens (Identify or analyze image)"
          >
            <Camera size={15} style={{ color: theme.accentColor }} />
          </button>

          <button
            type="button"
            onClick={triggerVoiceSearch}
            className={`p-1.5 hover:bg-white/10 rounded-full transition-transform hover:scale-110 cursor-pointer ${
              isListening ? "animate-ping bg-white/20" : ""
            }`}
            style={{ color: theme.textColor }}
            title="Google Voice Search"
          >
            <Mic size={15} style={{ color: theme.accentColor }} />
          </button>
        </div>
      </form>

      {/* Voice listening status animation overlay */}
      {isListening && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[1000] backdrop-blur-md">
          <div className="p-8 rounded-2xl bg-zinc-900 border border-white/15 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white animate-pulse">
              <Mic size={28} />
            </div>
            <h3 className="text-white text-base font-bold">Google Voice Search</h3>
            <span className="text-xs text-white/60 font-mono">Listening now... Speak clearly</span>
            
            {/* Real audio waveform ripple simulation */}
            <div className="flex gap-1 items-end h-6 mt-2">
              {[...Array(6)].map((_, i) => (
                <span 
                  key={i} 
                  className="w-1.5 bg-blue-500 rounded-full animate-bounce" 
                  style={{ 
                    height: `${Math.floor(Math.random() * 20) + 5}px`, 
                    animationDuration: `${0.4 + i * 0.1}s` 
                  }} 
                />
              ))}
            </div>

            <button
              onClick={() => setIsListening(false)}
              className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Google Lens or Ask Google Results Container */}
      {(lensImage || lensLoading || lensResult || lensError) && (
        <div
          className="mt-4 p-5 rounded-2xl border text-left text-xs leading-relaxed overflow-hidden shadow-2xl animate-fade-in relative z-50"
          style={{
            backgroundColor: `${theme.theme === 'light' ? 'rgba(255,255,255,0.92)' : 'rgba(18,18,18,0.92)'}`,
            borderColor: theme.borderColor,
            backdropFilter: `blur(${theme.glassBlur + 4}px)`,
            color: theme.textColor
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5 border-b border-white/5 pb-2">
            <span className="font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
              {lensImage ? (
                <>
                  <Camera size={13} style={{ color: theme.accentColor }} /> Google Lens Search
                </>
              ) : (
                <>
                  <Sparkles size={13} style={{ color: theme.accentColor }} /> Ask Google AI Result
                </>
              )}
            </span>
            <button
              onClick={() => {
                setLensImage(null);
                setLensResult(null);
                setLensError(null);
              }}
              className="p-1 hover:bg-white/10 rounded-full"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start">
            {/* Image Preview if applicable */}
            {lensImage && (
              <div className="relative rounded-lg overflow-hidden border border-white/10 shrink-0 max-w-[140px] shadow-md mx-auto md:mx-0">
                <img src={lensImage} alt="Lens Query" className="object-cover max-h-32 rounded-lg" />
              </div>
            )}

            {/* Analysis Result/Loader */}
            <div className="flex-1 w-full font-sans">
              {lensLoading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${theme.accentColor}33`, borderTopColor: theme.accentColor }} />
                  <span className="font-mono text-[10px] mt-3 opacity-60">
                    {lensImage ? "Uploading & analyzing image metadata..." : "Consulting Google Knowledge Graph..."}
                  </span>
                </div>
              ) : lensError ? (
                <div className="p-3 border border-red-500/15 bg-red-500/5 text-red-300 rounded-xl flex items-start gap-2">
                  <AlertCircle size={15} className="mt-0.5 text-red-400 shrink-0" />
                  <span className="font-mono text-[11px]">{lensError}</span>
                </div>
              ) : lensResult ? (
                <div className="whitespace-pre-wrap leading-relaxed markdown-body">
                  {lensResult}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
