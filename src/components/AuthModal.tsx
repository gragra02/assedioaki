import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, User as UserIcon, X, Check, KeyRound, AlertTriangle } from 'lucide-react';
import {
  verifyAdminCredentials,
  createAdminUser,
  getAdminConfig,
  isUserBlocked,
  saveRegisteredUser
} from '../lib/adminAuth';
import { addAccessLog } from '../lib/accessLogs';
import { supabase, isGoogleOAuthEnabled } from '../lib/supabase';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

function loadGoogleIdentityScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar Google SSO')), {
        once: true
      });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar Google SSO'));
    document.head.appendChild(script);
  });
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'anonymous'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [declarationChecked, setDeclarationChecked] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  if (!isOpen) return null;

  const googleClientId = (import.meta.env?.VITE_GOOGLE_CLIENT_ID || '').trim();
  const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');

  const handleQuickAdminFill = () => {
    const adminCfg = getAdminConfig();
    setEmail(adminCfg.email);
    setPassword(adminCfg.password);
    setTab('login');
    setAuthError(null);
  };

  const handleGoogleSSO = async () => {
    setAuthError(null);
    setIsLoadingGoogle(true);

    try {
      // 1. Real Google SSO via Supabase OAuth (when Google Provider is enabled in Supabase Dashboard)
      if (supabase && (await isGoogleOAuthEnabled())) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              prompt: 'select_account'
            }
          }
        });

        if (error) {
          setAuthError('Não conseguimos abrir o login do Google agora. Tente novamente em instantes.');
        }
        setIsLoadingGoogle(false);
        return;
      }

      // 2. Direct Google SSO Popup via Google Identity Services (when VITE_GOOGLE_CLIENT_ID is set in .env)
      if (googleClientId) {
        await loadGoogleIdentityScript();
        const oauth2 = window.google?.accounts?.oauth2;
        if (!oauth2) {
          setAuthError('Não foi possível iniciar a janela do Google no navegador.');
          setIsLoadingGoogle(false);
          return;
        }

        const tokenClient = oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse.error || !tokenResponse.access_token) {
              setIsLoadingGoogle(false);
              return;
            }
            try {
              const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              if (!profileRes.ok) {
                throw new Error('Falha ao obter perfil Google');
              }
              const profile = await profileRes.json();
              const userEmail = String(profile.email || '').trim().toLowerCase();

              if (userEmail && isUserBlocked(userEmail)) {
                addAccessLog(
                  `Tentativa de Acesso Google SSO com Conta Bloqueada: ${userEmail}`,
                  profile.name || userEmail,
                  userEmail,
                  'user',
                  'bloqueado'
                );
                setAuthError('Esta conta está suspensa pela administração do sistema.');
                setIsLoadingGoogle(false);
                return;
              }

              const googleUser: User = {
                id: profile.sub ? `usr-google-${profile.sub}` : `usr-google-${Date.now()}`,
                name: profile.name || userEmail.split('@')[0] || 'Usuária Google',
                email: userEmail,
                avatar: profile.picture || undefined,
                isAnonymous: false,
                role: 'user',
                declarationAcceptedAt: new Date().toISOString(),
                authProvider: 'google'
              };

              await saveRegisteredUser(googleUser);
              addAccessLog('Login SSO com Google Realizado', googleUser.name, googleUser.email, 'user');
              onLoginSuccess(googleUser);
              setIsLoadingGoogle(false);
              onClose();
            } catch {
              setAuthError('Não conseguimos concluir o acesso com sua conta Google. Tente novamente.');
              setIsLoadingGoogle(false);
            }
          },
          error_callback: () => {
            setIsLoadingGoogle(false);
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      }

      // 3. Neither Supabase Google Provider nor VITE_GOOGLE_CLIENT_ID is configured yet
      setAuthError(
        supabaseUrl
          ? `Para abrir a janela oficial de SSO do Google, ative o provedor "Google" no painel do Supabase (Authentication → Providers → Google) ou adicione VITE_GOOGLE_CLIENT_ID no arquivo .env.`
          : 'Para abrir a janela oficial de SSO do Google, adicione VITE_GOOGLE_CLIENT_ID no arquivo .env ou configure o provedor Google no Supabase.'
      );
      setIsLoadingGoogle(false);
    } catch {
      setAuthError('Não conseguimos conectar ao Google agora. Verifique sua conexão e tente novamente.');
      setIsLoadingGoogle(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (tab === 'login') {
      const adminCfg = getAdminConfig();
      const isAdminAttempt =
        email.trim().toLowerCase() === adminCfg.email.trim().toLowerCase() ||
        email.trim().toLowerCase() === 'admin';

      if (isAdminAttempt) {
        if (verifyAdminCredentials(email, password)) {
          const adminUser = createAdminUser();
          addAccessLog('Login de Administrador Efetuado com Sucesso', adminUser.name, adminUser.email, 'admin');
          onLoginSuccess(adminUser);
          onClose();
          return;
        } else {
          setAuthError('Senha de administrador incorreta. A senha padrão inicial é admin123.');
          return;
        }
      }

      if (isUserBlocked(email)) {
        addAccessLog(`Tentativa de Acesso com Conta Bloqueada: ${email}`, email, email, 'user', 'bloqueado');
        setAuthError('Esta conta está suspensa pela administração do sistema.');
        return;
      }

      const loggedUser: User = {
        id: 'usr-email-' + Date.now(),
        name: email.split('@')[0] || 'Usuária Cadastrada',
        email,
        isAnonymous: false,
        role: 'user',
        declarationAcceptedAt: new Date().toISOString(),
        authProvider: 'email'
      };
      saveRegisteredUser(loggedUser);
      addAccessLog('Login de Usuária Cadastrada', loggedUser.name, loggedUser.email, 'user');
      onLoginSuccess(loggedUser);
    } else if (tab === 'register') {
      if (!declarationChecked) return;
      const newUser: User = {
        id: 'usr-reg-' + Date.now(),
        name: name || 'Usuária Assédio Aki',
        email,
        isAnonymous: false,
        role: 'user',
        declarationAcceptedAt: new Date().toISOString(),
        authProvider: 'email'
      };
      saveRegisteredUser(newUser);
      addAccessLog('Novo Cadastro de Usuária Realizado', newUser.name, newUser.email, 'user');
      onLoginSuccess(newUser);
    } else {
      const guestUser: User = {
        id: 'usr-anon-' + Math.floor(100000 + Math.random() * 900000),
        name: 'Usuária Anônima',
        email: 'anonimo@assedioaki.com.br',
        isAnonymous: true,
        role: 'user',
        declarationAcceptedAt: new Date().toISOString(),
        authProvider: 'anonymous'
      };
      addAccessLog('Início de Sessão Anônima', guestUser.name, guestUser.email, 'anonymous');
      onLoginSuccess(guestUser);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#261d2e]/40 backdrop-blur-xs"
    >
      <div className="bg-white border border-[#e6dfee] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar janela"
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#5a4e66] hover:text-[#261d2e] hover:bg-[#f3eef8] rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="text-center space-y-1 pr-6">
          <h3 id="auth-modal-title" className="text-xl font-semibold text-[#261d2e] font-heading">
            Acesso opcional ao sistema
          </h3>
          <p className="text-xs sm:text-sm text-[#5a4e66]">
            Você não precisa criar conta para ler orientações, buscar apoio ou registrar relatos.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-[#f3eef8] p-1 rounded-xl text-xs font-medium border border-[#e6dfee]">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setAuthError(null);
            }}
            className={`min-h-[40px] rounded-lg transition-colors cursor-pointer ${
              tab === 'login' ? 'bg-white text-[#261d2e] font-semibold shadow-xs' : 'text-[#5a4e66] hover:text-[#261d2e]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setAuthError(null);
            }}
            className={`min-h-[40px] rounded-lg transition-colors cursor-pointer ${
              tab === 'register' ? 'bg-white text-[#261d2e] font-semibold shadow-xs' : 'text-[#5a4e66] hover:text-[#261d2e]'
            }`}
          >
            Criar perfil
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('anonymous');
              setAuthError(null);
            }}
            className={`min-h-[40px] rounded-lg transition-colors cursor-pointer ${
              tab === 'anonymous' ? 'bg-white text-[#261d2e] font-semibold shadow-xs' : 'text-[#5a4e66] hover:text-[#261d2e]'
            }`}
          >
            Anônimo
          </button>
        </div>

        {tab !== 'anonymous' ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <button
              type="button"
              onClick={handleGoogleSSO}
              disabled={isLoadingGoogle}
              className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-[#faf8fb] text-[#261d2e] font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors border border-[#ddd1ea] shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isLoadingGoogle ? 'Abrindo conta Google...' : 'Continuar com Google'}</span>
            </button>

            <div className="relative flex items-center justify-center py-0.5">
              <div className="border-t border-[#efe9f4] w-full" />
              <span className="bg-white px-3 text-[11px] text-[#7c6f88] whitespace-nowrap">
                ou com e-mail e senha
              </span>
            </div>

            {tab === 'register' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-medium text-[#261d2e] mb-1">
                  Nome ou apelido
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#7c6f88] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    placeholder="Ex: Maria R."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-[#261d2e] mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7c6f88] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-[#261d2e] mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7c6f88] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-[#fbf2f4] border border-[#e7cbd3] rounded-xl text-xs text-[#7f3347] flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{authError}</span>
              </div>
            )}

            {tab === 'register' && (
              <div className="p-3 bg-[#f3eef8] border border-[#ddd1ea] rounded-xl text-xs text-[#493d54] space-y-2">
                <p>
                  Este ambiente é voltado ao acolhimento e apoio a mulheres em situação de assédio.
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declarationChecked}
                    onChange={(e) => setDeclarationChecked(e.target.checked)}
                    className="w-4 h-4 accent-[#6d4c82] rounded"
                  />
                  <span>Concordo com as diretrizes de uso seguro.</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={tab === 'register' && !declarationChecked}
              className="w-full min-h-[44px] py-2.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {tab === 'login' ? 'Entrar' : 'Criar perfil local'}
            </button>

            {tab === 'login' && (
              <div className="pt-2 border-t border-[#efe9f4]">
                <button
                  type="button"
                  onClick={handleQuickAdminFill}
                  className="w-full min-h-[44px] py-2 bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#4f3461] rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Preencher acesso administrativo (demo)</span>
                </button>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-4 py-1">
            <div className="p-4 bg-[#f3eef8] border border-[#ddd1ea] rounded-xl text-xs sm:text-sm text-[#493d54] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#261d2e]">
                <Check className="w-4 h-4 text-[#6d4c82]" aria-hidden="true" />
                <span>Nenhum dado pessoal será solicitado</span>
              </div>
              <p>
                Você pode navegar, ler todas as orientações e salvar relatos com protocolo e PIN sem criar conta.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full min-h-[44px] py-2.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Continuar sem cadastro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
