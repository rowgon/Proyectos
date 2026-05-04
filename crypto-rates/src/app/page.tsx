"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, TrendingUp, RefreshCw, AlertCircle, Wallet, CreditCard } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<{
    airtm: number;
    binance: number;
    conversionRate: number;
    p2pTransferPrice: number;
    zinliPrice: number;
    wallyPrice: number;
    zinliAirtmPrice: number;
    wallyAirtmPrice: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calculator state
  const [amount, setAmount] = useState<number>(550);
  const [p2pPrice, setP2pPrice] = useState<number>(1.02);
  const [source, setSource] = useState<"airtm" | "zinli" | "wally">("airtm");

  // Editable Airtm Funding Rates
  const [zinliAirtmRate, setZinliAirtmRate] = useState<number>(1.06);
  const [wallyAirtmRate, setWallyAirtmRate] = useState<number>(1.10);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rates");
      const json = await res.json();
      if (json.status === "error") throw new Error(json.message);
      setData(json.data);
      
      // Update p2pPrice based on current source (Binance side)
      if (source === "airtm") setP2pPrice(json.data.p2pTransferPrice);
      if (source === "zinli") setP2pPrice(json.data.zinliPrice);
      if (source === "wally") setP2pPrice(json.data.wallyPrice);

      // Initialize Airtm rates from API defaults
      setZinliAirtmRate(json.data.zinliAirtmPrice);
      setWallyAirtmRate(json.data.wallyAirtmPrice);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update p2pPrice when source changes
  useEffect(() => {
    if (data) {
      if (source === "airtm") setP2pPrice(data.p2pTransferPrice);
      if (source === "zinli") setP2pPrice(data.zinliPrice);
      if (source === "wally") setP2pPrice(data.wallyPrice);
    }
  }, [source, data]);

  useEffect(() => {
    fetchRates();
  }, []);

  // Logical calcs
  let usdcAmount = amount;
  let currentAirtmFundingRate = 1.0;

  if (source === "zinli") {
    currentAirtmFundingRate = zinliAirtmRate;
    usdcAmount = amount / zinliAirtmRate;
  } else if (source === "wally") {
    currentAirtmFundingRate = wallyAirtmRate;
    usdcAmount = amount / wallyAirtmRate;
  }

  const vesAirtmBase = data ? usdcAmount * data.airtm : 0;
  const usdtEquiv = amount / p2pPrice;
  const vesBinance = data ? usdtEquiv * data.binance : 0;
  
  const difference = Math.abs(vesAirtmBase - vesBinance);
  const isAirtmBetter = vesAirtmBase > vesBinance;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 md:p-10 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-1/2 w-[1000px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full -translate-x-1/2 -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/5 blur-[180px] rounded-full -z-10" />

      <div className="max-w-6xl w-full">
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl shadow-2xl shadow-emerald-500/5">
              <ArrowLeftRight className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                CryptoHub Vzla
              </h1>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Global P2P Arbitrage Engine</p>
            </div>
          </div>
          
          <button
            onClick={fetchRates}
            disabled={loading}
            className="group flex items-center px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 mr-3 text-emerald-400 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
            <span className="font-black text-sm tracking-widest uppercase">Actualizar</span>
          </button>
        </div>

        {/* Main Rates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Main VES Rates */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] relative overflow-hidden group">
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Airtm Directo</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black">{loading ? '...' : data?.airtm.toFixed(2)}</span>
                <span className="text-gray-600 text-xs font-bold uppercase">ves/usdc</span>
              </div>
            </div>
            
            <div className="p-6 bg-yellow-500/5 backdrop-blur-2xl border border-yellow-500/10 rounded-[2rem] relative overflow-hidden group">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">Binance P2P</h3>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-yellow-500">{loading ? '...' : data?.binance.toFixed(2)}</span>
                <span className="text-yellow-700 text-xs font-bold uppercase">ves/usdt</span>
              </div>
            </div>
          </div>

          {/* Wallet Funding Comparison */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 text-center">Tasas de Fondeo (USD / 1.00 Agente)</h3>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Zinli Group */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-orange-500/20 rounded-xl"><CreditCard className="w-4 h-4 text-orange-400" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-orange-400">USD-Zinli</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-black/40 border border-white/5 rounded-2xl">
                    <span className="text-[9px] font-black text-gray-500 uppercase">Binance</span>
                    <span className="text-xl font-black text-white">{loading ? '...' : data?.zinliPrice.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <span className="text-[9px] font-black text-blue-500/50 uppercase">Airtm</span>
                    <span className="text-xl font-black text-blue-400">{loading ? '...' : data?.zinliAirtmPrice.toFixed(3)}</span>
                  </div>
                </div>
              </div>

              {/* Wally Tech Group */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-xl"><CreditCard className="w-4 h-4 text-purple-400" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-purple-400">Wally Tech</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-black/40 border border-white/5 rounded-2xl">
                    <span className="text-[9px] font-black text-gray-500 uppercase">Binance USD-WallyTech</span>
                    <span className="text-xl font-black text-white">{loading ? '...' : data?.wallyPrice.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <span className="text-[9px] font-black text-blue-500/50 uppercase">Airtm USD-WallyTech</span>
                    <span className="text-xl font-black text-blue-400">{loading ? '...' : data?.wallyAirtmPrice.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Mode Calculator */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
          {/* Main Calculator Box */}
          <div className="xl:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 relative shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Calculadora de Arbitraje</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Selecciona tu billetera de origen</p>
              </div>
              
              {/* Source Tabs */}
              <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
                <button onClick={() => setSource("airtm")} className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all ${source === "airtm" ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-white'}`}>Airtm</button>
                <button onClick={() => setSource("zinli")} className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all ${source === "zinli" ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}>Zinli</button>
                <button onClick={() => setSource("wally")} className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all ${source === "wally" ? 'bg-purple-500 text-black shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-white'}`}>Wally Tech</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-10">
                <div>
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Monto en {source.toUpperCase()}</label>
                  <div className="relative">
                    <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-white/5 border-2 border-white/10 rounded-3xl p-8 text-5xl font-black focus:outline-none focus:border-emerald-500/50 transition-all font-mono" />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 font-black text-xl select-none">USD</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Binance P2P Adjustable Rate */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Costo Binance P2P</label>
                      <span className="text-yellow-500 font-black text-xl">{p2pPrice.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <input type="range" min="0.95" max="1.15" step="0.001" value={p2pPrice} onChange={(e) => setP2pPrice(Number(e.target.value))} className="grow h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-500" />
                      <div className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black border border-white/10">USDT / USD</div>
                    </div>
                  </div>

                  {/* Airtm P2P Adjustable Rate (New) */}
                  {source !== "airtm" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Costo Fondeo Airtm</label>
                        <span className="text-blue-400 font-black text-xl">{currentAirtmFundingRate.toFixed(3)}</span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <input 
                          type="range" min="0.95" max="1.15" step="0.001" 
                          value={currentAirtmFundingRate} 
                          onChange={(e) => source === "zinli" ? setZinliAirtmRate(Number(e.target.value)) : setWallyAirtmRate(Number(e.target.value))}
                          className="grow h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500" 
                        />
                        <div className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black border border-white/10">USDC / USD</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                <div className={`p-6 rounded-3xl border transition-all duration-500 ${isAirtmBetter ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-white/10 opacity-60'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opción 1: Venta en Airtm</span>
                    {isAirtmBetter && <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black rounded-full">MEJOR PRECIO</span>}
                  </div>
                  {source !== "airtm" && (
                    <div className="flex items-center space-x-2 my-2 text-[10px] font-black text-blue-500/60 uppercase">
                      <span>{usdcAmount.toFixed(2)} USDC</span>
                      <span>×</span>
                      <span>{data?.airtm.toFixed(2)} tasa</span>
                    </div>
                  )}
                  <div className="text-3xl font-black">
                    {vesAirtmBase.toLocaleString('de-DE', { minimumFractionDigits: 2 })} <span className="text-sm font-medium opacity-50">VES</span>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border transition-all duration-500 ${!isAirtmBetter ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_50px_-15px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10 opacity-60'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Opción 2: Vía Binance</span>
                    {!isAirtmBetter && <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black rounded-full">MEJOR PRECIO</span>}
                  </div>
                  <div className="flex items-center space-x-2 my-2 text-[10px] font-black text-emerald-400/60 uppercase">
                    <span>{usdtEquiv.toFixed(2)} USDT</span>
                    <span>×</span>
                    <span>{data?.binance.toFixed(2)} tasa</span>
                  </div>
                  <div className="text-3xl font-black">
                    {vesBinance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} <span className="text-sm font-medium opacity-50">VES</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Comparison Column */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 h-full flex flex-col justify-center">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-10 text-center">Rendimiento</h3>
              <div className="text-center mb-10">
                <div className="text-7xl font-black tracking-tighter mb-4">
                  {(difference / (isAirtmBetter ? vesBinance : vesAirtmBase) * 100).toFixed(1)}
                  <span className="text-2xl font-bold text-emerald-400">%</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.1em] mb-2">Diferencia Neta</p>
                  <p className="text-xl font-black text-white">{difference.toLocaleString('de-DE', { minimumFractionDigits: 2 })} VES</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-center p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] mb-8">
            <AlertCircle className="text-red-400 w-6 h-6 mr-4 shrink-0" />
            <p className="text-red-200 text-sm font-bold tracking-tight">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
