import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, User as UserIcon, X, Check, KeyRound, AlertTriangle } from 'lucide-react';
import { verifyAdminCredentials, createAdminUser, getAdminConfig, isUserBlocked } from '../lib/adminAuth';
import { addAccessLog } from '../lib/accessLogs';

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

  if (!isOpen) return null;

  const handleQuickAdminFill = () => {
    const adminCfg = getAdminConfig();
    setEmail(adminCfg.email);
    setPassword(adminCfg.password);
    setTab('login');
    setAuthError(null);
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
            onClick={() => setTab('login')}
            className={`min-h-[40px] rounded-lg transition-colors cursor-pointer ${
              tab === 'login' ? 'bg-white text-[#261d2e] font-semibold shadow-xs' : 'text-[#5a4e66] hover:text-[#261d2e]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`min-h-[40px] rounded-lg transition-colors cursor-pointer ${
              tab === 'register' ? 'bg-white text-[#261d2e] font-semibold shadow-xs' : 'text-[#5a4e66] hover:text-[#261d2e]'
            }`}
          >
            Criar perfil
          </button>
          <button
            type="button"
            onClick={() => setTab('anonymous')}
            className={`min-h-[40px] rounded-lg transition-colors cursor-pointer ${
              tab === 'anonymous' ? 'bg-white text-[#261d2e] font-semibold shadow-xs' : 'text-[#5a4e66] hover:text-[#261d2e]'
            }`}
          >
            Anônimo
          </button>
        </div>

        {tab !== 'anonymous' ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
              <div className="p-3 bg-[#fbf2f4] border border-[#e7cbd3] rounded-xl text-xs text-[#7f3347] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
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
