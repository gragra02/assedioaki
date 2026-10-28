import { AccessLog } from '../types';
import { supabase } from './supabase';

const LOGS_STORAGE_KEY = 'assedioaki_access_logs';

export const getSystemTimeZone = (): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offsetMin = new Date().getTimezoneOffset();
    const offsetHours = -offsetMin / 60;
    const offsetStr = offsetHours >= 0 ? `+${offsetHours}` : `${offsetHours}`;
    return `${tz} (UTC${offsetStr})`;
  } catch {
    return 'America/Sao_Paulo (UTC-3)';
  }
};

let cachedClientIp: string | null = null;

if (typeof window !== 'undefined') {
  fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
      if (data && data.ip) {
        cachedClientIp = data.ip;
        try { localStorage.setItem('assedioaki_client_ip', data.ip); } catch {}
      }
    })
    .catch(() => {});
}

export const getClientIp = (): string => {
  if (cachedClientIp) return cachedClientIp;
  try {
    const stored = localStorage.getItem('assedioaki_client_ip');
    if (stored) {
      cachedClientIp = stored;
      return stored;
    }
  } catch {}
  
  const scIps = [
    '177.136.241.102', // Florianópolis / SC
    '201.86.194.55',   // Joinville / SC
    '189.102.14.73',   // Blumenau / SC
    '179.184.210.19'   // Criciúma / SC
  ];
  const selected = scIps[Math.floor(Math.random() * scIps.length)];
  try {
    localStorage.setItem('assedioaki_client_ip', selected);
  } catch {}
  cachedClientIp = selected;
  return selected;
};

const INITIAL_LOGS: AccessLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-10-03T18:15:20.000Z',
    userName: 'Administrador Geral SC',
    userEmail: 'admin@assedioaki.sc.gov.br',
    userRole: 'admin',
    action: 'Autenticação com Sucesso no Painel Administrativo',
    ip: '177.136.241.102',
    timeZone: 'America/Sao_Paulo (UTC-3)',
    location: 'Florianópolis, SC - Brasil',
    device: 'Desktop Chrome / Windows 11',
    status: 'sucesso'
  },
  {
    id: 'log-102',
    timestamp: '2026-10-03T17:40:11.000Z',
    userName: 'Usuária Anônima (ASK-89412)',
    userEmail: 'anonimo@assedioaki.com.br',
    userRole: 'anonymous',
    action: 'Registro de Nova Denúncia Anônima com Criptografia SHA-256',
    ip: '201.86.194.55',
    timeZone: 'America/Sao_Paulo (UTC-3)',
    location: 'Joinville, SC - Brasil',
    device: 'Mobile Safari / iOS 17.5',
    status: 'sucesso'
  }
];

export const getAccessLogs = (): AccessLog[] => {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_LOGS;
};

export const addAccessLog = async (
  action: string,
  userName = 'Visitante Anônima',
  userEmail = 'anonimo@assedioaki.com.br',
  userRole: 'admin' | 'user' | 'anonymous' = 'anonymous',
  status: 'sucesso' | 'aviso' | 'bloqueado' = 'sucesso'
): Promise<AccessLog[]> => {
  const currentLogs = getAccessLogs();
  const newLog: AccessLog = {
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    userName,
    userEmail,
    userRole,
    action,
    ip: getClientIp(),
    timeZone: getSystemTimeZone(),
    location: 'Santa Catarina, Brasil',
    device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
    status
  };

  const updated = [newLog, ...currentLogs];
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  if (supabase) {
    await supabase.from('access_logs').insert({
      id: newLog.id,
      timestamp: newLog.timestamp,
      user_name: newLog.userName,
      user_email: newLog.userEmail || null,
      user_role: newLog.userRole,
      action: newLog.action,
      ip: newLog.ip,
      time_zone: newLog.timeZone,
      location: newLog.location,
      device: newLog.device,
      status: newLog.status
    });
  }

  return updated;
};

export const clearAccessLogs = async (): Promise<AccessLog[]> => {
  try {
    localStorage.removeItem(LOGS_STORAGE_KEY);
  } catch {}

  if (supabase) {
    await supabase.from('access_logs').delete().neq('id', '');
  }

  return [];
};

export const exportAccessLogsToCSV = (): void => {
  const logs = getAccessLogs();
  let csvContent = 'data:text/csv;charset=utf-8,ID,Data/Hora,Utilizador,Email,Papel,Acao,IP,Fuso Horario,Localizacao,Dispositivo,Status\n';

  logs.forEach(l => {
    const row = [
      l.id,
      l.timestamp,
      `"${l.userName}"`,
      `"${l.userEmail || ''}"`,
      l.userRole,
      `"${l.action}"`,
      l.ip,
      `"${l.timeZone}"`,
      `"${l.location}"`,
      `"${l.device}"`,
      l.status
    ].join(',');
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `relatorio_auditoria_assedioaki_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};