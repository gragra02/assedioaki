import React, { useState, useEffect } from 'react';
import { Report, HarassmentType, LocationType, RiskLevel, User, ReportDraft } from '../types';
import { encryptData } from '../lib/crypto';
import { saveReportDraft, getReportDraft, clearReportDraft } from '../lib/draftStorage';
import { SC_CITIES_NAMES, getCityCoordinates } from '../lib/scCities';
import {
  Shield,
  Lock,
  MapPin,
  CheckCircle2,
  UserCheck,
  EyeOff,
  Send,
  ArrowRight,
  ArrowLeft,
  Play,
  Trash2,
  PauseCircle,
  X,
  AlertCircle,
  AlertTriangle,
  FileSearch
} from 'lucide-react';

interface ReportFormModalProps {
  user: User | null;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onSubmitSuccess: (newReport: Report) => void;
  onCancel: () => void;
  onEmergencyExit?: () => void;
  onGoToTrack?: (reportId: string) => void;
}

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  user,
  initialLat,
  initialLng,
  initialAddress,
  onSubmitSuccess,
  onCancel,
  onEmergencyExit,
  onGoToTrack
}) => {
  const [step, setStep] = useState<number>(1);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [category, setCategory] = useState<HarassmentType>('importunacao_sexual');
  const [title, setTitle] = useState<string>('');
  const [locationType, setLocationType] = useState<LocationType>('transporte_publico');
  const [address, setAddress] = useState<string>(initialAddress || '');
  const [city, setCity] = useState<string>('Florianópolis');
  const [state] = useState<string>('SC');
  const [lat, setLat] = useState<number>(initialLat || -27.5954);
  const [lng, setLng] = useState<number>(initialLng || -48.548);
  const [dateTime, setDateTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [periodOfDay, setPeriodOfDay] = useState<'manha' | 'tarde' | 'noite' | 'madrugada'>('noite');
  const [description, setDescription] = useState<string>('');
  const [aggressorDetails, setAggressorDetails] = useState<string>('');
  const [witnesses, setWitnesses] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('alto');
  const [secretPin, setSecretPin] = useState<string>('1234');
  const [attachmentName] = useState<string>('');
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  const [savedDraftPrompt, setSavedDraftPrompt] = useState<ReportDraft | null>(null);
  const [draftSavedNotice, setDraftSavedNotice] = useState<string | null>(null);
  const [geoFeedback, setGeoFeedback] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const existingDraft = getReportDraft();
    if (existingDraft) {
      setSavedDraftPrompt(existingDraft);
    }
  }, []);

  const getCurrentDraftObject = (
    reason: 'aggressor_present' | 'quick_exit' | 'user_pause' = 'user_pause'
  ): ReportDraft => ({
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

  const handleApplyDraft = () => {
    if (!savedDraftPrompt) return;
    setStep(savedDraftPrompt.step || 1);
    setIsAnonymous(savedDraftPrompt.isAnonymous ?? true);
    setCategory(savedDraftPrompt.category || 'importunacao_sexual');
    setTitle(savedDraftPrompt.title || '');
    setLocationType(savedDraftPrompt.locationType || 'transporte_publico');
    setAddress(savedDraftPrompt.address || '');
    setCity(savedDraftPrompt.city || 'Florianópolis');
    setLat(savedDraftPrompt.lat || -27.5954);
    setLng(savedDraftPrompt.lng || -48.548);
    setDateTime(savedDraftPrompt.dateTime || new Date().toISOString().slice(0, 16));
    setPeriodOfDay(savedDraftPrompt.periodOfDay || 'noite');
    setDescription(savedDraftPrompt.description || '');
    setAggressorDetails(savedDraftPrompt.aggressorDetails || '');
    setWitnesses(savedDraftPrompt.witnesses || '');
    setRiskLevel(savedDraftPrompt.riskLevel || 'alto');
    setSecretPin(savedDraftPrompt.secretPin || '1234');
    setSavedDraftPrompt(null);
    setDraftSavedNotice('Rascunho restaurado. Você pode continuar de onde parou.');
    setTimeout(() => setDraftSavedNotice(null), 3500);
  };

  const handleDiscardDraft = () => {
    clearReportDraft();
    setSavedDraftPrompt(null);
    setDraftSavedNotice('Rascunho descartado.');
    setTimeout(() => setDraftSavedNotice(null), 3000);
  };

  const handleEmergencyPause = () => {
    const draft = getCurrentDraftObject('aggressor_present');
    saveReportDraft(draft);
    if (onEmergencyExit) {
      onEmergencyExit();
    } else {
      onCancel();
    }
  };

  const handleNormalSaveDraft = () => {
    const draft = getCurrentDraftObject('user_pause');
    saveReportDraft(draft);
    setDraftSavedNotice('Rascunho salvo neste dispositivo.');
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
          setAddress(`Localização GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setGeoFeedback('Localização obtida com sucesso.');
          setTimeout(() => setGeoFeedback(null), 3000);
        },
        () => {
          setGeoFeedback('Não foi possível acessar o GPS. Você pode digitar o bairro ou ponto de referência.');
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
      const protocolId = 'ASK-2026-' + Math.floor(10000 + Math.random() * 90000);
      const userPin = secretPin.trim() || '1234';

      const sensitiveDataToEncrypt = JSON.stringify({
        title,
        description,
        aggressorDetails,
        witnesses,
        userEmail: isAnonymous ? 'ANONIMO' : user?.email || 'NAO_INFORMADO',
        createdAt: new Date().toISOString()
      });

      const encrypted = await encryptData(sensitiveDataToEncrypt, userPin);

      const newReport: Report = {
        id: protocolId,
        accessKey: userPin,
        isAnonymous,
        title: title || 'Relato sem título',
        category,
        locationType,
        address: address || 'Local não informado',
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
        forwardDestination: 'Central 180 / Delegacia Virtual SC',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        encryptedPayload: JSON.stringify(encrypted),
        encryptionHash: encrypted.hash,
        timeline: [
          {
            id: 'tl-' + Date.now(),
            date: new Date().toISOString(),
            title: 'Relato salvo no aplicativo',
            note: `Registrado com protocolo ${protocolId} e proteção AES-GCM (hash ${encrypted.hash.slice(0, 12)}...).`,
            actor: 'Sistema AssédioAki'
          }
        ],
        attachments: attachmentName
          ? [
              {
                id: 'att-1',
                name: attachmentName,
                size: '1.8 MB',
                type: 'image/jpeg'
              }
            ]
          : []
      };

      clearReportDraft();
      setSubmittedReport(newReport);
      onSubmitSuccess(newReport);
    } catch {
      setSubmitError('Não foi possível salvar o relato agora. Revise os campos e tente novamente.');
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="bg-white border border-[#e6dfee] rounded-2xl max-w-3xl mx-auto p-5 sm:p-8 space-y-6">
      {/* Header with Pause & Quick Disguise */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#efe9f4] pb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#f3eef8] text-[#6d4c82] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#261d2e] font-heading">
              Registrar relato neste aplicativo
            </h1>
            <p className="text-xs sm:text-sm text-[#5a4e66]">
              Rascunho salvo localmente enquanto você preenche · Não substitui B.O. policial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!submittedReport && (
            <>
              <button
                type="button"
                onClick={handleEmergencyPause}
                className="min-h-[44px] px-3.5 py-2 bg-[#fbf2f4] hover:bg-[#f4dfe5] text-[#7f3347] font-semibold text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-[#e7cbd3]"
                title="Salvar rascunho e disfarçar tela imediatamente"
              >
                <EyeOff className="w-4 h-4" aria-hidden="true" />
                <span>Pausar e disfarçar tela</span>
              </button>

              <button
                type="button"
                onClick={handleNormalSaveDraft}
                className="min-h-[44px] px-3.5 py-2 bg-[#faf8fb] hover:bg-[#f3eef8] text-[#4f3461] text-xs font-medium rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-[#e6dfee]"
              >
                <PauseCircle className="w-4 h-4" aria-hidden="true" />
                <span>Salvar rascunho</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-[#5a4e66] hover:text-[#261d2e] bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] rounded-xl transition-colors cursor-pointer"
          >
            Voltar
          </button>
        </div>
      </div>

      {draftSavedNotice && (
        <div className="p-3 bg-[#f1f6f3] border border-[#cde0d4] rounded-xl text-xs sm:text-sm text-[#26543b] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{draftSavedNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setDraftSavedNotice(null)}
            aria-label="Fechar aviso"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {savedDraftPrompt && !submittedReport && (
        <div className="p-4 sm:p-5 bg-[#f3eef8] border border-[#ddd1ea] rounded-2xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-[#261d2e]">
                Você tem um rascunho salvo ({`Etapa ${savedDraftPrompt.step} de 4`})
              </h2>
              <p className="text-xs text-[#5a4e66]">
                Salvo em {new Date(savedDraftPrompt.savedAt).toLocaleString('pt-BR')} · {savedDraftPrompt.title || 'Relato em andamento'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSavedDraftPrompt(null)}
              aria-label="Fechar aviso de rascunho"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#5a4e66] hover:text-[#261d2e] cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleApplyDraft}
              className="min-h-[44px] px-4 py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-xs sm:text-sm rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4" aria-hidden="true" />
              <span>Continuar rascunho</span>
            </button>

            <button
              type="button"
              onClick={handleDiscardDraft}
              className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-[#fbf2f4] text-[#5a4e66] hover:text-[#7f3347] text-xs sm:text-sm font-medium rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-[#e6dfee]"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Descartar</span>
            </button>
          </div>
        </div>
      )}

      {geoFeedback && (
        <div className="p-3 bg-[#f3eef8] border border-[#ddd1ea] rounded-xl text-xs sm:text-sm text-[#4f3461] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{geoFeedback}</span>
        </div>
      )}

      {submitError && (
        <div className="p-3 bg-[#fbf2f4] border border-[#e7cbd3] rounded-xl text-xs sm:text-sm text-[#7f3347] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{submitError}</span>
        </div>
      )}

      {!submittedReport ? (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-[#6b5e77]">
              <span className={step >= 1 ? 'text-[#6d4c82] font-semibold' : ''}>1. Tipo</span>
              <span className={step >= 2 ? 'text-[#6d4c82] font-semibold' : ''}>2. Local e data</span>
              <span className={step >= 3 ? 'text-[#6d4c82] font-semibold' : ''}>3. Relato</span>
              <span className={step >= 4 ? 'text-[#6d4c82] font-semibold' : ''}>4. Proteção</span>
            </div>
            <div className="w-full bg-[#efe9f4] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#6d4c82] h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <span className="block text-xs font-semibold text-[#261d2e] mb-2">
                  Como prefere registrar
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(true)}
                    aria-pressed={isAnonymous}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                      isAnonymous
                        ? 'bg-[#f3eef8] border-[#6d4c82] text-[#261d2e] ring-1 ring-[#6d4c82]'
                        : 'bg-[#faf8fb] border-[#e6dfee] text-[#5a4e66]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm text-[#261d2e]">
                      <EyeOff className="w-4 h-4 text-[#6d4c82]" aria-hidden="true" />
                      <span>Sem identificação (anônimo)</span>
                    </div>
                    <p className="text-xs text-[#5a4e66] mt-1">
                      Nenhum nome ou e-mail pessoal será ligado ao protocolo.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAnonymous(false)}
                    aria-pressed={!isAnonymous}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                      !isAnonymous
                        ? 'bg-[#f3eef8] border-[#6d4c82] text-[#261d2e] ring-1 ring-[#6d4c82]'
                        : 'bg-[#faf8fb] border-[#e6dfee] text-[#5a4e66]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm text-[#261d2e]">
                      <UserCheck className="w-4 h-4 text-[#6d4c82]" aria-hidden="true" />
                      <span>Associado ao meu perfil local</span>
                    </div>
                    <p className="text-xs text-[#5a4e66] mt-1">
                      Útil apenas se você entrou com um perfil opcional.
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#261d2e] mb-2">
                  O que aconteceu (escolha a opção mais próxima)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(
                    [
                      {
                        id: 'importunacao_sexual',
                        title: 'Importunação sexual',
                        desc: 'Toques sem consentimento, beijos forçados ou atos em público.'
                      },
                      {
                        id: 'assedio_sexual',
                        title: 'Assédio sexual',
                        desc: 'Chantagem ou pressão sexual em relação de trabalho ou ensino.'
                      },
                      {
                        id: 'assedio_moral',
                        title: 'Assédio moral',
                        desc: 'Humilhações repetidas, gritos ou isolamento no trabalho.'
                      },
                      {
                        id: 'perseguicao',
                        title: 'Perseguição (Stalking)',
                        desc: 'Vigília constante, mensagens insistentes ou perseguição.'
                      },
                      {
                        id: 'violencia_psicologica',
                        title: 'Violência psicológica',
                        desc: 'Ameaças, controle, manipulação ou intimidação emocional.'
                      },
                      {
                        id: 'violencia_virtual',
                        title: 'Violência virtual',
                        desc: 'Ameaça ou divulgação de fotos íntimas e ataques online.'
                      }
                    ] as const
                  ).map((item) => {
                    const isSelected = category === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCategory(item.id)}
                        aria-pressed={isSelected}
                        className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#f3eef8] border-[#6d4c82] text-[#261d2e] ring-1 ring-[#6d4c82]'
                            : 'bg-[#faf8fb] hover:bg-[#f3eef8]/50 border-[#e6dfee] text-[#493d54]'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-semibold block text-[#261d2e]">
                          {item.title}
                        </span>
                        <span className="text-xs text-[#5a4e66] block mt-1 leading-snug">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="report-title-input" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Resumo curto da situação
                </label>
                <input
                  id="report-title-input"
                  type="text"
                  required
                  placeholder="Ex: Abordagem insistente no ponto de ônibus do Centro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!title.trim()}
                  onClick={() => setStep(2)}
                  className="min-h-[44px] px-5 py-2.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>Próximo passo</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="report-location-type" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Tipo de ambiente
                </label>
                <select
                  id="report-location-type"
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as LocationType)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                >
                  <option value="transporte_publico">Transporte público (ônibus, terminal)</option>
                  <option value="via_publica">Via pública (rua, praça, calçada)</option>
                  <option value="trabalho">Ambiente de trabalho</option>
                  <option value="escola_universidade">Escola ou universidade</option>
                  <option value="evento_festa">Evento, festa ou show</option>
                  <option value="internet">Ambiente virtual / redes sociais</option>
                  <option value="local_privado">Local privado / residência</option>
                  <option value="outro">Outro local</option>
                </select>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <label htmlFor="report-address-input" className="block text-xs font-semibold text-[#261d2e]">
                    Bairro, rua aproximada ou ponto de referência
                  </label>
                  <button
                    type="button"
                    onClick={handleFetchCurrentLocation}
                    className="min-h-[36px] text-xs text-[#6d4c82] hover:underline inline-flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Usar localização aproximada (GPS)</span>
                  </button>
                </div>
                <input
                  id="report-address-input"
                  type="text"
                  required
                  placeholder="Evite colocar o número exato da sua casa; prefira rua ou referência próxima"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="report-city-select" className="block text-xs font-semibold text-[#261d2e] mb-1">
                    Município em Santa Catarina
                  </label>
                  <select
                    id="report-city-select"
                    value={city}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      setCity(newCity);
                      const coords = getCityCoordinates(newCity);
                      setLat(coords[0]);
                      setLng(coords[1]);
                    }}
                    className="w-full min-h-[44px] px-3 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e] cursor-pointer"
                  >
                    {SC_CITIES_NAMES.map((cName) => (
                      <option key={cName} value={cName}>
                        {cName} (SC)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="report-period-select" className="block text-xs font-semibold text-[#261d2e] mb-1">
                    Período do dia
                  </label>
                  <select
                    id="report-period-select"
                    value={periodOfDay}
                    onChange={(e) => setPeriodOfDay(e.target.value as any)}
                    className="w-full min-h-[44px] px-3 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                  >
                    <option value="manha">Manhã (06h às 12h)</option>
                    <option value="tarde">Tarde (12h às 18h)</option>
                    <option value="noite">Noite (18h às 00h)</option>
                    <option value="madrugada">Madrugada (00h às 06h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="report-datetime" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Data e hora aproximada
                </label>
                <input
                  id="report-datetime"
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full sm:w-72 min-h-[44px] px-3 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="min-h-[44px] px-4 py-2 bg-[#faf8fb] hover:bg-[#f3eef8] text-[#4f3461] border border-[#e6dfee] rounded-xl text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  disabled={!address.trim()}
                  onClick={() => setStep(3)}
                  className="min-h-[44px] px-5 py-2.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>Próximo passo</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="report-description" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Descreva o que aconteceu (no seu ritmo)
                </label>
                <textarea
                  id="report-description"
                  rows={4}
                  required
                  placeholder="Conte apenas o que se sentir confortável em registrar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e] leading-relaxed"
                />
              </div>

              <div>
                <label htmlFor="report-aggressor" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Características de quem praticou (opcional)
                </label>
                <input
                  id="report-aggressor"
                  type="text"
                  placeholder="Ex: roupas, placa, função no local ou vínculo"
                  value={aggressorDetails}
                  onChange={(e) => setAggressorDetails(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                />
              </div>

              <div>
                <label htmlFor="report-witnesses" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Testemunhas ou câmeras próximas (opcional)
                </label>
                <input
                  id="report-witnesses"
                  type="text"
                  placeholder="Ex: motorista, colegas, câmeras da rua"
                  value={witnesses}
                  onChange={(e) => setWitnesses(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#261d2e] mb-2">
                  Nível de gravidade percebido
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      {
                        id: 'baixo',
                        label: 'Baixo',
                        desc: 'Comentário ou abordagem isolada.'
                      },
                      {
                        id: 'medio',
                        label: 'Médio',
                        desc: 'Situação repetida ou constrangimento contínuo.'
                      },
                      {
                        id: 'grave',
                        label: 'Grave',
                        desc: 'Contato físico, ameaça direta ou perseguição.'
                      }
                    ] as const
                  ).map((lvl) => {
                    const isSelected =
                      lvl.id === 'grave'
                        ? riskLevel === 'grave' || riskLevel === 'alto' || riskLevel === 'urgente'
                        : lvl.id === 'medio'
                          ? riskLevel === 'medio' || riskLevel === 'moderado'
                          : riskLevel === 'baixo' || riskLevel === 'leve';

                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setRiskLevel(lvl.id)}
                        aria-pressed={isSelected}
                        className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? lvl.id === 'grave'
                              ? 'bg-[#fbf2f4] border-[#b05c72] text-[#261d2e] ring-1 ring-[#b05c72]'
                              : 'bg-[#f3eef8] border-[#6d4c82] text-[#261d2e] ring-1 ring-[#6d4c82]'
                            : 'bg-[#faf8fb] border-[#e6dfee] text-[#493d54]'
                        }`}
                      >
                        <span className="text-sm font-semibold block">{lvl.label}</span>
                        <span className="text-xs text-[#5a4e66] block mt-0.5">{lvl.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="min-h-[44px] px-4 py-2 bg-[#faf8fb] hover:bg-[#f3eef8] text-[#4f3461] border border-[#e6dfee] rounded-xl text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  disabled={!description.trim()}
                  onClick={() => setStep(4)}
                  className="min-h-[44px] px-5 py-2.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>Próximo passo</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 bg-[#f3eef8] border border-[#ddd1ea] rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-[#4f3461] font-semibold text-sm">
                  <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Como seus dados ficam protegidos</span>
                </div>
                <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                  O texto completo do relato, as características do autor e as testemunhas são criptografados com o seu PIN antes de serem guardados. Apenas quem tem o número de protocolo e o PIN consegue abrir esses detalhes na aba “Acompanhar protocolo”.
                </p>
                <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                  Para exibir o ponto no mapa em Santa Catarina, ficam visíveis apenas a categoria, a cidade, o bairro/referência aproximada e o título curto. Por isso, não escreva seu nome ou endereço residencial exato no título.
                </p>
              </div>

              <div>
                <label htmlFor="report-pin-input" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Escolha um PIN de 4 a 6 dígitos para acessar este relato depois
                </label>
                <input
                  id="report-pin-input"
                  type="password"
                  maxLength={6}
                  required
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  className="w-full sm:w-48 min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#ddd1ea] rounded-xl text-base font-semibold text-center text-[#261d2e] tracking-widest"
                />
              </div>

              <div className="p-3.5 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-xs text-[#5a4e66] leading-relaxed">
                <strong className="text-[#261d2e] block mb-0.5">Aviso importante</strong>
                Este registro ajuda você a guardar informações e contribui para o mapa preventivo do aplicativo, mas não envia denúncia automática à Polícia Civil nem substitui o Boletim de Ocorrência oficial (180, 181, 190 ou Delegacia Virtual).
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="min-h-[44px] px-4 py-2 bg-[#faf8fb] hover:bg-[#f3eef8] text-[#4f3461] border border-[#e6dfee] rounded-xl text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Voltar</span>
                </button>

                <button
                  type="submit"
                  disabled={isEncrypting}
                  className="min-h-[44px] px-6 py-2.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>{isEncrypting ? 'Salvando com segurança...' : 'Salvar relato com proteção'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-6 text-center py-4">
          <div className="w-14 h-14 bg-[#f1f6f3] text-[#26543b] rounded-full flex items-center justify-center mx-auto border border-[#cde0d4]">
            <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#26543b]">Relato salvo com proteção</p>
            <h2 className="text-2xl font-semibold text-[#261d2e] font-heading">
              Guarde seu protocolo
            </h2>
          </div>

          <div className="p-5 bg-[#faf8fb] border border-[#e6dfee] rounded-2xl max-w-md mx-auto space-y-2.5">
            <p className="text-xs text-[#5a4e66]">Número do protocolo:</p>
            <div className="text-2xl font-mono font-bold text-[#4f3461] tracking-wider bg-white py-2.5 px-4 rounded-xl border border-[#ddd1ea]">
              {submittedReport.id}
            </div>
            <p className="text-xs text-[#5a4e66]">
              PIN escolhido: <strong className="text-[#261d2e] font-mono">{submittedReport.accessKey}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onGoToTrack && (
              <button
                type="button"
                onClick={() => onGoToTrack(submittedReport.id)}
                className="min-h-[44px] px-5 py-2.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileSearch className="w-4 h-4" aria-hidden="true" />
                <span>Acompanhar protocolo</span>
              </button>
            )}

            <button
              type="button"
              onClick={onCancel}
              className="min-h-[44px] px-5 py-2.5 bg-[#faf8fb] hover:bg-[#f3eef8] text-[#4f3461] border border-[#ddd1ea] font-medium text-sm rounded-xl transition-colors cursor-pointer"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
