export type HarassmentType = 
  | 'importunacao_sexual' 
  | 'estupro'
  | 'assedio_sexual' 
  | 'assedio_moral'
  | 'perseguicao'
  | 'violencia_psicologica'
  | 'violencia_virtual';

export type SocialPlatformType =
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'telegram'
  | 'discord'
  | 'outros';

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

export type ReportLocationMode = 'real_approximate' | 'fictitious';

export interface Report {
  id: string; // e.g. ASK-2026-89412
  accessKey: string; // PIN for decryption/tracking
  isAnonymous: boolean;
  locationMode?: ReportLocationMode;
  title: string;
  category: HarassmentType;
  isOnlineStalking?: boolean;
  socialPlatform?: SocialPlatformType;
  socialPlatforms?: SocialPlatformType[];
  socialPlatformOther?: string;
  aggressorProfile?: string;
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
  hasLocationOffset?: boolean;
  locationOffsetMeters?: number;
  hideLocation?: boolean;
  registeredByCurrentUser?: boolean;
  authorUserId?: string;
  authorEmail?: string;
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
  locationMode?: ReportLocationMode;
  category: HarassmentType;
  isOnlineStalking?: boolean;
  socialPlatform?: SocialPlatformType | '';
  socialPlatforms?: SocialPlatformType[];
  socialPlatformOther?: string;
  aggressorProfile?: string;
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
  locationPrivacyMode?: 'offset' | 'exact' | 'none' | null;
  locationOffsetMeters?: number;
}

export type CommunityCategory =
  | 'apoio_emocional'
  | 'compartilhar_experiencia'
  | 'alerta_regiao'
  | 'duvida_direitos'
  | 'superacao';

export type CommunityFlagReason =
  | 'dados_pessoais'
  | 'conteudo_ofensivo'
  | 'spam_propaganda'
  | 'risco_seguranca';

export interface CommunityReply {
  id: string;
  postId: string;
  authorId: string;
  authorLabel: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
  flagCount?: number;
  hiddenByModeration?: boolean;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorLabel: string;
  isAnonymous: boolean;
  category: CommunityCategory;
  title: string;
  content: string;
  city?: string;
  createdAt: string;
  supportCount: number;
  replies: CommunityReply[];
  flagCount: number;
  flagReasons: CommunityFlagReason[];
  moderationStatus: 'published' | 'flagged' | 'hidden';
}


