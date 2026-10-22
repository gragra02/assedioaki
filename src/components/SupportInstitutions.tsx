import React, { useState } from 'react';
import { 
  Heart, PhoneCall, Mail, Globe, ExternalLink, MessageSquare, 
  Shield, CheckCircle2, MapPin, Clock, ArrowRight, Download, 
  Smartphone, Users, Scale, FileText, AlertCircle, Sparkles,
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
  organization: string;
  themeColor: string;
  accentBorder: string;
  bgGradient: string;
  tagline: string;
  description: string;
  phone: string;
  phoneLabel: string;
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
    badge: 'MPSC • Ministério Público de Santa Catarina',
    organization: 'Ministério Público de Santa Catarina (MPSC)',
    themeColor: 'from-purple-600 to-indigo-800',
    accentBorder: 'border-purple-500/50',
    bgGradient: 'bg-purple-950/20',
    tagline: 'Acolhimento humanizado, apoio psicológico, social e jurídico a mulheres e vítimas de violência.',
    description: 'O NEAVIT (Núcleo Especial de Atendimento a Vítimas de Crimes) foi criado pelo Ministério Público de Santa Catarina para proporcionar espaço seguro, acolhedor e multidisciplinar para mulheres e pessoas em situação de violência, oferecendo suporte contínuo desde o primeiro atendimento até o desfecho processual.',
    phone: '(48) 3229-9000 / (48) 3229-9300',
    phoneLabel: 'Central MPSC / NEAVIT',
    phoneClean: '4832299000',
    email: 'neavit@mpsc.mp.br',
    website: 'https://www.mpsc.mp.br/',
    address: 'Edifício-Sede MPSC: Rua Bocaiúva, 1750 - Centro, Florianópolis/SC (e Promotorias de Justiça em todo o estado)',
    hours: 'Segunda a Sexta, das 12h às 19h (atendimento presencial e remoto)',
    services: [
      'Acolhimento psicológico e escuta qualificada imediata',
      'Orientação social e encaminhamento para a rede de assistência municipal',
      'Acompanhamento jurídico sobre a tramitação do inquérito e ação penal',
      'Fiscalização do cumprimento de Medidas Protetivas de Urgência',
      'Articulação prioritária com as Promotorias de Justiça de SC'
    ],
    howToAccess: 'O atendimento pode ser solicitado por e-mail, telefone ou presencialmente em qualquer Promotoria de Justiça de Santa Catarina.'
  },
  oab_por_elas: {
    id: 'oab_por_elas',
    name: 'PROJETO OAB POR ELAS',
    shortName: 'OAB POR ELAS',
    badge: 'OAB/SC • Ordem dos Advogados do Brasil',
    organization: 'Ordem dos Advogados do Brasil - Seccional de Santa Catarina (OAB/SC)',
    themeColor: 'from-blue-600 to-indigo-700',
    accentBorder: 'border-blue-500/50',
    bgGradient: 'bg-blue-950/20',
    tagline: 'Orientação jurídica gratuita e imediata por advogadas voluntárias a mulheres em situação de violência.',
    description: 'O Projeto OAB Por Elas é uma iniciativa da Comissão da Mulher Advogada da OAB/SC em cooperação com a Polícia Civil e o Poder Judiciário. O projeto oferece assistência jurídica inicial gratuita dentro das Delegacias da Mulher (DPCAMI) e Subseções da OAB em todo o estado de Santa Catarina.',
    phone: '(48) 3239-3500',
    phoneLabel: 'Central OAB/SC',
    phoneClean: '4832393500',
    whatsapp: '(48) 99128-4444',
    whatsappClean: '5548991284444',
    email: 'oabporelas@oab-sc.org.br',
    website: 'https://www.oab-sc.org.br/',
    address: 'Sede OAB/SC: Rua Paschoal Apóstolo Pítsica, 4860 - Agronômica, Florianópolis/SC (presente nas DPCAMIs do estado)',
    hours: 'Segunda a Sexta-feira, das 09h às 18h',
    services: [
      'Atendimento e assessoria jurídica gratuita por advogadas voluntárias',
      'Orientação sobre Direito de Família (guarda dos filhos, divórcio e pensão alimentícia)',
      'Apoio técnico no momento do registro do Boletim de Ocorrência na DPCAMI',
      'Instrução e acompanhamento do pedido de Medidas Protetivas de Urgência',
      'Encaminhamento para a Defensoria Pública do Estado quando necessário'
    ],
    howToAccess: 'Disponível diretamente nas salas de atendimento do projeto dentro das DPCAMIs de Santa Catarina e através do formulário oficial no portal da OAB/SC.'
  },
  defendelas: {
    id: 'defendelas',
    name: 'DEFENDELAS - Defensoria Pública da Mulher',
    shortName: 'DEFENDELAS',
    badge: 'DPSC • Defensoria Pública de Santa Catarina',
    organization: 'Defensoria Pública do Estado de Santa Catarina (DPSC / NUDEM)',
    themeColor: 'from-emerald-600 to-teal-800',
    accentBorder: 'border-emerald-500/50',
    bgGradient: 'bg-emerald-950/20',
    tagline: 'Assistência jurídica integral, gratuita e humanizada para mulheres em situação de vulnerabilidade.',
    description: 'O DefenDelas é o programa do Núcleo de Promoção e Defesa dos Direitos das Mulheres (NUDEM) da Defensoria Pública de Santa Catarina. Garante representação judicial completa sem qualquer custo para mulheres que necessitam de amparo judicial, ações cíveis, de família e garantia de proteção à integridade.',
    phone: '(48) 3665-6370 / (48) 3665-6589',
    phoneLabel: 'Central de Atendimento DPSC',
    phoneClean: '4836656370',
    whatsapp: '(48) 99153-6250',
    whatsappClean: '5548991536250',
    email: 'nudem@defensoria.sc.def.br',
    website: 'https://www.defensoria.sc.def.br/',
    address: 'Sede Defensoria: Rua Esteves Júnior, 420 - Centro, Florianópolis/SC (com núcleos em todas as comarcas de SC)',
    hours: 'Segunda a Sexta-feira, das 13h às 18h',
    services: [
      'Representação jurídica gratuita em ações de divórcio, guarda e alimentos',
      'Requerimento judicial urgente de Medidas Protetivas da Lei Maria da Penha',
      'Acompanhamento processual integral de mulheres vítimas de violência',
      'Defesa dos direitos humanos e reparação de danos decorrentes de assédio',
      'Atendimento humanizado presencial ou 100% digital pelo WhatsApp'
    ],
    howToAccess: 'Entre em contato pelo WhatsApp oficial do NUDEM (48) 99153-6250 ou dirija-se à sede da Defensoria Pública na sua comarca.'
  },
  pc_por_elas: {
    id: 'pc_por_elas',
    name: 'POLÍCIA CIVIL POR ELAS (PCSC)',
    shortName: 'POLÍCIA CIVIL POR ELAS',
    badge: 'PCSC • Polícia Civil Santa Catarina',
    organization: 'Polícia Civil do Estado de Santa Catarina (PCSC / DPCAMI)',
    themeColor: 'from-purple-600 to-fuchsia-800',
    accentBorder: 'border-purple-500/50',
    bgGradient: 'bg-purple-950/20',
    tagline: 'Atendimento especializado, humanizado e com sigilo em Salas Lilás de delegacias em Santa Catarina.',
    description: 'O programa PC Por Elas é a diretriz da Polícia Civil de Santa Catarina para reestruturar as Delegacias Especializadas (DPCAMI) com as "Salas Lilás" — espaços acolhedores equipados para que a mulher relate a situação de violência e assédio sem contato com o agressor e com suporte humanizado.',
    phone: '(48) 98844-0083 e 181',
    phoneLabel: 'WhatsApp Oficial e Disque Denúncia 181',
    phoneClean: '181',
    whatsapp: '(48) 98844-0083',
    whatsappClean: '5548988440083',
    email: 'cdpcamis@pc.sc.gov.br',
    website: 'https://pcporelas.pc.sc.gov.br/index.php',
    address: 'Disponível em 31 Delegacias Especializadas (DPCAMI) e Centrais de Plantão Policial (CPP) de SC',
    hours: 'Delegacias DPCAMI: 12h às 19h • Plantão Policial (CPP) e Virtual: 24 Horas',
    services: [
      'Atendimento em Sala Lilás com ambiente privativo e acolhedor',
      'Registro oficial de Boletim de Ocorrência com total sigilo',
      'Solicitação eletrônica imediata de Medidas Protetivas de Urgência ao Juiz',
      'Encaminhamento imediato para perícia médica legal e exame de corpo de delito',
      'Canal de denúncias e acolhimento via WhatsApp Oficial (48) 98844-0083 e 181'
    ],
    howToAccess: 'Procure qualquer DPCAMI ou delegacia da Polícia Civil de SC com Sala Lilás, ou acesse o portal pcporelas.pc.sc.gov.br.'
  },
  pm_cidada: {
    id: 'pm_cidada',
    name: 'POLÍCIA MILITAR APP PM CIDADÃ (PMSC)',
    shortName: 'POLÍCIA MILITAR APP PM CIDADÃ',
    badge: 'PMSC • Rede Catarina de Proteção',
    organization: 'Polícia Militar do Estado de Santa Catarina (PMSC)',
    themeColor: 'from-rose-600 to-red-800',
    accentBorder: 'border-rose-500/50',
    bgGradient: 'bg-rose-950/20',
    tagline: 'Botão do Pânico com geolocalização e programa Rede Catarina de Proteção à Mulher.',
    description: 'A Polícia Militar de Santa Catarina desenvolveu o aplicativo PMSC Cidadão (com o módulo exclusivo "PMSC Cidadã"), que disponibiliza o Botão do Pânico para mulheres com Medida Protetiva vigente. O acionamento envia a viatura policial imediatamente ao local da usuária via GPS sem que ela precise falar ao telefone.',
    phone: '190 (Emergência Policial Militar)',
    phoneLabel: 'Emergência 190 (24 Horas)',
    phoneClean: '190',
    email: 'redecorina@pm.sc.gov.br',
    website: 'https://www.pm.sc.gov.br/',
    appDownloadUrl: 'https://play.google.com/store/apps/details?id=br.gov.sc.pm.cidadao',
    address: 'Quartel do Comando Geral PMSC: Rua Menino Deus, 376 - Centro, Florianópolis/SC (cobertura estadual)',
    hours: '24 Horas ininterruptas (todos os dias do ano)',
    services: [
      'Botão do Pânico no App PMSC Cidadão para envio silencioso de viatura policial',
      'Rastreamento em tempo real da localização da vítima via coordenadas GPS',
      'Envio de fotos, vídeos e áudios como evidência de descumprimento de medida',
      'Rondas periódicas preventivas da guarnição "Rede Catarina de Proteção à Mulher"',
      'Atendimento de chamadas emergenciais 190 com prioridade máxima de despacho'
    ],
    howToAccess: 'Baixe o app "PMSC Cidadão" na Google Play Store ou Apple App Store e cadastre-se com sua conta Gov.br para liberar a função PMSC Cidadã.'
  },
  ceav: {
    id: 'ceav',
    name: 'CEAV - Central Especializada de Atendimento às Vítimas (Poder Judiciário SC)',
    shortName: 'CEAV',
    badge: 'TJSC • Poder Judiciário de Santa Catarina',
    organization: 'Poder Judiciário do Estado de Santa Catarina (TJSC / CEAV)',
    themeColor: 'from-purple-700 via-teal-700 to-teal-900',
    accentBorder: 'border-teal-500/50',
    bgGradient: 'bg-teal-950/20',
    tagline: 'Canal especializado de informação, acolhimento e orientação com Balcão Virtual para solicitar Medida Protetiva de Urgência.',
    description: 'A CEAV é a Central Especializada de Atendimento às Vítimas de Crimes, de Atos Infracionais e de Violência Doméstica e Familiar, instituída no Poder Judiciário de Santa Catarina por meio da Resolução Conjunta GP/CGJ n. 17, de 22 de agosto de 2022, e em conformidade com a Resolução CNJ n. 253/2018, alterada pela Resolução CNJ n. 386/2021. A CEAV funciona no CEVID (Coordenadoria da Mulher em Situação de Violência Doméstica e Familiar do TJSC). Tem por objetivo prestar informação e apoio às vítimas de crimes, de atos infracionais e de violência doméstica e familiar contra a mulher, funcionando como canal especializado de atendimento, acolhimento e orientação. Também tem a atribuição fundamental de receber pedidos de medidas protetivas de urgência por meio do Balcão Virtual.',
    phone: '(48) 3287-2636',
    phoneLabel: 'Central CEAV / TJSC',
    phoneClean: '4832872636',
    email: 'cevid@tjsc.jus.br',
    website: 'https://vc2.tjsc.jus.br/balcao-ceav',
    address: 'Sede TJSC (no CEVID): Rua Álvaro Millen da Silveira, n. 208, Torre I, 1º andar, Sala 110 (mezanino), Centro, Florianópolis, Santa Catarina, CEP: 88020-901',
    hours: 'Segunda a Sexta-feira, das 12h às 19h (Balcão Virtual e Presencial)',
    services: [
      'Balcão Virtual Oficial do TJSC para receber pedidos de Medidas Protetivas de Urgência sem sair de casa',
      'Atendimento, acolhimento humanizado e escuta qualificada para vítimas diretas e indiretas',
      'Acolhimento a cônjuges, companheiros(as), familiares em linha reta, irmãos(ãs) e dependentes afetados',
      'Orientações institucionais detalhadas sobre a tramitação de processos no Poder Judiciário de SC',
      'Estrutura localizada na Coordenadoria Estadual da Mulher (CEVID / TJSC)'
    ],
    howToAccess: 'Acesse o Balcão Virtual do TJSC para atendimento remoto ou pedido de medida protetiva, contate pelo telefone (48) 3287-2636 ou e-mail cevid@tjsc.jus.br.'
  }
};

export const SupportInstitutions: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<InstitutionKey>('neavit');
  const activeInst = INSTITUTIONS[selectedKey];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Banner da Rede de Apoio */}
      <div className="bg-slate-900 border border-purple-900/40 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20 shrink-0">
            <Heart className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
              Rede de Apoio e Proteção à Mulher de Santa Catarina
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Clique nos botões institucionais abaixo para acessar serviços, telefones, e-mails, endereços e canais oficiais.
            </p>
          </div>
        </div>

        {/* OS 6 BOTÕES COM AS LOGOS OFICIAIS DAS INSTITUIÇÕES */}
        <div className="border-t border-slate-800 pt-4">
          <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">
            Escolha uma Instituição de Acolhimento:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">

            {/* BOTÃO 1: NEAVIT (MPSC) */}
            <button
              onClick={() => setSelectedKey('neavit')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 relative overflow-hidden group ${
                selectedKey === 'neavit'
                  ? 'bg-gradient-to-b from-purple-950 to-slate-900 border-purple-400 text-white shadow-xl ring-2 ring-purple-400 font-black'
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {/* Logo NEAVIT */}
              <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <NeavitLogo className="w-full h-full" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black block leading-tight">NEAVIT</span>
                <span className="text-[10px] text-purple-300 font-bold block">Ministério Público</span>
              </div>
            </button>

            {/* BOTÃO 2: PROJETO OAB POR ELAS */}
            <button
              onClick={() => setSelectedKey('oab_por_elas')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 relative overflow-hidden group ${
                selectedKey === 'oab_por_elas'
                  ? 'bg-gradient-to-b from-blue-950 to-slate-900 border-blue-400 text-white shadow-xl ring-2 ring-blue-400 font-black'
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {/* Logo OAB */}
              <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <OabLogo className="w-full h-full" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black block leading-tight">OAB POR ELAS</span>
                <span className="text-[10px] text-blue-300 font-bold block">Apoio Jurídico</span>
              </div>
            </button>

            {/* BOTÃO 3: DEFENDELAS */}
            <button
              onClick={() => setSelectedKey('defendelas')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 relative overflow-hidden group ${
                selectedKey === 'defendelas'
                  ? 'bg-gradient-to-b from-emerald-950 to-slate-900 border-emerald-400 text-white shadow-xl ring-2 ring-emerald-400 font-black'
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {/* Logo DEFENDELAS */}
              <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <DefendelasLogo className="w-full h-full" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black block leading-tight">DEFENDELAS</span>
                <span className="text-[10px] text-emerald-300 font-bold block">Defensoria Pública</span>
              </div>
            </button>

            {/* BOTÃO 4: POLÍCIA CIVIL POR ELAS */}
            <button
              onClick={() => setSelectedKey('pc_por_elas')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 relative overflow-hidden group ${
                selectedKey === 'pc_por_elas'
                  ? 'bg-gradient-to-b from-purple-950 to-slate-900 border-purple-400 text-white shadow-xl ring-2 ring-purple-400 font-black'
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {/* Logo Polícia Civil PCSC */}
              <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <PcscLogo className="w-full h-full" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black block leading-tight">POLÍCIA CIVIL</span>
                <span className="text-[10px] text-purple-300 font-bold block">PC POR ELAS</span>
              </div>
            </button>

            {/* BOTÃO 5: POLÍCIA MILITAR APP PM CIDADÃ */}
            <button
              onClick={() => setSelectedKey('pm_cidada')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 relative overflow-hidden group ${
                selectedKey === 'pm_cidada'
                  ? 'bg-gradient-to-b from-rose-950 to-slate-900 border-rose-400 text-white shadow-xl ring-2 ring-rose-400 font-black'
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {/* Logo Polícia Militar PMSC */}
              <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <PmscLogo className="w-full h-full" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black block leading-tight">POLÍCIA MILITAR</span>
                <span className="text-[10px] text-rose-300 font-bold block">APP PM CIDADÃ</span>
              </div>
            </button>

            {/* BOTÃO 6: CEAV (Poder Judiciário TJSC) */}
            <button
              onClick={() => setSelectedKey('ceav')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 relative overflow-hidden group ${
                selectedKey === 'ceav'
                  ? 'bg-gradient-to-b from-teal-950 to-slate-900 border-teal-400 text-white shadow-xl ring-2 ring-teal-400 font-black'
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {/* Logo CEAV */}
              <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CeavLogo className="w-full h-full" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black block leading-tight">CEAV</span>
                <span className="text-[10px] text-teal-300 font-bold block">Poder Judiciário</span>
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* DETALHES COMPLETOS DA INSTITUIÇÃO SELECIONADA */}
      <div className={`bg-slate-900 border ${activeInst.accentBorder} rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-150`}>
        
        {/* Cabeçalho do Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-800 pb-5">
          <div className="flex items-start gap-4">
            {/* Logo da Instituição Selecionada em Destaque */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center shrink-0 border border-slate-200">
              {selectedKey === 'neavit' && <NeavitLogo className="w-full h-full" />}
              {selectedKey === 'oab_por_elas' && <OabLogo className="w-full h-full" />}
              {selectedKey === 'defendelas' && <DefendelasLogo className="w-full h-full" />}
              {selectedKey === 'pc_por_elas' && <PcscLogo className="w-full h-full" />}
              {selectedKey === 'pm_cidada' && <PmscLogo className="w-full h-full" />}
              {selectedKey === 'ceav' && <CeavLogo className="w-full h-full" />}
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-extrabold text-purple-300 inline-block">
                {activeInst.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                {activeInst.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {activeInst.tagline}
              </p>
            </div>
          </div>

          {/* Botões Rápidos de Ação / Canais Diretos */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {selectedKey === 'ceav' && (
              <a
                href="https://vc2.tjsc.jus.br/balcao-ceav"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg ring-2 ring-teal-400/50 transition-all cursor-pointer animate-pulse"
              >
                <Laptop className="w-4 h-4" />
                <span>Balcão Virtual (Medida Protetiva)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {activeInst.phoneClean && (
              <a
                href={`tel:${activeInst.phoneClean}`}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Ligar Agora</span>
              </a>
            )}

            {activeInst.whatsappClean && (
              <a
                href={`https://wa.me/${activeInst.whatsappClean}?text=${encodeURIComponent(`Olá, gostaria de informações e acolhimento através do ${activeInst.shortName}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Oficial</span>
              </a>
            )}

            {activeInst.website && selectedKey !== 'ceav' && (
              <a
                href={activeInst.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Globe className="w-4 h-4 text-purple-400" />
                <span>Portal Oficial</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
          </div>
        </div>

        {/* Card Especial de Destaque para o CEAV (Balcão Virtual e Vítimas Diretas/Indiretas) */}
        {selectedKey === 'ceav' && (
          <div className="p-5 bg-gradient-to-r from-teal-950/80 via-slate-950 to-purple-950/80 border-2 border-teal-500/60 rounded-2xl shadow-xl space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/30">
                  <Laptop className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-teal-400 uppercase tracking-wider block">
                    Serviço de Urgência • TJSC
                  </span>
                  <h4 className="text-base font-black text-white">
                    Balcão Virtual da CEAV: Solicite sua Medida Protetiva de Urgência
                  </h4>
                </div>
              </div>
              <a
                href="https://vc2.tjsc.jus.br/balcao-ceav"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer"
              >
                <span>Acessar Balcão Virtual TJSC</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <strong className="text-teal-300 font-bold block mb-1">
                  👥 Quem pode requisitar o serviço:
                </strong>
                <ul className="space-y-1 text-slate-300 text-[11px] list-disc pl-4">
                  <li><strong>Vítimas diretas:</strong> de crimes, atos infracionais e violência doméstica e familiar contra a mulher.</li>
                  <li><strong>Vítimas indiretas:</strong> cônjuges, esposas, companheiros(as), familiares em linha reta, irmãos(ãs) e dependentes cuja lesão decorra de crime ou ato infracional.</li>
                </ul>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <strong className="text-purple-300 font-bold block mb-1">
                  🏛️ Local de Funcionamento & Parceria com a CEVID:
                </strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  A CEAV funciona no espaço da <strong>CEVID (Coordenadoria da Mulher em Situação de Violência Doméstica e Familiar)</strong>, unindo o apoio institucional do Poder Judiciário à agilidade processual.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card Especial idêntico ao modelo PCSC se for Polícia Civil */}
        {selectedKey === 'pc_por_elas' && (
          <div className="p-4 sm:p-5 bg-white text-slate-900 rounded-2xl border-2 border-purple-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-slate-50 p-1 flex items-center justify-center shrink-0 border border-slate-200">
                <PcscLogo className="w-full h-full" />
              </div>
              <div>
                <span className="text-xs font-black text-purple-950 uppercase tracking-wider block">PCSC</span>
                <strong className="text-base font-extrabold text-slate-900 block leading-tight">
                  Polícia Civil Santa Catarina
                </strong>
                <span className="text-xs text-slate-600">Programa PC Por Elas e Coordenadoria das DPCAMIs</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-800 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
              <a href="tel:181" className="flex items-center gap-1.5 hover:text-purple-700">
                <PhoneCall className="w-4 h-4 text-purple-700" />
                <span>(48) 98844-0083 e 181</span>
              </a>
              <span className="hidden sm:inline text-slate-300">•</span>
              <a href="mailto:cdpcamis@pc.sc.gov.br" className="flex items-center gap-1.5 hover:text-purple-700">
                <Mail className="w-4 h-4 text-purple-700" />
                <span>cdpcamis@pc.sc.gov.br</span>
              </a>
              <span className="hidden sm:inline text-slate-300">•</span>
              <a href="https://pcporelas.pc.sc.gov.br/index.php" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-purple-700 underline">
                <Globe className="w-4 h-4 text-purple-700" />
                <span>pcporelas.pc.sc.gov.br</span>
              </a>
            </div>
          </div>
        )}

        {/* Sobre a Instituição e Como Funciona */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Sobre o Serviço & Acolhimento</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {activeInst.description}
              </p>
            </div>

            {/* Lista de Serviços Oferecidos */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Serviços Prestados em Santa Catarina</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {activeInst.services.map((srv, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-400 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 border border-purple-800">
                      ✓
                    </span>
                    <span className="leading-snug">{srv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Como Acessar */}
            <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-2xl text-xs text-purple-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-1">Como ter Acesso ao Atendimento:</strong>
                <span>{activeInst.howToAccess}</span>
              </div>
            </div>
          </div>

          {/* Card Lateral: Contatos Oficiais e Endereço */}
          <div className="space-y-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 space-y-4 text-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Contatos Oficiais & Atendimento
              </h4>

              {/* Telefone */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block">Telefone:</span>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-purple-400 shrink-0" />
                  <a href={`tel:${activeInst.phoneClean}`} className="text-white font-bold hover:text-purple-300 transition-colors">
                    {activeInst.phone}
                  </a>
                </div>
              </div>

              {/* WhatsApp se houver */}
              {activeInst.whatsapp && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">WhatsApp de Atendimento:</span>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    <a 
                      href={`https://wa.me/${activeInst.whatsappClean}?text=${encodeURIComponent(`Olá, gostaria de orientação através do ${activeInst.shortName}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-emerald-300 font-bold hover:underline"
                    >
                      {activeInst.whatsapp}
                    </a>
                  </div>
                </div>
              )}

              {/* E-mail */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block">E-mail Institucional:</span>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <a href={`mailto:${activeInst.email}`} className="text-purple-300 hover:text-purple-100 underline truncate">
                    {activeInst.email}
                  </a>
                </div>
              </div>

              {/* Horário */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block">Horário de Funcionamento:</span>
                <div className="flex items-start gap-2 text-slate-200">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{activeInst.hours}</span>
                </div>
              </div>

              {/* Endereço / Sede */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block">Localização / Sede SC:</span>
                <div className="flex items-start gap-2 text-slate-200">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{activeInst.address}</span>
                </div>
              </div>

              {/* Download App PMSC se for PM Cidadã */}
              {activeInst.appDownloadUrl && (
                <div className="pt-2 border-t border-slate-800">
                  <a
                    href={activeInst.appDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar App PMSC Cidadão</span>
                  </a>
                </div>
              )}
            </div>

            {/* Card com Garantia de Sigilo */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] text-slate-400 space-y-1">
              <strong className="text-white block font-bold">🔒 Atendimento Sigiloso e Gratuito</strong>
              <span>
                Todas as entidades listadas integram a rede pública catarinense de garantia de direitos e não cobram valores pelo acolhimento de mulheres em risco.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
