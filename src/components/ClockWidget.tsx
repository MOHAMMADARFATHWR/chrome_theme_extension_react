import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Clock, Calendar, Edit2, Check } from "lucide-react";
import { ThemeConfig } from "../types";

interface ClockWidgetProps {
  theme: ThemeConfig;
  onUpdateUser: (name: string) => void;
}

export default function ClockWidget({ theme, onUpdateUser }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date());
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(theme.userName);
  const [showSeconds, setShowSeconds] = useState(false);
  const [is12Hour, setIs12Hour] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setEditedName(theme.userName);
  }, [theme.userName]);

  const hours = time.getHours();
  let greeting = "Hello";
  if (hours < 12) greeting = "Good morning";
  else if (hours < 17) greeting = "Good afternoon";
  else greeting = "Good evening";

  // Time Formatter
  const formatTime = () => {
    let hh = time.getHours();
    const mm = String(time.getMinutes()).padStart(2, "0");
    const ss = String(time.getSeconds()).padStart(2, "0");
    let ampm = "";

    if (is12Hour) {
      ampm = hh >= 12 ? " PM" : " AM";
      hh = hh % 12;
      hh = hh ? hh : 12; // 0 should be 12
    }
    
    const hhStr = String(hh).padStart(2, "0");
    return `${hhStr}:${mm}${showSeconds ? `:${ss}` : ""}${ampm}`;
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return time.toLocaleDateString(undefined, options);
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdateUser(editedName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col items-center text-center p-6 h-full justify-between" id="widget-clock-root">
      {/* Settings Panel */}
      <div className="flex gap-4 w-full justify-end text-xs font-mono opacity-50 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setIs12Hour(!is12Hour)} 
          className="hover:underline cursor-pointer"
        >
          {is12Hour ? "12h" : "24h"}
        </button>
        <button 
          onClick={() => setShowSeconds(!showSeconds)} 
          className="hover:underline cursor-pointer"
        >
          {showSeconds ? "Hide s" : "Show s"}
        </button>
      </div>

      {/* Main Clock */}
      <div className="my-auto py-2">
        <motion.h1 
          className="text-5xl md:text-6xl font-black tracking-tight"
          style={{ 
            color: theme.textColor,
            textShadow: theme.theme === 'dark' ? '0 0 20px rgba(255,255,255,0.1)' : 'none'
          }}
          key={formatTime()} // force key-frame updates for subtle numbers
          initial={{ opacity: 0.9, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {formatTime()}
        </motion.h1>

        {/* Date Display */}
        <div className="flex items-center justify-center gap-2 mt-2 font-mono text-sm opacity-80" style={{ color: theme.textColor }}>
          <Calendar size={14} />
          <span>{formatDate()}</span>
        </div>
      </div>

      {/* Greeting & Interactive Name */}
      <div className="w-full flex flex-col items-center gap-1 mt-2">
        {isEditingName ? (
          <div className="flex items-center gap-2 border-b-2 py-1 max-w-xs transition-colors" style={{ borderColor: theme.accentColor }}>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              className="bg-transparent text-center focus:outline-none font-sans text-xl font-bold w-full"
              style={{ color: theme.textColor }}
              autoFocus
            />
            <button 
              onClick={handleSaveName}
              className="p-1 rounded-full hover:bg-white/10"
              style={{ color: theme.accentColor }}
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="group flex items-center justify-center gap-2">
            <h2 className="text-xl font-semibold select-none" style={{ color: theme.textColor }}>
              {greeting}, <span className="font-extrabold" style={{ color: theme.accentColor }}>{theme.userName || "Guest"}</span>!
            </h2>
            <button
              onClick={() => setIsEditingName(true)}
              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
              style={{ color: theme.textColor }}
              title="Edit name"
            >
              <Edit2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
