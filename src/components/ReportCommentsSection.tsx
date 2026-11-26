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
    <div className="bg-[#faf8fb] border border-[#e6dfee] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#efe9f4] pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#6d4c82]" aria-hidden="true" />
          <h4 className="text-xs font-semibold text-[#261d2e]">
            Palavras de apoio ({comments.length})
          </h4>
        </div>
        <span className="text-[11px] text-[#4f3461] bg-[#f3eef8] border border-[#ddd1ea] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Heart className="w-3 h-3 text-[#b05c72]" aria-hidden="true" />
          <span>Escuta segura</span>
        </span>
      </div>

      {/* Comments List */}
      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="py-4 text-center text-[#5a4e66] text-xs bg-white rounded-xl border border-dashed border-[#ddd1ea] p-3.5">
            <p className="font-semibold text-[#261d2e]">Ainda não há mensagens aqui.</p>
            <p className="text-xs text-[#5a4e66] mt-0.5">
              Se quiser, deixe uma palavra de acolhimento ou um cuidado sobre este lugar.
            </p>
          </div>
        ) : (
          comments.map((cmt) => (
            <div
              key={cmt.id}
              className="bg-white p-3 rounded-xl border border-[#efe9f4] space-y-1 text-xs"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold text-[#261d2e]">
                  <div className="w-5 h-5 rounded-full bg-[#f3eef8] text-[#6d4c82] flex items-center justify-center shrink-0">
                    {cmt.isAnonymous ? <Lock className="w-2.5 h-2.5" aria-hidden="true" /> : <UserIcon className="w-2.5 h-2.5" aria-hidden="true" />}
                  </div>
                  <span>{cmt.authorName}</span>
                  {cmt.isAnonymous && (
                    <span className="text-[10px] bg-[#faf8fb] text-[#5a4e66] border border-[#efe9f4] px-1.5 rounded font-normal">
                      Sem se identificar
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#6b5e77] tabular-nums">{formatDate(cmt.createdAt)}</span>
              </div>
              <p className="text-[#493d54] leading-relaxed text-xs pl-6 whitespace-pre-wrap break-words">
                {cmt.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="pt-2 border-t border-[#efe9f4] space-y-2.5">
        {successMsg && (
          <div className="bg-[#f1f6f3] border border-[#cde0d4] text-[#26543b] text-xs font-medium p-2.5 rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Sua mensagem foi enviada. Obrigada pelo carinho e apoio.</span>
          </div>
        )}

        <div>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escreva uma palavra de acolhimento ou cuidado sobre este local..."
            rows={2}
            maxLength={600}
            className="w-full bg-white border border-[#e6dfee] rounded-xl p-2.5 text-xs sm:text-sm text-[#261d2e] placeholder:text-[#8c7e99]"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-[#493d54] cursor-pointer select-none min-h-[44px]">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-[#6d4c82] rounded border-[#ddd1ea]"
              />
              <span className="font-medium">Enviar sem me identificar</span>
            </label>

            {!isAnonymous && (
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Apelido"
                aria-label="Seu nome ou apelido"
                className="bg-white border border-[#ddd1ea] rounded-lg px-2.5 py-1.5 text-xs text-[#261d2e] w-36 min-h-[38px]"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="min-h-[44px] px-4 py-2 bg-[#6d4c82] hover:bg-[#593c6b] disabled:bg-[#cfc5da] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Enviar apoio</span>
          </button>
        </div>

        {/* Honest visibility guidance */}
        <div className="flex items-start gap-2 text-[11px] text-[#5a4e66] pt-2 border-t border-[#efe9f4]">
          <Globe className="w-3.5 h-3.5 text-[#6d4c82] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            As mensagens ficam visíveis para quem abre este ponto no mapa. Para sua proteção, não coloque nome completo, endereço ou telefone.
          </span>
        </div>
      </form>
    </div>
  );
};
