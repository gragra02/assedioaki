import {
  CommunityCategory,
  CommunityFlagReason,
  CommunityPost,
  CommunityReply
} from '../types';

export const COMMUNITY_STORAGE_KEY = 'assedioaki_community_posts';
export const BLOCKED_AUTHORS_STORAGE_KEY = 'assedioaki_blocked_authors';
export const COMMUNITY_AUTHOR_TOKEN_KEY = 'assedioaki_community_author_id';

export const COMMUNITY_CATEGORIES: Array<{
  id: CommunityCategory;
  label: string;
  description: string;
}> = [
  {
    id: 'apoio_emocional',
    label: 'Apoio e acolhimento',
    description: 'Mensagens de força, escuta e solidariedade entre mulheres.'
  },
  {
    id: 'compartilhar_experiencia',
    label: 'Compartilhar vivência',
    description: 'Relatos pessoais sem identificar pessoas ou endereços exatos.'
  },
  {
    id: 'alerta_regiao',
    label: 'Alerta preventivo',
    description: 'Cuidados gerais sobre regiões, horários ou trajetos em SC.'
  },
  {
    id: 'duvida_direitos',
    label: 'Dúvidas sobre caminhos',
    description: 'Perguntas sobre como buscar ajuda, B.O. ou atendimento de saúde.'
  },
  {
    id: 'superacao',
    label: 'Histórias de superação',
    description: 'Passos que ajudaram você a reencontrar segurança e apoio.'
  }
];

export const FLAG_REASONS: Array<{ id: CommunityFlagReason; label: string }> = [
  { id: 'dados_pessoais', label: 'Contém dados pessoais (telefone, endereço, CPF ou nome)' },
  { id: 'conteudo_ofensivo', label: 'Conteúdo ofensivo, julgamento ou hostilidade' },
  { id: 'risco_seguranca', label: 'Ameaça ou risco à segurança de alguém' },
  { id: 'spam_propaganda', label: 'Spam ou mensagem fora do propósito de apoio' }
];

export interface PiiDetectionResult {
  hasSensitivePii: boolean;
  warnings: string[];
}

/**
 * Checks whether free text likely includes personal identifying details
 * (phone number, email, CPF, or explicit street house number) so we can warn the author before posting.
 */
export function detectSensitivePII(text: string): PiiDetectionResult {
  const warnings: string[] = [];
  const trimmed = text || '';

  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(trimmed)) {
    warnings.push('e-mail');
  }
  if (/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9?\d{4}[-.\s]?\d{4})/.test(trimmed)) {
    warnings.push('telefone ou WhatsApp');
  }
  if (/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(trimmed)) {
    warnings.push('CPF');
  }
  if (/\b(?:rua|av\.?|avenida|servidão|travessa)\s+[^,\n]{2,35},?\s*(?:n[º°]?|n[uú]mero)?\s*\d{1,5}\b/i.test(trimmed)) {
    warnings.push('endereço com número');
  }

  return {
    hasSensitivePii: warnings.length > 0,
    warnings
  };
}

export function getOrCreateLocalAuthorId(): string {
  try {
    const existing = localStorage.getItem(COMMUNITY_AUTHOR_TOKEN_KEY);
    if (existing) return existing;
    const generated = 'aut-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(COMMUNITY_AUTHOR_TOKEN_KEY, generated);
    return generated;
  } catch {
    return 'aut-local';
  }
}

export function createCommunityPost(params: {
  title: string;
  content: string;
  category: CommunityCategory;
  city?: string;
  isAnonymous: boolean;
  authorDisplayName?: string;
  authorId: string;
}): CommunityPost {
  const safeName = params.isAnonymous
    ? 'Participante anônima'
    : (params.authorDisplayName || '').trim() || 'Participante da rede';

  return {
    id: 'post-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    authorId: params.authorId,
    authorLabel: safeName,
    isAnonymous: params.isAnonymous,
    category: params.category,
    title: params.title.trim() || 'Relato na comunidade',
    content: params.content.trim(),
    city: params.city && params.city !== 'none' ? params.city : undefined,
    createdAt: new Date().toISOString(),
    supportCount: 0,
    replies: [],
    flagCount: 0,
    flagReasons: [],
    moderationStatus: 'published'
  };
}

export function addReplyToCommunityPost(
  posts: CommunityPost[],
  postId: string,
  replyInput: {
    content: string;
    isAnonymous: boolean;
    authorDisplayName?: string;
    authorId: string;
  }
): CommunityPost[] {
  const safeName = replyInput.isAnonymous
    ? 'Participante anônima'
    : (replyInput.authorDisplayName || '').trim() || 'Participante da rede';

  const newReply: CommunityReply = {
    id: 'rep-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    postId,
    authorId: replyInput.authorId,
    authorLabel: safeName,
    isAnonymous: replyInput.isAnonymous,
    content: replyInput.content.trim(),
    createdAt: new Date().toISOString()
  };

  return posts.map((post) =>
    post.id === postId
      ? { ...post, replies: [...post.replies, newReply] }
      : post
  );
}

export function toggleSupportOnCommunityPost(
  posts: CommunityPost[],
  postId: string,
  delta: 1 | -1
): CommunityPost[] {
  return posts.map((post) =>
    post.id === postId
      ? { ...post, supportCount: Math.max(0, post.supportCount + delta) }
      : post
  );
}

/**
 * Flags a community post for moderation. Automatically moves post into 'flagged' status,
 * or hides it if it reaches 3+ distinct community reports.
 */
export function flagCommunityPost(
  posts: CommunityPost[],
  postId: string,
  reason: CommunityFlagReason
): CommunityPost[] {
  return posts.map((post) => {
    if (post.id !== postId) return post;
    const nextFlags = post.flagCount + 1;
    const nextReasons = post.flagReasons.includes(reason)
      ? post.flagReasons
      : [...post.flagReasons, reason];

    return {
      ...post,
      flagCount: nextFlags,
      flagReasons: nextReasons,
      moderationStatus: nextFlags >= 3 ? 'hidden' : 'flagged'
    };
  });
}

export function moderateCommunityPost(
  posts: CommunityPost[],
  postId: string,
  action: 'approve' | 'hide' | 'delete'
): CommunityPost[] {
  if (action === 'delete') {
    return posts.filter((p) => p.id !== postId);
  }
  return posts.map((post) => {
    if (post.id !== postId) return post;
    if (action === 'approve') {
      return {
        ...post,
        moderationStatus: 'published',
        flagCount: 0,
        flagReasons: []
      };
    }
    return {
      ...post,
      moderationStatus: 'hidden'
    };
  });
}

export function filterVisibleCommunityPosts(
  posts: CommunityPost[],
  options: {
    category?: CommunityCategory | 'all';
    searchQuery?: string;
    blockedAuthorIds?: string[];
    includeHidden?: boolean;
  } = {}
): CommunityPost[] {
  const {
    category = 'all',
    searchQuery = '',
    blockedAuthorIds = [],
    includeHidden = false
  } = options;

  const blockedSet = new Set(blockedAuthorIds);
  const query = searchQuery.trim().toLowerCase();

  return posts
    .filter((post) => {
      if (!includeHidden && post.moderationStatus === 'hidden') return false;
      if (blockedSet.has(post.authorId)) return false;
      if (category !== 'all' && post.category !== category) return false;
      if (query) {
        const hay = `${post.title} ${post.content} ${post.city || ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    })
    .map((post) => ({
      ...post,
      replies: post.replies.filter((rep) => !rep.hiddenByModeration && !blockedSet.has(rep.authorId))
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function loadCommunityPosts(): CommunityPost[] {
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CommunityPost[]) : [];
  } catch {
    return [];
  }
}

export function saveCommunityPosts(posts: CommunityPost[]): void {
  try {
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function loadBlockedAuthors(): string[] {
  try {
    const raw = localStorage.getItem(BLOCKED_AUTHORS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBlockedAuthors(authorIds: string[]): void {
  try {
    localStorage.setItem(BLOCKED_AUTHORS_STORAGE_KEY, JSON.stringify(Array.from(new Set(authorIds))));
  } catch {
    // Ignore storage errors cleanly
  }
}
