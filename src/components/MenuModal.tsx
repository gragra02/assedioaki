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
                  Guia prático e jurídico
                </p>
                <h4 className="text-lg font-semibold text-[#261d2e] font-heading mt-0.5">
                  Identifique o tipo de violência ou assédio
                </h4>
                <p className="text-xs sm:text-sm text-[#5a4e66] mt-1">
                  Selecione abaixo a situação que mais se aproxima do que aconteceu para entender melhor os conceitos legais.
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
                      <span>Importunação sexual (Crime • Pena de 1 a 5 anos)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>Como identificar:</strong> Praticar contra alguém, sem consentimento, ato de caráter sexual para satisfazer a própria vontade ou a de outra pessoa.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Toques íntimos indesejados em transporte público, festas ou ruas.</li>
                      <li>Beijo forçado, puxão ou contato físico sem consentimento.</li>
                      <li>Exposição ou atos obscenos direcionados à vítima.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'assedio_sexual' && (
                  <>
                    <div className="flex items-center gap-2 text-[#8c3d52] font-semibold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Assédio sexual (Art. 216-A • Relação de hierarquia)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>Como identificar:</strong> Constranger alguém para obter vantagem sexual usando a posição de superioridade no trabalho, cargo ou ensino.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Chefe ou gestor exigindo encontros em troca de promoção ou permanência no emprego.</li>
                      <li>Professor condicionando nota ou aprovação a favores íntimos.</li>
                      <li>Chantagens diretas ou veladas ligadas à sua função.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'assedio_moral' && (
                  <>
                    <div className="flex items-center gap-2 text-[#6d4c82] font-semibold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Assédio moral no trabalho ou ambiente institucional</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>Como identificar:</strong> Expor a pessoa a situações humilhantes, constrangedoras e repetidas durante o trabalho ou atividade acadêmica.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Gritos, piadas depreciativas e humilhações diante de colegas.</li>
                      <li>Isolamento proposital, metas impossíveis ou boicote às ferramentas de trabalho.</li>
                      <li>Perseguição contínua contra colaboradoras ou estudantes.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'stalking' && (
                  <>
                    <div className="flex items-center gap-2 text-[#6d4c82] font-semibold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Perseguição reiterada / Stalking (Art. 147-A)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>Como identificar:</strong> Perseguir alguém de forma repetida, presencialmente ou online, ameaçando sua integridade ou restringindo sua liberdade.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Vigilância constante na saída do trabalho, faculdade ou casa.</li>
                      <li>Ligações insistentes, perfis falsos e mensagens sem parar após recusa.</li>
                      <li>Recados intimidadores ou presentes indesejados.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'psicologica' && (
                  <>
                    <div className="flex items-center gap-2 text-[#6d4c82] font-semibold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Violência psicológica contra a mulher (Art. 147-B)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>Como identificar:</strong> Causar dano emocional à mulher ou tentar controlar suas ações, escolhas, amizades e decisões.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Ameaças, humilhação, chantagem, manipulação e isolamento.</li>
                      <li>Ridicularização, controle de celular/dinheiro ou distorção dos fatos.</li>
                    </ul>
                  </>
                )}

                {selectedIncidentType === 'digital' && (
                  <>
                    <div className="flex items-center gap-2 text-[#8c3d52] font-semibold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Divulgação não consentida de conteúdo íntimo (Art. 218-C)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                      <strong>Como identificar:</strong> Compartilhar, publicar, vender ou transmitir foto ou vídeo íntimo privado sem autorização da pessoa retratada.
                    </p>
                    <ul className="text-xs sm:text-sm text-[#5a4e66] space-y-1 list-disc pl-5">
                      <li>Vazamento de fotos ou vídeos em grupos de mensagens ou redes sociais.</li>
                      <li>Chantagem com ameaça de expor imagens íntimas.</li>
                    </ul>
                  </>
                )}

                <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#e6dfee]">
                  <span className="text-xs text-[#5a4e66]">
                    Você pode organizar e guardar um relato neste aplicativo quando se sentir segura.
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
                      <span>Registrar relato no app</span>
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
                    q: '1. O relato neste aplicativo é realmente anônimo?',
                    a: 'Você não precisa criar conta nem informar nome, CPF ou telefone. O texto detalhado do relato é criptografado no navegador com AES-GCM usando o PIN escolhido, mas título curto, categoria, cidade e ponto aproximado ficam visíveis no mapa preventivo. Evite colocar dados que identifiquem você ou sua casa nesses campos.'
                  },
                  {
                    q: '2. Como funciona o código do protocolo e o PIN?',
                    a: 'Ao salvar um relato, você recebe um código de protocolo e define um PIN. Com os dois, pode consultar o conteúdo completo e adicionar novas anotações na área "Acompanhar protocolo".'
                  },
                  {
                    q: '3. O registro no Assédio Aki substitui o Boletim de Ocorrência na Polícia?',
                    a: 'Não substitui. Para investigação policial oficial ou pedido de medida protetiva, é necessário registrar Boletim de Ocorrência pelo 190, 180, Delegacia Virtual de SC ou presencialmente em uma delegacia. O aplicativo oferece um organizador de texto para facilitar esse preenchimento.'
                  },
                  {
                    q: '4. O que fica visível no mapa de Santa Catarina?',
                    a: 'O mapa mostra áreas de incidência com base em registros demonstrativos iniciais e relatos salvos no dispositivo/base conectada, além da localização das Delegacias da Mulher (DPCAMI) e hospitais SAVIS em SC.'
                  },
                  {
                    q: '5. Como funciona o botão "Sair rápido"?',
                    a: 'Ao clicar em "Sair rápido" ou pressionar ESC, a tela é imediatamente disfarçada por uma página neutra de clima e receitas. Atenção: esse recurso não apaga o histórico do navegador; se precisar, use o botão "Ir para Google.com" ou feche a aba.'
                  },
                  {
                    q: '6. Funciona para todas as cidades de Santa Catarina?',
                    a: 'Sim. O aplicativo cobre os 295 municípios de Santa Catarina no mapa e reúne os contatos das 31 DPCAMIs, hospitais 24h SAVIS, Centrais de Plantão Policial e serviços como NEAVIT, OAB Por Elas, DefenDelas e CEAV.'
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
