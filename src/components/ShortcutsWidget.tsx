import React, { useState } from "react";
import { Plus, X, Edit, Link, Grid, Sparkles } from "lucide-react";
import { Shortcut, ThemeConfig } from "../types";

interface ShortcutsWidgetProps {
  theme: ThemeConfig;
  shortcuts: Shortcut[];
  onUpdateShortcuts: (updated: Shortcut[]) => void;
}

export default function ShortcutsWidget({ theme, shortcuts, onUpdateShortcuts }: ShortcutsWidgetProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState("#3b82f6");

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Default color recommendations
  const palette = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"];

  // Open add form
  const handleOpenAdd = () => {
    setTitle("");
    setUrl("");
    setColor(palette[Math.floor(Math.random() * palette.length)]);
    setEditingId(null);
    setIsAdding(true);
  };

  // Open edit form
  const handleOpenEdit = (s: Shortcut, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setTitle(s.title);
    setUrl(s.url);
    setColor(s.color || "#3b82f6");
    setEditingId(s.id);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    // Standardize URL
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (editingId) {
      // Edit
      const updated = shortcuts.map(s => s.id === editingId ? { ...s, title, url: formattedUrl, color } : s);
      onUpdateShortcuts(updated);
    } else {
      // Add
      const newShortcut: Shortcut = {
        id: "s_" + Date.now(),
        title,
        url: formattedUrl,
        color
      };
      onUpdateShortcuts([...shortcuts, newShortcut]);
    }
    setIsAdding(false);
    setTitle("");
    setUrl("");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = shortcuts.filter(s => s.id !== id);
    onUpdateShortcuts(updated);
    if (editingId === id) {
      setIsAdding(false);
    }
  };

  // Native drag & drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Dynamic reordering during hover
    const reordered = [...shortcuts];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    onUpdateShortcuts(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Extract Domain Initial/Letter for display icon
  const getDisplayLetter = (title: string, url: string) => {
    try {
      if (title.trim()) return title.trim().charAt(0).toUpperCase();
      const domain = new URL(url).hostname;
      return domain.replace("www.", "").charAt(0).toUpperCase();
    } catch {
      return title ? title.charAt(0).toUpperCase() : "★";
    }
  };

  return (
    <div className="flex flex-col h-full justify-between p-5 select-none" id="widget-shortcuts-root">
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: theme.textColor }}>
          <Grid size={12} style={{ color: theme.accentColor }} /> Quick Shortcuts
        </span>
        {!isAdding && (
          <button
            onClick={handleOpenAdd}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
            style={{ color: theme.textColor }}
          >
            <Plus size={10} style={{ color: theme.accentColor }} /> Add Link
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between gap-2.5">
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-mono opacity-60 block mb-0.5" style={{ color: theme.textColor }}>Title</label>
              <input
                type="text"
                placeholder="Google, Github, YouTube..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-black/25 border border-white/10 focus:outline-none focus:border-white/30"
                style={{ color: theme.textColor }}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] font-mono opacity-60 block mb-0.5" style={{ color: theme.textColor }}>URL</label>
              <input
                type="text"
                placeholder="google.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-black/25 border border-white/10 focus:outline-none focus:border-white/30"
                style={{ color: theme.textColor }}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-mono opacity-60 block mb-1" style={{ color: theme.textColor }}>Accent Color</label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {palette.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-4 h-4 rounded-full border border-white/20 transition-transform scale-95 hover:scale-110 cursor-pointer"
                    style={{ 
                      backgroundColor: c, 
                      boxShadow: color === c ? `0 0 8px ${c}` : 'none',
                      transform: color === c ? 'scale(1.2)' : 'none'
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-6 h-5 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[11px] px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10"
              style={{ color: theme.textColor }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[11px] px-3 py-1.5 rounded text-white font-bold"
              style={{ backgroundColor: theme.accentColor }}
            >
              {editingId ? "Save Changes" : "Create Shortcut"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[160px] pr-1 mt-1">
          {shortcuts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-6 opacity-40">
              <Link size={18} style={{ color: theme.textColor }} />
              <span className="text-[11px] font-mono mt-2" style={{ color: theme.textColor }}>No quick shortcuts saved.</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pt-1">
              {shortcuts.map((s, idx) => (
                <div
                  key={s.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`group relative flex flex-col items-center text-center p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-grab active:cursor-grabbing ${
                    draggedIndex === idx ? "opacity-30 scale-95 border-dashed border-white/25" : ""
                  }`}
                >
                  {/* Shortcut Favicon/Letter Hub */}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-lg transition-transform duration-300 hover:rotate-3"
                    style={{ 
                      backgroundColor: s.color || "#3b82f6",
                      boxShadow: `0 4px 12px ${(s.color || "#3b82f6")}3a`
                    }}
                  >
                    {/* Fallback to Letter */}
                    {getDisplayLetter(s.title, s.url)}
                  </a>

                  {/* Title */}
                  <span 
                    className="text-[10px] mt-1.5 max-w-[55px] truncate font-medium tracking-tight block"
                    style={{ color: theme.textColor }}
                  >
                    {s.title}
                  </span>

                  {/* Actions (visible on hover) */}
                  <div className="absolute -top-1.5 -right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleOpenEdit(s, e)}
                      className="p-1 rounded-full bg-black/60 text-white/80 hover:text-white border border-white/10 hover:bg-black/90 cursor-pointer"
                      title="Edit Shortcut"
                    >
                      <Edit size={8} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(s.id, e)}
                      className="p-1 rounded-full bg-black/60 text-red-400 hover:text-red-200 border border-white/10 hover:bg-black/90 cursor-pointer"
                      title="Delete Shortcut"
                    >
                      <X size={8} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
