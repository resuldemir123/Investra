
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Globe,
  FileText,
  Settings,
  Search,
  Bell,
  Plus,
  Zap,
  Paperclip,
  Globe as GlobeIcon,
  FileCode,
  Sparkles,
  Loader2,
  TrendingUp,
  Target,
  ShieldAlert,
  Download,
  Save,
  Trash2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Database,
  Info,
  Layers,
  BarChart3,
  Rocket,
  Presentation,
  Maximize2,
  Minimize2,
  BarChart,
  LineChart,
  Activity,
  Calculator,
  PieChart,
  LogOut
} from 'lucide-react';
import { api } from './services/djangoApi';
import { AnalysisResult, SavedAnalysis, MarketIntelligence } from './types';
import RadarChart from './components/RadarChart';
import ComparativeChart from './components/ComparativeChart';
import TrendChart from './components/TrendChart';
import SWOTGrid from './components/SWOTGrid';
import { useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type TabType = 'dashboard' | 'portfolio' | 'tools' | 'market' | 'reports' | 'settings';

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  tag?: string;
  onClick?: () => void;
}> = ({ icon, label, active, tag, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3.5 cursor-pointer transition-all duration-300 rounded-xl group ${active ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_12px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
  >
    <div className="flex items-center gap-3">
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="font-semibold text-sm tracking-tight">{label}</span>
    </div>
    {tag && (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${active ? 'bg-cyan-600/20 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
        {tag}
      </span>
    )}
  </button>
);

const App: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [projectSummary, setProjectSummary] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [isInvestorMode, setIsInvestorMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [marketIntel, setMarketIntel] = useState<MarketIntelligence | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Financial Tools State
  const [burnRate, setBurnRate] = useState(50000);
  const [cashOnHand, setCashOnHand] = useState(500000);

  useEffect(() => {
    if (user) {
      api.getAnalyses()
        .then(setSavedAnalyses)
        .catch(console.error);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const saveToHistory = useCallback(async () => {
    if (!result || !projectSummary || !user) return;
    setIsSaving(true);
    try {
      const title = projectSummary.trim().slice(0, 40) + (projectSummary.trim().length > 40 ? '...' : '');
      const id = await api.saveAnalysis(title, projectSummary, result);

      const newEntry: SavedAnalysis = {
        id,
        timestamp: Date.now(),
        title,
        summary: projectSummary,
        result: result
      };
      setSavedAnalyses([newEntry, ...savedAnalyses]);
      alert("Investra portföyüne ve buluta kaydedildi.");
    } catch (e) {
      console.error(e);
      alert("Kaydetme işlemi başarısız oldu.");
    } finally {
      setIsSaving(false);
    }
  }, [result, projectSummary, user, savedAnalyses]);

  const handleGenerateAndSavePDF = async () => {
    if (!reportRef.current || !user || !result) return;
    setIsSaving(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Save local
      pdf.save('investra-report.pdf');

      // Upload to cloud (optional per user request if saving makes sense)
      // We need an analysis ID to link it, typically we save the analysis first
      // For now, just simulating cloud upload or if we had an ID
      alert("PDF Raporu oluşturuldu.");

    } catch (e) {
      console.error(e);
      alert("PDF oluşturulurken hata meydan geldi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!projectSummary.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      // 1. Get Analysis from Gemini
      const data = await api.analyzeStartup(projectSummary);
      setResult(data);

      // 2. Auto-save to Portfolio (Database & Firestore)
      try {
        const title = projectSummary.trim().slice(0, 40) + (projectSummary.trim().length > 40 ? '...' : '');
        const id = await api.saveAnalysis(title, projectSummary, data);

        const newEntry: SavedAnalysis = {
          id,
          timestamp: Date.now(),
          title,
          summary: projectSummary,
          result: data
        };
        setSavedAnalyses(prev => [newEntry, ...prev]);
        // Update: Removed blocking alert, maybe add a toast later.
        console.log("Auto-saved to portfolio");
      } catch (saveError) {
        console.error("Auto-save failed:", saveError);
        // We don't block the UI if save fails, but we could notify
      }

    } catch (err: any) {
      console.error(err);
      setError('Stratejik analiz motoru yoğunluk yaşıyor veya servis erişilemez durumda.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [projectSummary]);

  const runway = useMemo(() => Math.floor(cashOnHand / burnRate), [cashOnHand, burnRate]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#020617] flex items-center justify-center">
        <Loader2 size={48} className="text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderDashboard = () => (
    <div className="space-y-10 pb-16">
      <section className="no-print">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">Venture Hub</h2>
            <p className="text-slate-400 text-lg font-medium">Girişimini profesyonel frameworkler ile scale et.</p>
          </div>
          <div className="flex gap-2">
            {['SaaS', 'FinTech', 'AI-Ready'].map(tag => (
              <span key={tag} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-cyan-400 tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div> {tag}
              </span>
            ))}
          </div>
        </div>

        {!result && (
          <div className="bg-[#0f172a] border border-slate-800/50 rounded-[2.5rem] overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all duration-500 shadow-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <textarea
              value={projectSummary}
              onChange={(e) => setProjectSummary(e.target.value)}
              placeholder="Girişiminin vizyonunu, iş modelini ve teknik altyapısını buraya aktar..."
              className="w-full h-64 bg-transparent p-12 outline-none resize-none text-slate-200 leading-relaxed placeholder:text-slate-600 text-xl font-medium relative z-10"
            />
            <div className="p-8 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-900/50 border-t border-slate-800/50 relative z-10">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <ShieldAlert size={18} className="text-cyan-500" />
                <span>Analizler kurumsal standartlarda şifreli gerçekleştirilir.</span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !projectSummary.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 disabled:opacity-40 text-white px-12 py-5 rounded-2xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-xl transform active:scale-95 btn-glow"
              >
                {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} fill="white" />}
                {isAnalyzing ? "Analiz Motoru Çalışıyor" : "Stratejik Analiz Başlat"}
              </button>
            </div>
          </div>
        )}
      </section>

      {result && !isAnalyzing && (
        <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000" ref={reportRef}>
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 no-print">
            <div className="flex items-center gap-6">
              <div className="w-1.5 h-12 bg-gradient-to-b from-cyan-500 to-violet-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)]"></div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{isInvestorMode ? "Investor Deck" : "Stratejik Rapor"}</h2>
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em]">{new Date().toLocaleDateString('tr-TR')} • CORE V4.2_LLM</p>
              </div>
            </div>
            <div className="flex gap-3" data-html2canvas-ignore>
              <button onClick={() => setIsInvestorMode(!isInvestorMode)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase border transition-all ${isInvestorMode ? 'bg-cyan-600 border-cyan-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {isInvestorMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />} {isInvestorMode ? "Normal" : "Sunum"}
              </button>
              <button onClick={saveToHistory} disabled={isSaving} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase border border-slate-700 disabled:opacity-50">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              </button>
              <button onClick={handleGenerateAndSavePDF} disabled={isSaving} className="bg-white text-slate-950 px-8 py-4 rounded-2xl text-xs font-black uppercase shadow-xl hover:bg-slate-100 disabled:opacity-50">
                <Download size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Insights */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-80 h-80 bg-cyan-600/5 rounded-full blur-[120px] group-hover:bg-cyan-600/10 transition-colors"></div>
              <div className="flex items-center gap-4 text-cyan-400 mb-10">
                <Sparkles size={28} className="animate-pulse" />
                <h3 className="font-black uppercase tracking-[0.4em] text-[10px]">Stratejik Değerleme Tezi</h3>
              </div>
              <p className="text-slate-200 text-2xl font-bold leading-relaxed mb-16 italic tracking-tight">"{result.executiveSummary}"</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-slate-800/50">
                {[
                  { label: "Değerleme", val: result.valuationRange, color: "text-white" },
                  { label: "Hedef Pazar", val: result.tam2025, color: "text-white" },
                  { label: "Nakit Verimi", val: result.burnRateFactor, color: result.burnRateFactor.includes('Risk') ? 'text-rose-500' : 'text-emerald-500' }
                ].map((s, i) => (
                  <div key={i} className="p-6 bg-slate-950/50 rounded-[2rem] border border-slate-800/50">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{s.label}</p>
                    <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Matrix */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center">
              <h3 className="w-full text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-12">Vektör Matrisi</h3>
              <RadarChart scores={result.scores} />
              <div className="mt-12 w-full grid grid-cols-2 gap-3">
                {Object.entries(result.scores).map(([k, v]) => (
                  <div key={k} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/50 text-center">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{k}</p>
                    <p className="text-xl font-black text-white">{v}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SWOT & Unit Economics Row */}
            <div className="lg:col-span-12 grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl">
                <div className="flex items-center gap-4 mb-10 text-cyan-400">
                  <Layers size={24} />
                  <h3 className="font-black uppercase tracking-[0.3em] text-xs">SWOT Matrisi</h3>
                </div>
                <SWOTGrid swot={result.swot} />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Activity size={120} className="text-cyan-500" />
                </div>
                <div className="flex items-center gap-4 mb-10 text-violet-400">
                  <Activity size={24} />
                  <h3 className="font-black uppercase tracking-[0.3em] text-xs">Unit Economics</h3>
                </div>
                <div className="space-y-6">
                  {Object.entries(result.unitEconomics).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center pb-4 border-b border-slate-800/50 last:border-0">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{k}</p>
                      <p className="text-lg font-black text-white">{v}</p>
                    </div>
                  ))}
                  <div className="mt-8 p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-center">
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Verimlilik Skoru</p>
                    <p className="text-2xl font-black text-white">8.4 / 10</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl h-[450px]">
                <div className="flex items-center gap-4 mb-10 text-blue-500">
                  <BarChart size={24} />
                  <h3 className="font-black text-white uppercase text-xs tracking-widest">Sektörel Benchmark</h3>
                </div>
                <div className="h-64"><ComparativeChart scores={result.scores} industryAverage={result.industryAverage} /></div>
              </div>
              <div className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl h-[450px]">
                <div className="flex items-center gap-4 mb-10 text-indigo-500">
                  <LineChart size={24} />
                  <h3 className="font-black text-white uppercase text-xs tracking-widest">Pazar Projeksiyonu</h3>
                </div>
                <div className="h-64"><TrendChart projections={result.growthProjections} /></div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );

  const renderTools = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Girişimci Toolseti</h2>
        <p className="text-slate-400 text-lg font-medium">Finansal projeksiyonlar ve runway yönetimi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Runway Tool */}
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-2xl">
          <div className="flex items-center gap-4 mb-12 text-cyan-400">
            <div className="p-4 bg-cyan-500/10 rounded-3xl border border-cyan-500/20"><Calculator size={32} /></div>
            <div>
              <h3 className="font-black text-white text-xl uppercase tracking-tighter">Runway Hesaplayıcı</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Nakit Tüketim Analizi</p>
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Mevcut Nakit (USD)</label>
              <input
                type="number"
                value={cashOnHand}
                onChange={(e) => setCashOnHand(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 p-6 rounded-3xl text-3xl font-black text-white outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Aylık Burn Rate (USD)</label>
              <input
                type="number"
                value={burnRate}
                onChange={(e) => setBurnRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 p-6 rounded-3xl text-3xl font-black text-rose-500 outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            <div className="pt-10 border-t border-slate-800/50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tahmini Runway</p>
                <p className={`text-6xl font-black ${runway < 6 ? 'text-rose-500' : 'text-emerald-500'}`}>{runway} Ay</p>
              </div>
              <div className={`p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest ${runway < 6 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {runway < 6 ? "KRİTİK_DÜZEY" : "GÜVENLİ_ALAN"}
              </div>
            </div>
          </div>
        </div>

        {/* Cap Table Tool */}
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><PieChart size={160} /></div>
          <div className="flex items-center gap-4 mb-12 text-violet-400">
            <div className="p-4 bg-violet-500/10 rounded-3xl border border-violet-500/20"><PieChart size={32} /></div>
            <div>
              <h3 className="font-black text-white text-xl uppercase tracking-tighter">Dinamik Cap Table</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Hisse Dağılım Simülasyonu</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { name: "Kurucu Ortaklar", share: 65, color: "bg-cyan-500" },
              { name: "Melek Yatırımcılar", share: 15, color: "bg-violet-500" },
              { name: "ESOP (Çalışan Payı)", share: 10, color: "bg-slate-600" },
              { name: "Diğer", share: 10, color: "bg-slate-800" }
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-950/50 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${p.color}`}></div>
                  <span className="text-sm font-bold text-slate-300">{p.name}</span>
                </div>
                <span className="font-black text-white">% {p.share}</span>
              </div>
            ))}
            <button className="w-full mt-8 bg-slate-800 hover:bg-slate-700 text-white py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest border border-slate-700 transition-all">
              Yatırım Turu Simüle Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Portföy</h2>
        <p className="text-slate-400 text-lg font-medium">Kaydedilen tüm girişim analizleri.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedAnalyses.map((analysis) => (
          <div key={analysis.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-cyan-500/50 transition-all group cursor-pointer" onClick={() => { setResult(analysis.result); setActiveTab('dashboard'); }}>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-500"><FileText size={20} /></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(analysis.timestamp).toLocaleDateString('tr-TR')}</p>
            </div>
            <h3 className="text-white font-bold text-lg mb-4 line-clamp-2">{analysis.title}</h3>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest">
              <span>İncele</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
        {savedAnalyses.length === 0 && (
          <div className="col-span-full py-24 text-center bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-800">
            <Database size={48} className="mx-auto text-slate-700 mb-6" />
            <p className="text-slate-500 font-bold">Henüz kaydedilmiş bir analiz bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    if (activeTab === 'market' && !marketIntel) {
      api.getMarketIntelligence().then(setMarketIntel).catch(console.error);
    }
  }, [activeTab, marketIntel]);

  const renderMarketIntel = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Pazar İstihbaratı</h2>
        <p className="text-slate-400 text-lg font-medium">Global ekosistem trendleri ve benchmarklar.</p>
      </div>

      {!marketIntel ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-cyan-500" />
          <span className="ml-3 text-slate-500 font-bold">Veri akışı sağlanıyor...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Sentiment Section */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5"><GlobeIcon size={180} /></div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
              <Activity className="text-cyan-500" /> Global Yatırımcı Havası
            </h3>

            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" strokeWidth="12" stroke="#1e293b" fill="none" />
                  <circle cx="96" cy="96" r="88" strokeWidth="12" stroke={marketIntel.globalSentiment === 'Bullish' ? '#10b981' : marketIntel.globalSentiment === 'Bearish' ? '#f43f5e' : '#f59e0b'} fill="none" strokeDasharray={553} strokeDashoffset={553 - (553 * marketIntel.sentimentScore) / 100} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-white">{marketIntel.sentimentScore}</span>
                  <span className={`text-xs font-black uppercase tracking-wider ${marketIntel.globalSentiment === 'Bullish' ? 'text-emerald-500' : 'text-amber-500'}`}>{marketIntel.globalSentiment}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-slate-300 text-lg leading-relaxed">{marketIntel.vcActivity}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trends */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                <TrendingUp className="text-violet-500" /> Yükselen Trendler
              </h3>
              <div className="space-y-6">
                {marketIntel.trends.map((t, i) => (
                  <div key={i} className="p-5 bg-slate-950/50 border border-slate-800 rounded-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">{t.title}</h4>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${t.impact === 'High' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-700/30 text-slate-400'}`}>{t.impact} Impact</span>
                    </div>
                    <p className="text-sm text-slate-400">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot Sectors */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                <Zap className="text-amber-500" /> Sıcak Sektörler
              </h3>
              <div className="space-y-6">
                {marketIntel.hotSectors.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-950/50 border border-slate-800 rounded-2xl group hover:border-amber-500/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors">{s.name}</h4>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{s.growth} Growth</span>
                      </div>
                      <p className="text-xs text-slate-500">{s.reason}</p>
                    </div>
                    <ChevronRight className="text-slate-600 group-hover:text-amber-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Raporlar</h2>
        <p className="text-slate-400 text-lg font-medium">Stratejik dokümanlar ve yatırımcı sunumları.</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 p-16 rounded-[3.5rem] text-center">
        <Presentation size={64} className="mx-auto text-violet-500 mb-8" />
        <h3 className="text-2xl font-black text-white mb-4">Rapor Arşivi Boş</h3>
        <p className="text-slate-500 max-w-md mx-auto">Girişim analizlerini tamamladıktan sonra PDF ve Sunum formatında dışa aktarabilirsiniz.</p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Profil ve Ayarlar</h2>
        <p className="text-slate-400 text-lg font-medium">Hesap detayları ve uygulama tercihleri.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-cyan-600/20 to-transparent"></div>
          <div className="w-32 h-32 rounded-3xl bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-slate-700/60 shadow-2xl mb-6 relative z-10">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&backgroundColor=06b6d4`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{user.first_name || user.username || 'Girişimci'}</h3>
          <p className="text-xs text-cyan-500 font-black uppercase tracking-widest mb-6">Investra Üyesi</p>

          <div className="w-full space-y-4">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">E-posta</p>
              <p className="text-sm font-semibold text-white truncate">{user.email}</p>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Üyelik Tipi</p>
              <div className="flex items-center justify-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                <p className="text-sm font-black text-amber-400 uppercase">Premium</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-rose-500/20 transition-all flex items-center justify-center gap-2">
              <LogOut size={16} /> Oturumu Kapat
            </button>
          </div>
        </div>

        {/* Settings Controls */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem]">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Tercihler</h3>
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-8 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><Target size={24} /></div>
                  <div>
                    <p className="text-white font-bold">Gelişmiş Yatırımcı Modu</p>
                    <p className="text-xs text-slate-500 mt-1">Analiz çıktılarını daha agresif bir finansal perspektifle yapılandırır.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInvestorMode(!isInvestorMode)}
                  className={`w-14 h-8 rounded-full transition-colors relative ${isInvestorMode ? 'bg-cyan-500' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isInvestorMode ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500"><Database size={24} /></div>
                  <div>
                    <p className="text-white font-bold">Veri Senkronizasyonu</p>
                    <p className="text-xs text-slate-500 mt-1">Analiz geçmişini bulutta güvenli sakla.</p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Aktif
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
              <Rocket size={120} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Üyelik Durumu</h3>
            <p className="text-slate-400 mb-6">Şu anda <span className="text-white font-bold">Pro Plan</span> deneme sürümünü kullanıyorsunuz. Tüm özelliklere erişiminiz açık.</p>
            <div className="w-full bg-slate-950 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-cyan-500 to-violet-500 h-2 rounded-full w-3/4"></div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right">Kota: %75 Dolu</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-800/60 flex flex-col bg-[#020617] no-print z-20 shrink-0">
        <div className="p-10 flex items-center gap-5">
          <div className="bg-gradient-to-br from-cyan-600 to-violet-600 p-3.5 rounded-[1.25rem] shadow-2xl shadow-cyan-900/40 transform rotate-3">
            <Rocket size={32} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-2xl leading-none uppercase tracking-tighter text-white">Investra</h1>
            <p className="text-[10px] text-cyan-500 uppercase tracking-[0.4em] font-black mt-1">Scale Core</p>
          </div>
        </div>

        <nav className="flex-1 mt-4 px-6 space-y-2 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={22} />} label="Venture Hub" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Calculator size={22} />} label="Finansal Araçlar" active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} />
          <SidebarItem icon={<Briefcase size={22} />} label="Portföy" tag={`${savedAnalyses.length}`} active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} />
          <SidebarItem icon={<Globe size={22} />} label="Pazar İstihbaratı" active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
          <SidebarItem icon={<FileText size={22} />} label="Raporlar" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <SidebarItem icon={<Settings size={22} />} label="Ayarlar" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-10 border-t border-slate-800/40 bg-slate-900/20 space-y-4">
          <button onClick={() => { setProjectSummary(''); setResult(null); setActiveTab('dashboard'); }} className="w-full bg-white hover:bg-slate-100 text-slate-950 py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl font-black text-xs uppercase tracking-widest transform active:scale-95 group">
            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> Yeni Analiz
          </button>
          <button onClick={handleLogout} className="w-full text-slate-500 hover:text-white py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 border-b border-slate-800/60 flex items-center justify-between px-12 bg-[#020617]/70 backdrop-blur-2xl sticky top-0 z-10 no-print">
          <div className="flex items-center gap-6 w-2/5 text-slate-500"><Search size={22} /><input type="text" placeholder="Ekosistemde akıllı arama..." className="bg-transparent border-none outline-none text-base w-full font-semibold text-white" /></div>
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-3 bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800/60 shadow-inner">
              <Sparkles size={18} className="text-cyan-500" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">GEMINI PRO 3.0 PREVIEW</span>
            </div>
            <div className="flex items-center gap-5 pl-8 border-l border-slate-800/60">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white uppercase tracking-tight">{user.first_name || user.username || user.email}</p>
                <p className="text-[10px] text-cyan-500 font-black tracking-widest uppercase">Admin</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-700/60 cursor-pointer shadow-2xl transform hover:scale-105 transition-all">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&backgroundColor=06b6d4`} alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#020617] relative">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none overflow-hidden no-print">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 relative z-10">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'tools' && renderTools()}
            {activeTab === 'portfolio' && renderPortfolio()}
            {activeTab === 'market' && renderMarketIntel()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
