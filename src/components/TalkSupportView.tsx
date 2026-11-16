import React, { useState } from 'react';
import { ArrowLeft, PhoneCall, MessageSquare, Building2, HeartHandshake } from 'lucide-react';
import { SupportCenter } from '../types';
import { SupportInstitutions } from './SupportInstitutions';
import { SupportNetwork } from './SupportNetwork';

interface TalkSupportViewProps {
  supportCenters: SupportCenter[];
  onBackHome: () => void;
}

export const TalkSupportView: React.FC<TalkSupportViewProps> = ({
  supportCenters,
  onBackHome
}) => {
  const [subTab, setSubTab] = useState<'institutions' | 'directory'>('institutions');

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
            Quero conversar e buscar acolhimento
          </h1>
          <p className="text-base text-[#5a4e66] max-w-2xl">
            Você pode conversar com profissionais e redes gratuitas de apoio em Santa Catarina sem precisar fazer denúncia policial antes, se não quiser.
          </p>
        </div>
      </div>

      {/* Immediate Listening Channels */}
      <section aria-label="Canais de escuta gratuita" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="tel:180"
          className="p-5 rounded-2xl bg-[#f3eef8] hover:bg-[#eae1f3] border border-[#ddd1ea] space-y-2 transition-colors"
        >
          <div className="flex items-center justify-between text-[#4f3461]">
            <span className="text-lg font-bold tabular-nums">Ligue 180</span>
            <PhoneCall className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-[#261d2e]">Central de Atendimento à Mulher</p>
          <p className="text-xs text-[#5a4e66]">Escuta acolhedora, orientação e encaminhamento 24h.</p>
        </a>

        <a
          href="https://wa.me/556196100180?text=Ol%C3%A1%2C%20gostaria%20de%20conversar%20e%20receber%20acolhimento."
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl bg-[#f1f6f3] hover:bg-[#e4efe8] border border-[#cde0d4] space-y-2 transition-colors"
        >
          <div className="flex items-center justify-between text-[#26543b]">
            <span className="text-lg font-bold">WhatsApp 180</span>
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-[#261d2e]">Conversa por mensagem</p>
          <p className="text-xs text-[#4b6355]">Atendimento oficial por texto para quando você precisar de discrição.</p>
        </a>

        <a
          href="tel:188"
          className="p-5 rounded-2xl bg-white hover:bg-[#faf8fb] border border-[#e6dfee] space-y-2 transition-colors"
        >
          <div className="flex items-center justify-between text-[#6d4c82]">
            <span className="text-lg font-bold tabular-nums">Ligue 188</span>
            <PhoneCall className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-[#261d2e]">CVV · Apoio Emocional</p>
          <p className="text-xs text-[#5a4e66]">Escuta gratuita e sigilosa 24h para momentos de angústia.</p>
        </a>
      </section>

      {/* Segmented Switch: Rede de Apoio Institucional vs Endereços de Atendimento */}
      <div className="flex flex-wrap gap-2 bg-[#f3eef8] p-1.5 rounded-xl border border-[#e6dfee] w-fit">
        <button
          type="button"
          onClick={() => setSubTab('institutions')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer ${
            subTab === 'institutions'
              ? 'bg-white text-[#261d2e] shadow-xs font-semibold'
              : 'text-[#5a4e66] hover:text-[#261d2e]'
          }`}
        >
          <HeartHandshake className="w-4 h-4" aria-hidden="true" />
          <span>Programas de acolhimento em SC</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('directory')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer ${
            subTab === 'directory'
              ? 'bg-white text-[#261d2e] shadow-xs font-semibold'
              : 'text-[#5a4e66] hover:text-[#261d2e]'
          }`}
        >
          <Building2 className="w-4 h-4" aria-hidden="true" />
          <span>Endereços de delegacias e hospitais</span>
        </button>
      </div>

      {subTab === 'institutions' ? (
        <SupportInstitutions />
      ) : (
        <SupportNetwork supportCenters={supportCenters} />
      )}
    </div>
  );
};
