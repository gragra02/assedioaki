import { HarassmentType } from '../types';

export interface HarassmentGuideItem {
  id: HarassmentType;
  title: string;
  shortTitle: string;
  summary: string;
  legalBasis: string;
  examples: string[];
  whatToDo: string[];
}

export interface OfficialEmergencyChannel {
  id: string;
  numberOrLabel: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  availability: string;
  whenToUse: string;
}

export interface RightGuideItem {
  id: string;
  title: string;
  summary: string;
  details: string[];
}

export const HOME_CARDS = [
  {
    id: 'help' as const,
    title: 'PRECISO DE AJUDA',
    description: 'Orientações sobre como agir em uma situação de assédio e onde encontrar ajuda.',
    actionLabel: 'Ver orientações e ajuda'
  },
  {
    id: 'understand' as const,
    title: 'QUERO ENTENDER O QUE ESTOU VIVENDO',
    description: 'Informações sobre os diferentes tipos de assédio, com exemplos claros e linguagem acessível.',
    actionLabel: 'Entender os tipos de assédio'
  },
  {
    id: 'talk' as const,
    title: 'QUERO CONVERSAR',
    description: 'Informações sobre serviços de acolhimento e canais de atendimento disponíveis.',
    actionLabel: 'Ver canais de acolhimento'
  },
  {
    id: 'rights' as const,
    title: 'CONHEÇA SEUS DIREITOS',
    description: 'Informações sobre direitos das mulheres, proteção e possibilidades de denúncia.',
    actionLabel: 'Ver direitos e denúncia'
  }
];

export const OFFICIAL_EMERGENCY_CHANNELS: OfficialEmergencyChannel[] = [
  {
    id: 'pm-190',
    numberOrLabel: '190',
    title: 'Polícia Militar',
    description: 'Para situações de perigo imediato, agressão acontecendo agora ou ameaça física.',
    href: 'tel:190',
    availability: '24 horas · Ligação gratuita',
    whenToUse: 'Emergência imediata'
  },
  {
    id: 'central-180',
    numberOrLabel: '180',
    title: 'Central de Atendimento à Mulher',
    description: 'Escuta especializada, orientação sobre direitos e encaminhamento para a rede de apoio.',
    href: 'tel:180',
    availability: '24 horas · Ligação gratuita e sigilosa',
    whenToUse: 'Orientação e acolhimento'
  },
  {
    id: 'whatsapp-180',
    numberOrLabel: 'WhatsApp 180',
    title: 'Atendimento por mensagem (180)',
    description: 'Para quando não for seguro falar ao telefone. Canal oficial do Governo Federal.',
    href: 'https://wa.me/556196100180?text=Ol%C3%A1%2C%20preciso%20de%20orienta%C3%A7%C3%A3o%20e%20apoio.',
    external: true,
    availability: '24 horas · Mensagem de texto',
    whenToUse: 'Quando precisar de silêncio'
  },
  {
    id: 'disque-181',
    numberOrLabel: '181',
    title: 'Disque Denúncia (Santa Catarina)',
    description: 'Canal oficial da Polícia Civil de Santa Catarina para denúncias anônimas.',
    href: 'tel:181',
    availability: '24 horas · Ligação gratuita',
    whenToUse: 'Denúncia anônima em SC'
  },
  {
    id: 'pcsc-whatsapp',
    numberOrLabel: '(48) 98844-0083',
    title: 'WhatsApp Polícia Civil SC',
    description: 'Canal direto da Polícia Civil de Santa Catarina para informações e encaminhamentos.',
    href: 'https://wa.me/5548988440083?text=Ol%C3%A1%2C%20preciso%20de%20orienta%C3%A7%C3%A3o.',
    external: true,
    availability: 'Canal oficial PCSC',
    whenToUse: 'Atendimento em Santa Catarina'
  }
];

export const HARASSMENT_GUIDE: HarassmentGuideItem[] = [
  {
    id: 'importunacao_sexual',
    title: 'Importunação sexual',
    shortTitle: 'Importunação sexual',
    summary: 'Qualquer ato de caráter sexual feito sem o seu consentimento, em público ou em espaço privado.',
    legalBasis: 'Crime previsto no Art. 215-A do Código Penal.',
    examples: [
      'Alguém encostar em você de propósito no ônibus, no terminal ou em eventos.',
      'Beijo forçado, puxão de braço ou toques sem autorização.',
      'Exposição ou atos obscenos direcionados a você na rua ou no transporte.'
    ],
    whatToDo: [
      'Se puder, afaste-se e peça ajuda a pessoas próximas, motorista ou segurança.',
      'Se estiver em segurança, anote horário, linha de ônibus, características ou placa.',
      'Você pode ligar para o 190 se o agressor ainda estiver por perto.'
    ]
  },
  {
    id: 'assedio_sexual',
    title: 'Assédio sexual',
    shortTitle: 'Assédio sexual',
    summary: 'Quando alguém usa uma posição de poder ou autoridade (chefe, professor, supervisor) para exigir ou pressionar por favores sexuais.',
    legalBasis: 'Crime previsto no Art. 216-A do Código Penal.',
    examples: [
      'Insinuações ou convites sexuais ligados à manutenção do emprego, promoção ou nota.',
      'Chantagem emocional ou profissional caso você recuse aproximações.',
      'Mensagens insistentes de cunho sexual enviadas por um superior.'
    ],
    whatToDo: [
      'Guarde mensagens, e-mails, áudios e anote datas e locais.',
      'A culpa nunca é sua: a responsabilidade é de quem abusa da posição de poder.',
      'Procure o canal de ouvidoria, sindicato, Ministério Público do Trabalho ou a Delegacia da Mulher.'
    ]
  },
  {
    id: 'assedio_moral',
    title: 'Assédio moral',
    shortTitle: 'Assédio moral',
    summary: 'Humilhações, críticas constantes, isolamento ou constrangimentos repetidos no trabalho ou nos estudos.',
    legalBasis: 'Violação trabalhista e civil (CLT e Código Civil).',
    examples: [
      'Gritos, apelidos ofensivos ou piadas para diminuir você na frente de colegas.',
      'Isolamento proposital, retirada de tarefas ou metas impossíveis de cumprir.',
      'Ameaças constantes de demissão ou desqualificação do seu trabalho.'
    ],
    whatToDo: [
      'Registre um diário com datas, horários, frases ditas e nomes de possíveis testemunhas.',
      'Salve e-mails e mensagens recebidas fora do horário ou com tom ofensivo.',
      'Busque orientação no sindicato, Ministério Público do Trabalho ou Defensoria Pública.'
    ]
  },
  {
    id: 'perseguicao',
    title: 'Perseguição (Stalking)',
    shortTitle: 'Perseguição',
    summary: 'Quando alguém vigia, segue ou entra em contato com você de forma repetida e indesejada, invadindo sua liberdade e causando medo.',
    legalBasis: 'Crime previsto no Art. 147-A do Código Penal.',
    examples: [
      'Aparecer repetidamente na saída do trabalho, da faculdade ou perto de casa.',
      'Ligar dezenas de vezes, criar perfis falsos ou mandar mensagens mesmo após bloqueio.',
      'Enviar presentes ou recados com tom de controle ou intimidação.'
    ],
    whatToDo: [
      'Não responda às provocações, mas não apague as mensagens — faça capturas de tela.',
      'Avise pessoas de confiança sobre sua rotina e trajetos.',
      'Você pode pedir Medida Protetiva de Urgência e registrar Boletim de Ocorrência.'
    ]
  },
  {
    id: 'violencia_psicologica',
    title: 'Violência psicológica',
    shortTitle: 'Violência psicológica',
    summary: 'Atitudes que causam dano emocional, diminuem sua autoestima, controlam suas escolhas ou fazem você duvidar de si mesma.',
    legalBasis: 'Crime previsto no Art. 147-B do Código Penal e Lei Maria da Penha.',
    examples: [
      'Manipulação, chantagem, humilhação ou ameaças para controlar com quem você fala ou onde vai.',
      'Fazer você sentir que está exagerando ou imaginando coisas que aconteceram.',
      'Isolar você de amigas, familiares ou da sua rede de apoio.'
    ],
    whatToDo: [
      'Converse com alguém de confiança ou com o atendimento do 180 para não enfrentar isso sozinha.',
      'Seus sentimentos são válidos — desconforto e medo são sinais importantes.',
      'Você tem direito a acolhimento psicológico gratuito pelo SUS, CREAS ou NEAVIT.'
    ]
  },
  {
    id: 'violencia_virtual',
    title: 'Violência virtual e exposição íntima',
    shortTitle: 'Violência virtual',
    summary: 'Ameaças pela internet, perseguição digital ou divulgação de fotos e vídeos íntimos sem o seu consentimento.',
    legalBasis: 'Crime previsto no Art. 218-C do Código Penal e Marco Civil da Internet.',
    examples: [
      'Compartilhar ou ameaçar divulgar fotos ou vídeos íntimos sem autorização.',
      'Exigir dinheiro ou favores para não vazar imagens (sextorsão).',
      'Ataques coordenados, exposição de dados pessoais ou contas falsas com seu nome.'
    ],
    whatToDo: [
      'Salve prints mostrando a URL, o perfil, a data e a hora antes de bloquear a conta.',
      'Não ceda a chantagens — procurar ajuda policial e jurídica interrompe o ciclo.',
      'Registre Boletim de Ocorrência na Delegacia Virtual ou DPCAMI para solicitar remoção de conteúdo.'
    ]
  }
];

export const RIGHTS_GUIDE: RightGuideItem[] = [
  {
    id: 'atendimento-humanizado',
    title: 'Direito a atendimento acolhedor e sem julgamentos',
    summary: 'Você tem direito a ser ouvida com respeito, privacidade e sem ser culpabilizada pelo que aconteceu.',
    details: [
      'Em delegacias especializadas de Santa Catarina (DPCAMI), o atendimento busca oferecer Salas Lilás para sua privacidade.',
      'Você pode solicitar atendimento por profissional mulher sempre que disponível.',
      'Você não precisa estar sozinha: pode ir acompanhada de alguém de confiança.'
    ]
  },
  {
    id: 'medida-protetiva',
    title: 'Medidas Protetivas de Urgência',
    summary: 'Se estiver sofrendo ameaça, perseguição ou violência doméstica/de gênero, a Justiça pode proibir o agressor de se aproximar ou fazer contato.',
    details: [
      'O pedido pode ser feito na delegacia (DPCAMI ou CPP 24h), pela Defensoria Pública (DefenDelas) ou pelo Balcão Virtual da CEAV/TJSC.',
      'O juiz analisa o pedido com prioridade, geralmente em até 48 horas.',
      'O descumprimento da medida protetiva é crime e permite acionar o 190 imediatamente.'
    ]
  },
  {
    id: 'boletim-ocorrencia',
    title: 'Boletim de Ocorrência (presencial ou online)',
    summary: 'Registrar o B.O. formaliza os fatos para investigação policial e proteção legal.',
    details: [
      'Em Santa Catarina, você pode registrar online na Delegacia Virtual (delegaciavirtual.sc.gov.br) ou presencialmente em qualquer delegacia.',
      'Mesmo se não tiver todas as provas na hora, você pode registrar o relato.',
      'Este aplicativo oferece um gerador de texto para ajudar você a organizar os fatos antes de preencher o B.O. oficial.'
    ]
  },
  {
    id: 'saude-gratuita',
    title: 'Atendimento médico e psicológico gratuito (SUS)',
    summary: 'Em casos de violência sexual recente, hospitais de referência oferecem atendimento de urgência sigiloso sem exigir B.O. prévio.',
    details: [
      'Hospitais da rede SAVIS em Santa Catarina oferecem acolhimento, medicação preventiva (profilaxia PEP em até 72h) e apoio psicológico.',
      'O atendimento de saúde é um direito seu e independe de registro policial imediato.'
    ]
  }
];

export const PRIVACY_TRUTHS = [
  {
    title: 'Sem cadastro obrigatório',
    text: 'Você pode ler todas as orientações, consultar direitos, localizar delegacias e acessar contatos oficiais sem informar nome, e-mail ou telefone.'
  },
  {
    title: 'Saída rápida (botão no topo ou tecla ESC)',
    text: 'O modo de disfarce oculta a tela imediatamente. Importante: ele não apaga o histórico do seu navegador nem impede monitoramento caso outra pessoa tenha acesso físico ao aparelho.'
  },
  {
    title: 'Limites de armazenamento do relato',
    text: 'Se você registrar um relato neste app, o texto é protegido por um PIN no navegador, mas o resumo, a cidade e a região aproximada ficam salvos localmente no dispositivo (ou no servidor configurado) para exibição no mapa público. Para denúncias com efeito policial, use sempre os canais oficiais (180, 181, 190 ou Delegacia Virtual SC).'
  }
];

export function filterHarassmentGuide(query: string): HarassmentGuideItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return HARASSMENT_GUIDE;
  return HARASSMENT_GUIDE.filter(item =>
    item.title.toLowerCase().includes(normalized) ||
    item.summary.toLowerCase().includes(normalized) ||
    item.examples.some(ex => ex.toLowerCase().includes(normalized))
  );
}
