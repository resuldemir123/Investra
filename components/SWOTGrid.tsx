
import React from 'react';
import { ShieldCheck, AlertCircle, TrendingUp, ShieldAlert } from 'lucide-react';

interface SWOTGridProps {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

const SWOTGrid: React.FC<SWOTGridProps> = ({ swot }) => {
  const categories = [
    { title: 'Güçlü Yönler', data: swot.strengths, icon: <ShieldCheck className="text-emerald-400" />, bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
    { title: 'Zayıf Yönler', data: swot.weaknesses, icon: <AlertCircle className="text-amber-400" />, bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
    { title: 'Fırsatlar', data: swot.opportunities, icon: <TrendingUp className="text-blue-400" />, bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
    { title: 'Tehditler', data: swot.threats, icon: <ShieldAlert className="text-rose-400" />, bg: 'bg-rose-500/5', border: 'border-rose-500/20' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((cat, idx) => (
        <div key={idx} className={`${cat.bg} ${cat.border} border p-6 rounded-3xl transition-all duration-300 hover:scale-[1.02]`}>
          <div className="flex items-center gap-3 mb-4">
            {cat.icon}
            <h4 className="font-black text-xs uppercase tracking-widest text-white">{cat.title}</h4>
          </div>
          <ul className="space-y-2">
            {cat.data.map((item, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-slate-600 shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SWOTGrid;
