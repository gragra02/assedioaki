import React, { useState } from 'react';
import {
  ArrowLeft,
  Scale,
  FileText,
  FilePlus2,
  FileSearch,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { RIGHTS_GUIDE } from '../lib/guidanceContent';
import { Report } from '../types';
import { AuthoritiesForwarding } from './AuthoritiesForwarding';
import { CaseTracker } from './CaseTracker';

interface RightsViewProps {
  reports: Report[];
  selectedTrackId: string;
  onOpenReportForm: () => void;
  onAddTimelineNote: (reportId: string, note: string) => void;
  onBackHome: () => void;
  initialSubTab?: 'rights' | 'bo' | 'track';
}

export const RightsView: React.FC<RightsViewProps> = ({
  reports,
  selectedTrackId,
  onOpenReportForm,
  onAddTimelineNote,
  onBackHome,
  initialSubTab = 'rights'
}) => {
  const [subTab, setSubTab] = useState<'rights' | 'bo' | 'track'>(initialSubTab);

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
            Seus direitos e caminhos de proteção
          </h1>
          <p className="text-base text-[#5a4e66] max-w-2xl">
            Você tem direito à proteção, ao respeito e ao atendimento gratuito. Escolha no seu ritmo como deseja seguir.
          </p>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2 bg-[#f3eef8] p-1.5 rounded-xl border border-[#e6dfee] w-fit">
        <button
          type="button"
          onClick={() => setSubTab('rights')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer ${
            subTab === 'rights'
              ? 'bg-white text-[#261d2e] shadow-xs font-semibold'
              : 'text-[#5a4e66] hover:text-[#261d2e]'
          }`}
        >
          <Scale className="w-4 h-4" aria-hidden="true" />
          <span>Seus direitos</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('bo')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer ${
            subTab === 'bo'
              ? 'bg-white text-[#261d2e] shadow-xs font-semibold'
              : 'text-[#5a4e66] hover:text-[#261d2e]'
          }`}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span>Organizar texto para a delegacia</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('track')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer ${
            subTab === 'track'
              ? 'bg-white text-[#261d2e] shadow-xs font-semibold'
              : 'text-[#5a4e66] hover:text-[#261d2e]'
          }`}
        >
          <FileSearch className="w-4 h-4" aria-hidden="true" />
          <span>Acompanhar meu relato</span>
        </button>
      </div>

      {subTab === 'rights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {RIGHTS_GUIDE.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-[#e6dfee] rounded-2xl p-6 space-y-3"
              >
                <h2 className="text-lg font-semibold text-[#261d2e] font-heading">
                  {item.title}
                </h2>
                <p className="text-sm text-[#5a4e66] leading-relaxed">
                  {item.summary}
                </p>
                <ul className="space-y-2 pt-1 text-sm text-[#493d54]">
                  {item.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#6d4c82] shrink-0 mt-1" aria-hidden="true" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* Action Choices: Official Delegacia Virtual vs Safe App Record */}
          <div className="bg-[#f3eef8]/70 border border-[#e6dfee] rounded-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#261d2e] font-heading">
                Quando você se sentir pronta
              </h2>
              <p className="text-sm text-[#5a4e66]">
                Contar o que aconteceu aqui no app ajuda você a guardar informações em segurança, e na Delegacia Virtual de SC você faz o registro oficial com a Polícia Civil.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://delegaciavirtual.sc.gov.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6d4c82] hover:bg-[#593c6b] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <span>Ir para a Delegacia Virtual de SC</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={onOpenReportForm}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white hover:bg-[#faf8fb] border border-[#ddd1ea] text-[#4f3461] text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FilePlus2 className="w-4 h-4" aria-hidden="true" />
                <span>Contar o que aconteceu aqui no app</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'bo' && <AuthoritiesForwarding reports={reports} />}

      {subTab === 'track' && (
        <CaseTracker
          reports={reports}
          initialProtocolId={selectedTrackId}
          onAddTimelineNote={onAddTimelineNote}
        />
      )}
    </div>
  );
};
