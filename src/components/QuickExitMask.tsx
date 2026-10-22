import React, { useState, useEffect } from 'react';
import { Sun, Cloud, Thermometer, Search, ExternalLink, Lock, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';
import { hasReportDraft } from '../lib/draftStorage';

interface QuickExitMaskProps {
  isMasked: boolean;
  onUnmask: () => void;
  onRedirectExternal: () => void;
}

export const QuickExitMask: React.FC<QuickExitMaskProps> = ({ isMasked, onUnmask, onRedirectExternal }) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (!isMasked) {
      setPinInput('');
      setPinError(false);
      setClickCount(0);
    }
  }, [isMasked]);

  if (!isMasked) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '0000' || pinInput.length >= 4) {
      onUnmask();
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const handleHeaderClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      onUnmask();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900 text-slate-800 font-sans overflow-y-auto">
      {/* Neutral Weather & Lifestyle Portal Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            onClick={handleHeaderClick}
            className="flex items-center gap-2 cursor-pointer select-none group"
            title="Clique 3 vezes para desbloquear"
          >
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:scale-105 transition-transform">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-800 tracking-tight block leading-none">Clima & Vida</span>
              <span className="text-xs text-slate-500">Portal do Tempo e Culinária</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRedirectExternal}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
            >
              <span>Ir para Google.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Neutral Portal Content */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Weather Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Digite sua cidade (ex: São Paulo, Rio, Floripa)..." 
              defaultValue="São Paulo, SP"
              className="w-full sm:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 w-full sm:w-auto justify-end">
            <span>Atualizado há 5 min</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>

        {/* Forecast Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 font-medium text-sm">Previsão Atual</p>
                <h2 className="text-3xl font-bold mt-1">São Paulo</h2>
                <p className="text-blue-100 text-xs mt-1">Sexta-feira, Parcialmente Nublado</p>
              </div>
              <Cloud className="w-12 h-12 text-white/90" />
            </div>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold">23°C</span>
              <span className="text-blue-200 text-sm">Sensação 24°C</span>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-3 text-center text-xs text-blue-100">
              <div>
                <span className="block opacity-75">Umidade</span>
                <span className="font-semibold text-sm">68%</span>
              </div>
              <div>
                <span className="block opacity-75">Vento</span>
                <span className="font-semibold text-sm">14 km/h</span>
              </div>
              <div>
                <span className="block opacity-75">Chuva</span>
                <span className="font-semibold text-sm">10%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-amber-500" />
              Próximos Dias
            </h3>
            <div className="space-y-3 text-sm divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <span className="font-medium text-slate-700">Sábado</span>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Sun className="w-4 h-4 text-amber-500" /> Ensolarado
                </div>
                <span className="font-semibold text-slate-800">26° / 17°</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-medium text-slate-700">Domingo</span>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Cloud className="w-4 h-4 text-blue-400" /> Parcialmente
                </div>
                <span className="font-semibold text-slate-800">22° / 15°</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-medium text-slate-700">Segunda</span>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Sun className="w-4 h-4 text-amber-500" /> Limpo
                </div>
                <span className="font-semibold text-slate-800">27° / 18°</span>
              </div>
            </div>
          </div>

          {/* Neutral Lifestyle Content */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Receitas em Destaque</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <p className="font-semibold text-slate-800 text-sm">Sopa Cremosa de Abóbora com Gengibre</p>
                <p className="text-xs text-slate-500 mt-0.5">Tempo de preparo: 30 min • Fácil</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <p className="font-semibold text-slate-800 text-sm">Bolo de Cenoura Fofinho com Cobertura de Cacau</p>
                <p className="text-xs text-slate-500 mt-0.5">Tempo de preparo: 45 min • Tradicional</p>
              </div>
            </div>
          </div>
        </div>

        {/* Discreeth Secret Unlock Bar at bottom */}
        <div className="mt-12 pt-8 border-t border-slate-200 max-w-md mx-auto text-center space-y-3">
          <form onSubmit={handlePinSubmit} className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <input 
              type="password"
              placeholder="PIN de acesso seguro..." 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 w-44 text-center focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button 
              type="submit"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Restaurar
            </button>
          </form>

          {pinError && (
            <p className="text-xs text-rose-600">PIN incorreto. Tente novamente ou dê 3 cliques no logotipo acima.</p>
          )}

          {hasReportDraft() && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-purple-700 bg-purple-50 py-1.5 px-3 rounded-full border border-purple-200 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Rascunho de denúncia preservado em sigilo para retomada segura.</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            Dica de Segurança: Pressione a tecla <kbd className="px-1 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">ESC</kbd> a qualquer momento para ativar este modo de disfarce.
          </p>
        </div>
      </main>
    </div>
  );
};
