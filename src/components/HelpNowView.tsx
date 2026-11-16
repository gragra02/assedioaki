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
          <p className="text-xs font-semibold text-[#8c3d52]">Orientação informativa</p>
          <h2 className="text-lg font-semibold text-[#261d2e] font-heading">
            Se a situação está acontecendo agora
          </h2>
          <ul className="space-y-2.5 text-sm text-[#4a3b47] leading-relaxed list-disc pl-5">
            <li>Priorize a sua segurança física: afaste-se da pessoa e vá para um lugar iluminado ou movimentado.</li>
            <li>Peça ajuda a quem estiver próximo — motorista, cobrador, segurança, atendente ou outra mulher.</li>
            <li>Se estiver em risco imediato, ligue para a Polícia Militar (<strong className="tabular-nums">190</strong>).</li>
            <li>Se não puder falar ao telefone, envie mensagem para o WhatsApp oficial <strong className="tabular-nums">180</strong>.</li>
          </ul>
        </div>

        <div className="bg-white border border-[#e6dfee] rounded-2xl p-6 space-y-3">
          <p className="text-xs font-semibold text-[#6d4c82]">Orientação informativa</p>
          <h2 className="text-lg font-semibold text-[#261d2e] font-heading">
            Se o assédio já aconteceu
          </h2>
          <ul className="space-y-2.5 text-sm text-[#5a4e66] leading-relaxed list-disc pl-5">
            <li>A responsabilidade pelo assédio é sempre de quem o praticou — nunca sua.</li>
            <li>Se sentir segurança, salve capturas de tela, mensagens, datas, horários e nomes de testemunhas.</li>
            <li>Em caso de violência sexual recente (até 72h), procure um hospital de referência para acolhimento médico sigiloso, mesmo sem Boletim de Ocorrência.</li>
            <li>Você decide se e quando quer fazer um registro policial ou conversar com um serviço de apoio.</li>
          </ul>
        </div>
      </section>

      {/* Official Emergency Services (Explicitly distinguished from app guidance) */}
      <section aria-label="Serviços oficiais de atendimento" className="bg-white border border-[#e6dfee] rounded-2xl p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#6d4c82]">
            Serviços oficiais de atendimento (externos ao aplicativo)
          </p>
          <h2 className="text-xl font-semibold text-[#261d2e] font-heading">
            Canais públicos de emergência e acolhimento
          </h2>
          <p className="text-sm text-[#5a4e66]">
            Os contatos abaixo ligam ou abrem conversa diretamente com órgãos públicos oficiais.
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
              {showLocatorMap ? 'Ocultar localizador de unidades' : 'Encontrar delegacia ou hospital próximo'}
            </span>
            <span className="text-sm text-[#5a4e66] block">
              Veja no mapa a Delegacia da Mulher (DPCAMI) ou Hospital 24h mais perto de você em Santa Catarina.
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
              Registrar relato neste aplicativo
            </span>
            <span className="text-sm text-[#5a4e66] block">
              Guarde informações com proteção por PIN e ajude a mapear áreas de risco (não substitui B.O. policial).
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
