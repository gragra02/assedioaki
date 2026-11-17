import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  X,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  MapPin,
  EyeOff,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { OFFICIAL_EMERGENCY_CHANNELS } from '../lib/guidanceContent';

interface FloatingHelpButtonProps {
  onGoToHelp: () => void;
  onGoToLocator: () => void;
  onQuickExit: () => void;
  isHidden?: boolean;
}

export const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({
  onGoToHelp,
  onGoToLocator,
  onQuickExit,
  isHidden = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (isHidden) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Preciso de ajuda — abrir acesso rápido de apoio e emergência"
        className="fixed bottom-[66px] lg:bottom-6 right-3 sm:right-6 z-40 min-h-[44px] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#b05c72] hover:bg-[#914358] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#261d2e]/15 border border-white/90 inline-flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer"
      >
        <LifeBuoy className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Preciso de ajuda</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-help-drawer-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#261d2e]/45 backdrop-blur-xs"
        >
          <div className="bg-white border border-[#e6dfee] rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#efe9f4] pb-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#8c3d52]">
                  Acesso rápido de acolhimento
                </p>
                <h2
                  id="quick-help-drawer-title"
                  className="text-xl font-semibold text-[#261d2e] font-heading"
                >
                  Preciso de ajuda agora
                </h2>
                <p className="text-xs sm:text-sm text-[#5a4e66]">
                  Se estiver em risco neste momento, priorize sair para um lugar seguro e acione um canal oficial.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar janela de ajuda rápida"
                className="min-w-[44px] min-h-[44px] rounded-xl text-[#5a4e66] hover:text-[#261d2e] hover:bg-[#f3eef8] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Emergency & Official Support Channels */}
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#4f3461]">
                Canais públicos oficiais (gratuitos)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {OFFICIAL_EMERGENCY_CHANNELS.slice(0, 4).map((channel) => (
                  <a
                    key={channel.id}
                    href={channel.href}
                    target={channel.external ? '_blank' : undefined}
                    rel={channel.external ? 'noopener noreferrer' : undefined}
                    className={`min-h-[56px] p-3.5 rounded-xl border flex flex-col justify-between gap-1 transition-colors ${
                      channel.id === 'pm-190'
                        ? 'bg-[#fbf2f4] hover:bg-[#f6e4e9] border-[#e7cbd3] text-[#7f3347]'
                        : 'bg-[#faf8fb] hover:bg-[#f3eef8] border-[#e6dfee] text-[#261d2e]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-bold tabular-nums">
                        {channel.numberOrLabel}
                      </span>
                      {channel.external ? (
                        <ExternalLink className="w-4 h-4 opacity-75 shrink-0" aria-hidden="true" />
                      ) : (
                        <PhoneCall className="w-4 h-4 opacity-75 shrink-0" aria-hidden="true" />
                      )}
                    </div>
                    <span className="text-xs font-medium opacity-90">{channel.title}</span>
                  </a>
                ))}
              </div>
              <a
                href={OFFICIAL_EMERGENCY_CHANNELS[4].href}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] p-3 rounded-xl bg-[#f1f6f3] hover:bg-[#e5efe8] border border-[#cde0d4] text-[#26543b] flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>WhatsApp Polícia Civil SC: (48) 98844-0083</span>
                </span>
                <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>
            </div>

            {/* Immediate Calm Steps */}
            <div className="bg-[#f3eef8] border border-[#ddd1ea] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#4f3461]">
                <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Passos imediatos de proteção</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#493d54] list-disc pl-4 leading-relaxed">
                <li>Procure um local iluminado e com outras pessoas (comércio, recepção, segurança).</li>
                <li>Se não puder falar ao telefone, envie mensagem silenciosa para o WhatsApp 180.</li>
                <li>Se sentir segurança depois, guarde prints, horários e nomes de testemunhas.</li>
              </ul>
            </div>

            {/* App Navigation Shortcuts */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onGoToHelp();
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#6d4c82] hover:bg-[#593c6b] text-white text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Abrir página completa “Preciso de ajuda”</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onGoToLocator();
                  }}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#4f3461] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Delegacia / Hospital próximo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onQuickExit();
                  }}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fbf2f4] hover:bg-[#f5e3e8] border border-[#e7cbd3] text-[#7f3347] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <EyeOff className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Sair rápido (disfarçar tela)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
