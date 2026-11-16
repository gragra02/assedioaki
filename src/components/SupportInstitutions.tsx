import React, { useState } from 'react';
import {
  Heart,
  PhoneCall,
  Mail,
  Globe,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Clock,
  Download,
  FileText,
  Laptop
} from 'lucide-react';
import {
  NeavitLogo,
  OabLogo,
  DefendelasLogo,
  PcscLogo,
  PmscLogo,
  CeavLogo
} from './InstitutionLogos';

export type InstitutionKey = 'neavit' | 'oab_por_elas' | 'defendelas' | 'pc_por_elas' | 'pm_cidada' | 'ceav';

interface InstitutionData {
  id: InstitutionKey;
  name: string;
  shortName: string;
  badge: string;
  subtitle: string;
  organization: string;
  tagline: string;
  description: string;
  phone: string;
  phoneClean: string;
  whatsapp?: string;
  whatsappClean?: string;
  email: string;
  website: string;
  appDownloadUrl?: string;
  address: string;
  hours: string;
  services: string[];
  howToAccess: string;
}

export const INSTITUTIONS: Record<InstitutionKey, InstitutionData> = {
  neavit: {
    id: 'neavit',
    name: 'NEAVIT - Núcleo Especial de Atendimento à Vítima',
    shortName: 'NEAVIT',
    subtitle: 'Ministério Público',
    badge: 'MPSC • Ministério Público de Santa Catarina',
    organization: 'Ministério Público de Santa Catarina (MPSC)',
    tagline: 'Acolhimento humanizado, apoio psicológico, social e jurídico a mulheres e vítimas de violência.',
    description:
      'O NEAVIT foi criado pelo Ministério Público de Santa Catarina para oferecer espaço seguro, acolhedor e multidisciplinar, com suporte desde o primeiro atendimento até o acompanhamento do processo.',
    phone: '(48) 3229-9000 / (48) 3229-9300',
    phoneClean: '4832299000',
    email: 'neavit@mpsc.mp.br',
    website: 'https://www.mpsc.mp.br/',
    address: 'Rua Bocaiúva, 1750 - Centro, Florianópolis/SC (e Promotorias em todo o estado)',
    hours: 'Segunda a sexta, das 12h às 19h',
    services: [
      'Escuta qualificada e acolhimento psicológico',
      'Orientação social e encaminhamento para a rede municipal',
      'Acompanhamento jurídico sobre inquérito e processo',
      'Apoio para acompanhamento de Medidas Protetivas de Urgência'
    ],
    howToAccess:
      'O atendimento pode ser solicitado por e-mail, telefone ou presencialmente em uma Promotoria de Justiça de Santa Catarina.'
  },
  oab_por_elas: {
    id: 'oab_por_elas',
    name: 'Projeto OAB Por Elas',
    shortName: 'OAB POR ELAS',
    subtitle: 'Orientação jurídica',
    badge: 'OAB/SC • Ordem dos Advogados do Brasil',
    organization: 'OAB Santa Catarina',
    tagline: 'Orientação jurídica gratuita inicial por advogadas voluntárias a mulheres em situação de violência.',
    description:
      'Iniciativa da Comissão da Mulher Advogada da OAB/SC em cooperação com a Polícia Civil e o Poder Judiciário, oferecendo atendimento inicial gratuito nas Delegacias da Mulher (DPCAMI) e Subseções.',
    phone: '(48) 3239-3500',
    phoneClean: '4832393500',
    whatsapp: '(48) 99128-4444',
    whatsappClean: '5548991284444',
    email: 'oabporelas@oab-sc.org.br',
    website: 'https://www.oab-sc.org.br/',
    address: 'Rua Paschoal Apóstolo Pítsica, 4860 - Agronômica, Florianópolis/SC (e DPCAMIs)',
    hours: 'Segunda a sexta, das 09h às 18h',
    services: [
      'Orientação jurídica gratuita por advogadas voluntárias',
      'Esclarecimentos sobre guarda, divórcio e pensão alimentícia',
      'Apoio no momento do registro do Boletim de Ocorrência',
      'Instrução para solicitação de Medidas Protetivas de Urgência'
    ],
    howToAccess:
      'Disponível nas salas de atendimento dentro das DPCAMIs de Santa Catarina e pelo portal da OAB/SC.'
  },
  defendelas: {
    id: 'defendelas',
    name: 'DefenDelas - Defensoria Pública da Mulher',
    shortName: 'DEFENDELAS',
    subtitle: 'Defensoria Pública',
    badge: 'DPSC • Defensoria Pública de Santa Catarina',
    organization: 'Defensoria Pública de SC (NUDEM)',
    tagline: 'Assistência jurídica gratuita e integral para mulheres em situação de vulnerabilidade.',
    description:
      'Programa do Núcleo de Promoção e Defesa dos Direitos das Mulheres (NUDEM/DPSC) que oferece representação judicial gratuita em ações cíveis, de família e medidas de proteção.',
    phone: '(48) 3665-6370 / (48) 3665-6589',
    phoneClean: '4836656370',
    whatsapp: '(48) 99153-6250',
    whatsappClean: '5548991536250',
    email: 'nudem@defensoria.sc.def.br',
    website: 'https://www.defensoria.sc.def.br/',
    address: 'Rua Esteves Júnior, 420 - Centro, Florianópolis/SC (com núcleos nas comarcas de SC)',
    hours: 'Segunda a sexta, das 13h às 18h',
    services: [
      'Representação jurídica gratuita em ações de família e proteção',
      'Pedido judicial urgente de Medidas Protetivas',
      'Acompanhamento processual integral',
      'Atendimento presencial ou pelo WhatsApp oficial'
    ],
    howToAccess:
      'Entre em contato pelo WhatsApp do NUDEM (48) 99153-6250 ou procure a Defensoria Pública na sua comarca.'
  },
  pc_por_elas: {
    id: 'pc_por_elas',
    name: 'Polícia Civil Por Elas (PCSC)',
    shortName: 'POLÍCIA CIVIL',
    subtitle: 'Salas Lilás SC',
    badge: 'PCSC • Polícia Civil de Santa Catarina',
    organization: 'Polícia Civil de Santa Catarina',
    tagline: 'Atendimento especializado em Salas Lilás nas delegacias de Santa Catarina.',
    description:
      'Diretriz da Polícia Civil de Santa Catarina para atendimento privativo e acolhedor nas Delegacias Especializadas (DPCAMI) e Centrais de Plantão, evitando contato com o agressor.',
    phone: '(48) 98844-0083 e 181',
    phoneClean: '181',
    whatsapp: '(48) 98844-0083',
    whatsappClean: '5548988440083',
    email: 'cdpcamis@pc.sc.gov.br',
    website: 'https://pcporelas.pc.sc.gov.br/index.php',
    address: '31 Delegacias Especializadas (DPCAMI) e Centrais de Plantão Policial em SC',
    hours: 'DPCAMIs: 12h às 19h • Plantão Policial (CPP) e Virtual: 24 horas',
    services: [
      'Atendimento privativo em Sala Lilás',
      'Registro de Boletim de Ocorrência',
      'Encaminhamento de pedido de Medida Protetiva ao Judiciário',
      'Requisição de exame de corpo de delito quando necessário'
    ],
    howToAccess:
      'Procure uma DPCAMI ou delegacia com Sala Lilás, ou acesse pcporelas.pc.sc.gov.br.'
  },
  pm_cidada: {
    id: 'pm_cidada',
    name: 'Polícia Militar · Rede Catarina e App PM Cidadã',
    shortName: 'POLÍCIA MILITAR',
    subtitle: 'Botão do Pânico',
    badge: 'PMSC • Rede Catarina de Proteção',
    organization: 'Polícia Militar de Santa Catarina',
    tagline: 'Acionamento rápido com localização via aplicativo PMSC Cidadão e rondas preventivas.',
    description:
      'O módulo "PMSC Cidadã" no aplicativo PMSC Cidadão disponibiliza o Botão do Pânico para mulheres com Medida Protetiva vigente, enviando viatura ao local sem necessidade de ligação.',
    phone: '190 (Emergência 24h)',
    phoneClean: '190',
    email: 'redecorina@pm.sc.gov.br',
    website: 'https://www.pm.sc.gov.br/',
    appDownloadUrl: 'https://play.google.com/store/apps/details?id=br.gov.sc.pm.cidadao',
    address: 'Cobertura em todo o estado de Santa Catarina',
    hours: '24 horas, todos os dias',
    services: [
      'Botão do Pânico no app PMSC Cidadão para mulheres com medida protetiva',
      'Envio de localização em emergência sem precisar falar ao telefone',
      'Rondas preventivas do programa Rede Catarina',
      'Atendimento emergencial pelo telefone 190'
    ],
    howToAccess:
      'Baixe o aplicativo "PMSC Cidadão" e habilite o módulo com sua conta Gov.br.'
  },
  ceav: {
    id: 'ceav',
    name: 'CEAV - Central Especializada de Atendimento às Vítimas (TJSC)',
    shortName: 'CEAV',
    subtitle: 'Poder Judiciário',
    badge: 'TJSC • Poder Judiciário de Santa Catarina',
    organization: 'Tribunal de Justiça de SC (CEVID / CEAV)',
    tagline: 'Balcão Virtual para orientações e pedido de Medida Protetiva de Urgência.',
    description:
      'Canal especializado do Poder Judiciário de Santa Catarina (CEVID/TJSC) que presta informação, acolhimento e orientação a vítimas diretas e indiretas, além de receber pedidos de medidas protetivas pelo Balcão Virtual.',
    phone: '(48) 3287-2636',
    phoneClean: '4832872636',
    email: 'cevid@tjsc.jus.br',
    website: 'https://vc2.tjsc.jus.br/balcao-ceav',
    address: 'Rua Álvaro Millen da Silveira, 208, Torre I, 1º andar, Sala 110 - Centro, Florianópolis/SC',
    hours: 'Segunda a sexta, das 12h às 19h',
    services: [
      'Balcão Virtual do TJSC para pedidos de Medida Protetiva de Urgência',
      'Acolhimento e escuta qualificada para vítimas diretas e familiares',
      'Orientação clara sobre andamento de processos judiciais em SC'
    ],
    howToAccess:
      'Acesse o Balcão Virtual do TJSC, ligue para (48) 3287-2636 ou escreva para cevid@tjsc.jus.br.'
  }
};

export const SupportInstitutions: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<InstitutionKey>('neavit');
  const activeInst = INSTITUTIONS[selectedKey];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Selector Grid */}
      <div className="bg-white border border-[#e6dfee] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#fbf2f4] text-[#8c3d52] flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#261d2e] font-heading">
              Rede pública de acolhimento em Santa Catarina
            </h2>
            <p className="text-sm text-[#5a4e66]">
              Escolha uma instituição abaixo para ver telefones, e-mails e como solicitar atendimento gratuito.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-[#efe9f4]">
          {(
            [
              { key: 'neavit', Logo: NeavitLogo },
              { key: 'oab_por_elas', Logo: OabLogo },
              { key: 'defendelas', Logo: DefendelasLogo },
              { key: 'pc_por_elas', Logo: PcscLogo },
              { key: 'pm_cidada', Logo: PmscLogo },
              { key: 'ceav', Logo: CeavLogo }
            ] as const
          ).map(({ key, Logo }) => {
            const inst = INSTITUTIONS[key];
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                aria-pressed={isSelected}
                className={`p-3 rounded-xl border transition-colors cursor-pointer flex flex-col items-center text-center gap-2 min-h-[116px] justify-center ${
                  isSelected
                    ? 'bg-[#f3eef8] border-[#6d4c82] text-[#261d2e] ring-1 ring-[#6d4c82]'
                    : 'bg-[#faf8fb] hover:bg-[#f3eef8]/60 border-[#e6dfee] text-[#493d54]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white p-1.5 border border-[#e6dfee] flex items-center justify-center shrink-0">
                  <Logo className="w-full h-full" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold block leading-tight">{inst.shortName}</span>
                  <span className="text-[11px] text-[#5a4e66] block">{inst.subtitle}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Institution Details */}
      <div className="bg-white border border-[#e6dfee] rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#efe9f4] pb-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#faf8fb] p-2 border border-[#e6dfee] flex items-center justify-center shrink-0">
              {selectedKey === 'neavit' && <NeavitLogo className="w-full h-full" />}
              {selectedKey === 'oab_por_elas' && <OabLogo className="w-full h-full" />}
              {selectedKey === 'defendelas' && <DefendelasLogo className="w-full h-full" />}
              {selectedKey === 'pc_por_elas' && <PcscLogo className="w-full h-full" />}
              {selectedKey === 'pm_cidada' && <PmscLogo className="w-full h-full" />}
              {selectedKey === 'ceav' && <CeavLogo className="w-full h-full" />}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#6d4c82]">{activeInst.badge}</p>
              <h3 className="text-lg sm:text-xl font-semibold text-[#261d2e] font-heading">
                {activeInst.name}
              </h3>
              <p className="text-sm text-[#5a4e66] max-w-2xl leading-relaxed">
                {activeInst.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {selectedKey === 'ceav' && (
              <a
                href="https://vc2.tjsc.jus.br/balcao-ceav"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-xs sm:text-sm rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                <Laptop className="w-4 h-4" aria-hidden="true" />
                <span>Balcão Virtual TJSC</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}

            {activeInst.phoneClean && (
              <a
                href={`tel:${activeInst.phoneClean}`}
                className="min-h-[44px] px-4 py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-xs sm:text-sm rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4" aria-hidden="true" />
                <span>Ligar</span>
              </a>
            )}

            {activeInst.whatsappClean && (
              <a
                href={`https://wa.me/${activeInst.whatsappClean}?text=${encodeURIComponent(`Olá, gostaria de orientação pelo ${activeInst.shortName}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2 bg-[#f1f6f3] hover:bg-[#e4efe8] border border-[#cde0d4] text-[#26543b] font-semibold text-xs sm:text-sm rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
            )}

            {activeInst.website && selectedKey !== 'ceav' && (
              <a
                href={activeInst.website}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2 bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#4f3461] font-medium text-xs sm:text-sm rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span>Site oficial</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-[#faf8fb] p-5 rounded-xl border border-[#efe9f4] space-y-2">
              <h4 className="text-xs font-semibold text-[#6d4c82] flex items-center gap-2">
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>Como funciona</span>
              </h4>
              <p className="text-sm text-[#493d54] leading-relaxed">
                {activeInst.description}
              </p>
            </div>

            <div className="bg-[#faf8fb] p-5 rounded-xl border border-[#efe9f4] space-y-3">
              <h4 className="text-xs font-semibold text-[#6d4c82]">
                Serviços gratuitos oferecidos
              </h4>
              <ul className="space-y-2.5 text-sm text-[#493d54]">
                {activeInst.services.map((srv, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#6d4c82] shrink-0 mt-1" aria-hidden="true" />
                    <span className="leading-snug">{srv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-[#f3eef8] border border-[#ddd1ea] rounded-xl text-sm text-[#493d54]">
              <strong className="text-[#261d2e] block font-semibold mb-1">Como solicitar atendimento</strong>
              <span>{activeInst.howToAccess}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#faf8fb] p-5 rounded-xl border border-[#efe9f4] space-y-4 text-sm">
              <h4 className="text-xs font-semibold text-[#6d4c82] border-b border-[#efe9f4] pb-2">
                Contatos e horários
              </h4>

              <div className="space-y-1">
                <span className="text-xs text-[#5a4e66] block">Telefone</span>
                <a href={`tel:${activeInst.phoneClean}`} className="text-[#261d2e] font-semibold hover:text-[#6d4c82] inline-flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                  <span>{activeInst.phone}</span>
                </a>
              </div>

              {activeInst.whatsapp && (
                <div className="space-y-1">
                  <span className="text-xs text-[#5a4e66] block">WhatsApp</span>
                  <a
                    href={`https://wa.me/${activeInst.whatsappClean}?text=${encodeURIComponent(`Olá, gostaria de orientação pelo ${activeInst.shortName}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#26543b] font-semibold hover:underline inline-flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{activeInst.whatsapp}</span>
                  </a>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-xs text-[#5a4e66] block">E-mail</span>
                <a href={`mailto:${activeInst.email}`} className="text-[#4f3461] underline inline-flex items-center gap-2 break-all">
                  <Mail className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                  <span>{activeInst.email}</span>
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#5a4e66] block">Horário</span>
                <div className="flex items-start gap-2 text-[#493d54] text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-[#6d4c82] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{activeInst.hours}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#5a4e66] block">Endereço de referência</span>
                <div className="flex items-start gap-2 text-[#493d54] text-xs sm:text-sm">
                  <MapPin className="w-4 h-4 text-[#6d4c82] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{activeInst.address}</span>
                </div>
              </div>

              {activeInst.appDownloadUrl && (
                <div className="pt-2 border-t border-[#efe9f4]">
                  <a
                    href={activeInst.appDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] py-2 bg-[#fbf2f4] hover:bg-[#f6e4e9] border border-[#e7cbd3] text-[#7f3347] font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>Baixar App PMSC Cidadão</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#faf8fb] border border-[#efe9f4] rounded-xl text-xs text-[#5a4e66] leading-relaxed">
              <strong className="text-[#261d2e] block font-semibold mb-1">Atendimento gratuito</strong>
              Todas as instituições acima fazem parte da rede pública ou parceira em Santa Catarina e não cobram pelo acolhimento.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
