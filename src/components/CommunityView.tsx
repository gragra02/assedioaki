import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  HeartHandshake,
  Send,
  ShieldAlert,
  Search,
  Heart,
  MessageSquare,
  Flag,
  UserX,
  CheckCircle2,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import {
  CommunityCategory,
  CommunityFlagReason,
  CommunityPost,
  User
} from '../types';
import {
  COMMUNITY_CATEGORIES,
  FLAG_REASONS,
  detectSensitivePII
} from '../lib/community';
import { SC_CITIES_NAMES } from '../lib/scCities';

interface CommunityViewProps {
  posts: CommunityPost[];
  blockedAuthorIds: string[];
  localAuthorId: string;
  currentUser: User | null;
  onCreatePost: (input: {
    title: string;
    content: string;
    category: CommunityCategory;
    city?: string;
    isAnonymous: boolean;
    authorDisplayName?: string;
  }) => void;
  onReplyPost: (
    postId: string,
    input: { content: string; isAnonymous: boolean; authorDisplayName?: string }
  ) => void;
  onToggleSupport: (postId: string, delta: 1 | -1) => void;
  onFlagPost: (postId: string, reason: CommunityFlagReason) => void;
  onBlockAuthor: (authorId: string) => void;
  onUnblockAllAuthors: () => void;
  onBackHome: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  blockedAuthorIds,
  localAuthorId,
  currentUser,
  onCreatePost,
  onReplyPost,
  onToggleSupport,
  onFlagPost,
  onBlockAuthor,
  onUnblockAllAuthors,
  onBackHome
}) => {
  const [categoryFilter, setCategoryFilter] = useState<CommunityCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Post composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<CommunityCategory>('apoio_emocional');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCity, setNewCity] = useState('none');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState(
    currentUser && !currentUser.isAnonymous ? currentUser.name : ''
  );
  const [postFeedback, setPostFeedback] = useState<string | null>(null);

  // Per-post interactive states
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [replyOpenPostId, setReplyOpenPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAnonymous, setReplyAnonymous] = useState(true);
  const [replyAuthorName, setReplyAuthorName] = useState(
    currentUser && !currentUser.isAnonymous ? currentUser.name : ''
  );
  const [flagOpenPostId, setFlagOpenPostId] = useState<string | null>(null);
  const [selectedFlagReason, setSelectedFlagReason] =
    useState<CommunityFlagReason>('dados_pessoais');
  const [flaggedPostFeedback, setFlaggedPostFeedback] = useState<string | null>(null);

  const piiCheckPost = useMemo(
    () => detectSensitivePII(`${newTitle} ${newContent}`),
    [newTitle, newContent]
  );
  const piiCheckReply = useMemo(
    () => detectSensitivePII(replyText),
    [replyText]
  );

  const visiblePosts = useMemo(() => {
    const blockedSet = new Set(blockedAuthorIds);
    const q = searchQuery.trim().toLowerCase();

    return posts
      .filter((p) => {
        if (p.moderationStatus === 'hidden') return false;
        if (blockedSet.has(p.authorId)) return false;
        if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
        if (q) {
          const hay = `${p.title} ${p.content} ${p.city || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .map((p) => ({
        ...p,
        replies: p.replies.filter(
          (r) => !r.hiddenByModeration && !blockedSet.has(r.authorId)
        )
      }))
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [posts, blockedAuthorIds, categoryFilter, searchQuery]);

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    onCreatePost({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      city: newCity !== 'none' ? newCity : undefined,
      isAnonymous,
      authorDisplayName: authorName
    });

    setNewTitle('');
    setNewContent('');
    setNewCity('none');
    setIsComposerOpen(false);
    setPostFeedback('Sua mensagem já está na comunidade. Obrigada por compartilhar.');
    setTimeout(() => setPostFeedback(null), 4000);
  };

  const handleSendReply = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onReplyPost(postId, {
      content: replyText.trim(),
      isAnonymous: replyAnonymous,
      authorDisplayName: replyAuthorName
    });
    setReplyText('');
    setReplyOpenPostId(null);
  };

  const handleConfirmFlag = (postId: string) => {
    onFlagPost(postId, selectedFlagReason);
    setFlagOpenPostId(null);
    setFlaggedPostFeedback(
      'Recebemos seu aviso e nossa equipe vai olhar esta mensagem com cuidado. Obrigada por ajudar.'
    );
    setTimeout(() => setFlaggedPostFeedback(null), 4500);
  };

  const getCategoryLabel = (catId: CommunityCategory) =>
    COMMUNITY_CATEGORIES.find((c) => c.id === catId)?.label || 'Apoio';

  return (
    <div className="max-w-5xl mx-auto space-y-7 py-2">
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

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#6d4c82]">
              Um lugar seguro para trocar acolhimento
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#261d2e] font-heading">
              Comunidade — vozes que se apoiam
            </h1>
            <p className="text-sm sm:text-base text-[#5a4e66] max-w-2xl">
              Compartilhe o que viveu, leia outras mulheres e deixe uma palavra de carinho. Você pode usar sem se identificar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsComposerOpen((prev) => !prev)}
            className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#b05c72] hover:bg-[#914358] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <HeartHandshake className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{isComposerOpen ? 'Fechar texto' : 'Escrever na comunidade'}</span>
          </button>
        </div>
      </div>

      {/* Safety & Honest Transparency Banner */}
      <section
        aria-label="Cuidados de privacidade na comunidade"
        className="bg-[#f3eef8] border border-[#ddd1ea] rounded-2xl p-5 space-y-2.5"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-[#4f3461]">
          <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Para proteger você e todas nós</span>
        </div>
        <ul className="space-y-1.5 text-xs sm:text-sm text-[#493d54] list-disc pl-5 leading-relaxed">
          <li>
            <strong>Cuide dos seus dados:</strong> evite escrever nome completo, endereço com número, telefone, CPF ou nomes de outras pessoas.
          </li>
          <li>
            <strong>Espaço aberto de apoio:</strong> o que é publicado aqui fica visível para quem visita a comunidade. Se precisar de ajuda imediata, ligue <strong className="tabular-nums">190</strong> ou <strong className="tabular-nums">180</strong>.
          </li>
          <li>
            <strong>Se algo incomodar:</strong> você pode avisar a equipe em qualquer mensagem ou ocultar uma participante no seu aparelho.
          </li>
        </ul>
      </section>

      {postFeedback && (
        <div className="p-3.5 rounded-xl bg-[#f1f6f3] border border-[#cde0d4] text-sm text-[#26543b] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{postFeedback}</span>
        </div>
      )}

      {flaggedPostFeedback && (
        <div className="p-3.5 rounded-xl bg-[#fcf7eb] border border-[#ebd7ad] text-sm text-[#6e4f16] flex items-center gap-2">
          <Flag className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{flaggedPostFeedback}</span>
        </div>
      )}

      {/* Composer Card */}
      {isComposerOpen && (
        <form
          onSubmit={handlePublishPost}
          className="bg-white border border-[#ddd1ea] rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div className="space-y-1 border-b border-[#efe9f4] pb-3">
            <h2 className="text-lg font-semibold text-[#261d2e] font-heading">
              Nova publicação na comunidade
            </h2>
            <p className="text-xs sm:text-sm text-[#5a4e66]">
              Escolha o tema que mais combina com a sua mensagem. Você decide se deseja publicar como anônima.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="community-category" className="block text-xs font-semibold text-[#261d2e] mb-1">
                Tema da publicação
              </label>
              <select
                id="community-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CommunityCategory)}
                className="w-full min-h-[44px] px-3 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
              >
                {COMMUNITY_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="community-city" className="block text-xs font-semibold text-[#261d2e] mb-1">
                Cidade em SC (opcional)
              </label>
              <select
                id="community-city"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
              >
                <option value="none">Prefiro não informar cidade</option>
                {SC_CITIES_NAMES.map((city) => (
                  <option key={city} value={city}>
                    {city} (SC)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="community-title" className="block text-xs font-semibold text-[#261d2e] mb-1">
              Título curto (opcional)
            </label>
            <input
              id="community-title"
              type="text"
              maxLength={120}
              placeholder="Ex: Força para quem está passando por um momento difícil"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
            />
          </div>

          <div>
            <label htmlFor="community-content" className="block text-xs font-semibold text-[#261d2e] mb-1">
              Sua mensagem ou vivência
            </label>
            <textarea
              id="community-content"
              rows={4}
              required
              maxLength={1200}
              placeholder="Escreva no seu tempo. Lembre-se de não incluir dados pessoais ou endereços exatos..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full p-3.5 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e] leading-relaxed"
            />
          </div>

          {piiCheckPost.hasSensitivePii && (
            <div className="p-3.5 rounded-xl bg-[#fbf2f4] border border-[#e7cbd3] text-xs sm:text-sm text-[#7f3347] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Atenção à sua privacidade:</strong> detectamos possível{' '}
                {piiCheckPost.warnings.join(', ')} no texto. Para sua segurança, recomendamos remover dados pessoais antes de publicar.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#261d2e] cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-[#6d4c82] rounded"
                />
                <span>Publicar de forma anônima</span>
              </label>

              {!isAnonymous && (
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Apelido (evite nome completo)"
                  aria-label="Apelido para exibição"
                  className="min-h-[40px] px-3 py-1.5 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-xs sm:text-sm text-[#261d2e]"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-sm font-medium text-[#5a4e66] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newContent.trim()}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#6d4c82] hover:bg-[#593c6b] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Publicar com segurança</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <section aria-label="Filtrar publicações" className="bg-white border border-[#e6dfee] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7c6f88] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por palavra ou cidade..."
              aria-label="Buscar publicações na comunidade"
              className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
            />
          </div>

          {blockedAuthorIds.length > 0 && (
            <button
              type="button"
              onClick={onUnblockAllAuthors}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-xs font-medium text-[#5a4e66] inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Mostrar {blockedAuthorIds.length} perfil(is) ocultado(s)</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-[#6d4c82] text-white'
                : 'bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#493d54]'
            }`}
          >
            Todos os temas
          </button>
          {COMMUNITY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#6d4c82] text-white'
                  : 'bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#493d54]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Posts List or Honest Empty State */}
      {visiblePosts.length === 0 ? (
        <div className="bg-white border border-dashed border-[#ddd1ea] rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f3eef8] text-[#6d4c82] flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-[#261d2e] font-heading">
            Ainda não há publicações aqui
          </h2>
          <p className="text-sm text-[#5a4e66] max-w-md mx-auto leading-relaxed">
            {searchQuery || categoryFilter !== 'all'
              ? 'Nenhuma mensagem corresponde aos filtros selecionados. Experimente limpar a busca ou escolher outro tema.'
              : 'Você pode iniciar este espaço compartilhando uma mensagem de acolhimento, dúvida ou vivência de forma anônima e segura.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {(searchQuery || categoryFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-sm font-medium text-[#4f3461] cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsComposerOpen(true)}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#6d4c82] hover:bg-[#593c6b] text-white text-sm font-semibold cursor-pointer"
            >
              Escrever primeira mensagem
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((post) => {
            const hasLiked = likedPostIds.includes(post.id);
            const isOwnPost = post.authorId === localAuthorId;

            return (
              <article
                key={post.id}
                className="bg-white border border-[#e6dfee] rounded-2xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#efe9f4] pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#f3eef8] text-[#4f3461] font-semibold border border-[#ddd1ea]">
                        {getCategoryLabel(post.category)}
                      </span>
                      {post.city && (
                        <span className="text-[#5a4e66] font-medium">
                          {post.city} (SC)
                        </span>
                      )}
                      {post.moderationStatus === 'flagged' && (
                        <span className="px-2 py-0.5 rounded-lg bg-[#fcf7eb] text-[#6e4f16] border border-[#ebd7ad] font-medium">
                          Em revisão pela moderação
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-semibold text-[#261d2e] font-heading">
                      {post.title}
                    </h2>

                    <p className="text-xs text-[#6b5e77]">
                      Por <strong className="text-[#493d54]">{post.authorLabel}</strong> ·{' '}
                      {new Date(post.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {!isOwnPost && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setFlagOpenPostId((curr) => (curr === post.id ? null : post.id))
                        }
                        title="Denunciar publicação"
                        aria-label={`Denunciar publicação ${post.title}`}
                        className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[#faf8fb] hover:bg-[#fbf2f4] border border-[#e6dfee] text-xs font-medium text-[#5a4e66] hover:text-[#7f3347] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Denunciar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onBlockAuthor(post.authorId)}
                        title="Ocultar publicações desta autora neste aparelho"
                        aria-label="Ocultar autora neste aparelho"
                        className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-xs font-medium text-[#5a4e66] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Ocultar</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Flag / Report Panel */}
                {flagOpenPostId === post.id && (
                  <div className="p-4 rounded-xl bg-[#fbf2f4] border border-[#e7cbd3] space-y-3">
                    <p className="text-xs font-semibold text-[#7f3347]">
                      Por que você deseja sinalizar esta publicação?
                    </p>
                    <select
                      value={selectedFlagReason}
                      onChange={(e) =>
                        setSelectedFlagReason(e.target.value as CommunityFlagReason)
                      }
                      aria-label="Motivo da denúncia da publicação"
                      className="w-full min-h-[42px] px-3 py-1.5 bg-white border border-[#e7cbd3] rounded-xl text-xs sm:text-sm text-[#261d2e]"
                    >
                      {FLAG_REASONS.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setFlagOpenPostId(null)}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-[#e6dfee] text-xs font-medium text-[#5a4e66] cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmFlag(post.id)}
                        className="min-h-[40px] px-4 py-1.5 rounded-xl bg-[#b05c72] hover:bg-[#914358] text-white text-xs font-semibold cursor-pointer"
                      >
                        Enviar para moderação
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-sm sm:text-[15px] text-[#261d2e] leading-relaxed whitespace-pre-wrap break-words">
                  {post.content}
                </p>

                {/* Support & Reply Bar */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (hasLiked) {
                        setLikedPostIds((prev) => prev.filter((id) => id !== post.id));
                        onToggleSupport(post.id, -1);
                      } else {
                        setLikedPostIds((prev) => [...prev, post.id]);
                        onToggleSupport(post.id, 1);
                      }
                    }}
                    aria-pressed={hasLiked}
                    className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      hasLiked
                        ? 'bg-[#fbf2f4] border-[#b05c72] text-[#7f3347]'
                        : 'bg-[#faf8fb] hover:bg-[#fbf2f4] border-[#e6dfee] text-[#493d54]'
                    }`}
                  >
                    <Heart className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Enviar acolhimento ({post.supportCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReplyOpenPostId((curr) => (curr === post.id ? null : post.id))
                    }
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-xs font-semibold text-[#4f3461] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Responder ({post.replies.length})</span>
                  </button>
                </div>

                {/* Replies Thread */}
                {post.replies.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-[#efe9f4] pl-3 sm:pl-5">
                    {post.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-3.5 rounded-xl bg-[#faf8fb] border border-[#efe9f4] space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-[#6b5e77]">
                          <strong className="text-[#4f3461]">{reply.authorLabel}</strong>
                          <span>
                            {new Date(reply.createdAt).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#261d2e] leading-relaxed whitespace-pre-wrap break-words">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Composer */}
                {replyOpenPostId === post.id && (
                  <form
                    onSubmit={(e) => handleSendReply(e, post.id)}
                    className="p-4 rounded-xl bg-[#f3eef8]/70 border border-[#ddd1ea] space-y-3"
                  >
                    <label
                      htmlFor={`reply-input-${post.id}`}
                      className="block text-xs font-semibold text-[#261d2e]"
                    >
                      Escreva uma mensagem de apoio
                    </label>
                    <textarea
                      id={`reply-input-${post.id}`}
                      rows={2}
                      required
                      maxLength={600}
                      placeholder="Ofereça escuta e solidariedade, sem julgamentos..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-3 bg-white border border-[#ddd1ea] rounded-xl text-sm text-[#261d2e]"
                    />

                    {piiCheckReply.hasSensitivePii && (
                      <div className="p-2.5 rounded-xl bg-[#fbf2f4] border border-[#e7cbd3] text-xs text-[#7f3347] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>
                          Evite incluir dados pessoais ({piiCheckReply.warnings.join(', ')}).
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 text-xs text-[#261d2e] cursor-pointer min-h-[36px]">
                          <input
                            type="checkbox"
                            checked={replyAnonymous}
                            onChange={(e) => setReplyAnonymous(e.target.checked)}
                            className="w-4 h-4 accent-[#6d4c82] rounded"
                          />
                          <span>Responder anonimamente</span>
                        </label>
                        {!replyAnonymous && (
                          <input
                            type="text"
                            value={replyAuthorName}
                            onChange={(e) => setReplyAuthorName(e.target.value)}
                            placeholder="Apelido"
                            className="min-h-[36px] px-2.5 py-1 bg-white border border-[#ddd1ea] rounded-lg text-xs text-[#261d2e] w-32"
                          />
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="min-h-[40px] px-4 py-2 rounded-xl bg-[#6d4c82] hover:bg-[#593c6b] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Enviar apoio</span>
                      </button>
                    </div>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
