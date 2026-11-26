import React from 'react';
import { ShieldCheck, MapPin, MapPinOff, Lock, X } from 'lucide-react';

interface LocationPrivacyModalProps {
  isOpen: boolean;
  context?: 'report' | 'locator' | 'support';
  showNoLocationOption?: boolean;
  onConfirmOffset: () => void;
  onConfirmExact: () => void;
  onConfirmNoLocation?: () => void;
  onCancel: () => void;
}

export const LocationPrivacyModal: React.FC<LocationPrivacyModalProps> = ({
  isOpen,
  context = 'report',
  showNoLocationOption = false,
  onConfirmOffset,
  onConfirmExact,
  onConfirmNoLocation,
  onCancel
}) => {
  if (!isOpen) return null;

  const contextSubtitle =
    context === 'report'
      ? 'Antes de usar sua localização neste relato, escolha como prefere cuidar da sua privacidade:'
      : context === 'locator'
      ? 'Antes de buscar delegacias e hospitais perto de você, escolha como prefere usar sua localização:'
      : 'Antes de ordenar os lugares de ajuda mais próximos, escolha como prefere usar sua localização:';

  return (
    <div
      className="fixed inset-0 z-[120] bg-[#261d2e]/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-privacy-title"
    >
      <div className="bg-white border border-[#e6dfee] rounded-2xl max-w-lg w-full max-h-[92dvh] overflow-y-auto p-5 sm:p-7 shadow-xl space-y-5 relative my-auto">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#5a4e66] hover:text-[#261d2e] hover:bg-[#f3eef8] rounded-xl transition-colors cursor-pointer"
          aria-label="Fechar janela"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="w-11 h-11 rounded-xl bg-[#f3eef8] text-[#6d4c82] border border-[#ddd1ea] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#6d4c82] block">
              Cuidado com a sua privacidade
            </span>
            <h3
              id="location-privacy-title"
              className="text-lg sm:text-xl font-semibold text-[#261d2e] font-heading leading-snug mt-0.5"
            >
              Como você quer proteger seu endereço?
            </h3>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-[#493d54] leading-relaxed">
          <p>{contextSubtitle}</p>

          <div className="p-4 bg-[#f3eef8] border border-[#ddd1ea] rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-[#261d2e]">
              <Lock className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
              <span>Como funciona o ponto aproximado?</span>
            </div>
            <p className="text-xs text-[#493d54] leading-relaxed">
              Movemos o ponto em cerca de <strong>200 m a 500 m</strong> para proteger você. Assim mostramos apenas a região aproximada, sem revelar seu endereço exato.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={onConfirmOffset}
            className="w-full min-h-[46px] py-3 px-4 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Mostrar um ponto aproximado (recomendado)</span>
          </button>

          <button
            type="button"
            onClick={onConfirmExact}
            className="w-full min-h-[44px] py-2.5 px-4 bg-[#faf8fb] hover:bg-[#f3eef8] text-[#261d2e] font-medium text-xs sm:text-sm rounded-xl border border-[#e6dfee] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
            <span>Mostrar o ponto exato</span>
          </button>

          {showNoLocationOption && onConfirmNoLocation && (
            <button
              type="button"
              onClick={onConfirmNoLocation}
              className="w-full min-h-[44px] py-2.5 px-4 bg-[#fbf2f4] hover:bg-[#f4dfe5] text-[#7f3347] font-semibold text-xs sm:text-sm rounded-xl border border-[#e7cbd3] flex items-center justify-center gap-2 transition-colors cursor-pointer text-center leading-snug"
            >
              <MapPinOff className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Não informar localização, quero apenas deixar meu relato</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="w-full min-h-[40px] py-2 text-xs font-medium text-[#5a4e66] hover:text-[#261d2e] transition-colors cursor-pointer"
          >
            Escolher depois
          </button>
        </div>
      </div>
    </div>
  );
};
