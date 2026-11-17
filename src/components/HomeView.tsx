import React from 'react';
import {
  LifeBuoy,
  BookOpen,
  MessageCircleHeart,
  Scale,
  ArrowRight,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  FileSearch,
  HeartHandshake
} from 'lucide-react';
import { HOME_CARDS, PRIVACY_TRUTHS } from '../lib/guidanceContent';
import { Report } from '../types';
import { HeatmapPreviewCard } from './HeatmapPreviewCard';

export type AppSection =
  | 'home'
  | 'map'
  | 'community'
  | 'help'
  | 'understand'
  | 'talk'
  | 'rights'
  | 'track';

interface HomeViewProps {
  reports: Report[];
  totalSupportCenters: number;
  communityPostsCount: number;
  onNavigate: (section: AppSection) => void;
  onOpenNewReport: () => void;
  onOpenPrivacy: () => void;
  onOpenSafeSpaceDeclaration?: () => void;
}

const CARD_ICONS = {
  help: LifeBuoy,
  understand: BookOpen,
  talk: MessageCircleHeart,
  rights: Scale
};

export const HomeView: React.FC<HomeViewProps> = ({
  reports,
  totalSupportCenters,
  communityPostsCount,
  onNavigate,
  onOpenNewReport,
  onOpenPrivacy,
  onOpenSafeSpaceDeclaration
}) => {
  return (
    <div className="space-y-9 sm:space-y-11 py-2 sm:py-4">
      {/* 1. Serene Welcome Hero */}
      <section className="max-w-3xl mx-auto text-center space-y-4 px-2">
        <p className="text-xs sm:text-sm font-medium text-[#6d4c82] tracking-wide">
          Acolhimento, orientação e apoio em Santa Catarina
        </p>
        <h1 className="text-3xl sm:text-5xl font-semibold text-[#261d2e] font-heading tracking-tight leading-tight">
          Você não está sozinha.
        </h1>
        <p className="text-base sm:text-lg text-[#5a4e66] max-w-xl mx-auto leading-relaxed">
          Estamos aqui para ajudar você a encontrar orientação e apoio.
        </p>
        <p className="text-sm text-[#6b5e77]">
          Não é necessário fazer cadastro para explorar o mapa, ler orientações ou acessar os canais de ajuda.
        </p>
      </section>

      {/* 2. Protagonist Highlight: MAPA DE CALOR */}
      <HeatmapPreviewCard
        reports={reports}
        totalSupportCenters={totalSupportCenters}
        onExploreHeatmap={() => onNavigate('map')}
        onNewReport={onOpenNewReport}
      />

      {/* 3. Community & Peer Support Highlight Card */}
      <section aria-labelledby="home-community-heading" className="max-w-5xl mx-auto">
        <div className="bg-[#f3eef8] border border-[#ddd1ea] rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#4f3461]">
              <HeartHandshake className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Espaço de escuta mútua e acolhimento</span>
              {communityPostsCount > 0 && (
                <span className="px-2 py-0.5 rounded-lg bg-white border border-[#ddd1ea] text-[#4f3461] tabular-nums">
                  {communityPostsCount} {communityPostsCount === 1 ? 'publicação' : 'publicações'}
                </span>
              )}
            </div>
            <h2
              id="home-community-heading"
              className="text-xl sm:text-2xl font-semibold text-[#261d2e] font-heading tracking-tight"
            >
              COMUNIDADE — VOZES QUE SE APOIAM
            </h2>
            <p className="text-sm sm:text-[15px] text-[#493d54] leading-relaxed">
              Compartilhe experiências sem revelar sua identidade, leia relatos de outras mulheres e envie mensagens de apoio com proteção contra exposição de dados pessoais.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('community')}
            className="min-h-[48px] px-5 py-3 rounded-xl bg-white hover:bg-[#faf8fb] border border-[#cfc0df] text-[#4f3461] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <span>Acessar Comunidade</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* 4. Preserved 4 Primary Intuitive Cards */}
      <section aria-label="Principais caminhos de apoio" className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {HOME_CARDS.map((card, index) => {
            const Icon = CARD_ICONS[card.id];
            const isPrimaryHelp = card.id === 'help';

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigate(card.id)}
                className={`group text-left rounded-2xl p-6 sm:p-7 border transition-colors duration-200 flex flex-col justify-between gap-5 min-h-[180px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#6d4c82] ${
                  isPrimaryHelp
                    ? 'bg-[#f8f2f6] hover:bg-[#f4eaf1] border-[#e4cfd9]'
                    : 'bg-white hover:bg-[#f7f4fa] border-[#e6dfee]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isPrimaryHelp
                          ? 'bg-[#b05c72]/15 text-[#914358]'
                          : 'bg-[#6d4c82]/10 text-[#6d4c82]'
                      }`}
                    >
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium text-[#7c6f88] tabular-nums">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#261d2e] font-heading tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-sm sm:text-[15px] text-[#5a4e66] leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-2 text-sm font-semibold ${
                    isPrimaryHelp ? 'text-[#8c3d52]' : 'text-[#5b3d6e]'
                  }`}
                >
                  <span>{card.actionLabel}</span>
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5 & 6. Official Public Channels + Privacy & Security Reassurance */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Official Emergency Services */}
        <div className="lg:col-span-7 bg-white border border-[#e6dfee] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#8c3d52] tracking-wide">
              Serviços públicos oficiais · Gratuitos e 24h
            </p>
            <h3 className="text-lg font-semibold text-[#261d2e] font-heading">
              Atendimento imediato por telefone ou mensagem
            </h3>
            <p className="text-sm text-[#5a4e66]">
              Estes são canais oficiais externos ao aplicativo para emergências e denúncias.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href="tel:190"
              className="min-h-[52px] px-4 py-3 rounded-xl bg-[#fbf2f4] hover:bg-[#f7e6ea] border border-[#e7cbd3] text-[#7f3347] flex flex-col justify-center transition-colors"
            >
              <span className="text-base font-bold tabular-nums flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Ligar 190</span>
              </span>
              <span className="text-xs text-[#694853]">Perigo imediato (Polícia Militar)</span>
            </a>

            <a
              href="tel:180"
              className="min-h-[52px] px-4 py-3 rounded-xl bg-[#f3eef8] hover:bg-[#ebe3f4] border border-[#ddd1ea] text-[#4f3461] flex flex-col justify-center transition-colors"
            >
              <span className="text-base font-bold tabular-nums flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Ligar 180</span>
              </span>
              <span className="text-xs text-[#5d4b6b]">Central da Mulher 24h</span>
            </a>

            <a
              href="https://wa.me/556196100180?text=Ol%C3%A1%2C%20preciso%20de%20orienta%C3%A7%C3%A3o%20e%20apoio."
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[52px] px-4 py-3 rounded-xl bg-[#f1f6f3] hover:bg-[#e4efe8] border border-[#cde0d4] text-[#26543b] flex flex-col justify-center transition-colors"
            >
              <span className="text-base font-bold flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>WhatsApp 180</span>
              </span>
              <span className="text-xs text-[#3b614b]">Conversar por texto</span>
            </a>

            <a
              href="tel:181"
              className="min-h-[52px] px-4 py-3 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#4f3461] flex flex-col justify-center transition-colors"
            >
              <span className="text-base font-bold tabular-nums flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Disque 181 (SC)</span>
              </span>
              <span className="text-xs text-[#5d4b6b]">Denúncia anônima Polícia Civil</span>
            </a>
          </div>
        </div>

        {/* Privacy, Quick Exit & Secondary Tools */}
        <div className="lg:col-span-5 bg-[#f3eef8]/70 border border-[#e6dfee] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#4f3461]">
              <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
              <h3 className="text-base font-semibold font-heading">
                Sua segurança ao navegar
              </h3>
            </div>
            <p className="text-sm text-[#5a4e66] leading-relaxed">
              {PRIVACY_TRUTHS[1].text}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-[#faf8fb] border border-[#ddd1ea] text-xs sm:text-sm font-medium text-[#4f3461] transition-colors cursor-pointer"
            >
              Privacidade e limites do app
            </button>
            <button
              type="button"
              onClick={() => onNavigate('track')}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-[#faf8fb] border border-[#ddd1ea] text-xs sm:text-sm font-medium text-[#4f3461] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSearch className="w-4 h-4" aria-hidden="true" />
              <span>Acompanhar protocolo</span>
            </button>
            {onOpenSafeSpaceDeclaration && (
              <button
                type="button"
                onClick={onOpenSafeSpaceDeclaration}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-[#faf8fb] border border-[#ddd1ea] text-xs sm:text-sm font-medium text-[#4f3461] transition-colors cursor-pointer"
              >
                Compromisso de espaço seguro
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
