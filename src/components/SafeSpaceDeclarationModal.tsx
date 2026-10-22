import React, { useState } from 'react';
import { ShieldAlert, Heart, CheckCircle2, Lock, EyeOff, Sparkles, UserCheck } from 'lucide-react';
import appLogo from '../assets/logo.jpg';

interface SafeSpaceDeclarationModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const SafeSpaceDeclarationModal: React.FC<SafeSpaceDeclarationModalProps> = ({ isOpen, onAccept }) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl shadow-purple-950/50 space-y-6 relative overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800 p-0.5 shadow-lg shadow-purple-900/50 flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src={appLogo} 
              alt="Logo Sistema AssédioAki" 
              className="w-full h-full object-cover rounded-full bg-white"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-purple-400">Plataforma Acolhedora</span>
            <h2 className="text-xl font-bold text-white font-heading">Bem-vinda ao Sistema AssédioAki</h2>
          </div>
        </div>

        {/* Declaration Box required by prompt */}
        <div className="bg-gradient-to-r from-purple-950/60 to-pink-950/40 p-4 sm:p-5 rounded-xl border border-purple-500/40 space-y-2 text-slate-200">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <p className="text-sm sm:text-base font-semibold leading-relaxed text-purple-100">
              "Esta plataforma é um espaço seguro voltado ao acolhimento de mulheres e vítimas de violência de gênero."
            </p>
          </div>
        </div>

        {/* Inclusivity & Guidelines Note */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-300">
          <div className="flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-purple-300">Público-alvo e escopo:</strong> Espaço dedicado prioritariamente a mulheres cisgênero, mulheres transgênero e pessoas não-binárias com expressão ou vivência do gênero feminino.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-emerald-300">Sigilo & Criptografia:</strong> Suas denúncias são encriptadas de ponta a ponta. Você pode relatar de forma 100% anônima sem revelar qualquer dado de identificação.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <EyeOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-amber-300">Botão de Saída Rápida:</strong> Pressione a tecla <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded text-xs border border-slate-700">ESC</kbd> ou o botão no topo a qualquer momento se precisar disfarçar o aplicativo imediatamente.
            </p>
          </div>
        </div>

        {/* Checkbox agreement */}
        <label className="flex items-start gap-3 p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl cursor-pointer transition-colors">
          <input 
            type="checkbox" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 accent-purple-500 rounded border-slate-600 bg-slate-900 focus:ring-purple-500"
          />
          <span className="text-xs text-slate-200 select-none">
            Declarar ciência das diretrizes de uso, concordar com os termos de privacidade rigorosos e entender que esta plataforma é um ambiente seguro e de apoio mútuo.
          </span>
        </label>

        {/* Action Button */}
        <button
          disabled={!agreed}
          onClick={onAccept}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            agreed 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/40 cursor-pointer' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Confirmar Declaração & Entrar com Segurança</span>
        </button>
      </div>
    </div>
  );
};
