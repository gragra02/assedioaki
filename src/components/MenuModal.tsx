import React, { useState } from 'react';
import { 
  X, HelpCircle, Mail, Info, HeartHandshake, Users, BookOpen, 
  CheckCircle2, Copy, Send, ChevronDown, ChevronUp, AlertTriangle, 
  ShieldCheck, ExternalLink, Sparkles, Scale, Heart, MessageSquare
} from 'lucide-react';
import { SC_CITIES_NAMES } from '../lib/scCities';

export type MenuModalSection = 
  | 'identify' 
  | 'contact' 
  | 'about' 
  | 'donate' 
  | 'volunteer' 
  | 'faqs';

interface MenuModalProps {
  isOpen: boolean;
  initialSection?: MenuModalSection;
  onClose: () => void;
  onOpenReport?: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  initialSection = 'identify',
  onClose,
  onOpenReport
}) => {
  const [activeSection, setActiveSection] = useState<MenuModalSection>(initialSection);

  // Sync section when initialSection changes
  React.useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection, isOpen]);

  // Quiz state for "Identifique o Tipo de Violência"
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>('importunacao');

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

  if (!isOpen) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVolSent(true);
    setTimeout(() => {
      setVolSent(false);
      setVolName('');
      setVolEmail('');
    }, 4000);
  };

  const menuNavItems: Array<{ id: MenuModalSection; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'identify', label: 'Identifique o Tipo de Violência', icon: BookOpen },
    { id: 'contact', label: 'Entre em Contato', icon: Mail },
    { id: 'about', label: 'Sobre AssédioAki', icon: Info },
    { id: 'donate', label: 'Doe para AssédioAki', icon: HeartHandshake },
    { id: 'volunteer', label: 'Seja Voluntário no AssédioAki', icon: Users },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 text-white flex items-center justify-between border-b border-purple-700/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Scale className="w-4 h-4 text-pink-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Central de Informações & Apoio</h3>
              <p className="text-[11px] text-purple-200">AssédioAki Santa Catarina • Conhecimento, Direitos e Rede</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs (Desktop & Mobile Scrollable) */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {menuNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-purple-950 hover:bg-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-800 space-y-6">
          
          {/* SECTION 1: IDENTIFIQUE O TIPO DE VIOLÊNCIA */}
          {activeSection === 'identify' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] uppercase font-black text-pink-600 tracking-wider">
                  Guia Prático e Jurídico
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  Identifique o Tipo de Violência ou Assédio
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Muitas vezes a vítima tem dúvidas sobre a tipificação legal do ocorrido. Selecione abaixo a situação que mais se assemelha ao que aconteceu:
                </p>
              </div>

              {/* Selector Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'importunacao', title: 'Importunação Sexual', law: 'Art. 215-A do Código Penal' },
                  { id: 'assedio_sexual', title: 'Assédio Sexual', law: 'Art. 216-A do Código Penal' },
                  { id: 'assedio_moral', title: 'Assédio Moral', law: 'CLT e Lei 8.112 / Código Civil' },
                  { id: 'stalking', title: 'Perseguição (Stalking)', law: 'Art. 147-A do Código Penal' },
                  { id: 'psicologica', title: 'Violência Psicológica', law: 'Art. 147-B do Código Penal' },
                  { id: 'digital', title: 'Violência Virtual / Nudez', law: 'Art. 218-C do Código Penal' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedIncidentType(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedIncidentType === item.id
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-400/40 shadow-xs'
                        : 'border-slate-200 hover:border-purple-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className={`text-xs font-extrabold ${selectedIncidentType === item.id ? 'text-purple-950' : 'text-slate-800'}`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.law}</p>
                  </button>
                ))}
              </div>

              {/* Diagnostic Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                {selectedIncidentType === 'importunacao' && (
                  <>
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Importunação Sexual (Crime Inafiançável • Pena de 1 a 5 anos)</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Como identificar:</strong> Praticar contra alguém e sem a sua anuência ato libidinoso com o objetivo de satisfazer a própria lascívia ou a de terceiro.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-5">
                      <li>Toques íntimos indesejados em transporte público, festas ou vias públicas.</li>
                      <li>Beijo forçado, puxão de braço ou passada de mão sem consentimento.</li>
                      <li>Masturbação pública ou ejaculação contra a vítima.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'assedio_sexual' && (
                  <>
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Assédio Sexual (Art. 216-A • Relação de Hierarquia ou Emprego)</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Como identificar:</strong> Constranger alguém com o intuito de obter vantagem ou favorecimento sexual, prevalecendo-se o agente da sua condição de superior hierárquico ou ascendência inerentes ao exercício de emprego, cargo ou função.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-5">
                      <li>Chefe ou gestor exigindo encontros sexuais em troca de promoção ou não demissão.</li>
                      <li>Professor exigindo favores íntimos para aprovação em matéria acadêmica.</li>
                      <li>Chantagens diretas ou veladas subordinando a permanência no trabalho.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'assedio_moral' && (
                  <>
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Assédio Moral no Trabalho / Ambiente Institucional</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Como identificar:</strong> Exposição de trabalhadores a situações humilhantes, constrangedoras, repetitivas e prolongadas durante a jornada de trabalho e no exercício de suas funções.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-5">
                      <li>Gritos, piadas depreciativas e humilhações públicas na frente de colegas.</li>
                      <li>Isolamento deliberado, metas impossíveis ou retirada proposital de ferramentas de trabalho.</li>
                      <li>Boicotes sistemáticos e perseguição contra colaboradoras.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'stalking' && (
                  <>
                    <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Perseguição Reiterada / Stalking (Art. 147-A)</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Como identificar:</strong> Perseguir alguém, reiteradamente e por qualquer meio, ameaçando-lhe a integridade física ou psicológica, restringindo-lhe a capacidade de locomoção ou invadindo sua privacidade.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-5">
                      <li>Vigilância constante na saída do trabalho, faculdade ou residência.</li>
                      <li>Dezenas de ligações, perfis falsos nas redes sociais e mensagens incessantes.</li>
                      <li>Envio indesejado de presentes e recados intimidadores.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'psicologica' && (
                  <>
                    <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Violência Psicológica contra a Mulher (Art. 147-B)</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Como identificar:</strong> Causar dano emocional à mulher que a prejudique e perturbe seu pleno desenvolvimento ou que vise a degradar ou a controlar suas ações, comportamentos, crenças e decisões.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-5">
                      <li>Ameaça, constrangimento, humilhação, manipulação, isolamento e chantagem.</li>
                      <li>Ridicularização pública, limitação do direito de ir e vir ou distorção da realidade (gaslighting).</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'digital' && (
                  <>
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Divulgação Não Consentida de Conteúdo Íntimo (Art. 218-C)</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Como identificar:</strong> Oferecer, trocar, disponibilizar, transmitir, vender ou publicar foto, vídeo ou outro registro com cena de nudez ou ato sexual ou libidinoso de caráter privado sem o consentimento da vítima.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-5">
                      <li>Compartilhamento de prints íntimos em grupos de WhatsApp ou redes sociais.</li>
                      <li>Chantagem com ameaça de vazamento de fotos íntimas (sextorsão).</li>
                    </ul>
                  </>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                  <span className="text-[11px] text-slate-500">
                    Você viveu ou presenciou alguma dessas situações em Santa Catarina?
                  </span>
                  {onOpenReport && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReport();
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      <span>Registrar Ocorrência Segura</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ENTRE EM CONTATO */}
          {activeSection === 'contact' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider">
                  Canal Institucional
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  Entre em Contato com a Equipe AssédioAki
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Envie dúvidas, propostas de parcerias com prefeituras, universidades, conselhos municipais dos direitos da mulher ou sugestões para aprimoramento da plataforma em Santa Catarina.
                </p>
              </div>

              {contactSent ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-emerald-900">Mensagem Enviada com Sucesso!</h5>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Agradecemos o contato. Nossa equipe institucional responderá ao seu e-mail com sigilo e atenção o mais rápido possível.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3.5 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Seu Nome / Organização</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ex: Coletivo Feminista / Maria"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">E-mail para Retorno</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contato@exemplo.com.br"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Assunto</label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                    >
                      <option value="Dúvida sobre a Plataforma">Dúvida sobre a Plataforma</option>
                      <option value="Parceria Institucional ou Acadêmica">Parceria Institucional ou Acadêmica</option>
                      <option value="Integração com DPCAMI / Delegacia">Integração com DPCAMI / Delegacia de SC</option>
                      <option value="Sugestão de Melhoria ou Recurso">Sugestão de Melhoria ou Recurso</option>
                      <option value="Contato de Imprensa / Mídia">Contato de Imprensa / Mídia</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mensagem</label>
                    <textarea
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Descreva sua solicitação, dúvida ou proposta..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Mensagem</span>
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="font-bold text-purple-950">E-mail Oficial</p>
                  <p className="text-[11px] text-purple-800">ouvidoria@assedioaki-sc.org.br</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="font-bold text-purple-950">Emergência Imediata em SC</p>
                  <p className="text-[11px] text-purple-800">Ligue 190 (PM) ou 180 (Central da Mulher)</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: SOBRE ASSEDIOAKI */}
          {activeSection === 'about' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider">
                  Nossa Missão
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  Sobre a Plataforma AssédioAki
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Tecnologia cidadã voltada à visibilidade, prevenção e acolhimento contra o assédio em Santa Catarina.
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  O <strong>AssédioAki</strong> nasceu para transformar o silêncio em dados de proteção e segurança para todas as mulheres e pessoas em situação de vulnerabilidade no estado de Santa Catarina.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <p className="font-extrabold text-purple-950 text-xs">Anonimato Rigoroso</p>
                    <p className="text-[11px] text-slate-600">
                      Criptografia local de ponta a ponta. Você pode registrar qualquer ocorrência sem revelar seu nome ou telefone.
                    </p>
                  </div>

                  <div className="p-3.5 bg-pink-50/70 border border-pink-200 rounded-xl space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-pink-600 text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <p className="font-extrabold text-pink-950 text-xs">Mapeamento em Tempo Real</p>
                    <p className="text-[11px] text-slate-600">
                      Identificação de zonas críticas em transportes públicos, universidades e locais de trabalho catarinenses.
                    </p>
                  </div>

                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                      3
                    </div>
                    <p className="font-extrabold text-indigo-950 text-xs">Encaminhamento Legal</p>
                    <p className="text-[11px] text-slate-600">
                      Geração de minutas formais prontas para envio à Delegacia Virtual de SC (DPCAMI / DEAM) e suporte psicológico voluntário.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Compromisso Ético e LGPD</span>
                  </h5>
                  <p className="text-[11px] text-slate-600">
                    A plataforma opera estritamente de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018). As coordenadas no mapa passam por perturbação de privacidade para evitar a identificação de residências particulares de vítimas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: DOE PARA ASSEDIOAKI */}
          {activeSection === 'donate' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] uppercase font-black text-pink-600 tracking-wider">
                  Sustentabilidade & Impacto
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  Doe para o AssédioAki Santa Catarina
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Sua contribuição voluntária mantém os servidores ativos, financia campanhas de conscientização e amplia o apoio jurídico e psicológico gratuito para vítimas.
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs font-bold text-purple-900 uppercase tracking-wide">Chave Pix Oficial da Campanha</p>
                    <p className="text-sm font-black text-slate-900 font-mono bg-white px-3 py-1.5 rounded-lg border border-purple-200 inline-block">
                      {pixKey}
                    </p>
                    <p className="text-[10px] text-slate-500">Banco Cooperativo • AssédioAki SC Solidário</p>
                  </div>

                  <button
                    onClick={handleCopyPix}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    {pixCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{pixCopied ? 'Chave Pix Copiada!' : 'Copiar Chave Pix'}</span>
                  </button>
                </div>

                <div className="border-t border-purple-200/60 pt-3">
                  <p className="text-xs font-bold text-slate-800 mb-2">Para onde vai sua doação?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-600">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                      <strong className="text-purple-900 block">Infraestrutura Segura</strong>
                      Servidores criptografados e proteção contra ataques digitais.
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                      <strong className="text-pink-900 block">Cartilhas e Ações</strong>
                      Material educativo distribuído em terminais de ônibus e escolas de SC.
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                      <strong className="text-indigo-900 block">Acolhimento Gratuito</strong>
                      Ajuda de custo para transporte de vítimas a delegacias especializadas.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: SEJA VOLUNTÁRIO */}
          {activeSection === 'volunteer' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider">
                  Rede de Solidariedade
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  Seja Voluntário(a) no AssédioAki
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Profissionais de psicologia, direito, serviço social, desenvolvimento de software e comunicação podem transformar vidas doando algumas horas do mês.
                </p>
              </div>

              {volSent ? (
                <div className="p-6 bg-purple-50 border border-purple-200 rounded-2xl text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center">
                    <Heart className="w-6 h-6 fill-purple-600 text-purple-600" />
                  </div>
                  <h5 className="text-sm font-bold text-purple-950">Inscrição Recebida com Amor!</h5>
                  <p className="text-xs text-purple-800 max-w-md mx-auto">
                    Entraremos em contato com você pelo e-mail informado para agendarmos a integração com nossa equipe de Santa Catarina.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleVolunteerSubmit} className="space-y-3.5 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Seu Nome Completo</label>
                      <input
                        type="text"
                        value={volName}
                        onChange={(e) => setVolName(e.target.value)}
                        placeholder="Nome ou nome social"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Seu E-mail</label>
                      <input
                        type="email"
                        value={volEmail}
                        onChange={(e) => setVolEmail(e.target.value)}
                        placeholder="voce@email.com"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Área de Atuação</label>
                      <select
                        value={volRole}
                        onChange={(e) => setVolRole(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                      >
                        <option value="Psicologia / Acolhimento Emocional">Psicologia / Acolhimento Emocional</option>
                        <option value="Direito / Orientação Jurídica">Direito / Orientação Jurídica</option>
                        <option value="Serviço Social">Serviço Social</option>
                        <option value="Tecnologia / Desenvolvimento / Dados">Tecnologia / Desenvolvimento / Dados</option>
                        <option value="Comunicação e Redes Sociais">Comunicação e Redes Sociais</option>
                        <option value="Embaixadora Comunitária de Bairro / Cidade">Embaixadora Comunitária de Bairro / Cidade</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Sua Cidade em SC (295 Municípios)</label>
                      <select
                        value={volCity}
                        onChange={(e) => setVolCity(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium cursor-pointer"
                      >
                        {SC_CITIES_NAMES.map(cName => (
                          <option key={cName} value={cName}>{cName} (SC)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Quero Ser Voluntária</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SECTION 6: FAQS */}
          {activeSection === 'faqs' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider">
                  Perguntas Frequentes
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  Dúvidas Frequentes sobre o AssédioAki
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Respostas claras sobre privacidade, validade jurídica, sigilo e funcionamento da plataforma.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    q: '1. A minha denúncia é realmente 100% anônima?',
                    a: 'Sim. Você não precisa se cadastrar, não precisa fornecer seu nome, CPF nem número de telefone. Caso deseje se identificar, seus dados pessoais são criptografados localmente com padrão militar AES-256 e jamais são exibidos no mapa público.'
                  },
                  {
                    q: '2. Como funciona o código do protocolo e a Chave de Acesso?',
                    a: 'Ao finalizar o registro, você recebe um Protocolo (ex: ASK-2026-90412) e uma Chave de 4 dígitos. Guarde esses dois dados para acompanhar o status, receber notas da equipe de acolhimento ou atualizar seu relato a qualquer momento na aba "Acompanhar Protocolo".'
                  },
                  {
                    q: '3. O registro no AssédioAki substitui o Boletim de Ocorrência na Polícia?',
                    a: 'Não substitui automaticamente. No entanto, a plataforma gera uma Minuta Técnica Completa com data, local, descrição estruturada e hash criptográfico, que você pode baixar ou copiar para formalizar o B.O. diretamente na Delegacia Virtual da Polícia Civil de SC (DPCAMI) com poucos cliques.'
                  },
                  {
                    q: '4. Quem tem acesso às ocorrências registradas?',
                    a: 'No mapa público, qualquer pessoa pode visualizar estatísticas agregadas e áreas de incidência para se proteger. Dados sensíveis e identificadores de pessoas físicas ficam trancados sob criptografia acessível apenas pela usuária portadora da chave.'
                  },
                  {
                    q: '5. Como funciona a Saída Rápida de Emergência?',
                    a: 'Se você estiver usando a plataforma e alguém se aproximar, basta clicar no botão "Sair Rápido" (ou pressionar a tecla ESC no teclado). A tela é imediatamente disfarçada em uma página inofensiva de notícias ou redirecionada para o Google.'
                  },
                  {
                    q: '6. Sou de uma cidade de Santa Catarina do interior, posso registrar?',
                    a: 'Sim! A cobertura é para os 295 municípios de Santa Catarina. O mapa e a ferramenta de localização encontram a Delegacia de Proteção à Criança, Adolescente, Mulher e Idoso (DPCAMI / DEAM) ou hospital mais próximo de você.'
                  },
                  {
                    q: '7. Posso anexar fotos, áudios ou capturas de tela como provas?',
                    a: 'Sim, na etapa de evidências você pode anexar capturas de tela de mensagens, fotos de hematomas ou documentos que reforcem o relato para fins de preservação probatória.'
                  },
                  {
                    q: '8. Como as autoridades de Santa Catarina são informadas?',
                    a: 'A plataforma compila relatórios periódicos de manchas criminais encaminhados aos órgãos públicos, além de disponibilizar exportação direta para o Disque 181 de SC e Delegacia Virtual.'
                  }
                ].map((faq, idx) => (
                  <div 
                    key={idx}
                    className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-3.5 text-left font-bold text-xs text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {openFaq === idx ? (
                        <ChevronUp className="w-4 h-4 text-purple-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {openFaq === idx && (
                      <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2 animate-in fade-in">
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
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            AssédioAki SC • Espaço Seguro e Protegido
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
