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
    description: 'Caminhos seguros para o que está acontecendo agora ou já passou, e lugares perto de você.',
    actionLabel: 'Ver caminhos de ajuda'
  },
  {
    id: 'understand' as const,
    title: 'QUERO ENTENDER O QUE ESTOU VIVENDO',
    description: 'Explicações simples, com exemplos do dia a dia, para ajudar você a dar nome ao que viveu.',
    actionLabel: 'Entender o que aconteceu'
  },
  {
    id: 'talk' as const,
    title: 'QUERO CONVERSAR',
    description: 'Lugares de escuta gratuita e acolhedora em Santa Catarina, sem obrigação de denunciar.',
    actionLabel: 'Ver lugares de escuta'
  },
  {
    id: 'rights' as const,
    title: 'CONHEÇA SEUS DIREITOS',
    description: 'Como funcionam as medidas de proteção, o atendimento gratuito e o acompanhamento do seu relato.',
    actionLabel: 'Ver direitos e proteção'
  }
];

export const OFFICIAL_EMERGENCY_CHANNELS: OfficialEmergencyChannel[] = [
  {
    id: 'pm-190',
    numberOrLabel: '190',
    title: 'Polícia Militar',
    description: 'Para quando há perigo neste momento, agressão acontecendo agora ou ameaça próxima.',
    href: 'tel:190',
    availability: '24 horas · Ligação gratuita',
    whenToUse: 'Se houver perigo agora'
  },
  {
    id: 'central-180',
    numberOrLabel: '180',
    title: 'Central de Atendimento à Mulher',
    description: 'Escuta acolhedora, orientação sobre seus direitos e indicação de serviços gratuitos.',
    href: 'tel:180',
    availability: '24 horas · Gratuita e em sigilo',
    whenToUse: 'Escuta e orientação'
  },
  {
    id: 'whatsapp-180',
    numberOrLabel: 'WhatsApp 180',
    title: 'Conversa por mensagem (180)',
    description: 'Para quando você não puder falar em voz alta ao telefone. Canal oficial e gratuito.',
    href: 'https://wa.me/556196100180?text=Ol%C3%A1%2C%20preciso%20de%20orienta%C3%A7%C3%A3o%20e%20apoio.',
    external: true,
    availability: '24 horas · Por texto',
    whenToUse: 'Quando precisar de silêncio'
  },
  {
    id: 'disque-181',
    numberOrLabel: '181',
    title: 'Disque 181 (Santa Catarina)',
    description: 'Canal da Polícia Civil de Santa Catarina para avisar sobre situações sem se identificar.',
    href: 'tel:181',
    availability: '24 horas · Ligação gratuita',
    whenToUse: 'Sem se identificar em SC'
  },
  {
    id: 'pcsc-whatsapp',
    numberOrLabel: '(48) 98844-0083',
    title: 'WhatsApp Polícia Civil SC',
    description: 'Atendimento por mensagem da Polícia Civil em Santa Catarina para dúvidas e orientação.',
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
    summary: 'Qualquer toque ou ato sexual feito sem a sua permissão, na rua, no transporte ou em lugar fechado.',
    legalBasis: 'A lei protege você (Importunação sexual · Art. 215-A)',
    examples: [
      'Alguém encostar em você de propósito no ônibus, no terminal ou em eventos.',
      'Beijo forçado, puxão pelo braço ou toques sem a sua permissão.',
      'Atos sexuais ou exposição íntima feitos na sua direção sem você querer.'
    ],
    whatToDo: [
      'Se puder, afaste-se e peça ajuda a quem estiver perto, como motorista, segurança ou outra mulher.',
      'Quando estiver segura, anote o horário, a linha do ônibus ou algum ponto de referência.',
      'Se a pessoa ainda estiver por perto oferecendo risco, você pode ligar para o 190.'
    ]
  },
  {
    id: 'assedio_sexual',
    title: 'Assédio sexual',
    shortTitle: 'Assédio sexual',
    summary: 'Quando alguém usa um cargo ou posição acima de você (chefia, coordenação, professor) para pressionar ou fazer chantagem sexual.',
    legalBasis: 'A lei protege você (Assédio sexual · Art. 216-A)',
    examples: [
      'Convites ou insinuações sexuais ligados a manter o emprego, conseguir vaga ou nota.',
      'Pressão ou ameaça de prejudicar você caso diga não.',
      'Mensagens insistentes de cunho íntimo enviadas por alguém em posição de poder.'
    ],
    whatToDo: [
      'Se for seguro, guarde prints de conversas, e-mails, áudios e anote datas.',
      'A culpa nunca é sua: quem erra é quem abusa do cargo ou da autoridade.',
      'Você pode buscar apoio no 180, na Defensoria Pública ou em uma DPCAMI / DEAM (delegacia que atende mulheres).'
    ]
  },
  {
    id: 'assedio_moral',
    title: 'Assédio moral',
    shortTitle: 'Assédio moral',
    summary: 'Humilhações, gritos, isolamento ou cobranças abusivas que se repetem no trabalho ou nos estudos.',
    legalBasis: 'Seus direitos no trabalho e no estudo protegem você',
    examples: [
      'Gritos, apelidos ofensivos ou piadas para diminuir você na frente de outras pessoas.',
      'Isolamento proposital, retirada de tarefas ou metas impossíveis de cumprir.',
      'Ameaças constantes de demissão ou desvalorização diária do que você faz.'
    ],
    whatToDo: [
      'Anote datas, horários, o que foi dito e quem estava presente.',
      'Guarde mensagens e e-mails que mostrem esse tratamento repetido.',
      'Você pode pedir orientação gratuita na Defensoria Pública, sindicato ou Ministério Público do Trabalho.'
    ]
  },
  {
    id: 'perseguicao',
    title: 'Perseguição (Stalking)',
    shortTitle: 'Perseguição',
    summary: 'Quando alguém segue, vigia ou procura você sem parar, na rua ou pela internet, tirando sua paz e sua liberdade.',
    legalBasis: 'A lei protege você (Perseguição · Art. 147-A)',
    examples: [
      'Aparecer várias vezes na saída do trabalho, da aula ou perto da sua casa.',
      'Ligar dezenas de vezes, criar perfis falsos ou mandar mensagens mesmo depois de bloqueio.',
      'Mandar presentes ou recados indesejados para vigiar ou intimidar você.'
    ],
    whatToDo: [
      'Evite responder, mas não apague as provas: tire prints com data e horário.',
      'Conte a pessoas de confiança sobre o que está acontecendo e combine caminhos seguros.',
      'Você pode pedir medida protetiva e procurar uma DPCAMI / DEAM (delegacia que atende mulheres).'
    ]
  },
  {
    id: 'violencia_psicologica',
    title: 'Violência psicológica',
    shortTitle: 'Violência psicológica',
    summary: 'Atitudes que machucam emocionalmente, diminuem sua autoestima, controlam sua rotina ou fazem você duvidar de si mesma.',
    legalBasis: 'A lei protege você (Violência emocional · Art. 147-B e Lei Maria da Penha)',
    examples: [
      'Chantagem, humilhação ou ameaças para controlar sua roupa, seu dinheiro ou com quem você conversa.',
      'Fazer você achar que está exagerando ou inventando algo que realmente aconteceu.',
      'Afastar você de amigas, familiares e pessoas que te apoiam.'
    ],
    whatToDo: [
      'Converse com alguém de confiança ou ligue para o 180 — você não precisa carregar isso sozinha.',
      'O que você sente importa: medo, angústia e perda de liberdade são sinais reais.',
      'Você tem direito a escuta psicológica gratuita pelo SUS, CREAS ou NEAVIT em SC.'
    ]
  },
  {
    id: 'violencia_virtual',
    title: 'Violência virtual e exposição íntima',
    shortTitle: 'Violência virtual',
    summary: 'Ameaças na internet, perseguição online ou compartilhamento de fotos e vídeos íntimos sem a sua permissão.',
    legalBasis: 'A lei protege você (Exposição íntima sem permissão · Art. 218-C)',
    examples: [
      'Mostrar, enviar ou ameaçar espalhar fotos ou vídeos íntimos sem sua autorização.',
      'Pedir dinheiro ou encontros para não divulgar imagens suas.',
      'Criar contas falsas com seu nome ou expor seus dados pessoais na internet.'
    ],
    whatToDo: [
      'Antes de bloquear, salve prints mostrando o perfil, o endereço da página, a data e a hora.',
      'Não se culpe e não ceda a chantagens: quem comete crime é quem expõe ou ameaça.',
      'Você pode buscar ajuda pela Delegacia Virtual de SC ou em uma DPCAMI / DEAM para pedir a retirada do conteúdo.'
    ]
  }
];

export const RIGHTS_GUIDE: RightGuideItem[] = [
  {
    id: 'atendimento-humanizado',
    title: 'Ser ouvida com respeito e sem julgamentos',
    summary: 'Em qualquer serviço público, você tem direito a privacidade, acolhimento e escuta cuidadosa — sem nunca ser culpada pelo que aconteceu.',
    details: [
      'Em Santa Catarina, as DPCAMIs / DEAMs (delegacias que atendem mulheres) contam com Salas Lilás para receber você com mais privacidade.',
      'Sempre que houver profissional mulher disponível, você pode pedir para ser atendida por ela.',
      'Se quiser, você pode ir acompanhada de alguém da sua confiança.'
    ]
  },
  {
    id: 'medida-protetiva',
    title: 'Medidas protetivas para afastar quem te ameaça',
    summary: 'Se você sofre ameaça, perseguição ou violência doméstica e de gênero, a Justiça pode proibir a pessoa de chegar perto ou entrar em contato.',
    details: [
      'Você pode pedir na delegacia (DPCAMI / DEAM ou plantão 24h), pela Defensoria Pública (DefenDelas) ou online no Balcão Virtual do TJSC.',
      'Os pedidos são analisados com urgência pela Justiça, geralmente em até 48 horas.',
      'Se a pessoa descumprir a medida, ligue 190 imediatamente.'
    ]
  },
  {
    id: 'boletim-ocorrencia',
    title: 'Fazer o registro oficial pela internet ou pessoalmente',
    summary: 'Quando você se sentir pronta, o Boletim de Ocorrência oficializa o que aconteceu para que a polícia possa investigar e proteger você.',
    details: [
      'Em SC, você pode fazer pela internet na Delegacia Virtual (delegaciavirtual.sc.gov.br) ou ir até uma delegacia.',
      'Você não precisa ter todas as provas em mãos para contar o que houve.',
      'Aqui no app há um espaço que organiza seu relato em texto pronto, se você quiser copiar e colar lá.'
    ]
  },
  {
    id: 'saude-gratuita',
    title: 'Cuidado médico e psicológico gratuito pelo SUS',
    summary: 'Se houve violência sexual recente, os hospitais 24h atendem você com sigilo e gratuitamente, sem exigir passagem antes pela delegacia.',
    details: [
      'Hospitais de referência (rede SAVIS em SC) oferecem acolhimento, medicação preventiva (idealmente em até 72h) e apoio emocional.',
      'Cuidar da sua saúde vem em primeiro lugar e é um direito seu.'
    ]
  }
];

export const PRIVACY_TRUTHS = [
  {
    title: 'Você pode usar sem se identificar',
    text: 'Você pode abrir o mapa, ler orientações, ver seus direitos e procurar ajuda em Santa Catarina sem informar nome, e-mail ou telefone.'
  },
  {
    title: 'Botão "Sair rápido" e tecla ESC',
    text: 'Com um toque em "Sair rápido" (ou na tecla ESC), a tela muda na hora para uma página comum de previsão do tempo. Lembrete honesto: isso não apaga o histórico do navegador.'
  },
  {
    title: 'Como cuidamos do que você conta aqui',
    text: 'Quando você salva um relato no app, os detalhes ficam trancados com o seu PIN, e no mapa aparece apenas um ponto aproximado para proteger você. Para investigação policial oficial, procure sempre o 180, 181, 190 ou a Delegacia Virtual de SC.'
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
