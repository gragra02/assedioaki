import React, { useState } from 'react';
import { Report } from '../types';
import { decryptData } from '../lib/crypto';
import { Search, Lock, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface CaseTrackerProps {
  reports: Report[];
  initialProtocolId?: string;
  onAddTimelineNote?: (reportId: string, note: string) => void;
}

interface ParsedDecryptedContent {
  title?: string;
  description?: string;
  aggressorDetails?: string;
  witnesses?: string;
}

export const CaseTracker: React.FC<CaseTrackerProps> = ({
  reports,
  initialProtocolId = '',
  onAddTimelineNote
}) => {
  const [searchId, setSearchId] = useState<string>(initialProtocolId);
  const [accessPin, setAccessPin] = useState<string>('');
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [parsedDecrypted, setParsedDecrypted] = useState<ParsedDecryptedContent | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [showSavedList, setShowSavedList] = useState<boolean>(false);

  const handleSearchAndDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setDecryptedText(null);
    setParsedDecrypted(null);
    setIsDecrypting(true);

    const found = reports.find(
      (r) => r.id.toLowerCase().trim() === searchId.toLowerCase().trim()
    );

    if (!found) {
      setErrorMsg('Não encontramos esse código por aqui. Confira se está certinho e tente de novo.');
      setIsDecrypting(false);
      return;
    }

    if (found.accessKey && found.accessKey !== accessPin.trim()) {
      setErrorMsg('Esse PIN não confere. Tente de novo, sem pressa.');
      setIsDecrypting(false);
      return;
    }

    setActiveReport(found);

    if (found.encryptedPayload) {
      try {
        const payloadObj = JSON.parse(found.encryptedPayload);
        const decrypted = await decryptData(payloadObj, accessPin.trim() || found.accessKey);
        try {
          const parsed = JSON.parse(decrypted) as ParsedDecryptedContent;
          if (parsed && typeof parsed === 'object' && parsed.description) {
            setParsedDecrypted(parsed);
          } else {
            setDecryptedText(decrypted);
          }
        } catch {
          setDecryptedText(decrypted);
        }
      } catch {
        setDecryptedText(found.description || 'Conteúdo protegido pelo PIN informado.');
      }
    } else {
      setDecryptedText(found.description);
    }

    setIsDecrypting(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport || !newNote.trim()) return;

    if (onAddTimelineNote) {
      onAddTimelineNote(activeReport.id, newNote);
    }

    const updatedTimeline = [
      ...activeReport.timeline,
      {
        id: 'tl-' + Date.now(),
        date: new Date().toISOString(),
        title: 'Atualização registrada por você',
        note: newNote,
        actor: 'Usuária' as const
      }
    ];

    setActiveReport({
      ...activeReport,
      timeline: updatedTimeline
    });

    setNewNote('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search Header Box */}
      <div className="bg-white border border-[#e6dfee] rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#f3eef8] text-[#6d4c82] flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#261d2e] font-heading">
              Acompanhar meu relato
            </h2>
            <p className="text-sm text-[#5a4e66]">
              Digite o código do relato e o seu PIN para abrir o que você salvou com privacidade.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearchAndDecrypt} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="tracker-protocol-id" className="block text-xs font-semibold text-[#261d2e] mb-1">
              Código do relato
            </label>
            <input
              id="tracker-protocol-id"
              type="text"
              required
              placeholder="Ex: ASK-2026-90412"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e] uppercase tracking-wider font-mono"
            />
          </div>

          <div>
            <label htmlFor="tracker-pin" className="block text-xs font-semibold text-[#261d2e] mb-1">
              Seu PIN
            </label>
            <input
              id="tracker-pin"
              type="password"
              required
              placeholder="Ex: 1234"
              value={accessPin}
              onChange={(e) => setAccessPin(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e] tracking-widest font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isDecrypting}
              className="w-full min-h-[44px] py-2 px-4 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>{isDecrypting ? 'Abrindo...' : 'Ver meu relato'}</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-3 bg-[#fbf2f4] border border-[#e7cbd3] rounded-xl text-xs sm:text-sm text-[#7f3347] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Privacy-safe toggle: never expose saved report titles on screen by default */}
        {reports.length > 0 && !activeReport && (
          <div className="pt-3 border-t border-[#efe9f4] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[#5a4e66]">
                Por privacidade, a lista de protocolos deste aparelho fica oculta até você escolher exibi-la.
              </p>
              <button
                type="button"
                onClick={() => setShowSavedList((prev) => !prev)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#ddd1ea] text-xs font-medium text-[#4f3461] inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                {showSavedList ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
                <span>
                  {showSavedList
                    ? 'Ocultar protocolos salvos'
                    : `Mostrar protocolos salvos neste aparelho (${reports.length})`}
                </span>
              </button>
            </div>

            {showSavedList && (
              <div className="flex flex-wrap gap-2 pt-1">
                {reports.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSearchId(r.id);
                      setAccessPin(r.accessKey || '');
                    }}
                    className="min-h-[44px] px-3 py-1.5 bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] rounded-xl text-xs text-[#4f3461] font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                    <span>{r.id}</span>
                    <span className="text-[11px] font-sans text-[#6b5e77]">({r.city})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decrypted Case Details Panel */}
      {activeReport && (
        <div className="bg-white border border-[#e6dfee] rounded-2xl p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#efe9f4] pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-semibold text-[#4f3461] bg-[#f3eef8] px-2.5 py-1 rounded-lg border border-[#ddd1ea]">
                  {activeReport.id}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#faf8fb] border border-[#e6dfee] text-[#5a4e66]">
                  Situação: {activeReport.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#261d2e] font-heading mt-2">
                {activeReport.title}
              </h3>
            </div>
          </div>

          {/* Decrypted Payload Preview */}
          <div className="p-4 sm:p-5 bg-[#f3eef8]/60 border border-[#e6dfee] rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[#4f3461] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#6d4c82]" aria-hidden="true" />
                <span>O que você contou</span>
              </span>
              <span className="text-xs text-[#5a4e66]">Protegido com seu PIN</span>
            </div>

            <div className="text-sm text-[#493d54] space-y-2">
              <p>
                <strong className="text-[#261d2e]">Local:</strong> {activeReport.address}, {activeReport.city} ({activeReport.state})
              </p>
              <p>
                <strong className="text-[#261d2e]">Modalidade:</strong>{' '}
                {activeReport.isAnonymous ? 'Relato anônimo' : 'Identificado com sigilo'}
              </p>

              {parsedDecrypted ? (
                <div className="pt-2 border-t border-[#e6dfee] space-y-2">
                  <p className="leading-relaxed">
                    <strong className="text-[#261d2e] block">Relato:</strong>
                    {parsedDecrypted.description}
                  </p>
                  {parsedDecrypted.aggressorDetails && (
                    <p>
                      <strong className="text-[#261d2e]">Características informadas:</strong>{' '}
                      {parsedDecrypted.aggressorDetails}
                    </p>
                  )}
                  {parsedDecrypted.witnesses && (
                    <p>
                      <strong className="text-[#261d2e]">Testemunhas:</strong>{' '}
                      {parsedDecrypted.witnesses}
                    </p>
                  )}
                </div>
              ) : (
                decryptedText && (
                  <p className="pt-2 border-t border-[#e6dfee] leading-relaxed">
                    {decryptedText}
                  </p>
                )
              )}
            </div>
          </div>

          {/* Timeline Visualizer */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#261d2e]">
              Linha do tempo do protocolo
            </h4>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e6dfee]">
              {activeReport.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative space-y-1">
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#6d4c82] ring-4 ring-white" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#261d2e]">{event.title}</span>
                    <span className="text-xs text-[#6b5e77] tabular-nums">
                      {new Date(event.date).toLocaleDateString('pt-BR')}{' '}
                      {new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#493d54] bg-[#faf8fb] p-3 rounded-xl border border-[#efe9f4]">
                    {event.note}
                  </p>
                  <span className="text-xs text-[#6d4c82]">Registrado por: {event.actor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Update Note Form */}
          <form onSubmit={handleAddNote} className="pt-3 border-t border-[#efe9f4] space-y-2">
            <label htmlFor="tracker-new-note" className="block text-sm font-medium text-[#261d2e]">
              Adicionar nova anotação ao seu histórico
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="tracker-new-note"
                type="text"
                placeholder="Ex: Registrei Boletim de Ocorrência sob número..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="min-h-[44px] px-5 py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                Salvar nota
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
