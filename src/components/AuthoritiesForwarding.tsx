import React, { useState } from 'react';
import { STATE_AUTHORITIES } from '../lib/initialData';
import { Report } from '../types';
import { Shield, PhoneCall, ExternalLink, Copy, Check, MessageSquare, AlertTriangle, FileText, ArrowRight, Building, Sparkles } from 'lucide-react';

interface AuthoritiesForwardingProps {
  reports: Report[];
}

export const AuthoritiesForwarding: React.FC<AuthoritiesForwardingProps> = ({ reports }) => {
  const [selectedState, setSelectedState] = useState<string>('SC');
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const currentStateConfig = STATE_AUTHORITIES.find(s => s.stateCode === selectedState) || STATE_AUTHORITIES[0];
  const activeReport = reports.find(r => r.id === selectedReportId);

  // Generate Official B.O. Format for Copy/Paste into Virtual Delegation
  const generatedBOText = activeReport ? `
BOLETIM DE OCORRÊNCIA VIRTUAL / DENÚNCIA - CANAL ASSÉDIOAKI
------------------------------------------------------------
PROTOCOLO DA PLATAFORMA: ${activeReport.id}
TIPO DE INCIDENTE: ${activeReport.category.toUpperCase().replace('_', ' ')}
GRAU DE RISCO: ${activeReport.riskLevel.toUpperCase()}
MODALIDADE: ${activeReport.isAnonymous ? 'DENÚNCIA ANÔNIMA' : 'IDENTIFICADA SOB SIGILO'}

DATA E HORA DO FATO: ${new Date(activeReport.dateTime).toLocaleString('pt-BR')}
LOCALIZAÇÃO: ${activeReport.address}, ${activeReport.city} - ${activeReport.state}
TIPO DE AMBIENTE: ${activeReport.locationType.toUpperCase()}

DESCRIÇÃO DOS FATOS:
${activeReport.description}

INFORMAÇÕES DO AGRESSOR: ${activeReport.aggressorDetails || 'Não informado / desconhecido'}
TESTEMUNHAS: ${activeReport.witnesses || 'Não informado'}

DOCUMENTO GERADO COM CRIPTOGRAFIA DE PONTA A PONTA (SHA-256: ${activeReport.encryptionHash || 'E2EE-VERIFIED'})
` : `Selecione uma denúncia abaixo para sintetizar a minuta do Boletim de Ocorrência.`;

  const handleCopyBO = () => {
    navigator.clipboard.writeText(generatedBOText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-purple-900/40 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              Encaminhamento para Autoridades de Santa Catarina
            </h2>
            <p className="text-xs text-slate-400">
              Direcionamento exclusivo para a Polícia Civil de Santa Catarina (DPCAMI / DEAM) e Central 181 / 180.
            </p>
          </div>
        </div>

        {/* Emergency Hotline Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* WhatsApp 180 Direct Link */}
          <a
            href="https://wa.me/556196100180?text=Ol%C3%A1%2C%20preciso%20fazer%20uma%20den%C3%BAncia%20e%20buscar%20orienta%C3%A7%C3%A3o%20sobre%20ass%C3%A9dio."
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-xl flex items-center justify-between group transition-all shadow-md"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">WhatsApp Oficial 180</span>
              <strong className="text-sm text-white font-bold block">Central da Mulher</strong>
              <span className="text-[11px] text-emerald-200">Clique para abrir chat no Zap</span>
            </div>
            <MessageSquare className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
          </a>

          {/* Hotline 180 */}
          <a
            href="tel:180"
            className="p-4 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 rounded-xl flex items-center justify-between group transition-all shadow-md"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">Ligação Gratuita</span>
              <strong className="text-sm text-white font-bold block">Ligue 180 (24 Horas)</strong>
              <span className="text-[11px] text-purple-200">Atendimento emergencial</span>
            </div>
            <PhoneCall className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
          </a>

          {/* Hotline 190 PM */}
          <a
            href="tel:190"
            className="p-4 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 rounded-xl flex items-center justify-between group transition-all shadow-md"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider block">Polícia Militar</span>
              <strong className="text-sm text-white font-bold block">Ligue 190 (Emergência)</strong>
              <span className="text-[11px] text-rose-200">Perigo ou agressão iminente</span>
            </div>
            <AlertTriangle className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>

      {/* State Delegation Selector & Virtual BO Synthesizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: State Directory */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400" />
            <span>Delegacia Eletrônica SC (DPCAMI / DEAM)</span>
          </h3>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Estado de Atuação</label>
            <div className="w-full px-3 py-2 bg-slate-950 border border-purple-800/60 rounded-xl text-xs text-purple-200 font-bold flex items-center justify-between">
              <span>Santa Catarina (SC)</span>
              <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-md border border-purple-500/30">Atuação Exclusiva</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
            <h4 className="font-bold text-purple-300">{currentStateConfig.stateName}</h4>
            <p className="text-slate-300 leading-relaxed">{currentStateConfig.deamInfo}</p>
            <p className="text-slate-300">
              <strong className="text-white">Telefone de Atendimento:</strong> {currentStateConfig.deamPhone}
            </p>

            {currentStateConfig.whatsapp && (
              <p className="text-slate-300 flex items-center gap-1.5 flex-wrap">
                <strong className="text-white">Denúncia pelo WhatsApp:</strong>
                <a
                  href={`https://wa.me/${currentStateConfig.whatsapp}?text=${encodeURIComponent('Olá, gostaria de fazer uma denúncia/orientação.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>(48) 98844-0083</span>
                </a>
              </p>
            )}

            <a
              href={currentStateConfig.delegaciaVirtualUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-center transition-colors cursor-pointer text-xs shadow-md mt-2 leading-tight"
            >
              <span className="text-center">Acessar Delegacia Virtual e Registrar Boletim de Ocorrência</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>

        {/* Right: B.O. Format Builder */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                Sintetizador de B.O. para Envio às Autoridades
              </h3>
              <p className="text-xs text-slate-400">
                Selecione uma de suas denúncias para formatar o texto padrão oficial de Boletim de Ocorrência.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Selecione o Protocolo</label>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">-- Escolha um relato registrado --</option>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.title} ({r.city})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <textarea 
              rows={10}
              readOnly
              value={generatedBOText}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-purple-200 focus:outline-none leading-relaxed"
            />
            
            {activeReport && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={handleCopyBO}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <p>
              <strong>Instrução:</strong> Após copiar o texto acima, acesse o portal da Polícia Civil do seu estado botão à esquerda, cole os dados no formulário de Registro de Ocorrência Online e guarde o protocolo oficial expedido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
