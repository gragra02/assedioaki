import React, { useState, useMemo } from 'react';
import { 
  X, HelpCircle, Mail, Info, HeartHandshake, Users, BookOpen, 
  CheckCircle2, Copy, Send, ChevronDown, ChevronUp, AlertTriangle, 
  ShieldCheck, ExternalLink, Scale, Heart,
  ShieldAlert, Search, AtSign, ArrowRight, FileText, MapPin, Clock, EyeOff, UserCheck,
  Pencil, Trash2
} from 'lucide-react';
import { SC_CITIES_NAMES } from '../lib/scCities';
import { PRIVACY_TRUTHS } from '../lib/guidanceContent';
import { Report, SocialPlatformType, User } from '../types';

export type MenuModalSection =
  | 'privacy'
  | 'identify'
  | 'suspect_profiles'
  | 'my_reports'
  | 'contact'
  | 'about'
  | 'donate'
  | 'volunteer'
  | 'faqs';

interface MenuModalProps {
  isOpen: boolean;
  initialSection?: MenuModalSection;
  reports?: Report[];
  myReportIds?: string[];
  currentUser?: User | null;
  onClose: () => void;
  onOpenReport?: () => void;
  onSelectReport?: (reportId: string) => void;
  onTrackReport?: (reportId: string) => void;
  onEditReport?: (report: Report) => void;
  onDeleteReport?: (reportId: string) => void;
}

const PLATFORM_LABELS: Record<SocialPlatformType, string> = {
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
  telegram: 'Telegram',
  discord: 'Discord',
  outros: 'Outros'
};

const SOCIAL_PLATFORMS_TO_MASK: SocialPlatformType[] = ['instagram', 'facebook', 'telegram', 'discord'];

const maskFourLettersInSocialProfile = (
  rawHandle: string,
  platforms: SocialPlatformType[]
): string => {
  if (!rawHandle || rawHandle === 'Perfil não informado (relato digital)') {
    return rawHandle;
  }
  const hasMaskedPlatform = platforms.some((p) => SOCIAL_PLATFORMS_TO_MASK.includes(p));
  if (!hasMaskedPlatform) {
    return rawHandle;
  }

  const noteMatch = rawHandle.match(/^(.+?)(\s+\([^)]+\))$/);
  const mainPart = noteMatch ? noteMatch[1] : rawHandle;
  const trailingNote = noteMatch ? noteMatch[2] : '';

  const maskTarget = (segment: string): string => {
    const letterMatches = Array.from(segment.matchAll(/\p{L}+/gu));
    if (letterMatches.length === 0) {
      return segment;
    }

    const longRun = letterMatches.find((m) => m[0].length >= 5);
    if (longRun && longRun.index !== undefined) {
      const word = longRun[0];
      const keepPrefixCount = word.length === 6 ? 2 : 1;
      const start = longRun.index + keepPrefixCount;
      return segment.slice(0, start) + '****' + segment.slice(start + 4);
    }

    let skippedFirstLetter = false;
    let replacedCount = 0;
    return Array.from(segment)
      .map((ch) => {
        if (/\p{L}/u.test(ch)) {
          if (!skippedFirstLetter) {
            skippedFirstLetter = true;
            return ch;
          }
          if (replacedCount < 4) {
            replacedCount += 1;
            return '*';
          }
        }
        return ch;
      })
      .join('');
  };

  if (/^(https?:\/\/|www\.)/i.test(mainPart)) {
    try {
      const normalized = /^https?:\/\//i.test(mainPart) ? mainPart : `https://${mainPart}`;
      const url = new URL(normalized);
      const parts = url.pathname.split('/');
      for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i]) {
          parts[i] = maskTarget(parts[i]);
          break;
        }
      }
      url.pathname = parts.join('/');
      return url.toString() + trailingNote;
    } catch {
      // Mantém fluxo padrão caso a URL não seja válida
    }
  }

  return maskTarget(mainPart) + trailingNote;
};

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  initialSection = 'identify',
  reports = [],
  myReportIds = [],
  currentUser = null,
  onClose,
  onOpenReport,
  onSelectReport,
  onTrackReport,
  onEditReport,
  onDeleteReport
}) => {
  const [activeSection, setActiveSection] = useState<MenuModalSection>(initialSection);

  // Sync section when initialSection changes
  React.useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
    setConfirmDeleteReportId(null);
  }, [initialSection, isOpen]);

  // Quiz state for "Identifique o Tipo de Violência"
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>('importunacao');

  // Search & Filter state for "Perfis denunciados"
  const [suspectSearch, setSuspectSearch] = useState('');
  const [suspectPlatformFilter, setSuspectPlatformFilter] = useState<'all' | SocialPlatformType>('all');

  // Search & action state for "Meus relatos"
  const [myReportsSearch, setMyReportsSearch] = useState('');
  const [confirmDeleteReportId, setConfirmDeleteReportId] = useState<string | null>(null);
  const [deletedNotice, setDeletedNotice] = useState<string | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Dúvida sobre a Plataforma');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Volunteer form state
  const [volName, setVolName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volRole, setVolRole] = useState('Psicologia / Acolhimento');
  const [volCity, setVolCity] = useState('Florianópolis');
  const [volSent, setVolSent] = useState(false);

  // Donation state
  const [pixCopied, setPixCopied] = useState(false);
  const pixKey = 'apoie@assedioaki-sc.org.br';

  // FAQs state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const suspectProfiles = useMemo(() => {
    const getReportPlatforms = (r: Report): SocialPlatformType[] => {
      if (r.socialPlatforms && r.socialPlatforms.length > 0) return r.socialPlatforms;
      if (r.socialPlatform) return [r.socialPlatform];
      return [];
    };

    const formatPlatformName = (plat: SocialPlatformType, otherText?: string): string => {
      if (plat === 'outros') {
        return otherText?.trim() ? `Outros (${otherText.trim()})` : 'Outros';
      }
      return PLATFORM_LABELS[plat];
    };

    const digitalReports = reports.filter(
      (r) =>
        (r.category === 'violencia_virtual' || r.category === 'perseguicao' || r.locationType === 'internet') &&
        Boolean(r.aggressorProfile?.trim() || getReportPlatforms(r).length > 0)
    );

    const grouped = new Map<
      string,
      {
        key: string;
        profileHandle: string;
        platforms: SocialPlatformType[];
        platformLabel: string;
        categoryLabel: string;
        cities: string[];
        latestDate: string;
        latestReportId: string;
        reportIds: string[];
        count: number;
        summary: string;
        highestRisk: string;
      }
    >();

    digitalReports.forEach((rep) => {
      const handle = rep.aggressorProfile?.trim() || 'Perfil não informado (relato digital)';
      const repPlatforms = getReportPlatforms(rep);
      const platformLabelsList = repPlatforms.map((p) => formatPlatformName(p, rep.socialPlatformOther));

      const categoryLabel =
        rep.category === 'violencia_virtual'
          ? 'Violência virtual / exposição íntima'
          : rep.category === 'perseguicao'
          ? 'Perseguição online'
          : 'Assédio pela internet';

      const dedupKey = rep.aggressorProfile?.trim()
        ? handle.toLowerCase()
        : `anon::${rep.id}`;

      const existing = grouped.get(dedupKey);
      if (existing) {
        existing.count += 1;
        if (!existing.reportIds.includes(rep.id)) {
          existing.reportIds.push(rep.id);
        }
        repPlatforms.forEach((p) => {
          if (!existing.platforms.includes(p)) {
            existing.platforms.push(p);
          }
        });
        const mergedLabels = existing.platforms.map((p) =>
          formatPlatformName(p, p === 'outros' ? rep.socialPlatformOther : undefined)
        );
        existing.platformLabel = mergedLabels.length > 0 ? mergedLabels.join(', ') : 'Internet';
        if (!existing.cities.includes(rep.city)) {
          existing.cities.push(rep.city);
        }
        if (new Date(rep.dateTime || rep.createdAt) > new Date(existing.latestDate)) {
          existing.latestDate = rep.dateTime || rep.createdAt;
          existing.latestReportId = rep.id;
          existing.summary = rep.title || rep.description;
        }
      } else {
        grouped.set(dedupKey, {
          key: dedupKey,
          profileHandle: handle,
          platforms: [...repPlatforms],
          platformLabel: platformLabelsList.length > 0 ? platformLabelsList.join(', ') : 'Internet',
          categoryLabel,
          cities: [rep.city],
          latestDate: rep.dateTime || rep.createdAt,
          latestReportId: rep.id,
          reportIds: [rep.id],
          count: 1,
          summary: rep.title || rep.description,
          highestRisk: rep.riskLevel
        });
      }
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        profileHandle: maskFourLettersInSocialProfile(item.profileHandle, item.platforms)
      }))
      .sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
  }, [reports]);

  const filteredSuspectProfiles = useMemo(() => {
    const q = suspectSearch.trim().toLowerCase();
    return suspectProfiles.filter((item) => {
      if (suspectPlatformFilter !== 'all' && !item.platforms.includes(suspectPlatformFilter)) {
        return false;
      }
      if (!q) return true;
      return (
        item.profileHandle.toLowerCase().includes(q) ||
        item.platformLabel.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.cities.some((c) => c.toLowerCase().includes(q)) ||
        item.summary.toLowerCase().includes(q)
      );
    });
  }, [suspectProfiles, suspectPlatformFilter, suspectSearch]);

  const myRegisteredReports = useMemo(() => {
    const q = myReportsSearch.trim().toLowerCase();
    const list = reports
      .filter((rep) => {
        if (rep.registeredByCurrentUser || myReportIds.includes(rep.id)) {
          return true;
        }
        if (currentUser && !currentUser.isAnonymous) {
          if (rep.authorUserId && rep.authorUserId === currentUser.id) return true;
          if (rep.authorEmail && rep.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
        }
        return false;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.dateTime).getTime() -
          new Date(a.createdAt || a.dateTime).getTime()
      );

    if (!q) return list;
    return list.filter(
      (rep) =>
        rep.id.toLowerCase().includes(q) ||
        rep.title.toLowerCase().includes(q) ||
        rep.city.toLowerCase().includes(q) ||
        rep.address.toLowerCase().includes(q) ||
        rep.description.toLowerCase().includes(q)
    );
  }, [reports, myReportIds, currentUser, myReportsSearch]);

  if (!isOpen) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
  };

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVolSent(true);
  };

  const menuNavItems: Array<{ id: MenuModalSection; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'my_reports', label: 'Meus relatos', icon: FileText },
    { id: 'suspect_profiles', label: 'Perfis denunciados', icon: ShieldAlert },
    { id: 'privacy', label: 'Privacidade e limites', icon: ShieldCheck },
    { id: 'identify', label: 'Identificar violência', icon: BookOpen },
    { id: 'about', label: 'Sobre o projeto', icon: Info },
    { id: 'faqs', label: 'Dúvidas frequentes', icon: HelpCircle },
    { id: 'contact', label: 'Contato', icon: Mail },
    { id: 'volunteer', label: 'Voluntariado', icon: Users },
    { id: 'donate', label: 'Apoiar', icon: HeartHandshake },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Informações e privacidade do aplicativo"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#261d2e]/45 backdrop-blur-xs"
    >
      <div
        className="bg-white border border-[#e6dfee] rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#6d4c82] text-white flex items-center justify-between border-b border-[#593c6b] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight font-heading">Informações e Privacidade</h3>
              <p className="text-xs text-[#f3eef8]">Assédio Aki · Santa Catarina</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-[#f3eef8] border-b border-[#e6dfee] px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {menuNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#6d4c82] text-white font-semibold'
                    : 'text-[#4f3461] hover:bg-white/70'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-[#261d2e] space-y-6">

          {/* SECTION 0: PRIVACIDADE E LIMITES */}
          {activeSection === 'privacy' && (
            <div className="space-y-5">
              <div className="border-b border-[#efe9f4] pb-3">
                <p className="text-xs font-semibold text-[#6d4c82]">Transparência e segurança digital</p>
                <h4 className="text-lg font-semibold text-[#261d2e] font-heading mt-0.5">
                  Como protegemos sua navegação e quais são os limites deste app
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRIVACY_TRUTHS.map((item) => (
                  <div key={item.title} className="p-4 rounded-xl bg-[#faf8fb] border border-[#e6dfee] space-y-1.5">
                    <h5 className="text-sm font-semibold text-[#261d2e]">{item.title}</h5>
                    <p className="text-xs sm:text-sm text-[#5a4e66] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* SECTION 1: IDENTIFIQUE O TIPO DE VIOLÊNCIA */}
          {activeSection === 'identify' && (
            <div className="space-y-5">
              <div className="border-b border-[#efe9f4] pb-3">
                <p className="text-xs font-semibold text-[#6d4c82]">
                  Entenda de forma simples
                </p>
                <h4 className="text-lg font-semibold text-[#261d2e] font-heading mt-0.5">
                  O que você viveu tem nome
                </h4>
                <p className="text-xs sm:text-sm text-[#5a4e66] mt-1">
                  Escolha abaixo a situação mais parecida com o que aconteceu para entender melhor como a lei protege você.
                </p>
              </div>

              {/* Selector Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'importunacao', title: 'Importunação sexual / Estupro', law: 'Arts. 215-A e 213 do Código Penal' },
                  { id: 'assedio_sexual', title: 'Assédio sexual', law: 'Art. 216-A do Código Penal' },
                  { id: 'assedio_moral', title: 'Assédio moral', law: 'CLT / Lei 8.112 / Código Civil' },
                  { id: 'stalking', title: 'Perseguição (Stalking)', law: 'Art. 147-A do Código Penal' },
                  { id: 'psicologica', title: 'Violência psicológica', law: 'Art. 147-B do Código Penal' },
                  { id: 'digital', title: 'Violência virtual / íntima', law: 'Art. 218-C do Código Penal' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIncidentType(item.id)}
                    aria-pressed={selectedIncidentType === item.id}
                    className={`min-h-[56px] p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      selectedIncidentType === item.id
                        ? 'border-[#6d4c82] bg-[#f3eef8] text-[#261d2e]'
                        : 'border-[#e6dfee] hover:bg-[#faf8fb] bg-white text-[#261d2e]'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-semibold text-[#261d2e]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#5a4e66] mt-0.5">{item.law}</p>
                  </button>
                ))}
              </div>

              {/* Diagnostic Box */}
              <div className="bg-[#faf8fb] border border-[#e6dfee] rounded-2xl p-4 sm:p-5 space-y-3">
                {selectedIncidentType === 'importunacao' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#8c3d52] font-semibold text-xs sm:text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>1. Importunação sexual (Art. 215-A · é crime)</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                        <strong>O que é:</strong> Qualquer ato de cunho sexual feito sem a sua permissão, sem uso de força física grave ou ameaça direta. A culpa nunca é sua.
                      </p>
                      <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                        <li>Toques sem permissão no ônibus, na rua ou em festas.</li>
                        <li>Beijo forçado, puxão pelo braço ou encoxada.</li>
                        <li>Mostrar partes íntimas ou fazer gestos obscenos para você.</li>
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-[#e6dfee] space-y-2">
                      <div className="flex items-center gap-2 text-[#7f3347] font-semibold text-xs sm:text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>2. Estupro (Arts. 213 e 217-A · crime grave)</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                        <strong>O que é:</strong> Qualquer ato sexual forçado com violência física, ameaça grave ou quando a pessoa não tinha condições de consentir (por exemplo, desacordada, dopada ou sob efeito forte de bebida).
                      </p>
                      <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                        <li>Relação ou ato sexual imposto mediante força, intimidação ou ameaça.</li>
                        <li>Qualquer ato praticado quando você não podia dizer sim ou se defender.</li>
                        <li><strong>Cuidado médico urgente:</strong> procure um hospital 24h o quanto antes (idealmente em até 72h para medicação preventiva gratuita) e, quando puder, o 190 ou uma DPCAMI / DEAM.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedIncidentType === 'assedio_sexual' && (
                  <>
                    <div className="flex items-center gap-2 text-[#8c3d52] font-semibold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Assédio sexual (no trabalho ou estudo)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>O que é:</strong> Quando alguém em posição de poder usa o cargo para pressionar você a aceitar investidas sexuais.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Chefe cobrando encontros em troca de vaga, promoção ou para não demitir você.</li>
                      <li>Professor prometendo nota ou aprovação em troca de algo íntimo.</li>
                      <li>Pressões ou chantagens ligadas ao seu trabalho ou curso.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'assedio_moral' && (
                  <>
                    <div className="flex items-center gap-2 text-[#6d4c82] font-semibold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Assédio moral no trabalho ou estudo</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>O que é:</strong> Humilhações, ofensas ou constrangimentos repetidos no ambiente de trabalho ou de ensino.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Gritos, apelidos ofensivos ou piadas que diminuem você na frente de outras pessoas.</li>
                      <li>Isolar você da equipe ou cobrar metas impossíveis de propósito.</li>
                      <li>Perseguição constante no dia a dia de trabalho ou aula.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'stalking' && (
                  <>
                    <div className="flex items-center gap-2 text-[#6d4c82] font-semibold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Perseguição insistente (Stalking)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>O que é:</strong> Seguir, vigiar ou procurar você sem parar, pessoalmente ou pela internet, tirando sua paz e liberdade.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Aparecer sempre na saída do seu trabalho, curso ou casa.</li>
                      <li>Ligar sem parar, criar perfis falsos ou mandar mensagens mesmo depois de um "não".</li>
                      <li>Mandar recados que dão medo ou presentes que você não pediu.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'psicologica' && (
                  <>
                    <div className="flex items-center gap-2 text-[#6d4c82] font-semibold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Violência psicológica</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>O que é:</strong> Machucar você emocionalmente, diminuir sua autoestima ou tentar controlar sua vida e suas escolhas.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Ameaças, humilhações, chantagens e afastar você de amigas ou família.</li>
                      <li>Controlar seu celular, sua roupa ou seu dinheiro, ou fazer você duvidar do que viu.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'digital' && (
                  <>
                    <div className="flex items-center gap-2 text-[#8c3d52] font-semibold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Exposição íntima sem permissão</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>O que é:</strong> Espalhar, postar ou mostrar fotos e vídeos íntimos seus sem a sua autorização — mesmo que você tenha enviado antes em confiança.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Vazar fotos ou vídeos em grupos ou redes sociais.</li>
                      <li>Ameaçar mostrar imagens íntimas para forçar você a fazer algo.</li>
                    </ul>
                  </>
                )}

                <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#e6dfee]">
                  <span className="text-xs text-[#5a4e66]">
                    Você pode contar e guardar o que viveu neste aplicativo quando se sentir segura.
                  </span>
                  {onOpenReport && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenReport();
                      }}
                      className="min-h-[44px] px-4 py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <span>Contar o que aconteceu</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1B: PERFIS DENUNCIADOS (PERSEGUIÇÃO / VIOLÊNCIA VIRTUAL) */}
          {activeSection === 'suspect_profiles' && (
            <div className="space-y-5">
              <div className="border-b border-[#efe9f4] pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-[#6d4c82]">
                    Prevenção digital em Santa Catarina
                  </span>
                  <h4 className="text-lg font-semibold text-[#261d2e] font-heading mt-0.5">
                    Perfis denunciados por perseguição ou violência virtual
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5a4e66] mt-1 max-w-2xl">
                    Contas e contatos citados em relatos de perseguição online, chantagem ou exposição íntima sem permissão. Parte das letras fica oculta por cuidado legal, e quem contou nunca é identificada.
                  </p>
                </div>
                {onOpenReport && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenReport();
                    }}
                    className="min-h-[44px] px-4 py-2 bg-[#b05c72] hover:bg-[#914358] text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Contar sobre um perfil
                  </button>
                )}
              </div>

              {/* Filter & Search Bar */}
              <div className="space-y-3 bg-[#faf8fb] border border-[#e6dfee] rounded-xl p-3.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#7c6f88] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    type="text"
                    value={suspectSearch}
                    onChange={(e) => setSuspectSearch(e.target.value)}
                    placeholder="Buscar por @perfil, aplicativo, cidade de SC ou resumo..."
                    className="w-full min-h-[42px] bg-white border border-[#e6dfee] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#261d2e]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'all', label: 'Todos os aplicativos' },
                      { id: 'whatsapp', label: 'WhatsApp' },
                      { id: 'instagram', label: 'Instagram' },
                      { id: 'facebook', label: 'Facebook' },
                      { id: 'telegram', label: 'Telegram' },
                      { id: 'discord', label: 'Discord' },
                      { id: 'outros', label: 'Outros' }
                    ] as const
                  ).map((plat) => (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => setSuspectPlatformFilter(plat.id)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        suspectPlatformFilter === plat.id
                          ? 'bg-[#6d4c82] text-white font-semibold'
                          : 'bg-white border border-[#e6dfee] text-[#493d54] hover:bg-[#f3eef8]'
                      }`}
                    >
                      {plat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gentle guidance notice */}
              <div className="p-3.5 bg-[#f3eef8] border border-[#ddd1ea] rounded-xl text-xs text-[#493d54] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#6d4c82] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="leading-relaxed">
                  <strong>Dica de proteção:</strong> se você passou por algo parecido, guarde prints das mensagens e links do perfil antes de bloquear. Isso ajuda muito caso decida fazer um Boletim de Ocorrência na DPCAMI ou Delegacia Virtual.
                </p>
              </div>

              {/* Results List */}
              {filteredSuspectProfiles.length === 0 ? (
                <div className="p-7 bg-[#faf8fb] border border-[#e6dfee] rounded-2xl text-center space-y-3">
                  <ShieldAlert className="w-8 h-8 text-[#7c6f88] mx-auto" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#261d2e]">
                      Nenhum perfil encontrado com este filtro
                    </p>
                    <p className="text-xs text-[#5a4e66] max-w-md mx-auto">
                      Tente limpar a busca ou escolher outro aplicativo. Quando alguém informa um perfil em um relato de perseguição online ou violência virtual, ele aparece aqui para alerta comunitário.
                    </p>
                  </div>
                  {(suspectSearch || suspectPlatformFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSuspectSearch('');
                        setSuspectPlatformFilter('all');
                      }}
                      className="min-h-[40px] px-4 py-1.5 bg-white border border-[#ddd1ea] hover:bg-[#f3eef8] text-[#4f3461] font-semibold rounded-xl text-xs cursor-pointer"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-[#efe9f4] border border-[#e6dfee] rounded-2xl bg-white overflow-hidden">
                  {filteredSuspectProfiles.map((item) => (
                    <div
                      key={item.key}
                      className="p-4 hover:bg-[#faf8fb] transition-colors space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectReport) {
                              onSelectReport(item.latestReportId);
                            }
                          }}
                          title="Toque para ver o relato ligado a este perfil"
                          className="group flex items-center gap-2 min-w-0 text-left cursor-pointer flex-wrap"
                        >
                          <AtSign className="w-4 h-4 text-[#b05c72] shrink-0" aria-hidden="true" />
                          <span className="text-sm font-semibold text-[#261d2e] group-hover:text-[#6d4c82] underline decoration-[#ddd1ea] group-hover:decoration-[#6d4c82] underline-offset-4 font-mono break-all transition-colors">
                            {item.profileHandle}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4f3461] bg-[#f3eef8] px-2.5 py-0.5 rounded-lg border border-[#ddd1ea] shrink-0">
                            <span>Ver no mapa</span>
                            <ArrowRight className="w-3 h-3" aria-hidden="true" />
                          </span>
                        </button>
                        <div className="flex items-center gap-2 text-xs text-[#5a4e66] tabular-nums shrink-0">
                          <span className="font-semibold text-[#4f3461]">{item.platformLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-[#7f3347]">
                            {item.count} {item.count === 1 ? 'relato' : 'relatos'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6b5e77] tabular-nums">
                        <span className="font-medium text-[#493d54]">{item.categoryLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.cities.join(', ')} (SC)</span>
                        <span aria-hidden="true">·</span>
                        <span>Último relato: {new Date(item.latestDate).toLocaleDateString('pt-BR')}</span>
                        {item.reportIds.length > 1 && onSelectReport && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex flex-wrap items-center gap-1.5">
                              <span>Códigos:</span>
                              {item.reportIds.map((repId) => (
                                <button
                                  key={repId}
                                  type="button"
                                  onClick={() => onSelectReport(repId)}
                                  className="font-mono font-semibold text-[#4f3461] hover:text-[#261d2e] underline cursor-pointer"
                                >
                                  {repId}
                                </button>
                              ))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 1C: MEUS RELATOS */}
          {activeSection === 'my_reports' && (
            <div className="space-y-5">
              <div className="border-b border-[#efe9f4] pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-[#6d4c82]">
                    Seus relatos neste espaço · Sigilo preservado
                  </span>
                  <h4 className="text-lg font-semibold text-[#261d2e] font-heading mt-0.5">
                    Meus relatos
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5a4e66] mt-1 max-w-2xl">
                    Veja, edite ou apague os relatos que você salvou aqui{currentUser && !currentUser.isAnonymous ? ` (${currentUser.name})` : ''}, no seu tempo e com privacidade.
                  </p>
                </div>
                {onOpenReport && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenReport();
                    }}
                    className="min-h-[44px] px-4 py-2 bg-[#b05c72] hover:bg-[#914358] text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    + Contar o que aconteceu
                  </button>
                )}
              </div>

              {deletedNotice && (
                <div className="p-3 bg-[#f1f6f3] border border-[#cde0d4] rounded-xl text-xs sm:text-sm text-[#26543b] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="font-medium">{deletedNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeletedNotice(null)}
                    className="p-1 cursor-pointer"
                    aria-label="Fechar aviso"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}

              {myRegisteredReports.length > 0 && (
                <div className="relative">
                  <Search className="w-4 h-4 text-[#7c6f88] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    type="text"
                    value={myReportsSearch}
                    onChange={(e) => setMyReportsSearch(e.target.value)}
                    placeholder="Buscar por código (ex: ASK-2026-...), título, cidade ou texto..."
                    className="w-full min-h-[42px] bg-[#faf8fb] border border-[#e6dfee] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#261d2e]"
                  />
                </div>
              )}

              {myRegisteredReports.length === 0 ? (
                <div className="p-8 bg-[#faf8fb] border border-[#e6dfee] rounded-2xl text-center space-y-3">
                  <FileText className="w-9 h-9 text-[#6d4c82] mx-auto" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#261d2e]">
                      {myReportsSearch.trim()
                        ? 'Nenhum relato encontrado com essa busca'
                        : 'Você ainda não salvou nenhum relato por aqui'}
                    </p>
                    <p className="text-xs text-[#5a4e66] max-w-md mx-auto leading-relaxed">
                      {myReportsSearch.trim()
                        ? 'Limpe o campo de busca para ver todos os relatos salvos por você.'
                        : 'Os relatos que você salvar (sem se identificar neste aparelho ou na sua conta) aparecem aqui para você consultar, editar ou apagar quando quiser.'}
                    </p>
                  </div>
                  {myReportsSearch.trim() ? (
                    <button
                      type="button"
                      onClick={() => setMyReportsSearch('')}
                      className="min-h-[40px] px-4 py-1.5 bg-white border border-[#ddd1ea] hover:bg-[#f3eef8] text-[#4f3461] font-semibold rounded-xl text-xs cursor-pointer"
                    >
                      Limpar busca
                    </button>
                  ) : onOpenReport ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenReport();
                      }}
                      className="min-h-[44px] px-4 py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold rounded-xl text-xs sm:text-sm cursor-pointer"
                    >
                      Contar o que aconteceu
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3">
                  {myRegisteredReports.map((rep) => {
                    const categoryPt =
                      rep.category === 'importunacao_sexual'
                        ? 'Importunação sexual'
                        : rep.category === 'estupro'
                        ? 'Estupro'
                        : rep.category === 'assedio_sexual'
                        ? 'Assédio sexual'
                        : rep.category === 'assedio_moral'
                        ? 'Assédio moral'
                        : rep.category === 'perseguicao'
                        ? 'Perseguição (stalking)'
                        : rep.category === 'violencia_psicologica'
                        ? 'Violência psicológica'
                        : 'Violência virtual';

                    const statusPt =
                      rep.status === 'concluida'
                        ? 'Concluído'
                        : rep.status === 'enviada_autoridade'
                        ? 'Encaminhado'
                        : rep.status === 'em_analise'
                        ? 'Em análise'
                        : rep.status === 'acolhimento_ativo'
                        ? 'Em acolhimento'
                        : 'Salvo no app';

                    const isGrave =
                      rep.riskLevel === 'grave' || rep.riskLevel === 'urgente' || rep.riskLevel === 'alto';
                    const isMedio = rep.riskLevel === 'medio' || rep.riskLevel === 'moderado';

                    return (
                      <div
                        key={rep.id}
                        className="p-4 bg-white border border-[#e6dfee] hover:border-[#ddd1ea] rounded-2xl transition-colors space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-mono font-semibold text-[#4f3461] bg-[#f3eef8] px-2.5 py-0.5 rounded-lg border border-[#ddd1ea]">
                              {rep.id}
                            </span>
                            <span className="text-xs font-medium text-[#493d54] bg-[#faf8fb] px-2.5 py-0.5 rounded-lg border border-[#e6dfee]">
                              {categoryPt}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
                              isGrave
                                ? 'bg-[#fbf2f4] text-[#7f3347] border-[#ead4dc]'
                                : isMedio
                                ? 'bg-[#faf5ee] text-[#6b4f2d] border-[#e8dcc8]'
                                : 'bg-[#f3eef8] text-[#4f3461] border-[#ddd1ea]'
                            }`}>
                              Nível {isGrave ? 'grave' : isMedio ? 'médio' : 'baixo'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <span className="inline-flex items-center gap-1 text-[#5a4e66] bg-[#faf8fb] border border-[#e6dfee] px-2.5 py-0.5 rounded-lg">
                              {rep.isAnonymous ? (
                                <>
                                  <EyeOff className="w-3 h-3 text-[#6d4c82]" aria-hidden="true" />
                                  <span>Sem identificação</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3 text-[#6d4c82]" aria-hidden="true" />
                                  <span>Com perfil</span>
                                </>
                              )}
                            </span>
                            <span className="text-[#26543b] bg-[#f1f6f3] border border-[#cde0d4] px-2.5 py-0.5 rounded-lg font-medium">
                              {statusPt}
                            </span>
                          </div>
                        </div>

                        <h5 className="text-sm font-semibold text-[#261d2e] font-heading">
                          {rep.title}
                        </h5>

                        <p className="text-xs sm:text-sm text-[#5a4e66] line-clamp-2 leading-relaxed">
                          {rep.description}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#efe9f4]">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6b5e77]">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#6d4c82] shrink-0" aria-hidden="true" />
                              <span>
                                {rep.hideLocation
                                  ? `${rep.address} (sem ponto no mapa)`
                                  : `${rep.address}, ${rep.city} (${rep.state})`}
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#6d4c82] shrink-0" aria-hidden="true" />
                              <span>{new Date(rep.dateTime || rep.createdAt).toLocaleString('pt-BR')}</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {onEditReport && (
                              <button
                                type="button"
                                onClick={() => onEditReport(rep)}
                                className="min-h-[36px] px-3 py-1.5 bg-[#faf8fb] hover:bg-[#f3eef8] text-[#4f3461] border border-[#ddd1ea] font-semibold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Editar</span>
                              </button>
                            )}
                            {onDeleteReport && (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDeleteReportId(
                                    confirmDeleteReportId === rep.id ? null : rep.id
                                  )
                                }
                                className="min-h-[36px] px-3 py-1.5 bg-[#fbf2f4] hover:bg-[#f4dfe5] text-[#7f3347] border border-[#e7cbd3] font-semibold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Apagar</span>
                              </button>
                            )}
                            {onSelectReport && (
                              <button
                                type="button"
                                onClick={() => onSelectReport(rep.id)}
                                className="min-h-[36px] px-3 py-1.5 bg-white hover:bg-[#faf8fb] text-[#4f3461] border border-[#e6dfee] font-medium text-xs rounded-xl transition-colors cursor-pointer"
                              >
                                Ver no mapa
                              </button>
                            )}
                            {onTrackReport && (
                              <button
                                type="button"
                                onClick={() => onTrackReport(rep.id)}
                                className="min-h-[36px] px-3.5 py-1.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <span>Acompanhar relato</span>
                                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </div>

                        {confirmDeleteReportId === rep.id && onDeleteReport && (
                          <div className="p-3.5 bg-[#fbf2f4] border border-[#e7cbd3] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-start gap-2 text-xs text-[#7f3347]">
                              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                              <span>
                                Quer mesmo apagar o relato <strong className="font-mono">{rep.id}</strong>? Ele será removido do aplicativo e do mapa.
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 justify-end">
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteReportId(null)}
                                className="min-h-[36px] px-3 py-1.5 bg-white hover:bg-[#faf8fb] text-[#493d54] border border-[#e6dfee] font-medium text-xs rounded-xl transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteReport(rep.id);
                                  setConfirmDeleteReportId(null);
                                  setDeletedNotice(`Relato ${rep.id} apagado com tranquilidade.`);
                                  setTimeout(() => setDeletedNotice(null), 4000);
                                }}
                                className="min-h-[36px] px-3.5 py-1.5 bg-[#b05c72] hover:bg-[#914358] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                              >
                                Sim, apagar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: ENTRE EM CONTATO */}
          {activeSection === 'contact' && (
            <div className="space-y-5">
              <div className="border-b border-[#efe9f4] pb-3">
                <p className="text-xs font-semibold text-[#6d4c82]">
                  Canal institucional
                </p>
                <h4 className="text-lg font-semibold text-[#261d2e] font-heading mt-0.5">
                  Contato com o projeto Assédio Aki
                </h4>
                <p className="text-xs sm:text-sm text-[#5a4e66] mt-1">
                  Para parcerias com prefeituras, universidades, conselhos municipais ou sugestões de melhoria em Santa Catarina.
                </p>
              </div>

              {contactSent ? (
                <div className="p-5 bg-[#faf8fb] border border-[#ddd1ea] rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#6d4c82] shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="space-y-1">
                      <h5 className="text-sm font-semibold text-[#261d2e]">
                        Mensagem preparada no seu aparelho
                      </h5>
                      <p className="text-xs sm:text-sm text-[#5a4e66]">
                        Este aplicativo não envia e-mails diretamente por servidor. Para enviar sua mensagem à equipe, abra no seu aplicativo de e-mail abaixo:
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:ouvidoria@assedioaki-sc.org.br?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(`Nome/Organização: ${contactName}\nE-mail de retorno: ${contactEmail}\n\n${contactMessage}`)}`}
                      className="min-h-[44px] px-4 py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      <span>Abrir no meu e-mail</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setContactSent(false)}
                      className="min-h-[44px] px-4 py-2 bg-white border border-[#ddd1ea] text-[#4f3461] font-medium rounded-xl text-xs sm:text-sm cursor-pointer"
                    >
                      Editar rascunho
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3.5 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="menu-contact-name" className="text-xs font-semibold text-[#261d2e]">
                        Seu nome ou organização
                      </label>
                      <input
                        id="menu-contact-name"
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ex: Coletivo / Maria"
                        className="w-full min-h-[44px] bg-[#faf8fb] border border-[#e6dfee] rounded-xl px-3 py-2 text-sm text-[#261d2e]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="menu-contact-email" className="text-xs font-semibold text-[#261d2e]">
                        E-mail para retorno
                      </label>
                      <input
                        id="menu-contact-email"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contato@exemplo.com.br"
                        className="w-full min-h-[44px] bg-[#faf8fb] border border-[#e6dfee] rounded-xl px-3 py-2 text-sm text-[#261d2e]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="menu-contact-subject" className="text-xs font-semibold text-[#261d2e]">
                      Assunto
                    </label>
                    <select
                      id="menu-contact-subject"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full min-h-[44px] bg-[#faf8fb] border border-[#e6dfee] rounded-xl px-3 py-2 text-sm text-[#261d2e]"
                    >
                      <option value="Dúvida sobre a Plataforma">Dúvida sobre o aplicativo</option>
                      <option value="Parceria Institucional ou Acadêmica">Parceria institucional ou acadêmica</option>
                      <option value="Integração com DPCAMI / Delegacia">Contato com rede de atendimento SC</option>
                      <option value="Sugestão de Melhoria ou Recurso">Sugestão de melhoria</option>
                      <option value="Contato de Imprensa / Mídia">Imprensa</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="menu-contact-message" className="text-xs font-semibold text-[#261d2e]">
                      Mensagem
                    </label>
                    <textarea
                      id="menu-contact-message"
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Escreva sua solicitação ou dúvida institucional (não envie dados sigilosos aqui)..."
                      className="w-full bg-[#faf8fb] border border-[#e6dfee] rounded-xl p-3 text-sm text-[#261d2e]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>Preparar e-mail de contato</span>
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-[#efe9f4] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-[#faf8fb] rounded-xl border border-[#e6dfee]">
                  <p className="font-semibold text-[#261d2e]">E-mail de referência</p>
                  <p className="text-xs text-[#5a4e66] mt-0.5">ouvidoria@assedioaki-sc.org.br</p>
                </div>
                <div className="p-3.5 bg-[#fbf2f4] rounded-xl border border-[#eed4dc]">
                  <p className="font-semibold text-[#261d2e]">Emergência imediata em SC</p>
                  <p className="text-xs text-[#7f3347] mt-0.5">Ligue 190 (PM) ou 180 (Central da Mulher)</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: SOBRE ASSEDIOAKI */}
          {activeSection === 'about' && (
            <div className="space-y-5">
              <div className="border-b border-[#efe9f4] pb-3">
                <p className="text-xs font-semibold text-[#6d4c82]">
                  Sobre o projeto
                </p>
                <h4 className="text-lg font-semibold text-[#261d2e] font-heading mt-0.5">
                  Assédio Aki · Santa Catarina
                </h4>
                <p className="text-xs sm:text-sm text-[#5a4e66] mt-1">
                  Tecnologia cidadã voltada ao acolhimento, informação e orientação de mulheres em Santa Catarina.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#493d54] leading-relaxed">
                <p>
                  O <strong>Assédio Aki</strong> reúne em um único lugar orientações claras sobre direitos, contatos oficiais de atendimento em Santa Catarina, mapa de delegacias e hospitais e uma ferramenta opcional de registro protegido por PIN.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 bg-[#faf8fb] border border-[#e6dfee] rounded-xl space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-[#6d4c82] text-white flex items-center justify-center font-semibold text-xs">
                      1
                    </div>
                    <p className="font-semibold text-[#261d2e] text-sm">Sem cadastro obrigatório</p>
                    <p className="text-xs text-[#5a4e66]">
                      Você lê todas as orientações e acessa os contatos oficiais sem informar nome, CPF ou e-mail.
                    </p>
                  </div>

                  <div className="p-4 bg-[#faf8fb] border border-[#e6dfee] rounded-xl space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-[#b05c72] text-white flex items-center justify-center font-semibold text-xs">
                      2
                    </div>
                    <p className="font-semibold text-[#261d2e] text-sm">Mapa preventivo em SC</p>
                    <p className="text-xs text-[#5a4e66]">
                      Visualização das 31 DPCAMIs, hospitais SAVIS 24h e áreas de risco em Santa Catarina.
                    </p>
                  </div>

                  <div className="p-4 bg-[#faf8fb] border border-[#e6dfee] rounded-xl space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-[#4f3461] text-white flex items-center justify-center font-semibold text-xs">
                      3
                    </div>
                    <p className="font-semibold text-[#261d2e] text-sm">Apoio para o B.O.</p>
                    <p className="text-xs text-[#5a4e66]">
                      Organizador de texto para facilitar o registro oficial na Delegacia Virtual de Santa Catarina.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: DOE PARA ASSEDIOAKI */}
          {activeSection === 'donate' && (
            <div className="space-y-5">
              <div className="border-b border-[#efe9f4] pb-3">
                <p className="text-xs font-semibold text-[#6d4c82]">
                  Sustentabilidade social
                </p>
                <h4 className="text-lg font-semibold text-[#261d2e] font-heading mt-0.5">
                  Apoie o Assédio Aki Santa Catarina
                </h4>
                <p className="text-xs sm:text-sm text-[#5a4e66] mt-1">
                  Contribuições voluntárias ajudam a manter ações educativas e materiais informativos para mulheres em SC.
                </p>
              </div>

              <div className="bg-[#f3eef8] border border-[#ddd1ea] rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs font-semibold text-[#4f3461]">Chave Pix de referência</p>
                    <p className="text-sm font-semibold text-[#261d2e] font-mono bg-white px-3 py-2 rounded-xl border border-[#ddd1ea] inline-block">
                      {pixKey}
                    </p>
                    <p className="text-xs text-[#5a4e66]">Assédio Aki SC Solidário</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="min-h-[44px] px-4 py-2.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                  >
                    {pixCopied ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                    <span>{pixCopied ? 'Chave Pix copiada' : 'Copiar chave Pix'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: SEJA VOLUNTÁRIO */}
          {activeSection === 'volunteer' && (
            <div className="space-y-5">
              <div className="border-b border-[#efe9f4] pb-3">
                <p className="text-xs font-semibold text-[#6d4c82]">
                  Rede de apoio
                </p>
                <h4 className="text-lg font-semibold text-[#261d2e] font-heading mt-0.5">
                  Quero ser voluntária(o)
                </h4>
                <p className="text-xs sm:text-sm text-[#5a4e66] mt-1">
                  Profissionais de psicologia, direito, serviço social, tecnologia e comunicação podem contribuir com a iniciativa.
                </p>
              </div>

              {volSent ? (
                <div className="p-5 bg-[#faf8fb] border border-[#ddd1ea] rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-[#b05c72] shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="space-y-1">
                      <h5 className="text-sm font-semibold text-[#261d2e]">Apresentação preparada</h5>
                      <p className="text-xs sm:text-sm text-[#5a4e66]">
                        Para enviar sua manifestação de voluntariado, abra o rascunho no seu aplicativo de e-mail abaixo:
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:ouvidoria@assedioaki-sc.org.br?subject=${encodeURIComponent(`Voluntariado - ${volRole} (${volCity}/SC)`)}&body=${encodeURIComponent(`Nome: ${volName}\nE-mail: ${volEmail}\nÁrea: ${volRole}\nCidade: ${volCity}/SC`)}`}
                      className="min-h-[44px] px-4 py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      <span>Enviar por e-mail</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setVolSent(false)}
                      className="min-h-[44px] px-4 py-2 bg-white border border-[#ddd1ea] text-[#4f3461] font-medium rounded-xl text-xs sm:text-sm cursor-pointer"
                    >
                      Voltar ao formulário
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleVolunteerSubmit} className="space-y-3.5 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="menu-vol-name" className="text-xs font-semibold text-[#261d2e]">
                        Seu nome completo
                      </label>
                      <input
                        id="menu-vol-name"
                        type="text"
                        value={volName}
                        onChange={(e) => setVolName(e.target.value)}
                        placeholder="Nome ou nome social"
                        className="w-full min-h-[44px] bg-[#faf8fb] border border-[#e6dfee] rounded-xl px-3 py-2 text-sm text-[#261d2e]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="menu-vol-email" className="text-xs font-semibold text-[#261d2e]">
                        Seu e-mail
                      </label>
                      <input
                        id="menu-vol-email"
                        type="email"
                        value={volEmail}
                        onChange={(e) => setVolEmail(e.target.value)}
                        placeholder="voce@email.com"
                        className="w-full min-h-[44px] bg-[#faf8fb] border border-[#e6dfee] rounded-xl px-3 py-2 text-sm text-[#261d2e]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="menu-vol-role" className="text-xs font-semibold text-[#261d2e]">
                        Área de atuação
                      </label>
                      <select
                        id="menu-vol-role"
                        value={volRole}
                        onChange={(e) => setVolRole(e.target.value)}
                        className="w-full min-h-[44px] bg-[#faf8fb] border border-[#e6dfee] rounded-xl px-3 py-2 text-sm text-[#261d2e]"
                      >
                        <option value="Psicologia / Acolhimento">Psicologia / Acolhimento</option>
                        <option value="Direito / Orientação jurídica">Direito / Orientação jurídica</option>
                        <option value="Serviço social">Serviço social</option>
                        <option value="Tecnologia e dados">Tecnologia e dados</option>
                        <option value="Comunicação">Comunicação</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="menu-vol-city" className="text-xs font-semibold text-[#261d2e]">
                        Município em SC
                      </label>
                      <select
                        id="menu-vol-city"
                        value={volCity}
                        onChange={(e) => setVolCity(e.target.value)}
                        className="w-full min-h-[44px] bg-[#faf8fb] border border-[#e6dfee] rounded-xl px-3 py-2 text-sm text-[#261d2e] cursor-pointer"
                      >
                        {SC_CITIES_NAMES.map((cName) => (
                          <option key={cName} value={cName}>{cName} (SC)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2.5 bg-[#b05c72] hover:bg-[#95485d] text-white font-semibold rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4" aria-hidden="true" />
                    <span>Preparar inscrição por e-mail</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SECTION 6: FAQS */}
          {activeSection === 'faqs' && (
            <div className="space-y-5">
              <div className="border-b border-[#efe9f4] pb-3">
                <p className="text-xs font-semibold text-[#6d4c82]">
                  Respostas simples
                </p>
                <h4 className="text-lg font-semibold text-[#261d2e] font-heading mt-0.5">
                  Dúvidas frequentes sobre o Assédio Aki
                </h4>
                <p className="text-xs sm:text-sm text-[#5a4e66] mt-1">
                  Explicações claras sobre sigilo, mapa aproximado e como buscar ajuda em Santa Catarina.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    q: '1. Posso mesmo contar o que aconteceu sem me identificar?',
                    a: 'Sim. Você pode usar sem se identificar, sem informar nome, CPF ou telefone. Os detalhes que você escreve ficam protegidos pelo PIN escolhido, e no mapa mostramos apenas um ponto aproximado — por isso, evite escrever dados pessoais no título.'
                  },
                  {
                    q: '2. Para que servem o código do relato e o PIN?',
                    a: 'Ao salvar seu relato, você recebe um código e escolhe um PIN. Com os dois, você consegue abrir o que escreveu e acrescentar anotações em "Acompanhar meu relato".'
                  },
                  {
                    q: '3. Contar aqui já vale como Boletim de Ocorrência na polícia?',
                    a: 'Não automaticamente. Quando você quiser investigação policial ou medida protetiva, procure o 190, 180, a Delegacia Virtual de SC ou uma delegacia presencial. Aqui no app há um organizador de texto para facilitar esse passo.'
                  },
                  {
                    q: '4. O que outras pessoas veem no Mapa de Calor?',
                    a: 'O mapa mostra áreas aproximadas de relatos (nunca o endereço exato de uma casa) e a localização das DPCAMIs / DEAMs (delegacias que atendem mulheres) e hospitais 24h em SC.'
                  },
                  {
                    q: '5. Como funciona o botão "Sair rápido"?',
                    a: 'Ao tocar em "Sair rápido" ou apertar ESC, a tela muda na hora para uma página comum de previsão do tempo e receitas. Importante: isso não apaga o histórico do navegador; se precisar, toque em "Ir para Google.com" ou feche a aba.'
                  },
                  {
                    q: '6. Funciona para cidades do interior de Santa Catarina?',
                    a: 'Sim. O mapa inclui todas as 295 cidades de Santa Catarina e reúne os contatos das 31 DPCAMIs / DEAMs, hospitais 24h e redes gratuitas como NEAVIT, OAB Por Elas, DefenDelas e CEAV.'
                  }
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-[#e6dfee] rounded-xl bg-white overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full min-h-[48px] p-4 text-left font-semibold text-xs sm:text-sm text-[#261d2e] flex items-center justify-between gap-3 hover:bg-[#faf8fb] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {openFaq === idx ? (
                        <ChevronUp className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#7c6f88] shrink-0" aria-hidden="true" />
                      )}
                    </button>
                    {openFaq === idx && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-[#5a4e66] leading-relaxed border-t border-[#efe9f4] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#faf8fb] border-t border-[#e6dfee] flex items-center justify-between text-xs shrink-0">
          <span className="text-[#5a4e66]">
            Assédio Aki · Santa Catarina
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 bg-[#f3eef8] hover:bg-[#e6dfee] text-[#4f3461] font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
