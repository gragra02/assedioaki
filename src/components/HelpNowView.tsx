import React, { useState } from 'react';
import {
  ArrowLeft,
  PhoneCall,
  MessageSquare,
  MapPin,
  ShieldCheck,
  FilePlus2,
  ExternalLink,
  HeartHandshake
} from 'lucide-react';
import { OFFICIAL_EMERGENCY_CHANNELS } from '../lib/guidanceContent';
import { Report, SupportCenter, ReportComment, User } from '../types';
import { HeatmapView } from './HeatmapView';

interface HelpNowViewProps {
  reports: Report[];
  supportCenters: SupportCenter[];
  currentUser: User | null;
  onAddComment: (reportId: string, comment: ReportComment) => void;
  onNewReportAtLocation: (lat: number, lng: number, address: string) => void;
  onSelectReportForTrack: (reportId: string) => void;
  onOpenReportForm: () => void;
  onBackHome: () => void;
}

export const HelpNowView: React.FC<HelpNowViewProps> = ({
  reports,
  supportCenters,
  currentUser,
  onAddComment,
  onNewReportAtLocation,
  onSelectReportForTrack,
  onOpenReportForm,
  onBackHome
}) => {
  const [showLocatorMap, setShowLocatorMap] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Back + Header */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 -ml-3 rounded-xl text-sm font-medium text-[#5b3d6e] hover:bg-[#f3eef8] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Voltar para o início</span>
        </button>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#261d2e] font-heading">
            Preciso de ajuda
          </h1>
          <p className="text-base text-[#5a4e66] max-w-2xl">
            Respire com calma. Escolha abaixo o que faz mais sentido para o momento em que você está agora.
          </p>
        </div>
      </div>

      {/* Informative Guidance: Now vs. After */}
      <section aria-label="Orientações práticas" className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#fbf2f4] border border-[#ead4dc] rounded-2xl p-6 space-y-3">
          <p className="text-xs font-semibold text-[#8c3d52]">Para este momento</p>
          <h2 className="text-lg font-semibold text-[#261d2e] font-heading">
            Se está acontecendo agora
          </h2>
          <ul className="space-y-2.5 text-sm text-[#4a3b47] leading-relaxed list-disc pl-5">
            <li>Cuide primeiro de você: afaste-se e procure um lugar iluminado ou com mais pessoas por perto.</li>
            <li>Peça ajuda a quem estiver próximo — motorista, segurança, atendente ou outra mulher.</li>
            <li>Se houver perigo imediato, ligue para a Polícia Militar (<strong className="tabular-nums">190</strong>).</li>
            <li>Se não puder falar em voz alta, mande mensagem para o WhatsApp <strong className="tabular-nums">180</strong>.</li>
          </ul>
        </div>

        <div className="bg-white border border-[#e6dfee] rounded-2xl p-6 space-y-3">
          <p className="text-xs font-semibold text-[#6d4c82]">No seu tempo</p>
          <h2 className="text-lg font-semibold text-[#261d2e] font-heading">
            Se já aconteceu
          </h2>
          <ul className="space-y-2.5 text-sm text-[#5a4e66] leading-relaxed list-disc pl-5">
            <li>Nada do que aconteceu é culpa sua — a responsabilidade é sempre de quem agrediu ou assediou.</li>
            <li>Se for seguro, guarde prints, mensagens, horários e quem estava por perto.</li>
            <li>Se houve violência sexual recente (até 72h), você pode ir direto a um hospital 24h para receber cuidado gratuito e em sigilo, sem precisar passar antes na delegacia.</li>
            <li>Você escolhe, sem pressa, se e quando quer conversar com um serviço de apoio ou procurar a polícia.</li>
          </ul>
        </div>
      </section>

      {/* Official Emergency Services */}
      <section aria-label="Serviços oficiais de atendimento" className="bg-white border border-[#e6dfee] rounded-2xl p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#6d4c82]">
            Atendimento público e gratuito · 24h
          </p>
          <h2 className="text-xl font-semibold text-[#261d2e] font-heading">
            Com quem você pode falar agora
          </h2>
          <p className="text-sm text-[#5a4e66]">
            Toque em uma opção abaixo para ligar ou conversar por mensagem com canais oficiais.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {OFFICIAL_EMERGENCY_CHANNELS.map((channel) => (
            <a
              key={channel.id}
              href={channel.href}
              target={channel.external ? '_blank' : undefined}
              rel={channel.external ? 'noopener noreferrer' : undefined}
              className="p-4 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] flex flex-col justify-between gap-3 transition-colors min-h-[120px]"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-[#4f3461] tabular-nums">
                    {channel.numberOrLabel}
                  </span>
                  {channel.external ? (
                    <ExternalLink className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                  ) : (
                    <PhoneCall className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-[#261d2e]">{channel.title}</h3>
                <p className="text-xs text-[#5a4e66] leading-relaxed">{channel.description}</p>
              </div>
              <p className="text-xs font-medium text-[#6d4c82]">
                {channel.whenToUse} · {channel.availability}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Next Actions: Locate Nearest Unit or Register Safe Note */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setShowLocatorMap((prev) => !prev)}
          className="p-5 rounded-2xl bg-[#f3eef8] hover:bg-[#eae1f3] border border-[#ddd1ea] text-left flex items-start gap-4 transition-colors cursor-pointer min-h-[88px]"
        >
          <div className="w-11 h-11 rounded-xl bg-white text-[#6d4c82] flex items-center justify-center shrink-0 border border-[#e6dfee]">
            <MapPin className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <span className="text-base font-semibold text-[#261d2e] block">
              {showLocatorMap ? 'Fechar mapa de lugares próximos' : 'Encontrar delegacia da mulher ou hospital perto de mim'}
            </span>
            <span className="text-sm text-[#5a4e66] block">
              Veja no mapa a DPCAMI / DEAM (delegacias que atendem mulheres) ou o hospital 24h mais próximo em SC.
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenReportForm}
          className="p-5 rounded-2xl bg-white hover:bg-[#faf8fb] border border-[#e6dfee] text-left flex items-start gap-4 transition-colors cursor-pointer min-h-[88px]"
        >
          <div className="w-11 h-11 rounded-xl bg-[#fbf2f4] text-[#914358] flex items-center justify-center shrink-0 border border-[#ead4dc]">
            <FilePlus2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <span className="text-base font-semibold text-[#261d2e] block">
              Contar o que aconteceu aqui no app
            </span>
            <span className="text-sm text-[#5a4e66] block">
              Você pode usar sem se identificar, guardar tudo com senha (PIN) e ajudar outras mulheres pelo mapa.
            </span>
          </div>
        </button>
      </section>

      {/* Expandable Nearest Support Locator Map */}
      {showLocatorMap && (
        <section aria-label="Localizador de delegacias e hospitais em Santa Catarina" className="pt-2">
          <HeatmapView
            reports={reports}
            supportCenters={supportCenters}
            mode="locator"
            currentUser={currentUser}
            onAddComment={onAddComment}
            onNewReportAtLocation={onNewReportAtLocation}
            onSelectReportForTrack={onSelectReportForTrack}
          />
        </section>
      )}
    </div>
  );
};
