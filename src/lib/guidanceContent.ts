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

export const PRIVACY_TRUTHS = [
  {
    title: 'Você pode usar sem se identificar',
    text: 'Você pode abrir o mapa, ler orientações, ver onde buscar atendimento e procurar apoio em Santa Catarina sem informar nome, e-mail ou telefone.'
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
