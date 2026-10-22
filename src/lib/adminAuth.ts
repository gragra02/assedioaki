import { User } from '../types';
import { addAccessLog } from './accessLogs';

const ADMIN_STORAGE_KEY = 'assedioaki_admin_config';
const USERS_STORAGE_KEY = 'assedioaki_registered_users';

export interface AdminConfig {
  email: string;
  password: string; // Senha padrão: admin123
  name: string;
  updatedAt: string;
}

const DEFAULT_ADMIN: AdminConfig = {
  email: 'admin@assedioaki.sc.gov.br',
  password: 'admin123',
  name: 'Administrador Geral SC',
  updatedAt: new Date().toISOString()
};

const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Administrador Geral SC',
    email: 'admin@assedioaki.sc.gov.br',
    isAnonymous: false,
    role: 'admin',
    authProvider: 'email',
    declarationAcceptedAt: '2026-08-01T08:00:00.000Z',
    createdAt: '2026-08-01T08:00:00.000Z',
    status: 'ativo'
  },
  {
    id: 'usr-google-maria',
    name: 'Maria Clara Silva',
    email: 'maria.clara@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isAnonymous: false,
    role: 'user',
    authProvider: 'google',
    declarationAcceptedAt: '2026-09-12T14:22:10.000Z',
    createdAt: '2026-09-12T14:20:00.000Z',
    status: 'ativo'
  },
  {
    id: 'usr-reg-amanda',
    name: 'Amanda R.',
    email: 'amanda.rodrigues@hotmail.com',
    isAnonymous: false,
    role: 'user',
    authProvider: 'email',
    declarationAcceptedAt: '2026-09-20T10:15:00.000Z',
    createdAt: '2026-09-20T10:14:00.000Z',
    status: 'ativo'
  },
  {
    id: 'usr-reg-camila',
    name: 'Camila Souza',
    email: 'camila.florianopolis@gmail.com',
    isAnonymous: false,
    role: 'user',
    authProvider: 'email',
    declarationAcceptedAt: '2026-09-28T18:45:00.000Z',
    createdAt: '2026-09-28T18:40:00.000Z',
    status: 'ativo'
  },
  {
    id: 'usr-reg-juliana',
    name: 'Juliana Mendes',
    email: 'juliana.mendes.sc@outlook.com',
    isAnonymous: false,
    role: 'user',
    authProvider: 'email',
    declarationAcceptedAt: '2026-10-01T11:30:00.000Z',
    createdAt: '2026-10-01T11:25:00.000Z',
    status: 'ativo'
  }
];

export const getAdminConfig = (): AdminConfig => {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Erro ao ler admin config:', err);
  }
  return DEFAULT_ADMIN;
};

export const saveAdminConfig = (cfg: AdminConfig): void => {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(cfg));
  } catch (err) {
    console.error('Erro ao salvar admin config:', err);
  }
};

export const verifyAdminCredentials = (emailInput: string, passwordInput: string): boolean => {
  const current = getAdminConfig();
  const normalizedEmail = emailInput.trim().toLowerCase();
  const adminEmail = current.email.trim().toLowerCase();
  
  // Accept standard admin email or short alias "admin"
  const isEmailMatch = normalizedEmail === adminEmail || normalizedEmail === 'admin' || normalizedEmail === 'admin@assedioaki.com.br';
  const isPassMatch = passwordInput === current.password;
  
  return isEmailMatch && isPassMatch;
};

export const changeAdminPassword = (
  currentPasswordInput: string,
  newPasswordInput: string
): { success: boolean; message: string } => {
  const current = getAdminConfig();

  if (currentPasswordInput !== current.password) {
    return { success: false, message: 'A senha atual informada está incorreta.' };
  }

  if (!newPasswordInput || newPasswordInput.trim().length < 6) {
    return { success: false, message: 'A nova senha deve possuir no mínimo 6 caracteres.' };
  }

  const updated: AdminConfig = {
    ...current,
    password: newPasswordInput.trim(),
    updatedAt: new Date().toISOString()
  };

  saveAdminConfig(updated);
  addAccessLog('Alteração de Senha do Administrador Realizada com Sucesso', current.name, current.email, 'admin');

  return { success: true, message: 'Senha do administrador alterada com sucesso!' };
};

export const createAdminUser = (): User => {
  const current = getAdminConfig();
  return {
    id: 'usr-admin-master',
    name: current.name,
    email: current.email,
    isAnonymous: false,
    role: 'admin',
    declarationAcceptedAt: new Date().toISOString(),
    authProvider: 'email',
    status: 'ativo'
  };
};

export const getRegisteredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler usuários:', err);
  }
  return INITIAL_USERS;
};

export const saveRegisteredUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Erro ao salvar usuários:', err);
  }
};

export const deleteUserById = (userId: string): { success: boolean; message: string } => {
  const current = getRegisteredUsers();
  const target = current.find(u => u.id === userId);

  if (!target) {
    return { success: false, message: 'Usuário não encontrado.' };
  }

  if (target.role === 'admin' && userId === 'usr-admin-1') {
    return { success: false, message: 'Não é permitido excluir a conta do Administrador Geral.' };
  }

  const filtered = current.filter(u => u.id !== userId);
  saveRegisteredUsers(filtered);

  addAccessLog(`Exclusão do Usuário: ${target.name} (${target.email})`, 'Administrador Geral SC', 'admin@assedioaki.sc.gov.br', 'admin');

  return { success: true, message: `Usuário ${target.name} excluído com sucesso!` };
};

export const toggleUserBlockStatus = (userId: string): { success: boolean; message: string; newStatus: 'ativo' | 'bloqueado' } => {
  const current = getRegisteredUsers();
  const target = current.find(u => u.id === userId);

  if (!target) {
    return { success: false, message: 'Usuário não encontrado.', newStatus: 'ativo' };
  }

  if (target.role === 'admin' || target.id === 'usr-admin-1' || target.id === 'usr-admin-master') {
    return { success: false, message: 'Não é permitido bloquear a conta do Administrador Geral.', newStatus: 'ativo' };
  }

  const nextStatus: 'ativo' | 'bloqueado' = target.status === 'bloqueado' ? 'ativo' : 'bloqueado';

  const updatedUsers = current.map(u => {
    if (u.id === userId) {
      return { ...u, status: nextStatus };
    }
    return u;
  });

  saveRegisteredUsers(updatedUsers);

  const actionText = nextStatus === 'bloqueado' 
    ? `Bloqueio do Usuário Efetivado: ${target.name} (${target.email})`
    : `Desbloqueio do Usuário Efetivado: ${target.name} (${target.email})`;

  addAccessLog(
    actionText, 
    'Administrador Geral SC', 
    'admin@assedioaki.sc.gov.br', 
    'admin', 
    nextStatus === 'bloqueado' ? 'aviso' : 'sucesso'
  );

  const message = nextStatus === 'bloqueado'
    ? `Usuário ${target.name} foi bloqueado com sucesso! O acesso desta conta está suspenso.`
    : `Usuário ${target.name} foi desbloqueado com sucesso!`;

  return { success: true, message, newStatus: nextStatus };
};

export const isUserBlocked = (email: string): boolean => {
  const users = getRegisteredUsers();
  const found = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
  return found ? found.status === 'bloqueado' : false;
};
