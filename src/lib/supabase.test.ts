import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidSupabaseConfig } from './supabase';

test('rejects empty or placeholder Supabase credentials', () => {
  assert.equal(isValidSupabaseConfig('', ''), false);
  assert.equal(
    isValidSupabaseConfig('https://seu_project_url_aqui.supabase.co', 'sua_chave_anon_aqui'),
    false
  );
  assert.equal(
    isValidSupabaseConfig('https://your_supabase_url.supabase.co', 'abc123'),
    false
  );
  assert.equal(isValidSupabaseConfig('not-a-url', 'valid-key'), false);
});

test('accepts valid http/https Supabase URL and non-placeholder key', () => {
  assert.equal(
    isValidSupabaseConfig('https://abcdefgh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'),
    true
  );
});
