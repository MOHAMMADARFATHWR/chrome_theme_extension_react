import React, { useState, useEffect } from "react";
import { ThemeConfig } from "../types";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Plus, 
  Trash2, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  Activity, 
  RefreshCw,
  Award,
  PlusCircle,
  X
} from "lucide-react";

interface StockMarketWidgetProps {
  theme: ThemeConfig;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number; // Percent change
  changePrice: number;
  history: number[]; // 10 points for mini-chart
  volume: string;
  high: number;
  low: number;
}

interface Holding {
  symbol: string;
  shares: number;
  avgBuyPrice: number;
}

const PRESET_STOCKS: Stock[] = [
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 135.24, change: 4.85, changePrice: 6.25, history: [122, 124, 123, 126, 129, 128, 131, 132, 133, 135.24], volume: "42.1M", high: 136.10, low: 129.50 },
  { symbol: "AAPL", name: "Apple Inc.", price: 218.45, change: -1.15, changePrice: -2.54, history: [224, 223, 222, 221, 222, 220, 219, 219.5, 218.8, 218.45], volume: "28.4M", high: 222.15, low: 217.50 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 182.10, change: 0.74, changePrice: 1.34, history: [178, 179, 180, 181, 180, 180.5, 181.2, 181.8, 181.5, 182.1], volume: "18.9M", high: 183.40, low: 180.10 },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 415.80, change: 1.45, changePrice: 5.95, history: [405, 407, 409, 411, 410, 412, 410, 413, 414, 415.8], volume: "15.2M", high: 417.00, low: 409.50 },
  { symbol: "TSLA", name: "Tesla, Inc.", price: 198.50, change: -3.20, changePrice: -6.56, history: [212, 209, 208, 205, 201, 203, 199, 199.5, 198.2, 198.5], volume: "51.3M", high: 204.80, low: 196.20 },
  { symbol: "AMZN", name: "Amazon.com, Inc.", price: 189.15, change: 2.11, changePrice: 3.90, history: [181, 182, 183, 182, 184, 185, 187, 186, 188, 189.15], volume: "22.7M", high: 190.50, low: 184.20 },
  { symbol: "NFLX", name: "Netflix, Inc.", price: 685.30, change: 0.95, changePrice: 6.45, history: [671, 674, 672, 678, 680, 679, 682, 681, 683, 685.3], volume: "3.1M", high: 688.00, low: 676.00 },
  { symbol: "COIN", name: "Coinbase Global", price: 210.40, change: 8.42, changePrice: 16.35, history: [188, 192, 195, 194, 199, 201, 205, 204, 208, 210.4], volume: "9.8M", high: 213.50, low: 195.00 }
];

const INDICES_INITIAL = [
  { symbol: "S&P 500", price: 5464.30, change: 0.65, changePrice: 35.10 },
  { symbol: "NASDAQ", price: 17822.50, change: 1.24, changePrice: 218.40 },
  { symbol: "DOW 30", price: 39120.15, change: -0.15, changePrice: -58.70 }
];

export default function StockMarketWidget({ theme }: StockMarketWidgetProps) {
  const [stocks, setStocks] = useState<Stock[]>(() => {
    try {
      const saved = localStorage.getItem("chrome_dashboard_stocks");
      return saved ? JSON.parse(saved) : PRESET_STOCKS;
    } catch {
      return PRESET_STOCKS;
    }
  });

  const [indices, setIndices] = useState(INDICES_INITIAL);
  const [selectedStock, setSelectedStock] = useState<Stock>(stocks[0] || PRESET_STOCKS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<"watchlist" | "portfolio">("watchlist");

  // Portfolio simulation states
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    try {
      const saved = localStorage.getItem("chrome_dashboard_holdings");
      return saved ? JSON.parse(saved) : [
        { symbol: "NVDA", shares: 15, avgBuyPrice: 110.50 },
        { symbol: "GOOGL", shares: 8, avgBuyPrice: 165.00 }
      ];
    } catch {
      return [
        { symbol: "NVDA", shares: 15, avgBuyPrice: 110.50 }
      ];
    }
  });

  // Buy Simulator modal state
  const [buyTarget, setBuyTarget] = useState<Stock | null>(null);
  const [buyShares, setBuyShares] = useState(10);

  // Persist Stocks Watchlist
  useEffect(() => {
    localStorage.setItem("chrome_dashboard_stocks", JSON.stringify(stocks));
  }, [stocks]);

  // Persist Portfolio Holdings
  useEffect(() => {
    localStorage.setItem("chrome_dashboard_holdings", JSON.stringify(holdings));
  }, [holdings]);

  // Real-time stock price feed fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate standard stocks
      setStocks((prev) => {
        const updated = prev.map((s) => {
          const deltaPercent = (Math.random() - 0.49) * 0.006; // slight positive bias
          const newPrice = Number((s.price * (1 + deltaPercent)).toFixed(2));
          const netChangePrice = Number((s.changePrice + (newPrice - s.price)).toFixed(2));
          const netChangePercent = Number(((netChangePrice / (newPrice - netChangePrice)) * 100).toFixed(2));
          const updatedHistory = [...s.history.slice(1), newPrice];
          const newHigh = newPrice > s.high ? newPrice : s.high;
          const newLow = newPrice < s.low ? newPrice : s.low;
          return {
            ...s,
            price: newPrice,
            changePrice: netChangePrice,
            change: netChangePercent,
            history: updatedHistory,
            high: newHigh,
            low: newLow
          };
        });

        // Sync selected stock preview details
        const refreshedSelected = updated.find(x => x.symbol === selectedStock.symbol);
        if (refreshedSelected) {
          setSelectedStock(refreshedSelected);
        }

        return updated;
      });

      // Fluctuate major indices
      setIndices((prev) =>
        prev.map((ind) => {
          const deltaPercent = (Math.random() - 0.49) * 0.004;
          const newPrice = Number((ind.price * (1 + deltaPercent)).toFixed(2));
          const netChangePrice = Number((ind.changePrice + (newPrice - ind.price)).toFixed(2));
          const netChangePercent = Number(((netChangePrice / (newPrice - netChangePrice)) * 100).toFixed(2));
          return {
            ...ind,
            price: newPrice,
            changePrice: netChangePrice,
            change: netChangePercent
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [selectedStock.symbol]);

  // Search stocks
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = PRESET_STOCKS.filter(
      (s) =>
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  const handleAddToWatchlist = (stock: Stock) => {
    if (stocks.some((s) => s.symbol === stock.symbol)) return;
    setStocks([...stocks, stock]);
    setSearchQuery("");
    setShowSearch(false);
  };

  const handleRemoveFromWatchlist = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = stocks.filter((s) => s.symbol !== symbol);
    setStocks(updated);
    if (selectedStock.symbol === symbol && updated.length > 0) {
      setSelectedStock(updated[0]);
    }
  };

  const handleBuySimulation = () => {
    if (!buyTarget) return;
    const existing = holdings.find(h => h.symbol === buyTarget.symbol);
    if (existing) {
      const newShares = existing.shares + buyShares;
      const newAvg = Number(((existing.shares * existing.avgBuyPrice + buyShares * buyTarget.price) / newShares).toFixed(2));
      setHoldings(holdings.map(h => h.symbol === buyTarget.symbol ? { ...h, shares: newShares, avgBuyPrice: newAvg } : h));
    } else {
      setHoldings([...holdings, { symbol: buyTarget.symbol, shares: buyShares, avgBuyPrice: buyTarget.price }]);
    }
    setBuyTarget(null);
  };

  const handleSellSimulation = (symbol: string) => {
    const existing = holdings.find(h => h.symbol === symbol);
    if (!existing) return;
    if (existing.shares <= 1) {
      setHoldings(holdings.filter(h => h.symbol !== symbol));
    } else {
      setHoldings(holdings.map(h => h.symbol === symbol ? { ...h, shares: existing.shares - 1 } : h));
    }
  };

  // Compute portfolio metrics
  const totalPortfolioValue = holdings.reduce((sum, h) => {
    const currentStock = stocks.find(s => s.symbol === h.symbol) || PRESET_STOCKS.find(s => s.symbol === h.symbol);
    const currentPrice = currentStock ? currentStock.price : h.avgBuyPrice;
    return sum + (h.shares * currentPrice);
  }, 0);

  const totalPortfolioCost = holdings.reduce((sum, h) => sum + (h.shares * h.avgBuyPrice), 0);
  const totalGainLoss = totalPortfolioValue - totalPortfolioCost;
  const totalGainLossPercent = totalPortfolioCost > 0 ? (totalGainLoss / totalPortfolioCost) * 100 : 0;

  return (
    <div className="p-4 h-full flex flex-col justify-between text-white select-none font-sans">
      
      {/* 1. Header & Quick Indices */}
      <div className="shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: theme.accentColor }} />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Stock Market Floor</h3>
          </div>

          <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab("watchlist")}
              className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer ${
                activeTab === "watchlist" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              Watchlist
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer ${
                activeTab === "portfolio" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              My Portfolio
            </button>
          </div>
        </div>

        {/* Indices Ticker */}
        <div className="grid grid-cols-3 gap-1.5 bg-black/25 p-1.5 rounded-xl border border-white/5">
          {indices.map((ind) => {
            const isPos = ind.change >= 0;
            return (
              <div key={ind.symbol} className="text-center">
                <div className="text-[8px] font-mono font-bold opacity-55 uppercase">{ind.symbol}</div>
                <div className="text-[10px] font-mono font-bold leading-tight mt-0.5">${ind.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className={`text-[8px] font-mono flex items-center justify-center font-bold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                  {isPos ? "+" : ""}{ind.change.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Dynamic View Area (Split Screen: List on left, dynamic chart/preview on right) */}
      <div className="flex-1 my-3 overflow-hidden grid grid-cols-1 md:grid-cols-5 gap-3.5 items-stretch min-h-0">
        
        {/* LEFT COLUMN: List / Watchlist / Portfolio (Col-span 2) */}
        <div className="md:col-span-2 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold opacity-50 uppercase tracking-wider">
              {activeTab === "watchlist" ? "Tracked Symbols" : "My Holdings"}
            </span>
            
            {activeTab === "watchlist" && (
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-mono flex items-center gap-1 cursor-pointer text-white/70 hover:text-white"
                >
                  <Search size={10} /> {showSearch ? "Close" : "Search"}
                </button>
              </div>
            )}
          </div>

          {/* Search Dropdown Panel */}
          {showSearch && activeTab === "watchlist" && (
            <div className="p-2 rounded-xl bg-black/60 border border-white/10 space-y-1.5 animate-fade-in mb-2 shrink-0 relative z-30">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol (e.g. AAPL, COIN)..."
                className="w-full text-[10px] px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-white/20 font-mono text-white"
                autoFocus
              />
              <div className="max-h-[80px] overflow-y-auto space-y-1 scrollbar-thin">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleAddToWatchlist(stock)}
                    className="w-full px-2.5 py-1 text-left rounded-lg hover:bg-white/10 text-[9px] font-mono flex items-center justify-between transition-colors"
                  >
                    <span>{stock.symbol} - <span className="opacity-60">{stock.name}</span></span>
                    <span className="font-bold text-emerald-400">+ Add</span>
                  </button>
                ))}
                {searchQuery && searchResults.length === 0 && (
                  <div className="text-[8px] text-white/30 text-center py-1.5 font-mono">No tickers matched search query</div>
                )}
              </div>
            </div>
          )}

          {/* Scrollable list container */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {activeTab === "watchlist" ? (
              stocks.map((stock) => {
                const isPos = stock.change >= 0;
                const isSelected = selectedStock.symbol === stock.symbol;
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className={`p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border ${
                      isSelected 
                        ? "bg-white/10 border-white/15 shadow-md" 
                        : "bg-white/0 border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-[10.5px] font-mono font-bold leading-none">{stock.symbol}</span>
                        {isSelected && <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: theme.accentColor }} />}
                      </div>
                      <span className="text-[8px] opacity-45 truncate block max-w-[80px]">{stock.name}</span>
                    </div>

                    <div className="text-right flex items-center gap-2.5 shrink-0">
                      <div className="text-[10px] font-mono font-bold">${stock.price.toFixed(2)}</div>
                      <div className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md min-w-[48px] text-center ${
                        isPos ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"
                      }`}>
                        {isPos ? "+" : ""}{stock.change.toFixed(1)}%
                      </div>
                      <button
                        onClick={(e) => handleRemoveFromWatchlist(stock.symbol, e)}
                        className="p-1 hover:bg-white/10 rounded-md transition-all opacity-0 group-hover:opacity-100 hover:text-red-400"
                        title="Remove from watchlist"
                      >
                        <Trash2 size={10} className="opacity-50 hover:opacity-100" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              holdings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-8 text-white/30 text-[9px] font-mono space-y-1">
                  <span>No mock holdings found</span>
                  <span>Select any stock on the right to simulate buys</span>
                </div>
              ) : (
                holdings.map((h) => {
                  const stockDetails = stocks.find(s => s.symbol === h.symbol) || PRESET_STOCKS.find(s => s.symbol === h.symbol);
                  const currentPrice = stockDetails ? stockDetails.price : h.avgBuyPrice;
                  const itemValue = h.shares * currentPrice;
                  const itemCost = h.shares * h.avgBuyPrice;
                  const itemGainLoss = itemValue - itemCost;
                  const isPos = itemGainLoss >= 0;

                  return (
                    <div
                      key={h.symbol}
                      className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all text-left flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10.5px] font-mono font-bold leading-none">{h.symbol}</span>
                          <span className="text-[8px] px-1.5 py-0.5 bg-white/10 rounded font-bold text-white/70">{h.shares} Shares</span>
                        </div>
                        <span className="text-[8px] opacity-45 font-mono">Avg: ${h.avgBuyPrice.toFixed(2)}</span>
                      </div>

                      <div className="text-right">
                        <div className="text-[10.5px] font-mono font-bold">${itemValue.toFixed(2)}</div>
                        <div className={`text-[8px] font-mono font-bold flex items-center justify-end ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                          {isPos ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                          {isPos ? "+" : ""}{itemGainLoss.toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSellSimulation(h.symbol)}
                        className="ml-2 text-[8px] font-mono font-bold px-1.5 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 rounded border border-rose-500/10 cursor-pointer"
                        title="Sell 1 Share"
                      >
                        Sell 1
                      </button>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Full Chart Visualization & Transaction Preview (Col-span 3) */}
        <div className="md:col-span-3 bg-black/25 border border-white/5 rounded-2xl p-3 flex flex-col justify-between overflow-hidden">
          
          {/* Active selected preview details */}
          <div className="flex items-center justify-between pb-2 border-b border-white/5 shrink-0">
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-black">{selectedStock.symbol}</span>
                <span className="text-[9px] opacity-40 truncate">{selectedStock.name}</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-mono font-bold">${selectedStock.price.toFixed(2)}</span>
                <span className={`text-[9px] font-mono font-bold ${selectedStock.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {selectedStock.change >= 0 ? "+" : ""}{selectedStock.changePrice.toFixed(2)} ({selectedStock.change.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Simulated instant Paper Trading Button */}
            <button
              onClick={() => {
                setBuyTarget(selectedStock);
                setBuyShares(10);
              }}
              className="px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer hover:scale-105 transition-all shadow-lg text-white"
              style={{ backgroundColor: theme.accentColor }}
            >
              <PlusCircle size={11} /> Simulate Buy
            </button>
          </div>

          {/* Interactive performance vector area chart */}
          <div className="flex-1 my-3 flex items-center justify-center relative min-h-[75px]">
            {/* Area Sparkline Chart */}
            <svg width="100%" height="100%" className="overflow-visible min-h-[75px]">
              <defs>
                <linearGradient id={`grad-${selectedStock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={selectedStock.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={selectedStock.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="10%" x2="100%" y2="10%" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
              <line x1="0" y1="90%" x2="100%" y2="90%" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />

              {/* Render dynamic smooth path polyline */}
              {(() => {
                const history = selectedStock.history;
                const min = Math.min(...history);
                const max = Math.max(...history);
                const range = max - min || 1;
                
                const points = history.map((val, idx) => {
                  const x = (idx / (history.length - 1)) * 240; // width factor
                  const y = 65 - ((val - min) / range) * 55;   // height margin bounds
                  return `${x},${y}`;
                });

                const polylinePoints = points.join(" ");
                // Area enclosing coordinate path
                const areaPoints = `0,75 ${polylinePoints} 240,75`;

                return (
                  <g className="translate-x-4">
                    <polygon
                      points={areaPoints}
                      fill={`url(#grad-${selectedStock.symbol})`}
                    />
                    <polyline
                      fill="none"
                      stroke={selectedStock.change >= 0 ? "#10b981" : "#ef4444"}
                      strokeWidth="2"
                      points={polylinePoints}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Pulsing focal point dot at final price */}
                    <circle
                      cx={240}
                      cy={65 - ((history[history.length - 1] - min) / range) * 55}
                      r="3.5"
                      fill={selectedStock.change >= 0 ? "#34d399" : "#f87171"}
                      className="animate-pulse"
                    />
                  </g>
                );
              })()}
            </svg>

            {/* High/Low Bounds indicator text overlay */}
            <div className="absolute bottom-1 right-2 flex gap-3 text-[7.5px] font-mono opacity-40">
              <span>HIGH: ${selectedStock.high.toFixed(1)}</span>
              <span>•</span>
              <span>LOW: ${selectedStock.low.toFixed(1)}</span>
            </div>
          </div>

          {/* Quick specs details list */}
          <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2 text-left shrink-0">
            <div className="bg-black/20 p-1.5 rounded-xl border border-white/5">
              <div className="text-[7.5px] font-mono opacity-50 uppercase">Trading Volume</div>
              <div className="text-[10px] font-mono font-bold">{selectedStock.volume}</div>
            </div>
            <div className="bg-black/20 p-1.5 rounded-xl border border-white/5">
              <div className="text-[7.5px] font-mono opacity-50 uppercase">Market Spread</div>
              <div className="text-[10px] font-mono font-bold text-emerald-400">0.05% Spread</div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Footer Statistics summary / Total Portfolio Balance details */}
      <div className="shrink-0 flex items-center justify-between border-t border-white/5 pt-2 text-[9px] font-mono">
        <span className="opacity-40 flex items-center gap-1"><Activity size={10} /> Active market feeds sync live.</span>
        
        {/* Render portfolio totals if clicked */}
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="opacity-45">PAPER VALUE:</span>
            <span className="font-bold text-white">${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center gap-1 border-l border-white/15 pl-4">
            <span className="opacity-45">TOTAL P&L:</span>
            <span className={`font-black flex items-center ${totalGainLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalGainLoss >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {totalGainLoss >= 0 ? "+" : ""}{totalGainLossPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* MODAL LIGHTBOX BUY TRANSACTION SIMULATOR */}
      {buyTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4">
          <div 
            className="w-full max-w-sm rounded-3xl p-5 border text-left shadow-2xl relative animate-scale-up"
            style={{
              backgroundColor: theme.theme === "amoled" ? "#000000" : "rgba(18, 18, 18, 0.95)",
              borderColor: theme.borderColor,
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} style={{ color: theme.accentColor }} />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">Paper Buy Order</h3>
                </div>
                <button
                  onClick={() => setBuyTarget(null)}
                  className="text-white/40 hover:text-white p-1 hover:bg-white/5 rounded-xl"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold font-mono">{buyTarget.symbol}</span>
                  <span className="font-mono opacity-55">${buyTarget.price.toFixed(2)} / share</span>
                </div>
                <div className="text-[10px] text-white/50">{buyTarget.name}</div>
              </div>

              {/* Slider for shares count selection */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="opacity-50">Select Amount</span>
                  <span className="font-bold">{buyShares} Shares</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={buyShares}
                  onChange={(e) => setBuyShares(Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center text-xs font-mono border-t border-white/5 pt-3.5">
                <span className="opacity-50">Estimated Cost:</span>
                <span className="font-bold text-sm text-emerald-400">${(buyShares * buyTarget.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <button
                onClick={handleBuySimulation}
                className="w-full py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-transform duration-150 hover:scale-102 text-white"
                style={{ backgroundColor: theme.accentColor }}
              >
                Confirm Paper Trade Buy Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
