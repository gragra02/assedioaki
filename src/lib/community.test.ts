import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addReplyToCommunityPost,
  createCommunityPost,
  detectSensitivePII,
  filterVisibleCommunityPosts,
  flagCommunityPost,
  moderateCommunityPost,
  toggleSupportOnCommunityPost
} from './community';

test('detectSensitivePII identifies emails, phones, CPFs, and numbered street addresses', () => {
  const clean = detectSensitivePII('Passei por uma situação difícil perto do terminal ontem à noite.');
  assert.equal(clean.hasSensitivePii, false);

  const risky = detectSensitivePII(
    'Meu telefone é (48) 99999-1234, email teste@exemplo.com, CPF 123.456.789-00 na Rua das Flores, 450.'
  );
  assert.equal(risky.hasSensitivePii, true);
  assert.ok(risky.warnings.includes('e-mail'));
  assert.ok(risky.warnings.includes('telefone ou WhatsApp'));
  assert.ok(risky.warnings.includes('CPF'));
  assert.ok(risky.warnings.includes('endereço com número'));
});

test('createCommunityPost, reply, and support counter maintain clean immutable state', () => {
  const post = createCommunityPost({
    title: 'Apoio em Florianópolis',
    content: 'Você não tem culpa do que aconteceu.',
    category: 'apoio_emocional',
    city: 'Florianópolis',
    isAnonymous: true,
    authorId: 'aut-1'
  });

  assert.equal(post.authorLabel, 'Participante anônima');
  assert.equal(post.moderationStatus, 'published');
  assert.equal(post.supportCount, 0);

  const withSupport = toggleSupportOnCommunityPost([post], post.id, 1);
  assert.equal(withSupport[0].supportCount, 1);

  const withReply = addReplyToCommunityPost(withSupport, post.id, {
    content: 'Obrigada pelas palavras.',
    isAnonymous: false,
    authorDisplayName: 'Clara',
    authorId: 'aut-2'
  });
  assert.equal(withReply[0].replies.length, 1);
  assert.equal(withReply[0].replies[0].authorLabel, 'Clara');
});

test('flagCommunityPost moves posts to moderation queue and hides at 3 flags, while moderateCommunityPost controls visibility', () => {
  const post = createCommunityPost({
    title: 'Post de teste',
    content: 'Conteúdo qualquer',
    category: 'duvida_direitos',
    isAnonymous: true,
    authorId: 'aut-3'
  });

  let posts = flagCommunityPost([post], post.id, 'dados_pessoais');
  assert.equal(posts[0].moderationStatus, 'flagged');
  assert.equal(posts[0].flagCount, 1);

  posts = flagCommunityPost(posts, post.id, 'dados_pessoais');
  posts = flagCommunityPost(posts, post.id, 'risco_seguranca');
  assert.equal(posts[0].moderationStatus, 'hidden');

  const visibleDefault = filterVisibleCommunityPosts(posts);
  assert.equal(visibleDefault.length, 0);

  const approved = moderateCommunityPost(posts, post.id, 'approve');
  assert.equal(approved[0].moderationStatus, 'published');
  assert.equal(approved[0].flagCount, 0);

  const hiddenByAdmin = moderateCommunityPost(approved, post.id, 'hide');
  assert.equal(filterVisibleCommunityPosts(hiddenByAdmin).length, 0);

  const deleted = moderateCommunityPost(hiddenByAdmin, post.id, 'delete');
  assert.equal(deleted.length, 0);
});

test('filterVisibleCommunityPosts enforces blockedAuthorIds, category filter, and search query', () => {
  const p1 = createCommunityPost({
    title: 'Alerta no TICEN',
    content: 'Muita atenção no embarque noturno.',
    category: 'alerta_regiao',
    city: 'Florianópolis',
    isAnonymous: true,
    authorId: 'aut-a'
  });
  const p2 = createCommunityPost({
    title: 'Mensagem de acolhimento',
    content: 'Força para todas em Joinville.',
    category: 'apoio_emocional',
    city: 'Joinville',
    isAnonymous: true,
    authorId: 'aut-b'
  });

  const filteredBlocked = filterVisibleCommunityPosts([p1, p2], {
    blockedAuthorIds: ['aut-a']
  });
  assert.equal(filteredBlocked.length, 1);
  assert.equal(filteredBlocked[0].id, p2.id);

  const filteredSearch = filterVisibleCommunityPosts([p1, p2], {
    category: 'alerta_regiao',
    searchQuery: 'ticen'
  });
  assert.equal(filteredSearch.length, 1);
  assert.equal(filteredSearch[0].id, p1.id);
});
