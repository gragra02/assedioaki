import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, User as UserIcon, ShieldAlert, Sparkles, X, Check, KeyRound, AlertTriangle } from 'lucide-react';
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

  const handleGoogleAuth = () => {
    // Simulate Google Sign-In with real profile structure
    const googleUser: User = {
      id: 'usr-google-' + Date.now(),
      name: 'Maria Clara Silva',
      email: 'maria.clara@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isAnonymous: false,
      role: 'user',
      declarationAcceptedAt: new Date().toISOString(),
      authProvider: 'google'
    };
    addAccessLog('Autenticação com Google Realizada', googleUser.name, googleUser.email, 'user');
    onLoginSuccess(googleUser);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (tab === 'login') {
      const adminCfg = getAdminConfig();
      const isAdminAttempt = email.trim().toLowerCase() === adminCfg.email.trim().toLowerCase() || email.trim().toLowerCase() === 'admin';

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

      // Check if user is blocked
      if (isUserBlocked(email)) {
        addAccessLog(`Tentativa de Acesso com Conta Bloqueada: ${email}`, email, email, 'user', 'bloqueado');
        setAuthError('Esta conta foi bloqueada pela administração do sistema. O acesso está suspenso.');
        return;
      }

      // Normal user email login
      const loggedUser: User = {
        id: 'usr-email-' + Date.now(),
        name: email.split('@')[0] || 'Usuária Cadastrada',
        email: email,
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
        name: name || 'Usuária AssédioAki',
        email: email,
        isAnonymous: false,
        role: 'user',
        declarationAcceptedAt: new Date().toISOString(),
        authProvider: 'email'
      };
      addAccessLog('Novo Cadastro de Usuária Realizado', newUser.name, newUser.email, 'user');
      onLoginSuccess(newUser);
    } else {
      // Guest / Anonymous user
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-purple-950/50 space-y-5 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-white font-heading">Acesse sua Conta Segura</h3>
          <p className="text-xs text-slate-400">Suas denúncias e dados são mantidos sob absoluto sigilo.</p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTab('login')}
            className={`py-2 rounded-lg transition-all ${
              tab === 'login' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setTab('register')}
            className={`py-2 rounded-lg transition-all ${
              tab === 'register' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cadastrar
          </button>
          <button
            onClick={() => setTab('anonymous')}
            className={`py-2 rounded-lg transition-all ${
              tab === 'anonymous' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Anônimo
          </button>
        </div>

        {/* Google Authentication Button */}
        {tab !== 'anonymous' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-xs border border-slate-200 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar com Conta Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-medium">ou com seu e-mail</span>
            </div>
          </div>
        )}

        {/* Email Form */}
        {tab !== 'anonymous' ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Seu Nome ou Pseudônimo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input 
                    type="text"
                    required
                    placeholder="Ex: Amanda R."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">Senha Segura</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {tab === 'register' && (
              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-[11px] text-purple-200 space-y-2">
                <p className="font-semibold text-purple-300">
                  "Esta plataforma é um espaço seguro voltado ao acolhimento de mulheres e vítimas de violência de gênero."
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={declarationChecked}
                    onChange={(e) => setDeclarationChecked(e.target.checked)}
                    className="accent-purple-500 rounded"
                  />
                  <span>Declaro concordar com a declaração de uso seguro.</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={tab === 'register' && !declarationChecked}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {tab === 'login' ? 'Entrar no Sistema' : 'Criar Conta Segura'}
            </button>

            {tab === 'login' && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleQuickAdminFill}
                  className="w-full py-2 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  <span>Preencher Acesso Administrador (admin123)</span>
                </button>
              </div>
            )}
          </form>
        ) : (
          /* Anonymous guest tab */
          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <Check className="w-4 h-4" />
                <span>Nenhum dado pessoal será exigido</span>
              </div>
              <p>
                Você receberá uma chave secreta exclusiva para visualizar e acompanhar suas denúncias sem necessidade de cadastro ou e-mail.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Continuar como Usuária Anônima</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
