import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, CheckCircle2, Lock, EyeOff, UserCheck } from 'lucide-react';
import appLogo from '../assets/logo.jpg';

interface SafeSpaceDeclarationModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onQuickExit?: () => void;
}

export const SafeSpaceDeclarationModal: React.FC<SafeSpaceDeclarationModalProps> = ({
  isOpen,
  onAccept,
  onQuickExit
}) => {
  const [agreed, setAgreed] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAgreed(false);
      const timer = setTimeout(() => {
        modalRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="safespace-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#261d2e]/55 backdrop-blur-sm overflow-y-auto"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white border border-[#e6dfee] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl space-y-5 relative my-auto outline-none"
      >
        {/* Header Icon, Title & Direct Quick Exit */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={appLogo} 
              alt="Logo Assédio Aki" 
              className="w-12 h-12 rounded-full object-cover border border-[#e6dfee] shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-xs font-semibold text-[#6d4c82]">Um lugar de cuidado</span>
              <h2 id="safespace-modal-title" className="text-xl font-semibold text-[#261d2e] font-heading">Que bom ter você aqui</h2>
            </div>
          </div>

          {onQuickExit && (
            <button
              type="button"
              onClick={onQuickExit}
              title="Disfarçar esta tela imediatamente"
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#fbf2f4] hover:bg-[#f4e2e7] border border-[#e7cbd3] text-[#7f3347] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <EyeOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Sair rápido</span>
            </button>
          )}
        </div>

        {/* Declaration Box */}
        <div className="bg-[#f3eef8] p-4 sm:p-5 rounded-2xl border border-[#ddd1ea] text-[#261d2e]">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#6d4c82] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm sm:text-base font-medium leading-relaxed text-[#261d2e]">
              Este é um espaço seguro de acolhimento, escuta e orientação para mulheres e pessoas que vivem violência de gênero. Você não está sozinha.
            </p>
          </div>
        </div>

        {/* Inclusivity & Guidelines Note */}
        <div className="space-y-3 text-xs sm:text-sm text-[#493d54]">
          <div className="flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-[#6d4c82] shrink-0 mt-1" aria-hidden="true" />
            <p>
              <strong className="text-[#261d2e]">Para quem é:</strong> mulheres cis, mulheres trans e pessoas não binárias com expressão feminina. Aqui você é respeitada.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#6d4c82] shrink-0 mt-1" aria-hidden="true" />
            <p>
              <strong className="text-[#261d2e]">Sigilo:</strong> você pode usar sem se identificar, e os relatos salvos aqui ficam protegidos pelo seu PIN.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <EyeOff className="w-4 h-4 text-[#8c3d52] shrink-0 mt-1" aria-hidden="true" />
            <p>
              <strong className="text-[#261d2e]">Sair rápido:</strong> aperte <kbd className="px-1.5 py-0.5 bg-[#f3eef8] text-[#4f3461] rounded text-xs border border-[#ddd1ea]">ESC</kbd> ou toque em “Sair rápido” no topo para disfarçar a tela na hora.
            </p>
          </div>
        </div>

        {/* Checkbox agreement */}
        <label className="flex items-start gap-3 p-3.5 bg-[#faf8fb] hover:bg-[#f3eef8]/60 border border-[#e6dfee] rounded-xl cursor-pointer transition-colors">
          <input 
            type="checkbox" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#6d4c82] rounded"
          />
          <span className="text-xs sm:text-sm text-[#261d2e] select-none leading-relaxed">
            Entendi como o espaço funciona, como cuidamos da privacidade e me comprometo a usá-lo com respeito.
          </span>
        </label>

        {/* Action Button */}
        <button
          type="button"
          disabled={!agreed}
          onClick={onAccept}
          className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
            agreed 
              ? 'bg-[#6d4c82] hover:bg-[#593c6b] text-white cursor-pointer' 
              : 'bg-[#efe9f4] text-[#8c7e99] cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          <span>Entrar com tranquilidade</span>
        </button>
      </div>
    </div>
  );
};
