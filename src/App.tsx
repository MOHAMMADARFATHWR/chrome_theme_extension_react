import React, { useState, useEffect } from "react";
import { ThemeConfig, WidgetConfig, Shortcut, TodoItem, DashboardConfig } from "./types";
import SearchBar from "./components/SearchBar";
import ClockWidget from "./components/ClockWidget";
import WeatherWidget from "./components/WeatherWidget";
import ShortcutsWidget from "./components/ShortcutsWidget";
import TodoWidget from "./components/TodoWidget";
import TelemetryWidget from "./components/TelemetryWidget";
import AiCompanionWidget from "./components/AiCompanionWidget";
import GoogleAppsLauncher from "./components/GoogleAppsLauncher";
import SettingsModal from "./components/SettingsModal";
import MagicCanvas from "./components/MagicCanvas";
import StockMarketWidget from "./components/StockMarketWidget";
import NewsWidget from "./components/NewsWidget";
import UserProfile from "./components/UserProfile";
import { saveLocalWallpaper, getLocalWallpaper, deleteLocalWallpaper } from "./lib/wallpaperDb";
import { Sparkles, RefreshCw, AlertCircle, Grid, Lock, Unlock, X } from "lucide-react";

// Default configs
const defaultTheme: ThemeConfig = {
  theme: "dark",
  glassBlur: 16,
  glassOpacity: 25,
  accentColor: "#3b82f6",
  backgroundType: "gradient",
  backgroundValue: "from-slate-950 via-zinc-900 to-stone-950",
  textColor: "#f4f4f5",
  borderColor: "rgba(255,255,255,0.08)",
  glowEffect: true,
  userName: "Explorer"
};

const defaultWidgets: WidgetConfig[] = [
  { id: "clock", title: "Display Clock & Greeting", visible: true, size: "md", order: 0 },
  { id: "weather", title: "Global Live Weather", visible: true, size: "md", order: 1 },
  { id: "shortcuts", title: "Quick Shortcuts Grid", visible: true, size: "lg", order: 2 },
  { id: "todo", title: "Task & Checklist Planner", visible: true, size: "md", order: 3 },
  { id: "ai-assistant", title: "Ask Google AI Companion", visible: true, size: "lg", order: 4 },
  { id: "sys-monitor", title: "Telemetry Performance", visible: true, size: "md", order: 5 },
  { id: "stocks", title: "Stock Market Tracker", visible: true, size: "md", order: 6 },
  { id: "news", title: "Live News Bulletin", visible: true, size: "md", order: 7 }
];

const defaultShortcuts: Shortcut[] = [
  { id: "s1", title: "Google", url: "https://google.com", color: "#4285F4" },
  { id: "s2", title: "Gmail", url: "https://mail.google.com", color: "#EA4335" },
  { id: "s3", title: "YouTube", url: "https://youtube.com", color: "#FF0000" },
  { id: "s4", title: "Maps", url: "https://maps.google.com", color: "#34A853" },
  { id: "s5", title: "GitHub", url: "https://github.com", color: "#24292e" }
];

export default function App() {
  // Theme Configuration State
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem("chrome_dashboard_theme");
      return saved ? JSON.parse(saved) : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  // Widgets Configuration State
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem("chrome_dashboard_widgets");
      const parsed = saved ? JSON.parse(saved) : defaultWidgets;
      
      let updated = parsed.filter((w: any) => w.id !== "stack");
      const hasStocks = updated.some((w: any) => w.id === "stocks");
      const hasNews = updated.some((w: any) => w.id === "news");
      if (!hasStocks) {
        updated.push({ id: "stocks", title: "Stock Market Tracker", visible: true, size: "md", order: 6 });
      }
      if (!hasNews) {
        updated.push({ id: "news", title: "Live News Bulletin", visible: true, size: "md", order: 7 });
      }
      return updated;
    } catch {
      return defaultWidgets;
    }
  });

  // Bookmarks State
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
    try {
      const saved = localStorage.getItem("chrome_dashboard_shortcuts");
      return saved ? JSON.parse(saved) : defaultShortcuts;
    } catch {
      return defaultShortcuts;
    }
  });

  // Tasks State
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem("chrome_dashboard_todos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state
  const [syncCode, setSyncCode] = useState<string | null>(() => {
    return localStorage.getItem("chrome_dashboard_sync_code") || null;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Widget dragging layout locks
  const [isLocked, setIsLocked] = useState(() => {
    return localStorage.getItem("chrome_dashboard_layout_locked") === "true";
  });
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  // Interactive Focus & Hover States for Dynamic Blurs
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLensActive, setIsLensActive] = useState(false);
  const [hoveredWidgetId, setHoveredWidgetId] = useState<string | null>(null);

  // Local wallpaper states retrieved from IndexedDB
  const [localWallpaperUrl, setLocalWallpaperUrl] = useState<string | null>(null);
  const [localWallpaperMime, setLocalWallpaperMime] = useState<string>("");

  useEffect(() => {
    const loadLocalWallpaper = async () => {
      try {
        const item = await getLocalWallpaper();
        if (item) {
          const url = URL.createObjectURL(item.file);
          setLocalWallpaperUrl(url);
          setLocalWallpaperMime(item.mimeType);
        }
      } catch (e) {
        console.error("Failed to load local wallpaper", e);
      }
    };
    loadLocalWallpaper();
  }, []);

  // --- LOCAL PERSISTENCE SYNC WRITERS ---
  useEffect(() => {
    localStorage.setItem("chrome_dashboard_theme", JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("chrome_dashboard_widgets", JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem("chrome_dashboard_shortcuts", JSON.stringify(shortcuts));
  }, [shortcuts]);

  useEffect(() => {
    localStorage.setItem("chrome_dashboard_todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("chrome_dashboard_layout_locked", isLocked ? "true" : "false");
  }, [isLocked]);

  // --- CLOUD SYNC AUTOMATION CONTROLLER ---
  // Periodically send updates to the cloud if a syncCode exists
  useEffect(() => {
    if (!syncCode) return;

    const syncToCloud = async () => {
      setIsSyncing(true);
      try {
        const payload = {
          theme,
          widgets,
          shortcuts,
          todos
        };

        const res = await fetch("/api/sync/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            syncCode,
            config: payload
          })
        });

        if (res.ok) {
          setLastSynced(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.warn("Failed to update cloud sync:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    // Perform initial sync & set up recurring interval (every 10 seconds)
    syncToCloud();
    const timer = setInterval(syncToCloud, 10000);
    return () => clearInterval(timer);
  }, [syncCode, theme, widgets, shortcuts, todos]);

  // --- CLOUD SYNC HANDLERS ---
  const handleRegisterSync = async () => {
    setIsSyncing(true);
    try {
      const payload = { theme, widgets, shortcuts, todos };
      const res = await fetch("/api/sync/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: payload })
      });
      const data = await res.json();
      if (data.success) {
        setSyncCode(data.syncCode);
        localStorage.setItem("chrome_dashboard_sync_code", data.syncCode);
        setLastSynced(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Failed to register sync code:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLinkDevice = async (codeToLink: string): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/sync/get/${codeToLink}`);
      if (!res.ok) return false;

      const data = await res.json();
      if (data.success && data.config) {
        const conf = data.config;
        if (conf.theme) setTheme(conf.theme);
        if (conf.widgets) setWidgets(conf.widgets);
        if (conf.shortcuts) setShortcuts(conf.shortcuts);
        if (conf.todos) setTodos(conf.todos);

        setSyncCode(codeToLink);
        localStorage.setItem("chrome_dashboard_sync_code", codeToLink);
        setLastSynced(new Date().toLocaleTimeString());
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error linking device config:", err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearStorage = async () => {
    localStorage.clear();
    setTheme(defaultTheme);
    setWidgets(defaultWidgets);
    setShortcuts(defaultShortcuts);
    setTodos([]);
    setSyncCode(null);
    setIsLocked(false);
    setLastSynced(null);
    try {
      await deleteLocalWallpaper();
      if (localWallpaperUrl) {
        URL.revokeObjectURL(localWallpaperUrl);
      }
      setLocalWallpaperUrl(null);
      setLocalWallpaperMime("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadLocalWallpaper = async (file: File) => {
    try {
      await saveLocalWallpaper(file);
      const url = URL.createObjectURL(file);
      if (localWallpaperUrl) {
        URL.revokeObjectURL(localWallpaperUrl);
      }
      setLocalWallpaperUrl(url);
      setLocalWallpaperMime(file.type);
      setTheme(prev => ({
        ...prev,
        backgroundType: "local",
        backgroundValue: file.name
      }));
    } catch (e) {
      console.error("Failed to store local wallpaper", e);
      alert("Error saving file locally. Please try a smaller file or another format.");
    }
  };

  const handleClearLocalWallpaper = async () => {
    try {
      await deleteLocalWallpaper();
      if (localWallpaperUrl) {
        URL.revokeObjectURL(localWallpaperUrl);
      }
      setLocalWallpaperUrl(null);
      setLocalWallpaperMime("");
      setTheme(prev => ({
        ...prev,
        backgroundType: "gradient",
        backgroundValue: "from-slate-950 via-zinc-900 to-stone-950"
      }));
    } catch (e) {
      console.error("Failed to delete local wallpaper", e);
    }
  };

  // --- NATIVE DRAG AND DROP HANDLERS FOR THE WIDGET GRID ---
  const handleWidgetDragStart = (id: string, e: React.DragEvent) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleWidgetDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleWidgetDrop = (targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (isLocked || !draggedWidgetId || draggedWidgetId === targetId) return;

    const sourceIdx = widgets.findIndex(w => w.id === draggedWidgetId);
    const targetIdx = widgets.findIndex(w => w.id === targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const reordered = [...widgets];
      const sourceWidget = reordered[sourceIdx];
      
      // Swap order positions
      reordered.splice(sourceIdx, 1);
      reordered.splice(targetIdx, 0, sourceWidget);

      // Re-map order numbers explicitly
      const withUpdatedOrders = reordered.map((w, idx) => ({ ...w, order: idx }));
      setWidgets(withUpdatedOrders);
    }

    setDraggedWidgetId(null);
  };

  // --- BACKGROUND CANVAS ENGINE ---
  const getBackgroundStyle = () => {
    if (theme.backgroundType === "solid") {
      return {
        backgroundColor: theme.backgroundValue || "#09090b",
      };
    }
    if (theme.backgroundType === "local" && localWallpaperUrl) {
      if (!localWallpaperMime.startsWith("video/")) {
        return {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${localWallpaperUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
      } else {
        return {
          backgroundColor: "#000000"
        };
      }
    }
    if (theme.backgroundType === "unsplash") {
      // Direct Unsplash query based on user's keyword
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/featured/1920x1080/?${encodeURIComponent(theme.backgroundValue)}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    if (theme.backgroundType === "custom-url" && theme.backgroundValue) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${theme.backgroundValue}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    // Default to fluid gradients
    return {};
  };

  const getGradientClasses = () => {
    if (theme.backgroundType === "gradient") {
      return theme.backgroundValue;
    }
    return "";
  };

  // Render Widget Based on ID
  const renderWidgetContent = (id: string) => {
    switch (id) {
      case "clock":
        return <ClockWidget theme={theme} onUpdateUser={(name) => setTheme(prev => ({ ...prev, userName: name }))} />;
      case "weather":
        return <WeatherWidget theme={theme} />;
      case "shortcuts":
        return <ShortcutsWidget theme={theme} shortcuts={shortcuts} onUpdateShortcuts={setShortcuts} />;
      case "todo":
        return <TodoWidget theme={theme} todos={todos} onUpdateTodos={setTodos} />;
      case "ai-assistant":
        return <AiCompanionWidget theme={theme} />;
      case "sys-monitor":
        return <TelemetryWidget theme={theme} />;
      case "stocks":
        return <StockMarketWidget theme={theme} />;
      case "news":
        return <NewsWidget theme={theme} />;
      default:
        return null;
    }
  };

  // Grid styling size mapping
  const getSizeClasses = (size: WidgetConfig["size"]) => {
    switch (size) {
      case "sm":
        return "col-span-1 md:col-span-1 h-[220px]";
      case "md":
        return "col-span-1 md:col-span-2 h-[220px]";
      case "lg":
        return "col-span-1 md:col-span-3 h-[220px]";
      case "xl":
        return "col-span-1 md:col-span-4 h-[240px]";
      default:
        return "col-span-1 md:col-span-2 h-[220px]";
    }
  };

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  return (
    <div
      className={`min-h-screen relative flex flex-col justify-between transition-all duration-1000 bg-cover bg-center bg-no-repeat font-sans overflow-x-hidden ${
        theme.backgroundType === "gradient" ? `bg-gradient-to-br ${getGradientClasses()}` : ""
      }`}
      style={getBackgroundStyle()}
      id="app-root-container"
    >
      {/* 0a. HIGH-DEFINITION VIDEO WALLPAPER LOOP OR LOCAL VIDEO */}
      {((theme.backgroundType === "video" && theme.backgroundValue) || (theme.backgroundType === "local" && localWallpaperUrl && localWallpaperMime.startsWith("video/"))) && (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <video
            src={theme.backgroundType === "local" ? localWallpaperUrl! : theme.backgroundValue}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: theme.theme === "light" ? 0.65 : 0.45 }}
          />
          <div 
            className="absolute inset-0 transition-colors duration-1000" 
            style={{ 
              backgroundColor: theme.theme === "light" 
                ? "rgba(255, 255, 255, 0.15)" 
                : theme.theme === "amoled"
                ? "rgba(0, 0, 0, 0.4)"
                : "rgba(0, 0, 0, 0.25)"
            }} 
          />
        </div>
      )}

      {/* 0b. DYNAMIC COSMIC MESH FLOATING ORBS */}
      {(theme.backgroundType === "gradient" || theme.backgroundType === "animated-mesh") && (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-45 transition-all duration-1000">
          <div 
            className="absolute top-[10%] left-[15%] w-[40rem] h-[40rem] rounded-full blur-[150px] animate-float-slow transition-colors duration-1000"
            style={{ backgroundColor: `${theme.accentColor}25` }}
          />
          <div 
            className="absolute bottom-[15%] right-[10%] w-[35rem] h-[35rem] rounded-full blur-[130px] animate-float-medium transition-colors duration-1000"
            style={{ backgroundColor: `${theme.accentColor}15` }}
          />
          <div 
            className="absolute top-[40%] left-[60%] w-[25rem] h-[25rem] rounded-full blur-[110px] animate-float-fast transition-colors duration-1000"
            style={{ backgroundColor: `${theme.accentColor}10` }}
          />
        </div>
      )}

      {/* 0c. INTERACTIVE MAGIC CANVAS ANIMATION PARTICLES */}
      <MagicCanvas theme={theme} />

      {/* 1. TOP RAIL / BAR PANEL */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-50 shrink-0">
        {/* Logo Brand */}
        <div className="flex items-center gap-2 select-none group">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg transition-transform duration-300 group-hover:rotate-12"
            style={{ 
              backgroundColor: theme.accentColor,
              boxShadow: theme.glowEffect ? `0 4px 14px ${theme.accentColor}55` : "none"
            }}
          >
            C
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
              Chrome <span className="text-[10px] font-mono opacity-50 font-normal px-1 py-0.2 bg-white/10 rounded">v3.5</span>
            </span>
            <span className="text-[9px] font-mono opacity-40 leading-none">New Tab Dashboard</span>
          </div>
        </div>

        {/* Sync & Lock State Indicators */}
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-white/50 bg-black/35 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
          {syncCode && (
            <div className="flex items-center gap-1.5 border-r border-white/10 pr-3 mr-1">
              <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} style={{ color: theme.accentColor }} />
              <span>Synced: <span className="font-bold text-white">{lastSynced || "active"}</span></span>
            </div>
          )}
          <button 
            onClick={() => setIsLocked(!isLocked)}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            {isLocked ? <Lock size={10} className="text-amber-400" /> : <Unlock size={10} className="text-emerald-400" />}
            <span>{isLocked ? "Layout Locked" : "Drag Unlocked"}</span>
          </button>
        </div>

        {/* Control Tools Drawer */}
        <div className="flex items-center gap-2">
          <GoogleAppsLauncher theme={theme} />
          
          <UserProfile theme={theme} />
          
          <SettingsModal
            theme={theme}
            onUpdateTheme={(up) => setTheme(prev => ({ ...prev, ...up }))}
            widgets={widgets}
            onUpdateWidgets={setWidgets}
            isLocked={isLocked}
            onToggleLock={() => setIsLocked(!isLocked)}
            syncCode={syncCode}
            onRegisterSync={handleRegisterSync}
            onLinkDevice={handleLinkDevice}
            onClearStorage={handleClearStorage}
            localWallpaperUrl={localWallpaperUrl}
            localWallpaperMime={localWallpaperMime}
            onUploadLocalWallpaper={handleUploadLocalWallpaper}
            onClearLocalWallpaper={handleClearLocalWallpaper}
          />
        </div>
      </header>

      {/* 2. CORE WORKSPACE */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-6 flex flex-col justify-center relative z-40">
        
        {/* Integrated Centered Search bar with interaction listeners */}
        <SearchBar 
          theme={theme} 
          onFocusChange={setIsSearchFocused}
          onLensActiveChange={setIsLensActive}
        />

        {/* Dashboard Widgets Board */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {sortedWidgets
            .filter((w) => w.visible)
            .map((w) => {
              // Interactive dynamic filter and scaling calculations
              const currentBlur = (() => {
                let blurVal = theme.glassBlur;
                if (isSearchFocused) return blurVal + 8; // Deep blur background to focus search query input
                if (isLensActive) return blurVal + 12; // Deep blur for lens analysis card
                if (hoveredWidgetId) {
                  if (hoveredWidgetId === w.id) {
                    return Math.max(2, blurVal - 6); // Sharpen active hovered widget for visual focus
                  } else {
                    return blurVal + 6; // Blur secondary cards more
                  }
                }
                return blurVal;
              })();

              const currentOpacityAndScale = (() => {
                if (isSearchFocused || isLensActive) {
                  return "opacity-35 scale-98 blur-[0.5px] pointer-events-none";
                }
                if (hoveredWidgetId) {
                  if (hoveredWidgetId === w.id) {
                    return "opacity-100 scale-[1.015] z-30 shadow-2xl";
                  } else {
                    return "opacity-50 scale-97 saturate-50 blur-[0.2px] z-10";
                  }
                }
                return "opacity-100 scale-100 z-20";
              })();

              return (
                <div
                  key={w.id}
                  draggable={!isLocked}
                  onDragStart={(e) => handleWidgetDragStart(w.id, e)}
                  onDragOver={handleWidgetDragOver}
                  onDrop={(e) => handleWidgetDrop(w.id, e)}
                  onMouseEnter={() => setHoveredWidgetId(w.id)}
                  onMouseLeave={() => setHoveredWidgetId(null)}
                  className={`relative rounded-3xl border flex flex-col justify-between overflow-hidden group/widget transition-all duration-500 ease-out ${getSizeClasses(
                    w.size
                  )} ${currentOpacityAndScale} ${
                    draggedWidgetId === w.id 
                      ? "opacity-10 scale-95 border-dashed border-white/20 shadow-none" 
                      : ""
                  }`}
                  style={{
                    backgroundColor: `${
                      theme.theme === "light"
                        ? `rgba(255, 255, 255, ${theme.glassOpacity / 100})`
                        : theme.theme === "amoled"
                        ? "rgba(0, 0, 0, 0.92)"
                        : `rgba(10, 10, 10, ${theme.glassOpacity / 100})`
                    }`,
                    borderColor: theme.borderColor,
                    backdropFilter: `blur(${currentBlur}px)`,
                    boxShadow: theme.glowEffect 
                      ? hoveredWidgetId === w.id 
                        ? `0 20px 40px -15px rgba(0,0,0,0.5), 0 0 20px ${(theme.accentColor)}35`
                        : `0 8px 32px 0 rgba(0,0,0,0.15), 0 0 10px ${(theme.accentColor)}0a`
                      : "none"
                  }}
                >
                  {/* Custom Widget Controls (Visible ONLY when layout is UNLOCKED) */}
                  {!isLocked && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-50 animate-fade-in bg-black/75 border border-white/10 px-2 py-1 rounded-xl shadow-lg">
                      {/* Size Cycler */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const sizes: WidgetConfig["size"][] = ["sm", "md", "lg", "xl"];
                          const currentIdx = sizes.indexOf(w.size);
                          const nextIdx = (currentIdx + 1) % sizes.length;
                          const nextSize = sizes[nextIdx];
                          const updated = widgets.map(item => item.id === w.id ? { ...item, size: nextSize } : item);
                          setWidgets(updated);
                        }}
                        className="text-[9px] font-mono font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                        title="Resize Widget (Cycle size)"
                      >
                        {w.size.toUpperCase()}
                      </button>
                      
                      {/* Hide Widget */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = widgets.map(item => item.id === w.id ? { ...item, visible: false } : item);
                          setWidgets(updated);
                        }}
                        className="text-red-400 hover:text-red-300 p-0.5 hover:bg-white/10 rounded-md transition-all cursor-pointer"
                        title="Hide Widget"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}

                  {/* Drag Handle Indicator (visible on hover if unlocked) */}
                  {!isLocked && (
                    <div className="absolute top-2.5 left-2.5 p-1 bg-black/40 border border-white/5 text-white/40 group-hover/widget:text-white/80 opacity-0 group-hover/widget:opacity-100 transition-all rounded-md cursor-grab active:cursor-grabbing z-50">
                      <Grid size={11} />
                    </div>
                  )}

                  {/* Main Widget Inner content */}
                  <div className="flex-1 h-full">
                    {renderWidgetContent(w.id)}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Tactile Unlocked Widget Dock (Allows quick adding/removing widgets directly on the grid) */}
        {!isLocked && (
          <div className="mt-8 p-5 rounded-2xl bg-black/40 border border-white/10 text-center backdrop-blur-md animate-fade-in max-w-2xl mx-auto shadow-2xl">
            <h4 className="text-[10px] font-mono text-white/60 mb-3 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Grid size={11} style={{ color: theme.accentColor }} /> Dashboard Active Widgets Dock
            </h4>
            <p className="text-[10px] text-white/40 mb-3 font-sans">
              Click any badge to toggle its visibility on the grid in real-time. Drag and drop cards above to rearrange their positions.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {widgets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    const updated = widgets.map(item => item.id === w.id ? { ...item, visible: !item.visible } : item);
                    setWidgets(updated);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    w.visible 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20" 
                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{w.title.replace("Grid", "").replace("Live", "").replace("Performance", "").split(" ")[0]}</span>
                  <span>{w.visible ? "✓" : "+ Add"}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. COZY FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-white/35 relative z-50 border-t border-white/5 mt-8 backdrop-blur-sm">
        <span>Chrome Workspace • Powered by Gemini AI • Build by <a href="https://github.com/MOHAMMADARFATHWR" target="_blank" rel="noreferrer" className="underline hover:text-white transition-colors">MOHAMMADARFATHWR</a></span>
        
        <div className="flex gap-4 mt-2 sm:mt-0">
          <a href="https://github.com/MOHAMMADARFATHWR" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Developer Portal</a>
          <span>•</span>
          <button 
            onClick={() => alert("Help Tips:\n1. Open Settings (top-right gear icon) to customize the aesthetic, opacity, colors, wallpaper types (gradients, solid colors, video loops, Unsplash), or generate/sync Codes.\n2. Click 'Layout Locked' to switch to 'Drag Unlocked' mode. This displays real-time sizing cycles, hide actions, and a floating Widget Config Dock!\n3. Standard Drag & Drop allows rearranging cards on the fly.\n4. Ask Google AI directly in the search bar to run quick Gemini summaries.\n5. Click the Camera icon to run image identification via Google Lens API.")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            How to Use Dashboard
          </button>
        </div>
      </footer>
    </div>
  );
}
