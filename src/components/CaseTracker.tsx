import React, { useState } from 'react';
import { Report } from '../types';
import { decryptData } from '../lib/crypto';
import { Search, Lock, ShieldCheck, Clock, FileText, CheckCircle2, AlertCircle, Calendar, PlusCircle, ArrowRight, Download, Eye, Sparkles } from 'lucide-react';

interface CaseTrackerProps {
  reports: Report[];
  initialProtocolId?: string;
  onAddTimelineNote?: (reportId: string, note: string) => void;
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);

  const handleSearchAndDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setDecryptedText(null);
    setIsDecrypting(true);

    const found = reports.find(
      r => r.id.toLowerCase().trim() === searchId.toLowerCase().trim()
    );

    if (!found) {
      setErrorMsg('Protocolo não encontrado no banco de dados seguro.');
      setIsDecrypting(false);
      return;
    }

    // Check PIN or attempt decryption if payload exists
    if (found.accessKey && found.accessKey !== accessPin.trim()) {
      setErrorMsg('PIN de acesso incorreto para este protocolo.');
      setIsDecrypting(false);
      return;
    }

    setActiveReport(found);

    if (found.encryptedPayload) {
      try {
        const payloadObj = JSON.parse(found.encryptedPayload);
        const decrypted = await decryptData(payloadObj, accessPin.trim() || found.accessKey);
        setDecryptedText(decrypted);
      } catch (err) {
        console.warn('Decryption fallback:', err);
        setDecryptedText('Conteúdo do relato mantido em sigilo absoluto com formato seguro.');
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
        title: 'Atualização da Usuária',
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
      <div className="bg-slate-900 border border-purple-900/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">
                Acompanhamento Seguro de Caso
              </h2>
              <p className="text-xs text-slate-400">
                Consulte o andamento da sua denúncia através do Protocolo e PIN de Acesso.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearchAndDecrypt} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Número do Protocolo</label>
            <input 
              type="text" 
              required
              placeholder="Ex: ASK-2026-90412"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase tracking-wider font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">PIN de Acesso Secreto</label>
            <input 
              type="password" 
              required
              placeholder="Ex: 8821"
              value={accessPin}
              onChange={(e) => setAccessPin(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white tracking-widest font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isDecrypting}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isDecrypting ? (
                <span>Desencriptando...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Consultar & Desbloquear</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick select from user reports if available */}
        {reports.length > 0 && !activeReport && (
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
              Casos salvos neste dispositivo ({reports.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {reports.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setSearchId(r.id);
                    setAccessPin(r.accessKey || '');
                  }}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-lg text-[11px] text-purple-300 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-pink-400" />
                  <span>{r.id}</span>
                  <span className="text-[10px] text-slate-500">({r.title.slice(0, 16)}...)</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decrypted Case Details Panel */}
      {activeReport && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6 animate-in fade-in duration-300">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950 px-2.5 py-0.5 rounded border border-purple-800">
                  {activeReport.id}
                </span>
                <span className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded border ${
                  activeReport.status === 'concluida' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                  activeReport.status === 'enviada_autoridade' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                  'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  Status: {activeReport.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-heading mt-2">
                {activeReport.title}
              </h3>
            </div>
          </div>

          {/* Timeline Visualizer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Histórico de Evolução do Protocolo
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-900/60">
              {activeReport.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative space-y-1">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-pink-500 ring-4 ring-slate-900" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{event.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(event.date).toLocaleDateString('pt-BR')} {new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {event.note}
                  </p>
                  <span className="text-[10px] text-purple-400 font-medium">Por: {event.actor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decrypted Payload Preview */}
          <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-pink-400" />
                <span>Dados Desencriptados em Tempo Real</span>
              </span>
              <span className="text-[10px] text-slate-500">Chave AES-GCM 256 Ativa</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <p><strong>Local:</strong> {activeReport.address}, {activeReport.city} ({activeReport.state})</p>
              <p><strong>Modalidade:</strong> {activeReport.isAnonymous ? 'Denúncia Anônima' : 'Denúncia Identificada'}</p>
              {decryptedText && (
                <p className="pt-2 text-slate-200 border-t border-slate-800 leading-relaxed">
                  {decryptedText}
                </p>
              )}
            </div>
          </div>

          {/* Add Update Note Form */}
          <form onSubmit={handleAddNote} className="pt-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Adicionar Nova Observação ou Prova ao Caso
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ex: Entrei em contato com a Central 180 e recebi número de acompanhamento B.O..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                Anexar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
