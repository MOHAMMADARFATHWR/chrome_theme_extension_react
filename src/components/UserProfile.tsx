import React, { useState, useRef, useEffect } from "react";
import { ThemeConfig } from "../types";
import { User, LogOut, Check, Settings, Mail, Shield, ShieldCheck, Camera, CloudRain, Sparkles, RefreshCw } from "lucide-react";

interface UserProfileProps {
  theme: ThemeConfig;
}

interface ProfileState {
  name: string;
  email: string;
  avatarUrl: string;
  avatarId: string; // "gravatar" | "custom" | placeholder names
}

const CHROME_AVATAR_PRESETS = [
  { id: "astronaut", name: "Astronaut", color: "bg-indigo-600", char: "👨‍🚀" },
  { id: "fox", name: "Fox", color: "bg-amber-500", char: "🦊" },
  { id: "cat", name: "Cat", color: "bg-rose-500", char: "🐱" },
  { id: "panda", name: "Panda", color: "bg-slate-700", char: "🐼" },
  { id: "ninja", name: "Ninja", color: "bg-zinc-800", char: "🥷" },
  { id: "dragon", name: "Dragon", color: "bg-emerald-600", char: "🐲" }
];

export default function UserProfile({ theme }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Initialize profile with waheedwar776@gmail.com from system metadata as high-quality default
  const [profile, setProfile] = useState<ProfileState>(() => {
    try {
      const saved = localStorage.getItem("chrome_user_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      name: "Waheed War",
      email: "waheedwar776@gmail.com",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
      avatarId: "custom"
    };
  });

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);

  useEffect(() => {
    localStorage.setItem("chrome_user_profile", JSON.stringify(profile));
  }, [profile]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditMode(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name: editName || "Chrome User",
      email: editEmail || "user@gmail.com"
    }));
    setEditMode(false);
  };

  const selectPreset = (presetId: string) => {
    setProfile(prev => ({
      ...prev,
      avatarId: presetId
    }));
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          avatarUrl: reader.result as string,
          avatarId: "custom"
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderActiveAvatar = (sizeClass = "w-8 h-8 text-sm") => {
    if (profile.avatarId === "custom" && profile.avatarUrl) {
      return (
        <img
          src={profile.avatarUrl}
          alt={profile.name}
          className={`${sizeClass} rounded-full object-cover border border-white/20`}
          referrerPolicy="no-referrer"
        />
      );
    }

    const preset = CHROME_AVATAR_PRESETS.find(p => p.id === profile.avatarId);
    if (preset) {
      return (
        <div className={`${sizeClass} rounded-full ${preset.color} flex items-center justify-center border border-white/20 select-none shadow-inner font-sans`}>
          <span>{preset.char}</span>
        </div>
      );
    }

    // Default monogram avatar
    const initials = profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-white/20 font-bold text-white shadow-md font-sans`}>
        {initials || "U"}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef} id="user-profile-widget-root">
      {/* Circle Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-0.5 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
        title="Google Chrome Account"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-emerald-500 to-amber-500 opacity-0 group-hover:opacity-100 blur-[3px] transition-opacity duration-300" />
        <div className="relative z-10">
          {renderActiveAvatar("w-8 h-8 text-xs")}
        </div>
        
        {/* Sleek online dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full z-20" />
      </button>

      {/* Account Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-11 w-80 p-5 rounded-3xl border flex flex-col shadow-2xl z-[100] animate-scale-up"
          style={{
            backgroundColor: `${theme.theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(15,15,15,0.95)'}`,
            borderColor: theme.borderColor,
            backdropFilter: `blur(${theme.glassBlur}px)`,
            boxShadow: theme.glowEffect ? `0 15px 35px ${theme.accentColor}25, 0 5px 15px rgba(0,0,0,0.2)` : "none"
          }}
        >
          {/* Main User Card info */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-white/5 relative">
            <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full mb-3 self-center flex items-center gap-1">
              <ShieldCheck size={10} /> Sync Active
            </span>

            {/* Avatar block with hover image select */}
            <div className="relative group/avatar mb-3">
              {renderActiveAvatar("w-16 h-16 text-2xl")}
              
              <label 
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-mono"
                htmlFor="avatar-file-upload-input"
              >
                <Camera size={14} className="mr-1" /> Edit
              </label>
              <input
                type="file"
                id="avatar-file-upload-input"
                accept="image/*"
                className="hidden"
                onChange={handleCustomAvatarUpload}
              />
            </div>

            {/* Editable Profile Information */}
            {editMode ? (
              <form onSubmit={handleSaveProfile} className="w-full space-y-2 mt-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-center text-xs px-2 py-1 rounded-lg bg-black/30 border border-white/10 text-white focus:outline-none focus:border-white/30 font-bold"
                  placeholder="Profile Name"
                  required
                />
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-center text-[11px] px-2 py-1 rounded-lg bg-black/30 border border-white/10 text-white focus:outline-none focus:border-white/30 font-mono"
                  placeholder="Email"
                  required
                />
                <div className="flex items-center gap-1.5 justify-center pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-mono font-bold rounded-lg transition-all"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-mono rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1">
                  {profile.name}
                </h4>
                <p className="text-[10.5px] font-mono text-white/50">{profile.email}</p>
                <button
                  onClick={() => {
                    setEditName(profile.name);
                    setEditEmail(profile.email);
                    setEditMode(true);
                  }}
                  className="text-[9px] font-mono text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/5 transition-all mt-2.5 cursor-pointer inline-block"
                >
                  Manage Google Account
                </button>
              </div>
            )}
          </div>

          {/* Preset chrome retro profile icons picker */}
          <div className="py-3 border-b border-white/5 text-left">
            <span className="text-[9px] font-mono font-bold opacity-45 uppercase block mb-2">
              Select Chrome Preset Avatar
            </span>
            <div className="grid grid-cols-6 gap-1.5">
              {CHROME_AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectPreset(preset.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg hover:scale-110 active:scale-90 transition-all cursor-pointer relative ${preset.color} border ${
                    profile.avatarId === preset.id ? "border-white shadow-lg scale-105" : "border-white/5 opacity-80"
                  }`}
                  title={preset.name}
                >
                  {preset.char}
                  {profile.avatarId === preset.id && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5">
                      <Check size={6} className="stroke-[4]" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Account sync stats */}
          <div className="pt-3 space-y-2.5 text-left">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="opacity-50 flex items-center gap-1"><RefreshCw size={10} /> Last Cloud Backup</span>
              <span className="font-bold text-white">Just now</span>
            </div>
            
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1 text-left">
              <span className="text-[8px] font-mono opacity-50 block uppercase font-bold tracking-wider">Device Synchronizer</span>
              <p className="text-[10px] text-white/70 leading-relaxed font-sans">
                Chrome Cloud Storage keeps your settings, custom wallpaper, search history, and task planners active across all devices seamlessly.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
