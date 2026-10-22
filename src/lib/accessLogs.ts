import { AccessLog } from '../types';

const LOGS_STORAGE_KEY = 'assedioaki_access_logs';

// Detecção dinâmica de Time Zone
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

// Detecção ou geração consistente de IP de cliente
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
  
  // IPs públicos típicos de operadoras de Santa Catarina (Claro, Vivo, Unifique)
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

// Histórico inicial de logs de acesso
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
  },
  {
    id: 'log-103',
    timestamp: '2026-10-03T16:22:05.000Z',
    userName: 'Maria Clara Silva',
    userEmail: 'maria.clara@gmail.com',
    userRole: 'user',
    action: 'Consulta ao Mapa de Calor e DPCAMI / DEAM de Florianópolis',
    ip: '177.136.241.102',
    timeZone: 'America/Sao_Paulo (UTC-3)',
    location: 'Florianópolis, SC - Brasil',
    device: 'Desktop Firefox / Ubuntu Linux',
    status: 'sucesso'
  },
  {
    id: 'log-104',
    timestamp: '2026-10-03T15:05:44.000Z',
    userName: 'Visitante Não Identificada',
    userEmail: 'acesso.externo@sc.gov.br',
    userRole: 'anonymous',
    action: 'Acesso à Página Inicial e Declaração de Uso Seguro Aceita',
    ip: '189.102.14.73',
    timeZone: 'America/Sao_Paulo (UTC-3)',
    location: 'Blumenau, SC - Brasil',
    device: 'Mobile Chrome / Android 14',
    status: 'sucesso'
  },
  {
    id: 'log-105',
    timestamp: '2026-10-03T14:18:30.000Z',
    userName: 'Amanda R.',
    userEmail: 'amanda.rodrigues@hotmail.com',
    userRole: 'user',
    action: 'Envio de Mensagem de Apoio Comunitário na Denúncia ASK-90412',
    ip: '179.184.210.19',
    timeZone: 'America/Sao_Paulo (UTC-3)',
    location: 'Criciúma, SC - Brasil',
    device: 'Desktop Edge / Windows 10',
    status: 'sucesso'
  }
];

export const getAccessLogs = (): AccessLog[] => {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler logs de acesso:', err);
  }
  return INITIAL_LOGS;
};

export const saveAccessLogs = (logs: AccessLog[]): void => {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Erro ao salvar logs de acesso:', err);
  }
};

export const addAccessLog = (
  action: string,
  userName = 'Usuária Anônima',
  userEmail = 'anonimo@assedioaki.com.br',
  userRole: 'admin' | 'user' | 'anonymous' = 'anonymous',
  status: 'sucesso' | 'aviso' | 'bloqueado' = 'sucesso'
): AccessLog => {
  const current = getAccessLogs();
  const timeZone = getSystemTimeZone();
  const ip = getClientIp();

  let location = 'Santa Catarina, Brasil';
  if (ip.startsWith('177.')) location = 'Florianópolis, SC - Brasil';
  else if (ip.startsWith('201.')) location = 'Joinville, SC - Brasil';
  else if (ip.startsWith('189.')) location = 'Blumenau, SC - Brasil';
  else if (ip.startsWith('179.')) location = 'Criciúma, SC - Brasil';

  let device = 'Navegador Web';
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    if (ua.includes('iPhone') || ua.includes('iPad')) device = 'Mobile Safari / iOS';
    else if (ua.includes('Android')) device = 'Mobile Chrome / Android';
    else if (ua.includes('Windows')) device = 'Desktop Chrome / Windows';
    else if (ua.includes('Macintosh')) device = 'Desktop Safari / macOS';
    else if (ua.includes('Linux')) device = 'Desktop Browser / Linux';
  }

  const newLog: AccessLog = {
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    userName,
    userEmail,
    userRole,
    action,
    ip,
    timeZone,
    location,
    device,
    status
  };

  const updated = [newLog, ...current].slice(0, 300); // keep latest 300 logs
  saveAccessLogs(updated);
  return newLog;
};

export const clearAccessLogs = (): void => {
  saveAccessLogs([]);
};

export const exportAccessLogsToCSV = (logs: AccessLog[]): void => {
  const headers = [
    'ID Log',
    'Data e Hora (ISO)',
    'Data e Hora Formatada (pt-BR)',
    'Usuário / Identificação',
    'E-mail',
    'Papel (Role)',
    'Ação Executada',
    'Endereço IP',
    'Fuso Horário (Time Zone)',
    'Localidade Estimada',
    'Dispositivo / Sistema Operacional',
    'Status'
  ];

  const rows = logs.map(log => {
    const formattedDate = new Date(log.timestamp).toLocaleString('pt-BR');
    return [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${formattedDate}"`,
      `"${log.userName.replace(/"/g, '""')}"`,
      `"${(log.userEmail || '').replace(/"/g, '""')}"`,
      `"${log.userRole}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.ip}"`,
      `"${log.timeZone}"`,
      `"${log.location}"`,
      `"${log.device}"`,
      `"${log.status}"`
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const nowStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_auditoria_logs_assedioaki_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
