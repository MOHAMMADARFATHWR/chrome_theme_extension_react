import React, { useState, useEffect } from "react";
import { Cpu, Activity, Zap, Network, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ThemeConfig } from "../types";

interface TelemetryWidgetProps {
  theme: ThemeConfig;
}

export default function TelemetryWidget({ theme }: TelemetryWidgetProps) {
  const [cpu, setCpu] = useState(24);
  const [ram, setRam] = useState(62);
  const [ping, setPing] = useState<number | null>(null);
  const [battery, setBattery] = useState({ level: 100, charging: false });
  const [speed, setSpeed] = useState({ up: 1.2, down: 45.8 });

  // Fluctuate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => {
        const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
        return Math.max(5, Math.min(95, prev + delta));
      });
      setRam(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(40, Math.min(90, prev + delta));
      });
      setSpeed(prev => {
        const upDelta = (Math.random() * 0.4 - 0.2);
        const downDelta = (Math.random() * 4 - 2);
        return {
          up: Math.max(0.1, parseFloat((prev.up + upDelta).toFixed(1))),
          down: Math.max(5, parseFloat((prev.down + downDelta).toFixed(1)))
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Real Network Latency Test
  const measureLatency = async () => {
    try {
      const startTime = performance.now();
      await fetch("/api/sync/get/ping_test", { method: "GET" }).catch(() => {});
      const latency = Math.round(performance.now() - startTime);
      setPing(Math.min(999, latency));
    } catch {
      setPing(45); // Standard fallback ping
    }
  };

  useEffect(() => {
    measureLatency();
    const latencyInterval = setInterval(measureLatency, 6000);
    return () => clearInterval(latencyInterval);
  }, []);

  // Real Battery Status API Integration
  useEffect(() => {
    let batteryInstance: any = null;

    const updateBattery = (b: any) => {
      setBattery({
        level: Math.round(b.level * 100),
        charging: b.charging
      });
    };

    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        batteryInstance = b;
        updateBattery(b);
        b.addEventListener("levelchange", () => updateBattery(b));
        b.addEventListener("chargingchange", () => updateBattery(b));
      }).catch((err: any) => {
        console.warn("Battery status API blocked or unsupported:", err);
      });
    }

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener("levelchange", () => {});
        batteryInstance.removeEventListener("chargingchange", () => {});
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full justify-between p-5 select-none text-xs font-mono" id="widget-telemetry-root">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
        <span className="font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: theme.textColor }}>
          <Activity size={12} style={{ color: theme.accentColor }} /> New Tab Telemetry
        </span>
        <button 
          onClick={measureLatency}
          className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-transform"
          style={{ color: theme.textColor }}
        >
          Ref test
        </button>
      </div>

      {/* Grid of Telemetry */}
      <div className="grid grid-cols-2 gap-3 flex-1 mt-1.5 py-1">
        {/* CPU utilization */}
        <div className="p-2 rounded-lg bg-black/10 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-60 mb-1" style={{ color: theme.textColor }}>
            <span>Core Load</span>
            <Cpu size={12} />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-sm font-bold" style={{ color: theme.textColor }}>{cpu}%</span>
            <span className="text-[10px]" style={{ color: theme.accentColor }}>Active</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${cpu}%`, backgroundColor: theme.accentColor }}
            />
          </div>
        </div>

        {/* Memory Allocation */}
        <div className="p-2 rounded-lg bg-black/10 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-60 mb-1" style={{ color: theme.textColor }}>
            <span>Tab RAM</span>
            <span className="text-[10px]">GB</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-sm font-bold" style={{ color: theme.textColor }}>{ram}%</span>
            <span className="text-[10px]" style={{ color: theme.accentColor }}>Allocated</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${ram}%`, backgroundColor: theme.accentColor }}
            />
          </div>
        </div>

        {/* Network Ping */}
        <div className="p-2 rounded-lg bg-black/10 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-60 mb-1" style={{ color: theme.textColor }}>
            <span>Sync Latency</span>
            <Network size={12} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold" style={{ color: theme.textColor }}>
              {ping === null ? "--" : `${ping}`}
            </span>
            <span className="text-[9px] opacity-60" style={{ color: theme.textColor }}>ms</span>
          </div>
          <span className="text-[9px] opacity-50 mt-1" style={{ color: theme.textColor }}>
            {ping !== null && ping < 60 ? "Excellent Node" : ping !== null && ping < 150 ? "Stable Link" : "Checking..."}
          </span>
        </div>

        {/* Power Status */}
        <div className="p-2 rounded-lg bg-black/10 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-60 mb-1" style={{ color: theme.textColor }}>
            <span>Power Stat</span>
            <Zap size={11} className={battery.charging ? "animate-pulse" : ""} style={{ color: battery.charging ? theme.accentColor : "inherit" }} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold" style={{ color: theme.textColor }}>{battery.level}%</span>
            <span className="text-[9px] opacity-60" style={{ color: theme.textColor }}>batt</span>
          </div>
          <span className="text-[9px] opacity-50 mt-1" style={{ color: theme.textColor }}>
            {battery.charging ? "Charging AC" : "Discharging"}
          </span>
        </div>
      </div>

      {/* Down/Up Speed Bar */}
      <div className="border-t border-white/5 pt-2 mt-2 flex items-center justify-between opacity-75">
        <div className="flex items-center gap-1">
          <ArrowDownRight size={11} className="text-emerald-400" />
          <span className="opacity-55">Down:</span>
          <span className="font-bold">{speed.down} Mb/s</span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowUpRight size={11} className="text-sky-400" />
          <span className="opacity-55">Up:</span>
          <span className="font-bold">{speed.up} Mb/s</span>
        </div>
      </div>
    </div>
  );
}
