import React, { useState, useEffect } from 'react';
import { Sun, Cloud, Thermometer, Search, ExternalLink, Lock, ShieldCheck } from 'lucide-react';
import { hasReportDraft } from '../lib/draftStorage';

interface QuickExitMaskProps {
  isMasked: boolean;
  onUnmask: () => void;
  onRedirectExternal: () => void;
}

export const QuickExitMask: React.FC<QuickExitMaskProps> = ({
  isMasked,
  onUnmask,
  onRedirectExternal
}) => {
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
      setTimeout(() => setPinError(false), 2500);
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tela de disfarce rápido"
      className="fixed inset-0 z-[99999] bg-[#f8fafc] text-slate-800 font-sans overflow-y-auto"
    >
      {/* Neutral Weather & Lifestyle Portal Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleHeaderClick}
            className="flex items-center gap-2.5 min-h-[44px] cursor-pointer select-none text-left"
            title="Clique 3 vezes para voltar ao aplicativo"
          >
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Sun className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-semibold text-lg text-slate-800 tracking-tight block leading-none">
                Clima &amp; Dia
              </span>
              <span className="text-xs text-slate-500">Previsão do tempo e receitas</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onRedirectExternal}
            className="min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors border border-slate-300 cursor-pointer"
          >
            <span>Ir para Google.com</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Neutral Portal Content */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Weather Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Search className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
            <label htmlFor="mask-city-search" className="sr-only">
              Buscar cidade
            </label>
            <input
              id="mask-city-search"
              type="text"
              placeholder="Digite sua cidade..."
              defaultValue="Florianópolis, SC"
              className="w-full sm:w-80 min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700"
            />
          </div>
          <div className="text-xs text-slate-500">Atualizado hoje</div>
        </div>

        {/* Forecast Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-sky-700 rounded-2xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sky-100 font-medium text-sm">Previsão atual</p>
                <h2 className="text-2xl font-bold mt-1">Florianópolis</h2>
                <p className="text-sky-100 text-xs mt-1">Parcialmente nublado</p>
              </div>
              <Cloud className="w-10 h-10 text-white/90" aria-hidden="true" />
            </div>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums">23°C</span>
              <span className="text-sky-100 text-sm">Sensação 24°C</span>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-3 text-center text-xs text-sky-100">
              <div>
                <span className="block opacity-80">Umidade</span>
                <span className="font-semibold text-sm">68%</span>
              </div>
              <div>
                <span className="block opacity-80">Vento</span>
                <span className="font-semibold text-sm">14 km/h</span>
              </div>
              <div>
                <span className="block opacity-80">Chuva</span>
                <span className="font-semibold text-sm">10%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-800 text-base flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-amber-600" aria-hidden="true" />
              <span>Próximos dias</span>
            </h3>
            <div className="space-y-3 text-sm divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <span className="font-medium text-slate-700">Sábado</span>
                <span className="text-slate-500 text-xs">Ensolarado</span>
                <span className="font-semibold text-slate-800 tabular-nums">26° / 17°</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-medium text-slate-700">Domingo</span>
                <span className="text-slate-500 text-xs">Nublado</span>
                <span className="font-semibold text-slate-800 tabular-nums">22° / 15°</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-medium text-slate-700">Segunda</span>
                <span className="text-slate-500 text-xs">Tempo aberto</span>
                <span className="font-semibold text-slate-800 tabular-nums">27° / 18°</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-800 text-base">Receitas simples</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-800 text-sm">Sopa de abóbora com gengibre</p>
                <p className="text-xs text-slate-500 mt-0.5">Preparo: 30 min</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-800 text-sm">Bolo de cenoura tradicional</p>
                <p className="text-xs text-slate-500 mt-0.5">Preparo: 45 min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Discreet Unlock & Honest Browser History Notice */}
        <div className="mt-10 pt-8 border-t border-slate-200 max-w-lg mx-auto text-center space-y-3">
          <form onSubmit={handlePinSubmit} className="flex flex-wrap items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <label htmlFor="mask-pin-input" className="sr-only">
              PIN para voltar
            </label>
            <input
              id="mask-pin-input"
              type="password"
              placeholder="PIN (ex: 1234)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 w-44 text-center"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Voltar ao app
            </button>
          </form>

          {pinError && (
            <p className="text-xs text-rose-700">
              Digite pelo menos 4 caracteres (ex: 1234) ou clique 3 vezes no título acima.
            </p>
          )}

          {hasReportDraft() && (
            <div className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-700 bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span>Seu rascunho em andamento foi salvo localmente neste aparelho.</span>
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed">
            Este modo disfarça a tela imediatamente (ou tecle <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px]">ESC</kbd>), mas não apaga o histórico do navegador. Se precisar, use o botão “Ir para Google.com” ou feche a aba.
          </p>
        </div>
      </main>
    </div>
  );
};
