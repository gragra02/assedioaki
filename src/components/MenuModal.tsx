import React, { useState } from 'react';
import { 
  X, HelpCircle, Mail, Info, HeartHandshake, Users, BookOpen, 
  CheckCircle2, Copy, Send, ChevronDown, ChevronUp, AlertTriangle, 
  ShieldCheck, ExternalLink, Sparkles, Scale, Heart, MessageSquare
} from 'lucide-react';
import { SC_CITIES_NAMES } from '../lib/scCities';
import { PRIVACY_TRUTHS } from '../lib/guidanceContent';

export type MenuModalSection =
  | 'privacy'
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
  };

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVolSent(true);
  };

  const menuNavItems: Array<{ id: MenuModalSection; label: string; icon: React.ComponentType<{ className?: string }> }> = [
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
                  { id: 'importunacao', title: 'Importunação sexual', law: 'Art. 215-A do Código Penal' },
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
                  <>
                    <div className="flex items-center gap-2 text-[#8c3d52] font-semibold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Importunação sexual (é crime)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>O que é:</strong> Qualquer ato sexual feito sem a sua permissão. A culpa nunca é sua.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Toques sem permissão no ônibus, na rua ou em festas.</li>
                      <li>Beijo forçado, puxão pelo braço ou encoxada.</li>
                      <li>Mostrar partes íntimas ou fazer gestos obscenos para você.</li>
                    </ul>
                  </>
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
