import { User } from '../types';
import { supabase } from './supabase';
import { addAccessLog } from './accessLogs';

const ADMIN_STORAGE_KEY = 'assedioaki_admin_config';

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
  addAccessLog('Alteração de Senha do Administrador Realizada com Sucesso', current.name, current.email, 'admin', 'sucesso');
  return { success: true, message: 'Senha de administrador alterada com sucesso.' };
};

export const getRegisteredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem('assedioaki_db_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_USERS;
};

export const saveRegisteredUser = async (user: User): Promise<void> => {
  const current = getRegisteredUsers();
  const existingIndex = current.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
  
  let updated: User[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...current[existingIndex], ...user };
  } else {
    const userWithMeta: User = {
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
      status: user.status || 'ativo'
    };
    updated = [userWithMeta, ...current];
  }

  try {
    localStorage.setItem('assedioaki_db_users', JSON.stringify(updated));
  } catch {}

  if (supabase) {
    await supabase.from('users').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      is_anonymous: user.isAnonymous,
      declaration_accepted_at: user.declarationAcceptedAt,
      auth_provider: user.authProvider,
      role: user.role || 'user',
      status: user.status || 'ativo'
    });
  }
};

export const toggleUserBlockStatus = async (userId: string): Promise<User[]> => {
  const current = getRegisteredUsers();
  const updated = current.map(u => {
    if (u.id === userId) {
      const newStatus = u.status === 'bloqueado' ? 'ativo' : 'bloqueado';
      const modified = { ...u, status: newStatus as 'ativo' | 'bloqueado' };
      if (supabase) {
        supabase.from('users').update({ status: newStatus }).eq('id', userId);
      }
      return modified;
    }
    return u;
  });

  try {
    localStorage.setItem('assedioaki_db_users', JSON.stringify(updated));
  } catch {}
  return updated;
};

export const deleteUserById = async (userId: string): Promise<User[]> => {
  const current = getRegisteredUsers();
  const updated = current.filter(u => u.id !== userId);
  try {
    localStorage.setItem('assedioaki_db_users', JSON.stringify(updated));
  } catch {}

  if (supabase) {
    await supabase.from('users').delete().eq('id', userId);
  }
  return updated;
};

export const isUserBlocked = (email: string): boolean => {
  const users = getRegisteredUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return found?.status === 'bloqueado';
};

export const createAdminUser = (): User => {
  const adminCfg = getAdminConfig();
  const adminUser: User = {
    id: 'usr-admin-master',
    name: adminCfg.name,
    email: adminCfg.email,
    isAnonymous: false,
    role: 'admin',
    authProvider: 'email',
    declarationAcceptedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'ativo'
  };
  saveRegisteredUser(adminUser);
  return adminUser;
};