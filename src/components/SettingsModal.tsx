import React, { useState } from "react";
import { Settings, X, Sliders, Palette, LayoutGrid, RefreshCw, Smartphone, Key, AlertCircle, Info } from "lucide-react";
import { ThemeConfig, WidgetConfig } from "../types";

interface SettingsModalProps {
  theme: ThemeConfig;
  onUpdateTheme: (updated: Partial<ThemeConfig>) => void;
  widgets: WidgetConfig[];
  onUpdateWidgets: (updated: WidgetConfig[]) => void;
  isLocked: boolean;
  onToggleLock: () => void;
  syncCode: string | null;
  onRegisterSync: () => void;
  onLinkDevice: (code: string) => Promise<boolean>;
  onClearStorage: () => void;
  localWallpaperUrl: string | null;
  localWallpaperMime: string;
  onUploadLocalWallpaper: (file: File) => void;
  onClearLocalWallpaper: () => void;
}

export default function SettingsModal({
  theme,
  onUpdateTheme,
  widgets,
  onUpdateWidgets,
  isLocked,
  onToggleLock,
  syncCode,
  onRegisterSync,
  onLinkDevice,
  onClearStorage,
  localWallpaperUrl,
  localWallpaperMime,
  onUploadLocalWallpaper,
  onClearLocalWallpaper
}: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"visuals" | "widgets" | "sync">("visuals");
  const [linkInput, setLinkInput] = useState("");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const presets = [
    { name: "Default Glow", accent: "#3b82f6", blur: 16, opacity: 25 },
    { name: "Nordic Minimal", accent: "#14b8a6", blur: 24, opacity: 15 },
    { name: "Cyberpunk Terminal", accent: "#10b981", blur: 12, opacity: 40 },
    { name: "Midnight Rose", accent: "#ec4899", blur: 20, opacity: 30 },
  ];

  const backgroundPresets = [
    { name: "Cosmic Dark Mesh", type: "gradient", value: "from-slate-950 via-zinc-900 to-stone-950" },
    { name: "Emerald Auroras", type: "gradient", value: "from-zinc-950 via-slate-900 to-teal-950" },
    { name: "Volcanic Crimson", type: "gradient", value: "from-stone-950 via-zinc-900 to-rose-950" },
    { name: "Royal Purple Glow", type: "gradient", value: "from-neutral-950 via-zinc-900 to-indigo-950" },
    { name: "Vaporwave Dusk", type: "gradient", value: "from-slate-950 via-fuchsia-950 to-indigo-950" },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    onUpdateTheme({
      accentColor: p.accent,
      glassBlur: p.blur,
      glassOpacity: p.opacity
    });
  };

  const handleWidgetToggle = (id: string) => {
    const updated = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    onUpdateWidgets(updated);
  };

  const handleLinkDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;
    setSyncStatus("Linking...");
    const success = await onLinkDevice(linkInput.trim());
    if (success) {
      setSyncStatus("Device linked successfully! All configurations are auto-syncing.");
      setLinkInput("");
    } else {
      setSyncStatus("Linking failed. Sync Code not found or expired.");
    }
  };

  return (
    <div id="settings-modal-root">
      {/* Settings Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-full transition-all duration-300 hover:bg-white/10 flex items-center justify-center cursor-pointer group"
        style={{ color: theme.textColor }}
        title="Dashboard Customization"
      >
        <Settings size={18} className="group-hover:rotate-45 transition-transform duration-500" />
      </button>

      {/* Modal Popup overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
            style={{
              backgroundColor: `${theme.theme === 'light' ? 'rgba(255,255,255,0.92)' : 'rgba(18,18,18,0.92)'}`,
              borderColor: theme.borderColor,
              backdropFilter: `blur(${theme.glassBlur + 10}px)`,
              color: theme.textColor
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest flex items-center gap-2">
                <Sliders size={14} style={{ color: theme.accentColor }} /> Dashboard Control Hub
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Inner Layout Split */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto">
              {/* Sidebar Tabs */}
              <div className="w-full md:w-48 border-r border-white/5 p-2 flex flex-row md:flex-col gap-1 shrink-0">
                <button
                  onClick={() => setActiveTab("visuals")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors w-full ${
                    activeTab === "visuals" ? "bg-white/10 font-bold" : "hover:bg-white/5 opacity-70"
                  }`}
                >
                  <Palette size={13} style={{ color: theme.accentColor }} />
                  <span>Theming & Visuals</span>
                </button>
                <button
                  onClick={() => setActiveTab("widgets")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors w-full ${
                    activeTab === "widgets" ? "bg-white/10 font-bold" : "hover:bg-white/5 opacity-70"
                  }`}
                >
                  <LayoutGrid size={13} style={{ color: theme.accentColor }} />
                  <span>Manage Widgets</span>
                </button>
                <button
                  onClick={() => setActiveTab("sync")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors w-full ${
                    activeTab === "sync" ? "bg-white/10 font-bold" : "hover:bg-white/5 opacity-70"
                  }`}
                >
                  <RefreshCw size={13} style={{ color: theme.accentColor }} />
                  <span>Cloud Device Sync</span>
                </button>
              </div>

              {/* Tab Panel */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5">
                {/* 1. THEME & VISUALS TAB */}
                {activeTab === "visuals" && (
                  <div className="space-y-4">
                    {/* User display name */}
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1">User Greeting Name</label>
                      <input
                        type="text"
                        value={theme.userName}
                        onChange={(e) => onUpdateTheme({ userName: e.target.value })}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-black/25 border border-white/10 focus:outline-none focus:border-white/30"
                      />
                    </div>

                    {/* Dark/Light mode selector */}
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1.5">Theme Palette</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["dark", "light", "amoled"] as const).map(m => (
                          <button
                            key={m}
                            onClick={() => onUpdateTheme({ 
                              theme: m,
                              textColor: m === "light" ? "#18181b" : "#f4f4f5",
                              borderColor: m === "light" ? "rgba(24,24,27,0.12)" : "rgba(255,255,255,0.08)"
                            })}
                            className={`px-3 py-1.5 rounded-lg border text-xs capitalize cursor-pointer transition-all ${
                              theme.theme === m ? "bg-white/10 font-bold border-white/20" : "bg-transparent border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            {m === "amoled" ? "AMOLED Dark" : `${m} Mode`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick presets */}
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1.5">Aesthetic Glass Presets</label>
                      <div className="grid grid-cols-2 gap-2">
                        {presets.map(p => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleApplyPreset(p)}
                            className="p-2 text-left rounded-lg bg-black/10 hover:bg-black/25 border border-white/5 flex flex-col cursor-pointer hover:border-white/15 transition-all"
                          >
                            <span className="text-xs font-bold">{p.name}</span>
                            <span className="text-[9px] opacity-50">Blur: {p.blur}px / Opacity: {p.opacity}%</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wallpapers */}
                    <div className="space-y-3.5 border-t border-white/5 pt-4">
                      <label className="text-[10px] font-mono opacity-50 block mb-1">Select Wallpaper Type</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["gradient", "solid", "video", "local", "unsplash", "custom-url"] as const).map(bt => (
                          <button
                            key={bt}
                            type="button"
                            onClick={() => {
                              let defaultValue = "";
                              if (bt === "gradient") defaultValue = "from-slate-950 via-zinc-900 to-stone-950";
                              if (bt === "solid") defaultValue = "#09090b";
                              if (bt === "video") defaultValue = "https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-blue-lights-31835-large.mp4";
                              if (bt === "local") defaultValue = "offline-upload";
                              if (bt === "unsplash") defaultValue = "abstract art";
                              if (bt === "custom-url") defaultValue = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe";
                              onUpdateTheme({
                                backgroundType: bt,
                                backgroundValue: defaultValue
                              });
                            }}
                            className={`px-2 py-1.5 rounded-lg border text-[10px] capitalize cursor-pointer transition-all ${
                              theme.backgroundType === bt ? "bg-white/10 font-bold border-white/20" : "bg-transparent border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            {bt === "custom-url" ? "Custom URL" : bt === "local" ? "Local Upload" : bt}
                          </button>
                        ))}
                      </div>

                      {/* CONDITIONAL RENDER PER WALLPAPER TYPE */}
                      {theme.backgroundType === "gradient" && (
                        <div>
                          <label className="text-[9px] font-mono opacity-50 block mb-1.5">Preset Gradient Meshes</label>
                          <div className="grid grid-cols-2 gap-2">
                            {backgroundPresets.map(bp => (
                              <button
                                key={bp.name}
                                type="button"
                                onClick={() => onUpdateTheme({ backgroundType: "gradient", backgroundValue: bp.value })}
                                className={`p-1.5 text-left rounded-lg border text-[10px] truncate cursor-pointer transition-all ${
                                  theme.backgroundValue === bp.value ? "bg-white/10 font-bold border-white/30" : "bg-transparent border-white/5 opacity-70"
                                }`}
                              >
                                {bp.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {theme.backgroundType === "solid" && (
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono opacity-50 block mb-1">Pick Solid Wallpaper Color</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={theme.backgroundValue.startsWith("#") ? theme.backgroundValue : "#09090b"}
                              onChange={(e) => onUpdateTheme({ backgroundType: "solid", backgroundValue: e.target.value })}
                              className="w-10 h-10 rounded-lg cursor-pointer border border-white/15 bg-transparent"
                            />
                            <input
                              type="text"
                              value={theme.backgroundValue}
                              onChange={(e) => onUpdateTheme({ backgroundType: "solid", backgroundValue: e.target.value })}
                              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-black/25 border border-white/10 font-mono"
                            />
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {["#000000", "#18181b", "#1e293b", "#064e3b", "#1e1b4b", "#450a0a", "#f4f4f5"].map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => onUpdateTheme({ backgroundType: "solid", backgroundValue: color })}
                                className="w-6 h-6 rounded-full border border-white/10 shadow hover:scale-110 transition-transform cursor-pointer"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {theme.backgroundType === "video" && (
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono opacity-50 block mb-1">Select Interactive Video Loop</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { name: "Futuristic Tunnel", url: "https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-blue-lights-31835-large.mp4" },
                              { name: "Cozy Night Rain", url: "https://assets.mixkit.co/videos/preview/mixkit-rain-on-a-window-pane-at-night-40124-large.mp4" },
                              { name: "Rotating Nebula", url: "https://assets.mixkit.co/videos/preview/mixkit-rotating-starry-universe-under-a-clear-sky-32087-large.mp4" },
                              { name: "Laser Aurora Loop", url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-41851-large.mp4" }
                            ].map(v => (
                              <button
                                key={v.name}
                                type="button"
                                onClick={() => onUpdateTheme({ backgroundType: "video", backgroundValue: v.url })}
                                className={`p-1.5 text-left rounded-lg border text-[10px] truncate cursor-pointer transition-all ${
                                  theme.backgroundValue === v.url ? "bg-white/10 font-bold border-white/30" : "bg-transparent border-white/5 opacity-70"
                                }`}
                              >
                                {v.name}
                              </button>
                            ))}
                          </div>
                          <div className="mt-2">
                            <label className="text-[9px] font-mono opacity-50 block mb-1">Or paste custom MP4 Video URL</label>
                            <input
                              type="text"
                              value={theme.backgroundValue}
                              onChange={(e) => onUpdateTheme({ backgroundType: "video", backgroundValue: e.target.value })}
                              placeholder="https://example.com/video.mp4"
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-black/25 border border-white/10 focus:outline-none focus:border-white/30 font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {theme.backgroundType === "local" && (
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-mono opacity-50 block mb-1">Upload Local Image or Video File</label>
                          <div 
                            className="border border-dashed border-white/20 hover:border-white/40 rounded-xl p-5 text-center bg-black/10 hover:bg-black/20 transition-all cursor-pointer relative"
                            onClick={() => document.getElementById("local-wallpaper-file-input")?.click()}
                          >
                            <input
                              type="file"
                              id="local-wallpaper-file-input"
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onUploadLocalWallpaper(file);
                                }
                              }}
                            />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-white/80">
                                {localWallpaperUrl ? `Active Stored Wallpaper` : "Click to select a local file"}
                              </p>
                              <p className="text-[10px] text-white/40">
                                Supports JPEG, PNG, WEBP, and MP4 video files saved permanently in offline IndexedDB
                              </p>
                            </div>
                          </div>

                          {localWallpaperUrl && (
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                              <div className="flex flex-col text-left truncate">
                                <span className="text-[10px] font-mono opacity-50 font-bold uppercase">Active File</span>
                                <span className="text-xs truncate max-w-[200px] font-mono">{theme.backgroundValue || "local-upload"}</span>
                              </div>
                              <button
                                type="button"
                                onClick={onClearLocalWallpaper}
                                className="text-[10px] font-mono text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg border border-red-500/20 transition-all cursor-pointer"
                              >
                                Remove File
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {theme.backgroundType === "unsplash" && (
                        <div>
                          <label className="text-[10px] font-mono opacity-50 block mb-1">Unsplash Dynamic Wallpaper (Keyword query)</label>
                          <input
                            type="text"
                            placeholder="e.g., nebula, moody landscapes, architecture"
                            value={theme.backgroundValue}
                            onChange={(e) => {
                              onUpdateTheme({
                                backgroundType: "unsplash",
                                backgroundValue: e.target.value
                              });
                            }}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-black/25 border border-white/10 focus:outline-none focus:border-white/30"
                          />
                        </div>
                      )}

                      {theme.backgroundType === "custom-url" && (
                        <div>
                          <label className="text-[10px] font-mono opacity-50 block mb-1">Custom Wallpaper Image URL</label>
                          <input
                            type="text"
                            placeholder="https://example.com/wallpaper.jpg"
                            value={theme.backgroundValue}
                            onChange={(e) => {
                              onUpdateTheme({
                                backgroundType: "custom-url",
                                backgroundValue: e.target.value
                              });
                            }}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-black/25 border border-white/10 focus:outline-none focus:border-white/30 font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Detailed sliders */}
                    <div className="space-y-3.5 border-t border-white/5 pt-4">
                      {/* Glass Blur Slider */}
                      <div>
                        <div className="flex justify-between text-[10px] font-mono opacity-50 mb-1">
                          <span>Glass Backdrop Blur</span>
                          <span>{theme.glassBlur}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={theme.glassBlur}
                          onChange={(e) => onUpdateTheme({ glassBlur: parseInt(e.target.value) })}
                          className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Glass Opacity */}
                      <div>
                        <div className="flex justify-between text-[10px] font-mono opacity-50 mb-1">
                          <span>Glass Sheet Opacity</span>
                          <span>{theme.glassOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={theme.glassOpacity}
                          onChange={(e) => onUpdateTheme({ glassOpacity: parseInt(e.target.value) })}
                          className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Accent color picker */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] font-mono opacity-50 block mb-1">Theme Accent Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={theme.accentColor}
                              onChange={(e) => onUpdateTheme({ accentColor: e.target.value })}
                              className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent"
                            />
                            <span className="text-xs font-mono">{theme.accentColor}</span>
                          </div>
                        </div>

                        {/* Card shadows */}
                        <div>
                          <label className="text-[10px] font-mono opacity-50 block mb-1">Accent Neon Glow</label>
                          <button
                            onClick={() => onUpdateTheme({ glowEffect: !theme.glowEffect })}
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold"
                          >
                            {theme.glowEffect ? "Enabled" : "Disabled"}
                          </button>
                        </div>
                      </div>

                      {/* Magic Particle Canvas Animation Options */}
                      <div className="space-y-3 pt-4 border-t border-white/5 text-left">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs font-bold block">Magic Interactive Canvas</label>
                            <span className="text-[9px] opacity-50 block font-mono">Render sparkling particles & fluids below widgets</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onUpdateTheme({ magicAnimationEnabled: !theme.magicAnimationEnabled })}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                              theme.magicAnimationEnabled
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                : "bg-white/5 border-white/10 text-white/50"
                            }`}
                          >
                            {theme.magicAnimationEnabled ? "Enabled" : "Disabled"}
                          </button>
                        </div>

                        {theme.magicAnimationEnabled && (
                          <div className="space-y-2 animate-fade-in mt-2.5">
                            <label className="text-[10px] font-mono opacity-50 block mb-1">Select Magic Theme Style</label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: "cosmic-stars", name: "Celestial Stars", desc: "Glowing gravity nodes responding to mouse drag" },
                                { id: "sparkle-trail", name: "Sparkle Cursor Trail", desc: "Magical 4-pointed sparkle trails tracing mouse paths" },
                                { id: "aurora", name: "Ethereal Northern Lights", desc: "Flowing velvet sine wave auroras morphing dynamically" },
                                { id: "interactive-trail", name: "Constellation Grid", desc: "Interactive connected line webs following the mouse" }
                              ].map(style => (
                                <button
                                  key={style.id}
                                  type="button"
                                  onClick={() => onUpdateTheme({ magicAnimationType: style.id as any })}
                                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                    theme.magicAnimationType === style.id || (!theme.magicAnimationType && style.id === "cosmic-stars")
                                      ? "bg-white/10 border-white/30"
                                      : "bg-black/15 border-transparent opacity-70 hover:opacity-100"
                                  }`}
                                >
                                  <div className="text-[11px] font-bold text-white">{style.name}</div>
                                  <div className="text-[9px] opacity-40 leading-tight mt-0.5">{style.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. MANAGE WIDGETS TAB */}
                {activeTab === "widgets" && (
                  <div className="space-y-4">
                    <p className="text-[11px] opacity-60 font-sans">
                      Toggle specific smart widgets to clean up or extend your dashboard. You can drag and drop widgets directly on the grid to rearrange their layout!
                    </p>

                    {/* Grid of Toggle buttons */}
                    <div className="space-y-2">
                      {widgets.map(w => (
                        <div key={w.id} className="flex items-center justify-between p-2.5 rounded-xl bg-black/10 border border-white/5">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{w.title}</span>
                            <span className="text-[9px] opacity-40 font-mono">Size: {w.size.toUpperCase()}</span>
                          </div>

                          <button
                            onClick={() => handleWidgetToggle(w.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              w.visible
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-white/5 text-white/40 border border-white/5"
                            }`}
                          >
                            {w.visible ? "Visible" : "Hidden"}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Lock Arrangement Switch */}
                    <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Lock Grid Arrangement</span>
                        <span className="text-[9px] opacity-50">Prevents dragging widgets on the home screen</span>
                      </div>
                      <button
                        onClick={onToggleLock}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                          isLocked
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-white/5 border-white/10 text-white/70"
                        }`}
                      >
                        {isLocked ? "Grid Locked" : "Grid Unlocked"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. CLOUD DEVICE SYNC TAB */}
                {activeTab === "sync" && (
                  <div className="space-y-4">
                    <div className="p-3 border border-blue-500/15 bg-blue-500/5 rounded-xl text-[11px] leading-relaxed flex items-start gap-2.5">
                      <Smartphone className="text-blue-400 shrink-0 mt-0.5" size={16} />
                      <div>
                        <strong className="block mb-0.5">How Cloud Sync Works:</strong>
                        Your theme, wallpaper, shortcuts, and task configurations auto-save locally.
                        Generate a secure <strong>Sync Code</strong> here, insert it on another browser or device, and see your configurations sync in real-time.
                      </div>
                    </div>

                    {/* Generating active Sync Code */}
                    <div className="p-4 rounded-xl bg-black/15 border border-white/5 text-center space-y-2">
                      <span className="text-[10px] font-mono opacity-50 block uppercase">Your Link Code</span>
                      {syncCode ? (
                        <div className="flex flex-col items-center gap-2">
                          <span 
                            className="text-xl font-mono font-extrabold px-4 py-1.5 bg-black/40 border border-white/10 rounded-lg tracking-wider"
                            style={{ color: theme.accentColor }}
                          >
                            {syncCode}
                          </span>
                          <span className="text-[10px] opacity-40 font-mono">Configurations are backup-saved. Auto syncing active.</span>
                        </div>
                      ) : (
                        <div>
                          <button
                            onClick={onRegisterSync}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                          >
                            Generate Sync Code
                          </button>
                          <span className="text-[10px] opacity-40 block mt-1.5">No active link code. Generate one to initiate cross-device syncing.</span>
                        </div>
                      )}
                    </div>

                    {/* Linking an external code */}
                    <form onSubmit={handleLinkDeviceSubmit} className="space-y-2 border-t border-white/5 pt-4">
                      <label className="text-[10px] font-mono opacity-50 block">Link to Another Device</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g., SYNC-XW8F2K"
                          value={linkInput}
                          onChange={(e) => setLinkInput(e.target.value.toUpperCase())}
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-black/25 border border-white/10 focus:outline-none focus:border-white/30 font-mono tracking-widest text-center"
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Link Device
                        </button>
                      </div>

                      {syncStatus && (
                        <div className="p-2 border border-white/5 bg-black/10 text-[10px] font-mono rounded-lg flex items-center gap-2 text-white/80 mt-2">
                          <Info size={11} style={{ color: theme.accentColor }} />
                          <span>{syncStatus}</span>
                        </div>
                      )}
                    </form>

                    {/* Destructive options */}
                    <div className="border-t border-white/5 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure? This will delete all saved configurations, shortcuts, and tasks, resetting your Chrome Dashboard back to default settings.")) {
                            onClearStorage();
                            setIsOpen(false);
                          }
                        }}
                        className="text-[10px] font-mono text-red-400 hover:text-red-300 hover:underline"
                      >
                        Reset Dashboard back to Factory Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
