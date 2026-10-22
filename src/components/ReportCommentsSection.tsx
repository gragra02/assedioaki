import React, { useState } from 'react';
import { MessageSquare, Send, User as UserIcon, Lock, Heart, ShieldCheck, Globe } from 'lucide-react';
import { ReportComment, User } from '../types';
import { getClientIp, getSystemTimeZone, addAccessLog } from '../lib/accessLogs';

interface ReportCommentsSectionProps {
  reportId: string;
  comments?: ReportComment[];
  currentUser?: User | null;
  onAddComment: (reportId: string, comment: ReportComment) => void;
}

export const ReportCommentsSection: React.FC<ReportCommentsSectionProps> = ({
  reportId,
  comments = [],
  currentUser,
  onAddComment
}) => {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [isAnonymous, setIsAnonymous] = useState(!currentUser || currentUser.isAnonymous);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const clientIp = getClientIp();
    const clientTimeZone = getSystemTimeZone();

    const newComment: ReportComment = {
      id: 'cmt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      reportId,
      authorName: isAnonymous ? 'Mulher em Apoio (Anônima)' : (authorName.trim() || 'Usuária Solidária'),
      isAnonymous,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
      ip: clientIp,
      timeZone: clientTimeZone
    };

    onAddComment(reportId, newComment);

    addAccessLog(
      `Comentário Registrado na Denúncia #${reportId.replace(/^ASK-\d{4}-/, '')} (IP: ${clientIp})`,
      isAnonymous 
        ? `Usuária Anônima (Comentário #${reportId.replace(/^ASK-\d{4}-/, '')})` 
        : `${authorName.trim() || 'Usuária'} (Comentário)`,
      isAnonymous ? 'anonimo@assedioaki.com.br' : (currentUser?.email || 'usuario@assedioaki.com.br'),
      isAnonymous ? 'anonymous' : 'user',
      'sucesso'
    );

    setCommentText('');
    setIsSubmitting(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          <h4 className="text-xs font-bold text-slate-900">
            Comentários e Apoio da Comunidade ({comments.length})
          </h4>
        </div>
        <span className="text-[10px] text-purple-800 bg-purple-100 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Heart className="w-3 h-3 text-pink-600 fill-pink-500" />
          Rede Segura
        </span>
      </div>

      {/* Comments List */}
      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="py-4 text-center text-slate-500 text-xs bg-white rounded-lg border border-dashed border-slate-200 p-3">
            <p className="font-semibold text-slate-700">Nenhum comentário registrado ainda.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Deixe uma mensagem de acolhimento, alerta sobre o local ou informação de segurança.
            </p>
          </div>
        ) : (
          comments.map((cmt) => (
            <div
              key={cmt.id}
              className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-xs"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-black shrink-0">
                    {cmt.isAnonymous ? <Lock className="w-2.5 h-2.5 text-purple-600" /> : <UserIcon className="w-2.5 h-2.5 text-purple-600" />}
                  </div>
                  <span>{cmt.authorName}</span>
                  {cmt.isAnonymous && (
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded font-normal">
                      Anônimo
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-600">{formatDate(cmt.createdAt)}</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px] pl-6.5 whitespace-pre-wrap break-words">
                {cmt.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-200 space-y-2">
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold p-2 rounded-lg flex items-center gap-1.5 animate-in fade-in">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Comentário publicado com sucesso! Obrigado pelo apoio.</span>
          </div>
        )}

        <div className="space-y-1.5">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escreva uma palavra de apoio, alerta ou comentário sobre a ocorrência..."
            rows={2}
            maxLength={600}
            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder:text-slate-400"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-3.5 h-3.5 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span className="font-semibold">Comentar como anônima</span>
            </label>

            {!isAnonymous && (
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Seu nome ou apelido"
                className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 w-36"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs shrink-0"
          >
            <Send className="w-3 h-3" />
            <span>Comentar</span>
          </button>
        </div>

        {/* Aviso de Coleta de IP para Auditoria */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/80">
          <Globe className="w-3 h-3 text-purple-600 shrink-0" />
          <span>
            Para segurança da rede e combate a fraudes/ameaças, o <strong>IP da conexão ({getClientIp()})</strong> é coletado e registrado nos relatórios de auditoria, inclusive em comentários anônimos (Marco Civil da Internet).
          </span>
        </div>
      </form>
    </div>
  );
};
