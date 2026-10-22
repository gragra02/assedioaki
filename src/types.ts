export type HarassmentType = 
  | 'importunacao_sexual' 
  | 'assedio_sexual' 
  | 'assedio_moral'
  | 'perseguicao'
  | 'violencia_psicologica'
  | 'violencia_virtual';

export type LocationType = 
  | 'transporte_publico' 
  | 'trabalho' 
  | 'via_publica' 
  | 'escola_universidade' 
  | 'evento_festa' 
  | 'internet' 
  | 'local_privado' 
  | 'outro';

export type RiskLevel = 'baixo' | 'medio' | 'alto' | 'urgente' | 'leve' | 'moderado' | 'grave';

export type CaseStatus = 
  | 'registrada' 
  | 'em_analise' 
  | 'enviada_autoridade' 
  | 'acolhimento_ativo' 
  | 'concluida';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAnonymous: boolean;
  declarationAcceptedAt: string;
  authProvider: 'google' | 'email' | 'anonymous';
  role?: 'admin' | 'user';
  createdAt?: string;
  status?: 'ativo' | 'suspenso' | 'bloqueado';
}

export interface AccessLog {
  id: string;
  timestamp: string;
  userName: string;
  userEmail?: string;
  userRole: 'admin' | 'user' | 'anonymous';
  action: string;
  ip: string;
  timeZone: string;
  location: string;
  device: string;
  status: 'sucesso' | 'aviso' | 'bloqueado';
}

export interface ReportAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  dataUrl?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  note: string;
  actor: 'Sistema AssédioAki' | 'Sistema AssedioAki' | 'Equipe de Acolhimento' | 'Usuária' | 'Autoridade Policial';
}

export interface ReportComment {
  id: string;
  reportId: string;
  authorName: string;
  isAnonymous?: boolean;
  content: string;
  createdAt: string;
  ip?: string;
  timeZone?: string;
}

export interface Report {
  id: string; // e.g. ASK-2026-89412
  accessKey: string; // PIN for decryption/tracking
  isAnonymous: boolean;
  title: string;
  category: HarassmentType;
  locationType: LocationType;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  dateTime: string;
  periodOfDay: 'manha' | 'tarde' | 'noite' | 'madrugada';
  description: string;
  aggressorDetails?: string;
  witnesses?: string;
  riskLevel: RiskLevel;
  status: CaseStatus;
  forwardDestination?: string;
  createdAt: string;
  updatedAt: string;
  encryptedPayload?: string;
  encryptionHash?: string;
  timeline: TimelineEvent[];
  attachments?: ReportAttachment[];
  comments?: ReportComment[];
}

export interface SupportCenter {
  id: string;
  name: string;
  type: 'delegacia' | 'centro_acolhimento' | 'hospital' | 'defensoria' | 'central_policia';
  address: string;
  city: string;
  state: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  postalCode?: string;
  email?: string;
  ramal?: string;
  whatsapp?: string;
  website?: string;
}

export interface StateAuthorityConfig {
  stateCode: string;
  stateName: string;
  delegaciaVirtualUrl: string;
  deamInfo: string;
  deamPhone: string;
  whatsapp?: string;
}

export interface ReportDraft {
  savedAt: string;
  step: number;
  isAnonymous: boolean;
  category: HarassmentType;
  title: string;
  locationType: LocationType;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  dateTime: string;
  periodOfDay: 'manha' | 'tarde' | 'noite' | 'madrugada';
  description: string;
  aggressorDetails: string;
  witnesses: string;
  riskLevel: RiskLevel;
  secretPin: string;
  attachmentName: string;
  reasonForPause?: 'aggressor_present' | 'quick_exit' | 'user_pause';
}

