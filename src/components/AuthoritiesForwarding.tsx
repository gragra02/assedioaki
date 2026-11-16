import React, { useState } from 'react';
import { STATE_AUTHORITIES } from '../lib/initialData';
import { Report } from '../types';
import {
  Shield,
  PhoneCall,
  ExternalLink,
  Copy,
  Check,
  MessageSquare,
  AlertTriangle,
  Building
} from 'lucide-react';

interface AuthoritiesForwardingProps {
  reports: Report[];
}

export const AuthoritiesForwarding: React.FC<AuthoritiesForwardingProps> = ({ reports }) => {
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const currentStateConfig = STATE_AUTHORITIES.find((s) => s.stateCode === 'SC') || STATE_AUTHORITIES[0];
  const activeReport = reports.find((r) => r.id === selectedReportId);

  const generatedBOText = activeReport
    ? `MINUTA PARA BOLETIM DE OCORRÊNCIA - SANTA CATARINA
------------------------------------------------------------
PROTOCOLO DE APOIO (APP): ${activeReport.id}
TIPO DE OCORRÊNCIA: ${activeReport.category.toUpperCase().replace('_', ' ')}
MODALIDADE: ${activeReport.isAnonymous ? 'DENÚNCIA ANÔNIMA' : 'IDENTIFICADA SOB SIGILO'}

DATA E HORA APROXIMADA: ${new Date(activeReport.dateTime).toLocaleString('pt-BR')}
LOCALIZAÇÃO: ${activeReport.address}, ${activeReport.city} - ${activeReport.state}
AMBIENTE: ${activeReport.locationType.toUpperCase()}

RELATO DOS FATOS:
${activeReport.description}

INFORMAÇÕES SOBRE O AUTOR: ${activeReport.aggressorDetails || 'Não informado'}
TESTEMUNHAS: ${activeReport.witnesses || 'Não informado'}
`
    : 'Selecione um protocolo salvo abaixo para organizar o texto antes de acessar a Delegacia Virtual de Santa Catarina.';

  const handleCopyBO = () => {
    navigator.clipboard.writeText(generatedBOText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Official Channels Banner */}
      <div className="bg-white border border-[#e6dfee] rounded-2xl p-5 sm:p-7 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#f3eef8] text-[#6d4c82] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#6d4c82]">
              Serviços oficiais da Segurança Pública em Santa Catarina
            </p>
            <h2 className="text-lg sm:text-xl font-semibold text-[#261d2e] font-heading">
              Canais oficiais e preparação de Boletim de Ocorrência
            </h2>
            <p className="text-sm text-[#5a4e66]">
              Este aplicativo não envia denúncias automaticamente à polícia. Use esta página para organizar seu relato e acessar os portais oficiais.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <a
            href="https://wa.me/556196100180?text=Ol%C3%A1%2C%20preciso%20fazer%20uma%20den%C3%BAncia%20e%20buscar%20orienta%C3%A7%C3%A3o."
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[64px] p-4 bg-[#f1f6f3] hover:bg-[#e4efe8] border border-[#cde0d4] rounded-xl flex items-center justify-between gap-3 transition-colors"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-[#26543b] block">WhatsApp oficial 180</span>
              <strong className="text-sm text-[#1e3d2b] font-semibold block">Central da Mulher</strong>
              <span className="text-xs text-[#3b614b]">Atendimento por mensagem</span>
            </div>
            <MessageSquare className="w-5 h-5 text-[#26543b] shrink-0" aria-hidden="true" />
          </a>

          <a
            href="tel:180"
            className="min-h-[64px] p-4 bg-[#f3eef8] hover:bg-[#eae1f3] border border-[#ddd1ea] rounded-xl flex items-center justify-between gap-3 transition-colors"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-[#4f3461] block">Ligação gratuita 24h</span>
              <strong className="text-sm text-[#261d2e] font-semibold block">Ligue 180</strong>
              <span className="text-xs text-[#5a4e66]">Orientação e denúncia</span>
            </div>
            <PhoneCall className="w-5 h-5 text-[#6d4c82] shrink-0" aria-hidden="true" />
          </a>

          <a
            href="tel:190"
            className="min-h-[64px] p-4 bg-[#fbf2f4] hover:bg-[#f6e4e9] border border-[#e7cbd3] rounded-xl flex items-center justify-between gap-3 transition-colors"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-[#7f3347] block">Emergência policial</span>
              <strong className="text-sm text-[#261d2e] font-semibold block">Ligue 190 (PM)</strong>
              <span className="text-xs text-[#694853]">Perigo ou agressão agora</span>
            </div>
            <AlertTriangle className="w-5 h-5 text-[#8c3d52] shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* State Directory & Virtual BO Text Helper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#e6dfee] rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-semibold text-[#261d2e] font-heading flex items-center gap-2">
            <Building className="w-4 h-4 text-[#6d4c82]" aria-hidden="true" />
            <span>Delegacia Virtual de SC</span>
          </h3>

          <div className="p-4 bg-[#faf8fb] border border-[#efe9f4] rounded-xl space-y-3 text-sm text-[#493d54]">
            <h4 className="font-semibold text-[#261d2e]">{currentStateConfig.stateName}</h4>
            <p className="text-xs sm:text-sm text-[#5a4e66] leading-relaxed">
              {currentStateConfig.deamInfo}
            </p>
            <p className="text-xs sm:text-sm">
              <strong className="text-[#261d2e]">Telefone:</strong> {currentStateConfig.deamPhone}
            </p>

            {currentStateConfig.whatsapp && (
              <p className="text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                <strong className="text-[#261d2e]">WhatsApp PCSC:</strong>
                <a
                  href={`https://wa.me/${currentStateConfig.whatsapp}?text=${encodeURIComponent('Olá, gostaria de orientação sobre denúncia.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#26543b] font-semibold underline"
                >
                  (48) 98844-0083
                </a>
              </p>
            )}

            <a
              href={currentStateConfig.delegaciaVirtualUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] px-4 py-2.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-center transition-colors text-xs sm:text-sm"
            >
              <span>Abrir Delegacia Virtual SC</span>
              <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-[#e6dfee] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#efe9f4] pb-3 space-y-1">
            <h3 className="text-base font-semibold text-[#261d2e] font-heading">
              Organizador de texto para Boletim de Ocorrência
            </h3>
            <p className="text-sm text-[#5a4e66]">
              Se você já salvou um relato neste aparelho, selecione-o abaixo para gerar um rascunho organizado e colar no site da Delegacia Virtual.
            </p>
          </div>

          <div>
            <label htmlFor="bo-report-select" className="block text-xs font-semibold text-[#261d2e] mb-1">
              Escolha um protocolo salvo
            </label>
            <select
              id="bo-report-select"
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
            >
              <option value="">-- Selecione um protocolo --</option>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.title} ({r.city})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label htmlFor="bo-generated-text" className="sr-only">
              Texto organizado para Boletim de Ocorrência
            </label>
            <textarea
              id="bo-generated-text"
              rows={9}
              readOnly
              value={generatedBOText}
              className="w-full p-4 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-xs sm:text-sm font-mono text-[#261d2e] leading-relaxed"
            />

            {activeReport && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCopyBO}
                  className="min-h-[44px] px-4 py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white text-sm font-semibold rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4" aria-hidden="true" />
                      <span>Texto copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span>Copiar texto</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
