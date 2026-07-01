import React, { useState, useRef, useEffect } from "react";
import { Grid, Search, Mail, Video, MapPin, HardDrive, Calendar, Image, Languages, FileText, BarChart2, Presentation, ShoppingBag } from "lucide-react";
import { ThemeConfig } from "../types";

interface GoogleAppsLauncherProps {
  theme: ThemeConfig;
}

interface GoogleApp {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

export default function GoogleAppsLauncher({ theme }: GoogleAppsLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const googleApps: GoogleApp[] = [
    { name: "Search", url: "https://www.google.com", color: "#4285F4", icon: <Search size={18} /> },
    { name: "Gmail", url: "https://mail.google.com", color: "#EA4335", icon: <Mail size={18} /> },
    { name: "YouTube", url: "https://www.youtube.com", color: "#FF0000", icon: <Video size={18} /> },
    { name: "Maps", url: "https://maps.google.com", color: "#34A853", icon: <MapPin size={18} /> },
    { name: "Drive", url: "https://drive.google.com", color: "#FBBC05", icon: <HardDrive size={18} /> },
    { name: "Calendar", url: "https://calendar.google.com", color: "#4285F4", icon: <Calendar size={18} /> },
    { name: "Photos", url: "https://photos.google.com", color: "#FF0000", icon: <Image size={18} /> },
    { name: "Translate", url: "https://translate.google.com", color: "#4285F4", icon: <Languages size={18} /> },
    { name: "Docs", url: "https://docs.google.com", color: "#4285F4", icon: <FileText size={18} /> },
    { name: "Sheets", url: "https://sheets.google.com", color: "#34A853", icon: <BarChart2 size={18} /> },
    { name: "Slides", url: "https://slides.google.com", color: "#FBBC05", icon: <Presentation size={18} /> },
    { name: "Web Store", url: "https://chromewebstore.google.com", color: "#FBBC05", icon: <ShoppingBag size={18} /> },
  ];

  return (
    <div className="relative" ref={dropdownRef} id="google-apps-launcher-root">
      {/* 9-Dot Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full transition-all duration-300 hover:bg-white/10 flex items-center justify-center cursor-pointer relative group"
        style={{ color: theme.textColor }}
        aria-label="Google Apps"
        title="Google Apps"
      >
        <Grid size={18} className="transition-transform group-hover:rotate-12" />
      </button>

      {/* Launcher Glass Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-12 w-64 p-4 rounded-2xl border flex flex-col items-center shadow-2xl z-[100] animate-scale-up"
          style={{
            backgroundColor: `${theme.theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(15,15,15,0.85)'}`,
            borderColor: theme.borderColor,
            backdropFilter: `blur(${theme.glassBlur}px)`,
            boxShadow: theme.glowEffect ? `0 10px 30px ${theme.accentColor}1a, 0 4px 12px rgba(0,0,0,0.1)` : "none"
          }}
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest self-start opacity-50 mb-3" style={{ color: theme.textColor }}>
            Google Companion
          </span>

          <div className="grid grid-cols-3 gap-y-4 gap-x-2 w-full">
            {googleApps.map((app) => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/5 group transition-all"
              >
                {/* Visual Circle with Dynamic Icon */}
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-105 duration-300 shadow-md"
                  style={{
                    backgroundColor: app.color,
                    boxShadow: `0 3px 8px ${app.color}2e`
                  }}
                >
                  {app.icon}
                </div>
                
                <span
                  className="text-[10px] mt-1.5 font-medium tracking-tight block max-w-full truncate opacity-80"
                  style={{ color: theme.textColor }}
                >
                  {app.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
