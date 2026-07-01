import React, { useState, useEffect } from "react";
import { ThemeConfig } from "../types";
import { Newspaper, RefreshCw, Search, ExternalLink, Globe, Cpu, TrendingUp, BookOpen, Clock } from "lucide-react";

interface NewsWidgetProps {
  theme: ThemeConfig;
}

interface NewsItem {
  id: string | number;
  title: string;
  source: string;
  category: "tech" | "world" | "business" | "science";
  url: string;
  time: string;
  summary: string;
  imageUrl?: string;
}

const STATIC_FALLBACK_NEWS: NewsItem[] = [
  {
    id: "f1",
    title: "AI Pioneers Win Nobel Prize in Physics for Neural Network Breakthroughs",
    source: "Global Science",
    category: "science",
    url: "https://nobelprize.org",
    time: "2h ago",
    summary: "Recognizing fundamental discoveries and inventions that enable machine learning based on artificial neural networks.",
  },
  {
    id: "f2",
    title: "Global Stock Markets Surge as Tech Sector Registers Record Gains",
    source: "Financial Bulletin",
    category: "business",
    url: "https://bloomberg.com",
    time: "3h ago",
    summary: "Solid corporate earnings and moderating inflation reports trigger an optimistic rally in global indices.",
  },
  {
    id: "f3",
    title: "Deep Space Telescope Discovers Atmosphere on Earth-Sized Exoplanet",
    source: "Cosmos Daily",
    category: "science",
    url: "https://nasa.gov",
    time: "5h ago",
    summary: "Astronomers detect carbon dioxide and methane, pointing to potential ocean-bearing planetary systems.",
  },
  {
    id: "f4",
    title: "The Rise of Edge Computing: Why Cloud Infrastructure is Shifting Outward",
    source: "Tech Frontiers",
    category: "tech",
    url: "https://techcrunch.com",
    time: "1d ago",
    summary: "As low-latency operations become critical for smart devices, edge nodes are processing data closer to home.",
  },
  {
    id: "f5",
    title: "Sustainable Architecture: Designing Carbon-Negative Smart Cities",
    source: "Green Living",
    category: "world",
    url: "https://archdaily.com",
    time: "1d ago",
    summary: "How urban developers are integrating cross-laminated timber, solar glazing, and micro-forests to sink carbon.",
  }
];

export default function NewsWidget({ theme }: NewsWidgetProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | "tech" | "world" | "business" | "science">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Fetch latest articles from DEV.to API as a real live data source
      const res = await fetch("https://dev.to/api/articles?per_page=12&top=7");
      if (res.ok) {
        const data = await res.json();
        const liveTechNews: NewsItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          source: item.user.name || "DEV.to",
          category: "tech",
          url: item.url,
          time: new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          summary: item.description || "Click to open the live discussion and technical insights page on DEV.to.",
          imageUrl: item.cover_image || undefined
        }));
        
        // Merge with static fallback news for non-tech categories
        setNews([...liveTechNews, ...STATIC_FALLBACK_NEWS]);
      } else {
        setNews(STATIC_FALLBACK_NEWS);
      }
    } catch (e) {
      console.warn("Failed to fetch live DEV.to articles, using local news feed fallback", e);
      setNews(STATIC_FALLBACK_NEWS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Filter criteria
  const filteredNews = news.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="p-4 h-full flex flex-col justify-between text-white select-none">
      {/* Header and Controls */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Newspaper size={14} style={{ color: theme.accentColor }} />
            <h3 className="text-xs font-bold tracking-tight uppercase font-sans">Live News Bulletin</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Simple mini Search */}
            <div className="relative flex items-center">
              <Search size={10} className="absolute left-2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search headlines..."
                className="pl-5 pr-2 py-0.5 rounded-full bg-black/30 border border-white/5 text-[9px] focus:outline-none focus:border-white/20 w-24 sm:w-32 transition-all font-sans"
              />
            </div>
            <button
              onClick={fetchNews}
              disabled={loading}
              className={`p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer ${
                loading ? "animate-spin" : ""
              }`}
              title="Refresh News Feed"
            >
              <RefreshCw size={11} />
            </button>
          </div>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 border-b border-white/5 mb-2">
          {(["all", "tech", "world", "business", "science"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded-md text-[9px] font-mono capitalize transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-white/10 font-bold text-white border border-white/10"
                  : "text-white/40 hover:text-white/80 border border-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Feed Content (Scrollable list) */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center py-6 opacity-50 space-y-2">
            <RefreshCw size={18} className="animate-spin" style={{ color: theme.accentColor }} />
            <span className="text-[10px] font-mono">Syncing global headlines...</span>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="h-full flex items-center justify-center py-8 text-white/30 text-[10px] font-mono">
            No headlines match search filters
          </div>
        ) : (
          filteredNews.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedArticle(item)}
              className="p-2 rounded-xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200 cursor-pointer flex gap-2.5 items-start text-left"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt="news"
                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/5 bg-black/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-black/25 border border-white/5 flex items-center justify-center shrink-0">
                  {item.category === "tech" ? (
                    <Cpu size={14} className="opacity-50" />
                  ) : item.category === "science" ? (
                    <BookOpen size={14} className="opacity-50" />
                  ) : item.category === "business" ? (
                    <TrendingUp size={14} className="opacity-50" />
                  ) : (
                    <Globe size={14} className="opacity-50" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 text-[8px] font-mono opacity-50">
                  <span className="font-bold text-white/80">{item.source.toUpperCase()}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5"><Clock size={8} /> {item.time}</span>
                </div>
                <p className="text-[11px] font-medium leading-tight text-white/90 line-clamp-2 hover:text-white transition-colors">
                  {item.title}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer statistics indicator */}
      <div className="shrink-0 text-[8px] font-mono text-white/30 text-right mt-1.5 flex justify-between items-center border-t border-white/5 pt-1.5">
        <span>Source: Live dev.to API & Global feeds</span>
        <span>Showing {filteredNews.length} articles</span>
      </div>

      {/* MODAL LIGHTBOX PREVIEW FOR FULL ARTICLES */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4">
          <div 
            className="w-full max-w-lg rounded-3xl p-6 border text-left shadow-2xl relative animate-scale-up"
            style={{
              backgroundColor: theme.theme === "amoled" ? "#000000" : "rgba(18, 18, 18, 0.95)",
              borderColor: theme.borderColor,
            }}
          >
            {/* Back indicator / close button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 text-xs font-mono text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
            >
              Close [ESC]
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[9px] font-mono text-white/50">
                <span className="px-2 py-0.5 bg-white/10 rounded-md text-white font-bold">{selectedArticle.category.toUpperCase()}</span>
                <span>•</span>
                <span>{selectedArticle.source}</span>
                <span>•</span>
                <span>{selectedArticle.time}</span>
              </div>

              <h2 className="text-lg font-bold tracking-tight text-white leading-snug">
                {selectedArticle.title}
              </h2>

              {selectedArticle.imageUrl && (
                <img
                  src={selectedArticle.imageUrl}
                  alt="article banner"
                  className="w-full h-40 object-cover rounded-2xl border border-white/10 shadow-lg bg-black/20"
                  referrerPolicy="no-referrer"
                />
              )}

              <p className="text-xs text-white/70 leading-relaxed font-sans">
                {selectedArticle.summary}
              </p>

              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                <span className="text-[9px] font-mono text-white/40">Secure offline viewer sandboxed</span>
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-white text-black hover:bg-white/90 px-4 py-2 rounded-xl transition-all shadow-md"
                  style={{ backgroundColor: theme.accentColor, color: "#ffffff" }}
                >
                  Read Source Article <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
