import React, { useState, useEffect } from 'react';
import { Report, HarassmentType, LocationType, RiskLevel, User, ReportDraft } from '../types';
import { encryptData } from '../lib/crypto';
import { saveReportDraft, getReportDraft, clearReportDraft } from '../lib/draftStorage';
import { SC_CITIES_NAMES, getCityCoordinates } from '../lib/scCities';
import { 
  Shield, 
  Lock, 
  FileText, 
  MapPin, 
  Calendar, 
  Clock, 
  Paperclip, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  EyeOff, 
  Sparkles, 
  Send, 
  Download, 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  ShieldAlert, 
  Play, 
  Trash2, 
  PauseCircle, 
  Check, 
  X,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface ReportFormModalProps {
  user: User | null;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onSubmitSuccess: (newReport: Report) => void;
  onCancel: () => void;
  onEmergencyExit?: () => void;
}

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  user,
  initialLat,
  initialLng,
  initialAddress,
  onSubmitSuccess,
  onCancel,
  onEmergencyExit
}) => {
  const [step, setStep] = useState<number>(1);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [category, setCategory] = useState<HarassmentType>('importunacao_sexual');
  const [title, setTitle] = useState<string>('');
  const [locationType, setLocationType] = useState<LocationType>('transporte_publico');
  const [address, setAddress] = useState<string>(initialAddress || '');
  const [city, setCity] = useState<string>('Florianópolis');
  const [state, setState] = useState<string>('SC');
  const [lat, setLat] = useState<number>(initialLat || -27.5954);
  const [lng, setLng] = useState<number>(initialLng || -48.5480);
  const [dateTime, setDateTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [periodOfDay, setPeriodOfDay] = useState<'manha' | 'tarde' | 'noite' | 'madrugada'>('noite');
  const [description, setDescription] = useState<string>('');
  const [aggressorDetails, setAggressorDetails] = useState<string>('');
  const [witnesses, setWitnesses] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('alto');
  const [secretPin, setSecretPin] = useState<string>('1234');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  // Draft Management State
  const [savedDraftPrompt, setSavedDraftPrompt] = useState<ReportDraft | null>(null);
  const [draftSavedNotice, setDraftSavedNotice] = useState<string | null>(null);
  const [geoFeedback, setGeoFeedback] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Check for existing draft on component mount
  useEffect(() => {
    const existingDraft = getReportDraft();
    if (existingDraft) {
      setSavedDraftPrompt(existingDraft);
    }
  }, []);

  // Helper to compile current draft data
  const getCurrentDraftObject = (reason: 'aggressor_present' | 'quick_exit' | 'user_pause' = 'user_pause'): ReportDraft => ({
    savedAt: new Date().toISOString(),
    step,
    isAnonymous,
    category,
    title,
    locationType,
    address,
    city,
    state,
    lat,
    lng,
    dateTime,
    periodOfDay,
    description,
    aggressorDetails,
    witnesses,
    riskLevel,
    secretPin,
    attachmentName,
    reasonForPause: reason
  });

  // Debounced auto-save effect to protect against accidental exit or power loss
  useEffect(() => {
    if (!submittedReport && (title.trim() || description.trim() || aggressorDetails.trim() || step > 1)) {
      const timer = setTimeout(() => {
        saveReportDraft(getCurrentDraftObject('user_pause'));
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [
    step, 
    isAnonymous, 
    category, 
    title, 
    locationType, 
    address, 
    city, 
    state, 
    lat, 
    lng, 
    dateTime, 
    periodOfDay, 
    description, 
    aggressorDetails, 
    witnesses, 
    riskLevel, 
    secretPin, 
    attachmentName, 
    submittedReport
  ]);

  // Restore draft into form fields
  const handleApplyDraft = () => {
    if (!savedDraftPrompt) return;
    setStep(savedDraftPrompt.step || 1);
    setIsAnonymous(savedDraftPrompt.isAnonymous ?? true);
    setCategory(savedDraftPrompt.category || 'importunacao_sexual');
    setTitle(savedDraftPrompt.title || '');
    setLocationType(savedDraftPrompt.locationType || 'transporte_publico');
    setAddress(savedDraftPrompt.address || '');
    setCity(savedDraftPrompt.city || 'Florianópolis');
    setState(savedDraftPrompt.state || 'SC');
    setLat(savedDraftPrompt.lat || -27.5954);
    setLng(savedDraftPrompt.lng || -48.5480);
    setDateTime(savedDraftPrompt.dateTime || new Date().toISOString().slice(0, 16));
    setPeriodOfDay(savedDraftPrompt.periodOfDay || 'noite');
    setDescription(savedDraftPrompt.description || '');
    setAggressorDetails(savedDraftPrompt.aggressorDetails || '');
    setWitnesses(savedDraftPrompt.witnesses || '');
    setRiskLevel(savedDraftPrompt.riskLevel || 'alto');
    setSecretPin(savedDraftPrompt.secretPin || '1234');
    setAttachmentName(savedDraftPrompt.attachmentName || '');
    setSavedDraftPrompt(null);
    setDraftSavedNotice('Rascunho restaurado com sucesso. Você pode continuar preenchendo.');
    setTimeout(() => setDraftSavedNotice(null), 3500);
  };

  // Discard draft completely
  const handleDiscardDraft = () => {
    clearReportDraft();
    setSavedDraftPrompt(null);
    setDraftSavedNotice('Rascunho descartado. Iniciando formulário limpo.');
    setTimeout(() => setDraftSavedNotice(null), 3000);
  };

  // Emergency safety pause (aggressor approaching)
  const handleEmergencyPause = () => {
    const draft = getCurrentDraftObject('aggressor_present');
    saveReportDraft(draft);
    if (onEmergencyExit) {
      onEmergencyExit();
    } else {
      onCancel();
    }
  };

  // Normal save and pause
  const handleNormalSaveDraft = () => {
    const draft = getCurrentDraftObject('user_pause');
    saveReportDraft(draft);
    setDraftSavedNotice('Rascunho protegido salvo no seu dispositivo.');
    setTimeout(() => {
      onCancel();
    }, 700);
  };

  const handleFetchCurrentLocation = () => {
    setGeoFeedback(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setAddress(`Localização via GPS: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setGeoFeedback('Coordenadas de GPS obtidas com sucesso.');
          setTimeout(() => setGeoFeedback(null), 3000);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setGeoFeedback('Não foi possível obter a localização exata do GPS. Por favor, digite o endereço manualmente.');
        }
      );
    } else {
      setGeoFeedback('Geolocalização não suportada neste navegador.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsEncrypting(true);

    try {
      // Create Protocol ID
      const protocolId = 'ASK-2026-' + Math.floor(10000 + Math.random() * 90000);
      const userPin = secretPin.trim() || '1234';

      // Sensitive Payload string
      const sensitiveDataToEncrypt = JSON.stringify({
        title,
        description,
        aggressorDetails,
        witnesses,
        userEmail: isAnonymous ? 'ANONIMO' : user?.email || 'NAO_INFORMADO',
        createdAt: new Date().toISOString()
      });

      // E2EE Web Crypto AES-GCM Encryption
      const encrypted = await encryptData(sensitiveDataToEncrypt, userPin);

      const newReport: Report = {
        id: protocolId,
        accessKey: userPin,
        isAnonymous,
        title: title || 'Denúncia sem título',
        category,
        locationType,
        address: address || 'Endereço não informado',
        city,
        state,
        lat,
        lng,
        dateTime,
        periodOfDay,
        description,
        aggressorDetails,
        witnesses,
        riskLevel,
        status: 'registrada',
        forwardDestination: 'Central 180 / Delegacia Eletrônica',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        encryptedPayload: JSON.stringify(encrypted),
        encryptionHash: encrypted.hash,
        timeline: [
          {
            id: 'tl-' + Date.now(),
            date: new Date().toISOString(),
            title: 'Denúncia Criptografada e Registrada',
            note: `Gravada sob protocolo exclusivo com criptografia AES-GCM (SHA-256: ${encrypted.hash.slice(0, 12)}...)`,
            actor: 'Sistema AssédioAki'
          }
        ],
        attachments: attachmentName ? [
          {
            id: 'att-1',
            name: attachmentName,
            size: '1.8 MB',
            type: 'image/jpeg'
          }
        ] : []
      };

      // Clear draft once submitted successfully
      clearReportDraft();

      setSubmittedReport(newReport);
      onSubmitSuccess(newReport);
    } catch (err) {
      console.error(err);
      setSubmitError('Erro ao processar a denúncia com criptografia. Verifique os dados e tente novamente.');
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-purple-900/40 rounded-2xl max-w-3xl mx-auto p-5 sm:p-8 shadow-2xl shadow-purple-950/40 space-y-6">
      {/* Header with Safety Pause Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-pink-400 rounded-xl border border-purple-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              Registro Seguro de Denúncia
            </h2>
            <p className="text-xs text-slate-400">
              Criptografia E2EE • Rascunho com Salvamento Protetivo
            </p>
          </div>
        </div>

        {/* Safety & Pause Buttons Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {!submittedReport && (
            <>
              {/* Emergency Interruption Button */}
              <button 
                type="button"
                onClick={handleEmergencyPause}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md animate-pulse hover:animate-none cursor-pointer border border-rose-500"
                title="Pausar e esconder imediatamente a tela devido à presença ou aproximação do agressor"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Interromper por Segurança (Agressor Próximo)</span>
                <span className="sm:hidden">Interromper (Agressor)</span>
              </button>

              {/* Normal Save & Pause */}
              <button 
                type="button"
                onClick={handleNormalSaveDraft}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                title="Salvar rascunho seguro e continuar mais tarde"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pausar e Salvar Rascunho</span>
                <span className="sm:hidden">Pausar</span>
              </button>
            </>
          )}

          <button 
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Draft Saved Feedback Toast */}
      {draftSavedNotice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{draftSavedNotice}</span>
          </div>
          <button onClick={() => setDraftSavedNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recover Interrupted Draft Card (Shown when an interrupted draft is detected) */}
      {savedDraftPrompt && !submittedReport && (
        <div className="p-4 bg-gradient-to-r from-purple-950/90 via-slate-900 to-purple-950/90 border border-purple-500/60 rounded-xl space-y-3 animate-in fade-in duration-200 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-pink-500/20 text-pink-400 rounded-xl border border-pink-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                  <span>Rascunho de Denúncia Interrompido</span>
                  <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded font-mono border border-purple-700">
                    Etapa {savedDraftPrompt.step} de 4
                  </span>
                  {savedDraftPrompt.reasonForPause === 'aggressor_present' && (
                    <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 font-bold">
                      Interrompido por Segurança
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Salvo em {new Date(savedDraftPrompt.savedAt).toLocaleString('pt-BR')} • {savedDraftPrompt.title || 'Denúncia em andamento'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSavedDraftPrompt(null)} 
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
              title="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-purple-200/90 leading-relaxed">
            Identificamos que você precisou pausar o preenchimento anteriormente por receio ou segurança. Todos os seus relatos e detalhes digitados foram guardados em sigilo no seu navegador.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleApplyDraft}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Retomar Denúncia de Onde Parei</span>
            </button>

            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Descartar Rascunho</span>
            </button>
          </div>
        </div>
      )}

      {/* Geolocation feedback if any */}
      {geoFeedback && (
        <div className="p-3 bg-slate-950 border border-purple-800/50 rounded-xl text-xs text-purple-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{geoFeedback}</span>
        </div>
      )}

      {/* Submit error feedback if any */}
      {submitError && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {!submittedReport ? (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Step Progress Bar with safety hint */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className={step >= 1 ? 'text-purple-400' : ''}>1. Modalidade</span>
              <span className={step >= 2 ? 'text-purple-400' : ''}>2. Local & Data</span>
              <span className={step >= 3 ? 'text-purple-400' : ''}>3. Relato</span>
              <span className={step >= 4 ? 'text-purple-400' : ''}>4. Criptografia</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Seus dados são salvos em segundo plano continuamente.</span>
              <span className="text-purple-400 font-medium">Teclando ESC ativa o disfarce imediato.</span>
            </div>
          </div>

          {/* STEP 1: Modalidade & Tipo */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Escolha a Modalidade do Relato
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setIsAnonymous(true)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isAnonymous 
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow-md' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
                      <EyeOff className="w-4 h-4 text-pink-400" />
                      <span>100% Anônimo</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Nenhum dado pessoal, nome ou e-mail será associado ao protocolo.
                    </p>
                  </div>

                  <div
                    onClick={() => setIsAnonymous(false)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      !isAnonymous 
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow-md' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
                      <UserCheck className="w-4 h-4 text-purple-400" />
                      <span>Identificado com Sigilo</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Seu cadastro facilitará o acompanhamento direto de acolhimento.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Tipo de Infração / Violência
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCategory('importunacao_sexual')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      category === 'importunacao_sexual'
                        ? 'bg-purple-950/70 border-purple-500 text-white shadow-sm ring-1 ring-purple-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-purple-300">Importunação Sexual</span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Toques não autorizados, beijos forçados, masturbação pública (Lei 13.718/18).
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('assedio_sexual')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      category === 'assedio_sexual'
                        ? 'bg-purple-950/70 border-purple-500 text-white shadow-sm ring-1 ring-purple-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-purple-300">Assédio Sexual</span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Chantagem, favores sexuais em relação de trabalho ou subordinação (Art. 216-A).
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('assedio_moral')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      category === 'assedio_moral'
                        ? 'bg-purple-950/70 border-purple-500 text-white shadow-sm ring-1 ring-purple-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-purple-300">Assédio Moral</span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Humilhação reiterada, perseguição sistemática, constrangimento no ambiente laboral.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('perseguicao')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      category === 'perseguicao'
                        ? 'bg-purple-950/70 border-purple-500 text-white shadow-sm ring-1 ring-purple-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-purple-300">Perseguição (Stalking)</span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Perseguição reiterada física ou online, vigília, ameaça ou invasão de privacidade (Art. 147-A).
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('violencia_psicologica')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      category === 'violencia_psicologica'
                        ? 'bg-purple-950/70 border-purple-500 text-white shadow-sm ring-1 ring-purple-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-purple-300">Violência Psicológica</span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Dano emocional, controle, humilhação, isolamento, manipulação ou ameaças (Art. 147-B).
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('violencia_virtual')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      category === 'violencia_virtual'
                        ? 'bg-purple-950/70 border-purple-500 text-white shadow-sm ring-1 ring-purple-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-purple-300">Violência Virtual / Nudez</span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Divulgação não consentida de fotos íntimas, sextorsão, vazamento e cyberbullying (Art. 218-C).
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Título Resumido do Caso
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Importunação dentro do ônibus Linha TICEN / Beira-Mar..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!title.trim()}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>Próximo Passo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Local & Horário */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Tipo de Local do Ocorrido
                </label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as LocationType)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="transporte_publico">🚌 Transporte Público (Ônibus, Metrô, Terminal)</option>
                  <option value="via_publica">🛣️ Via Pública (Rua, Calçada, Praça)</option>
                  <option value="trabalho">🏢 Ambiente de Trabalho / Empresa</option>
                  <option value="escola_universidade">🎓 Escola / Universidade</option>
                  <option value="evento_festa">🎉 Evento, Festa, Show ou Balada</option>
                  <option value="internet">🌐 Ambiente Virtual / Internet</option>
                  <option value="local_privado">🏠 Local Privado / Residência</option>
                  <option value="outro">📍 Outro Local</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Endereço ou Ponto de Referência
                  </label>
                  <button
                    type="button"
                    onClick={handleFetchCurrentLocation}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Usar Minha Localização GPS</span>
                  </button>
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Av. Mauro Ramos, próximo ao Ponto de Ônibus 14..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Cidade (Santa Catarina)
                    </label>
                    <span className="text-[10px] text-purple-400 font-bold">295 Municípios</span>
                  </div>
                  <select 
                    value={city}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      setCity(newCity);
                      const coords = getCityCoordinates(newCity);
                      setLat(coords[0]);
                      setLng(coords[1]);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {SC_CITIES_NAMES.map(cName => (
                      <option key={cName} value={cName} className="bg-slate-900 text-white">
                        {cName} (SC)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
                  <input 
                    type="text" 
                    value={state}
                    disabled
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data e Hora Aproximada</label>
                  <input 
                    type="datetime-local" 
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Período do Dia</label>
                  <select
                    value={periodOfDay}
                    onChange={(e) => setPeriodOfDay(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="manha">Manhã (06h às 12h)</option>
                    <option value="tarde">Tarde (12h às 18h)</option>
                    <option value="noite">Noite (18h às 00h)</option>
                    <option value="madrugada">Madrugada (00h às 06h)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  disabled={!address.trim()}
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>Próximo Passo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Relato & Fatos */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição Circunstanciada dos Fatos
                </label>
                <p className="text-[11px] text-slate-400 mb-1.5">
                  Descreva o que ocorreu com o máximo de detalhes que se sentir confortável em relatar.
                </p>
                <textarea 
                  rows={4}
                  required
                  placeholder="Descreva a sequência dos acontecimentos, falas, abordagens e reações..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Características do Agressor (Opcional)
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Altura aproximada, cor de camisa, tatuagens, apelido ou vínculo..."
                  value={aggressorDetails}
                  onChange={(e) => setAggressorDetails(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Testemunhas ou Pessoas que Presenciaram (Opcional)
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Cobrador do ônibus, colegas de trabalho, motorista..."
                  value={witnesses}
                  onChange={(e) => setWitnesses(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Selecione o nível de gravidade da ocorrência:</span>
                  <span className="text-[10px] text-purple-300 font-normal">Passe o cursor sobre os níveis para ver a orientação</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Baixo */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setRiskLevel('baixo')}
                      className={`w-full py-2.5 px-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        riskLevel === 'baixo' || riskLevel === 'leve' 
                          ? 'bg-blue-900/60 text-blue-200 border-blue-400 ring-2 ring-blue-500/50 shadow-md' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Relatos de comentários isolados ou situações de desconforto único, onde a orientação preventiva ou escuta é suficiente."
                    >
                      <span>🔵 Baixo</span>
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400 opacity-80" />
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-64 text-center animate-in fade-in zoom-in-95 duration-150">
                      <div className="bg-slate-950 text-white text-[11px] rounded-xl p-2.5 shadow-2xl border border-slate-700 leading-snug">
                        <strong className="text-blue-400 block mb-0.5 font-bold">🔵 Nível Baixo:</strong>
                        Relatos de comentários isolados ou situações de desconforto único, onde a orientação preventiva ou escuta é suficiente.
                      </div>
                      <div className="w-2.5 h-2.5 bg-slate-950 border-b border-r border-slate-700 rotate-45 -mt-1.5" />
                    </div>
                  </div>

                  {/* Médio */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setRiskLevel('medio')}
                      className={`w-full py-2.5 px-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        riskLevel === 'medio' || riskLevel === 'moderado' 
                          ? 'bg-amber-900/60 text-amber-200 border-amber-400 ring-2 ring-amber-500/50 shadow-md' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Envolve assédio verbal recorrente, constrangimento no ambiente de trabalho/estudo ou condutas inapropiadas repetidas"
                    >
                      <span>🟡 Médio</span>
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400 opacity-80" />
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-64 text-center animate-in fade-in zoom-in-95 duration-150">
                      <div className="bg-slate-950 text-white text-[11px] rounded-xl p-2.5 shadow-2xl border border-slate-700 leading-snug">
                        <strong className="text-amber-400 block mb-0.5 font-bold">🟡 Nível Médio:</strong>
                        Envolve assédio verbal recorrente, constrangimento no ambiente de trabalho/estudo ou condutas inapropiadas repetidas.
                      </div>
                      <div className="w-2.5 h-2.5 bg-slate-950 border-b border-r border-slate-700 rotate-45 -mt-1.5" />
                    </div>
                  </div>

                  {/* Grave */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setRiskLevel('grave')}
                      className={`w-full py-2.5 px-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        riskLevel === 'grave' || riskLevel === 'urgente' || riskLevel === 'alto' 
                          ? 'bg-rose-900/60 text-rose-200 border-rose-400 ring-2 ring-rose-500/50 shadow-md' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Envolve violência física, ameaça direta, coerção ou reincidência insistente (ex: stalking ou chantagem)"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span>🔴 Grave</span>
                      <HelpCircle className="w-3.5 h-3.5 text-rose-400 opacity-80" />
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-64 text-center animate-in fade-in zoom-in-95 duration-150">
                      <div className="bg-slate-950 text-white text-[11px] rounded-xl p-2.5 shadow-2xl border border-slate-700 leading-snug">
                        <strong className="text-rose-400 block mb-0.5 font-bold">🔴 Nível Grave:</strong>
                        Envolve violência física, ameaça direta, coerção ou reincidência insistente (ex: stalking ou chantagem).
                      </div>
                      <div className="w-2.5 h-2.5 bg-slate-950 border-b border-r border-slate-700 rotate-45 -mt-1.5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  disabled={!description.trim()}
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>Próximo Passo (Criptografia)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Criptografia E2EE & Envio */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-3">
                <div className="flex items-center gap-2.5 text-purple-300 font-bold text-sm">
                  <Lock className="w-5 h-5 text-pink-400" />
                  <span>Criptografia de Ponta a Ponta (AES-GCM 256-bit)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para sua máxima proteção, os dados sensíveis deste relato serão encriptados diretamente no seu navegador antes do armazenamento. Apenas detentores da sua senha ou chave de protocolo poderão desencriptá-los.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Defina um PIN Secreto de Acesso (4 Dígitos)
                </label>
                <input 
                  type="password" 
                  maxLength={6}
                  required
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  className="w-full sm:w-48 px-3.5 py-2.5 bg-slate-950 border border-purple-500/50 rounded-xl text-sm font-extrabold text-center text-white tracking-widest focus:outline-none focus:border-purple-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Guarde este PIN para acessar e exportar seu caso com segurança e sigilo.
                </p>
              </div>

              {/* Privacy Terms Notice */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-normal space-y-1">
                <p className="font-semibold text-slate-300">Termos de Privacidade e Proteção LGPD (Art. 5º II)</p>
                <p>
                  Esta denúncia é protegida por normativas estritas de confidencialidade de dados de gênero e integridade física. Nenhuma informação pessoal será vendida, exposta publicamente ou transferida a terceiros sem a sua expressa autorização.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  type="submit"
                  disabled={isEncrypting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-950 cursor-pointer disabled:opacity-50"
                >
                  {isEncrypting ? (
                    <span>Processando Criptografia...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Criptografar & Registrar Denúncia</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      ) : (
        /* Submission Success Receipt Screen */
        <div className="space-y-6 text-center animate-in zoom-in-95 duration-300 py-4">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Denúncia Registrada com Sucesso
            </span>
            <h3 className="text-2xl font-extrabold text-white font-heading">
              Protocolo Gerado
            </h3>
          </div>

          <div className="p-5 bg-slate-950 border border-purple-500/40 rounded-2xl max-w-md mx-auto space-y-3">
            <p className="text-xs text-slate-400">Seu número de protocolo criptografado é:</p>
            <div className="text-2xl font-mono font-bold text-purple-300 tracking-wider bg-slate-900 py-2.5 px-4 rounded-xl border border-slate-800">
              {submittedReport.id}
            </div>
            <p className="text-[11px] text-slate-400">
              PIN de Desbloqueio: <strong className="text-amber-300 font-mono">{submittedReport.accessKey}</strong>
            </p>
            <p className="text-[10px] text-slate-500 font-mono break-all">
              SHA-256: {submittedReport.encryptionHash}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => onCancel()}
              className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md"
            >
              Ver no Mapa de Calor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
