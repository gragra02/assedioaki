import React, { useState } from 'react';
import { ArrowLeft, Search, CheckCircle2, MapPin, MessageCircleHeart } from 'lucide-react';
import { HARASSMENT_GUIDE, filterHarassmentGuide } from '../lib/guidanceContent';
import { HarassmentType, Report, SupportCenter, ReportComment, User } from '../types';
import { HeatmapView } from './HeatmapView';

interface UnderstandViewProps {
  reports: Report[];
  supportCenters: SupportCenter[];
  currentUser: User | null;
  onAddComment: (reportId: string, comment: ReportComment) => void;
  onNewReportAtLocation: (lat: number, lng: number, address: string) => void;
  onSelectReportForTrack: (reportId: string) => void;
  onGoToTalk: () => void;
  onBackHome: () => void;
}

export const UnderstandView: React.FC<UnderstandViewProps> = ({
  reports,
  supportCenters,
  currentUser,
  onAddComment,
  onNewReportAtLocation,
  onSelectReportForTrack,
  onGoToTalk,
  onBackHome
}) => {
  const [selectedId, setSelectedId] = useState<HarassmentType>('importunacao_sexual');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(false);

  const filteredItems = filterHarassmentGuide(searchQuery);
  const activeItem =
    filteredItems.find((item) => item.id === selectedId) ||
    filteredItems[0] ||
    HARASSMENT_GUIDE[0];

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
            Quero entender o que estou vivendo
          </h1>
          <p className="text-base text-[#5a4e66] max-w-2xl">
            Nem sempre é fácil dar nome ao que aconteceu. Se uma atitude deixou você constrangida, assustada ou sem liberdade, seus sentimentos são válidos.
          </p>
        </div>
      </div>

      {/* Gentle Filter Search */}
      <div className="max-w-md">
        <label htmlFor="understand-search" className="block text-sm font-medium text-[#261d2e] mb-1.5">
          Buscar por situação ou palavra-chave
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#7c6f88] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            id="understand-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ex: ônibus, trabalho, chefe, mensagens, fotos..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white border border-[#e6dfee] rounded-xl text-sm text-[#261d2e] placeholder:text-[#8c7e99]"
          />
        </div>
      </div>

      {/* Category Selector Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-[#e6dfee] rounded-2xl p-6 text-center space-y-2">
          <p className="text-sm font-medium text-[#261d2e]">
            Nenhum resultado encontrado para "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="min-h-[44px] px-4 py-2 text-sm font-semibold text-[#6d4c82] hover:bg-[#f3eef8] rounded-xl cursor-pointer"
          >
            Mostrar todos os tipos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Category Tabs */}
          <div className="lg:col-span-4 space-y-2" role="tablist" aria-label="Tipos de assédio">
            {filteredItems.map((item) => {
              const isSelected = activeItem.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full min-h-[48px] px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#6d4c82] border-[#6d4c82] text-white font-semibold'
                      : 'bg-white hover:bg-[#f3eef8] border-[#e6dfee] text-[#261d2e] font-medium'
                  }`}
                >
                  <span className="text-sm block">{item.title}</span>
                </button>
              );
            })}
          </div>

          {/* Right Detail Card */}
          <div
            role="tabpanel"
            className="lg:col-span-8 bg-white border border-[#e6dfee] rounded-2xl p-6 sm:p-7 space-y-6"
          >
            <div className="space-y-2 border-b border-[#efe9f4] pb-5">
              <p className="text-xs font-medium text-[#6d4c82]">{activeItem.legalBasis}</p>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#261d2e] font-heading">
                {activeItem.title}
              </h2>
              <p className="text-base text-[#493d54] leading-relaxed">
                {activeItem.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#faf8fb] rounded-xl p-4 sm:p-5 border border-[#efe9f4] space-y-3">
                <h3 className="text-sm font-semibold text-[#261d2e]">
                  Exemplos comuns
                </h3>
                <ul className="space-y-2.5 text-sm text-[#5a4e66] leading-relaxed list-disc pl-5">
                  {activeItem.examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#f3eef8]/70 rounded-xl p-4 sm:p-5 border border-[#e6dfee] space-y-3">
                <h3 className="text-sm font-semibold text-[#261d2e]">
                  O que você pode fazer
                </h3>
                <ul className="space-y-2.5 text-sm text-[#493d54] leading-relaxed">
                  {activeItem.whatToDo.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#6d4c82] shrink-0 mt-1" aria-hidden="true" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-[#efe9f4] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onGoToTalk}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6d4c82] hover:bg-[#593c6b] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircleHeart className="w-4 h-4" aria-hidden="true" />
                <span>Ver canais de acolhimento</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHeatmap((prev) => !prev)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#ddd1ea] text-[#4f3461] text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>{showHeatmap ? 'Ocultar mapa de relatos' : 'Ver mapa de relatos em SC'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional Interactive Heatmap */}
      {showHeatmap && (
        <section aria-label="Mapa de relatos em Santa Catarina" className="pt-2">
          <HeatmapView
            reports={reports}
            supportCenters={supportCenters}
            mode="heatmap"
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
