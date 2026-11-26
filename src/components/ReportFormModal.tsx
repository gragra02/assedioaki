import React, { useState, useEffect } from 'react';
import {
  Report,
  HarassmentType,
  LocationType,
  RiskLevel,
  User,
  ReportDraft,
  ReportLocationMode
} from '../types';
import { encryptData } from '../lib/crypto';
import { saveReportDraft, getReportDraft, clearReportDraft } from '../lib/draftStorage';
import { SC_CITIES_NAMES, getCityCoordinates } from '../lib/scCities';
import {
  FICTITIOUS_SECTORS,
  FictitiousSectorId,
  quantizeCoordinate,
  sanitizeLocationForPrivacy
} from '../lib/geo';
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
  FileSearch,
  LocateFixed,
  Compass
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

  // Privacy-first explicit location mode choice:
  // 'real_approximate' vs 'fictitious'
  const [locationMode, setLocationMode] = useState<ReportLocationMode>('fictitious');
  const [fictitiousSector, setFictitiousSector] = useState<FictitiousSectorId>('centro');
  const [address, setAddress] = useState<string>(initialAddress || '');
  const [city, setCity] = useState<string>('Florianópolis');
  const [state] = useState<string>('SC');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(
    typeof initialLat === 'number' && typeof initialLng === 'number'
      ? { lat: quantizeCoordinate(initialLat), lng: quantizeCoordinate(initialLng) }
      : null
  );
  const [realLocationConfirmed, setRealLocationConfirmed] = useState<boolean>(false);
  const [isFetchingGps, setIsFetchingGps] = useState<boolean>(false);

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

  const sanitizedPreview = sanitizeLocationForPrivacy({
    mode: locationMode,
    city,
    cityCoordinates: getCityCoordinates(city),
    address,
    gpsLat: locationMode === 'real_approximate' ? gpsCoords?.lat : undefined,
    gpsLng: locationMode === 'real_approximate' ? gpsCoords?.lng : undefined,
    fictitiousSector
  });

  const getCurrentDraftObject = (
    reason: 'aggressor_present' | 'quick_exit' | 'user_pause' = 'user_pause'
  ): ReportDraft => ({
    savedAt: new Date().toISOString(),
    step,
    isAnonymous,
    locationMode: sanitizedPreview.locationMode,
    category,
    title,
    locationType,
    address: sanitizedPreview.address,
    city: sanitizedPreview.city,
    state,
    lat: sanitizedPreview.lat,
    lng: sanitizedPreview.lng,
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
    locationMode,
    fictitiousSector,
    gpsCoords,
    category,
    title,
    locationType,
    address,
    city,
    state,
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
    const restoredMode: ReportLocationMode =
      savedDraftPrompt.locationMode === 'real_approximate' ? 'real_approximate' : 'fictitious';

    setStep(savedDraftPrompt.step || 1);
    setIsAnonymous(savedDraftPrompt.isAnonymous ?? true);
    setCategory(savedDraftPrompt.category || 'importunacao_sexual');
    setTitle(savedDraftPrompt.title || '');
    setLocationType(savedDraftPrompt.locationType || 'transporte_publico');
    setLocationMode(restoredMode);
    setAddress(savedDraftPrompt.address || '');
    setCity(savedDraftPrompt.city || 'Florianópolis');
    if (restoredMode === 'real_approximate') {
      setGpsCoords({
        lat: quantizeCoordinate(savedDraftPrompt.lat),
        lng: quantizeCoordinate(savedDraftPrompt.lng)
      });
      setRealLocationConfirmed(true);
    } else {
      setGpsCoords(null);
      setRealLocationConfirmed(false);
    }
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

  const handleSelectLocationMode = (nextMode: ReportLocationMode) => {
    setGeoFeedback(null);
    setLocationMode(nextMode);
    if (nextMode === 'fictitious') {
      // Strictly discard any real GPS coordinates so they are never saved or sent
      setGpsCoords(null);
      setRealLocationConfirmed(false);
      if (/área aproximada|gps/i.test(address)) {
        setAddress('');
      }
    }
  };

  const handleAuthorizeRealLocation = () => {
    setGeoFeedback(null);
    if (!navigator.geolocation) {
      setGeoFeedback(
        'Seu navegador não oferece geolocalização. Use a Opção 2 para escolher uma região manualmente.'
      );
      return;
    }

    setIsFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const approxLat = quantizeCoordinate(pos.coords.latitude);
        const approxLng = quantizeCoordinate(pos.coords.longitude);
        setGpsCoords({ lat: approxLat, lng: approxLng });
        setRealLocationConfirmed(false);
        if (!address.trim()) {
          setAddress(`Região aproximada em ${city} (~600 m)`);
        }
        setIsFetchingGps(false);
        setGeoFeedback(
          'Localização aproximada obtida. Confira abaixo antes de avançar — suas coordenadas exatas não serão armazenadas.'
        );
      },
      () => {
        setIsFetchingGps(false);
        setGeoFeedback(
          'Permissão de localização não autorizada ou indisponível. Você pode digitar um ponto de referência ou usar a Opção 2 (localização fictícia).'
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const isStep2Valid =
    address.trim().length > 0 &&
    (locationMode === 'fictitious' || !gpsCoords || realLocationConfirmed);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsEncrypting(true);

    try {
      const protocolId = 'ASK-2026-' + Math.floor(10000 + Math.random() * 90000);
      const userPin = secretPin.trim() || '1234';

      const finalLocation = sanitizeLocationForPrivacy({
        mode: locationMode,
        city,
        cityCoordinates: getCityCoordinates(city),
        address,
        gpsLat: locationMode === 'real_approximate' ? gpsCoords?.lat : undefined,
        gpsLng: locationMode === 'real_approximate' ? gpsCoords?.lng : undefined,
        fictitiousSector
      });

      const sensitiveDataToEncrypt = JSON.stringify({
        title,
        description,
        aggressorDetails,
        witnesses,
        locationMode: finalLocation.locationMode,
        userEmail: isAnonymous ? 'ANONIMO' : user?.email || 'NAO_INFORMADO',
        createdAt: new Date().toISOString()
      });

      const encrypted = await encryptData(sensitiveDataToEncrypt, userPin);

      const newReport: Report = {
        id: protocolId,
        accessKey: userPin,
        isAnonymous,
        locationMode: finalLocation.locationMode,
        title: title || 'Relato sem título',
        category,
        locationType,
        address: finalLocation.address,
        city: finalLocation.city,
        state,
        lat: finalLocation.lat,
        lng: finalLocation.lng,
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
            note: `Registrado com protocolo ${protocolId} (${
              finalLocation.locationMode === 'fictitious'
                ? 'localização fictícia escolhida pela usuária'
                : 'área aproximada protegida'
            }) e proteção AES-GCM.`,
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
      setSubmitError('Não conseguimos enviar agora. Seus dados não foram perdidos. Tente de novo em instantes.');
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
              Contar o que aconteceu
            </h1>
            <p className="text-xs sm:text-sm text-[#5a4e66]">
              Você pode usar sem se identificar · Seu rascunho é salvo sozinho neste aparelho
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
                Salvo em {new Date(savedDraftPrompt.savedAt).toLocaleString('pt-BR')} ·{' '}
                {savedDraftPrompt.title || 'Relato em andamento'}
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
                  Como você prefere contar?
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
                      <span>Sem me identificar</span>
                    </div>
                    <p className="text-xs text-[#5a4e66] mt-1">
                      Nenhum nome ou e-mail pessoal fica ligado ao seu relato.
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
                      <span>Usar meu perfil deste aparelho</span>
                    </div>
                    <p className="text-xs text-[#5a4e66] mt-1">
                      Útil apenas se você entrou com um perfil opcional.
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#261d2e] mb-2">
                  O que você viveu? (escolha a opção mais parecida)
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

          {/* STEP 2 — Privacy-preserving Location Choice */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Reassurance Note */}
              <div className="p-4 rounded-xl bg-[#f3eef8] border border-[#ddd1ea] text-xs sm:text-sm text-[#493d54] leading-relaxed">
                <strong className="text-[#261d2e] block mb-1">
                  Você decide como informar a localização
                </strong>
                Você pode escolher uma localização aproximada ou fictícia para proteger sua identidade. A localização exibida no mapa não precisa ser o local exato onde o ocorrido aconteceu.
              </div>

              {/* Explicit Choice: Option 1 vs Option 2 */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-[#261d2e]">
                  Como deseja definir o local para o mapa?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectLocationMode('real_approximate')}
                    aria-pressed={locationMode === 'real_approximate'}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer space-y-1.5 ${
                      locationMode === 'real_approximate'
                        ? 'bg-[#f3eef8] border-[#6d4c82] ring-1 ring-[#6d4c82] text-[#261d2e]'
                        : 'bg-[#faf8fb] hover:bg-[#f3eef8]/50 border-[#e6dfee] text-[#493d54]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#261d2e]">
                      <LocateFixed className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                      <span>OPÇÃO 1 — USAR MINHA LOCALIZAÇÃO ATUAL</span>
                    </div>
                    <p className="text-xs text-[#5a4e66] leading-snug">
                      Pede sua autorização e mostra apenas uma área aproximada, para proteger você.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectLocationMode('fictitious')}
                    aria-pressed={locationMode === 'fictitious'}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer space-y-1.5 ${
                      locationMode === 'fictitious'
                        ? 'bg-[#f3eef8] border-[#6d4c82] ring-1 ring-[#6d4c82] text-[#261d2e]'
                        : 'bg-[#faf8fb] hover:bg-[#f3eef8]/50 border-[#e6dfee] text-[#493d54]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#261d2e]">
                      <Compass className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                      <span>OPÇÃO 2 — ESCOLHER UMA LOCALIZAÇÃO FICTÍCIA</span>
                    </div>
                    <p className="text-xs text-[#5a4e66] leading-snug">
                      Não acessa seu GPS. Você escolhe manualmente outra cidade, setor ou ponto de referência.
                    </p>
                  </button>
                </div>
              </div>

              {/* Option 1 Panel: Real Approximate Location */}
              {locationMode === 'real_approximate' && (
                <div className="p-4 rounded-xl bg-[#faf8fb] border border-[#ddd1ea] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[#261d2e]">
                        Localização aproximada com autorização
                      </p>
                      <p className="text-xs text-[#5a4e66]">
                        Ao autorizar, mostramos um ponto aproximado e não guardamos o endereço exato do seu aparelho.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAuthorizeRealLocation}
                      disabled={isFetchingGps}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#6d4c82] hover:bg-[#593c6b] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>
                        {isFetchingGps
                          ? 'Obtendo área aproximada...'
                          : 'Autorizar localização aproximada'}
                      </span>
                    </button>
                  </div>

                  {geoFeedback && (
                    <div className="p-3 bg-white border border-[#ddd1ea] rounded-xl text-xs text-[#4f3461] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{geoFeedback}</span>
                    </div>
                  )}

                  {gpsCoords && (
                    <div className="p-3.5 bg-white border border-[#cde0d4] rounded-xl space-y-2 text-xs text-[#26543b]">
                      <p className="font-semibold">
                        Área aproximada pronta: {city} (nunca o ponto exato)
                      </p>
                      <label className="flex items-start gap-2 cursor-pointer text-[#261d2e]">
                        <input
                          type="checkbox"
                          checked={realLocationConfirmed}
                          onChange={(e) => setRealLocationConfirmed(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-[#6d4c82] rounded"
                        />
                        <span>
                          Revisei o bairro/referência abaixo e confirmo o envio desta área aproximada para o mapa.
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Option 2 Panel: Fictitious Manual Selection */}
              {locationMode === 'fictitious' && (
                <div className="p-4 rounded-xl bg-[#faf8fb] border border-[#ddd1ea] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#26543b]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>
                      Modo localização fictícia ativo — seu GPS não será acessado nem registrado em nenhum momento.
                    </span>
                  </div>

                  <div>
                    <label
                      htmlFor="fictitious-sector-select"
                      className="block text-xs font-semibold text-[#261d2e] mb-1"
                    >
                      Setor fictício ou região aproximada do município selecionado
                    </label>
                    <select
                      id="fictitious-sector-select"
                      value={fictitiousSector}
                      onChange={(e) => setFictitiousSector(e.target.value as FictitiousSectorId)}
                      className="w-full min-h-[44px] px-3 py-2 bg-white border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                    >
                      {FICTITIOUS_SECTORS.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

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
                <label htmlFor="report-address-input" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  {locationMode === 'fictitious'
                    ? 'Bairro ou ponto de referência fictício/aproximado'
                    : 'Bairro ou ponto de referência aproximado'}
                </label>
                <input
                  id="report-address-input"
                  type="text"
                  required
                  placeholder={
                    locationMode === 'fictitious'
                      ? 'Ex: Região Central ou Praça pública fictícia para proteção'
                      : 'Evite colocar o número exato da sua casa; informe apenas bairro ou referência'
                  }
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="report-city-select" className="block text-xs font-semibold text-[#261d2e] mb-1">
                    {locationMode === 'fictitious'
                      ? 'Município escolhido (fictício ou de referência)'
                      : 'Município em Santa Catarina'}
                  </label>
                  <select
                    id="report-city-select"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
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
                  disabled={!isStep2Valid}
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
                  Conte o que aconteceu, no seu tempo
                </label>
                <textarea
                  id="report-description"
                  rows={4}
                  required
                  placeholder="Escreva do seu jeito, apenas o que se sentir confortável em contar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e] leading-relaxed"
                />
              </div>

              <div>
                <label htmlFor="report-aggressor" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Sobre quem fez isso (opcional)
                </label>
                <input
                  id="report-aggressor"
                  type="text"
                  placeholder="Ex: roupas, linha de ônibus, função no local ou se era alguém conhecido"
                  value={aggressorDetails}
                  onChange={(e) => setAggressorDetails(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                />
              </div>

              <div>
                <label htmlFor="report-witnesses" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Alguém viu ou havia câmeras por perto? (opcional)
                </label>
                <input
                  id="report-witnesses"
                  type="text"
                  placeholder="Ex: motorista, colegas, câmeras próximas"
                  value={witnesses}
                  onChange={(e) => setWitnesses(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#261d2e] mb-2">
                  Como você se sentiu em relação à sua segurança?
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
                  Localização definida para o mapa:{' '}
                  <strong>
                    {sanitizedPreview.locationMode === 'fictitious'
                      ? `Fictícia/aproximada (${sanitizedPreview.address}, ${sanitizedPreview.city})`
                      : `Área aproximada (${sanitizedPreview.address}, ${sanitizedPreview.city})`}
                  </strong>
                  . O endereço exato não é publicado nem guardado.
                </p>
                <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                  O texto completo do seu relato e os detalhes informados ficam protegidos com o seu PIN. Ninguém vai saber que foi você.
                </p>
              </div>

              <div>
                <label htmlFor="report-pin-input" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Escolha um PIN de 4 a 6 números para abrir este relato depois
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
                <strong className="text-[#261d2e] block mb-0.5">Bom saber</strong>
                Este relato ajuda você a guardar informações e fortalece o mapa de segurança, mas não vai automaticamente para a polícia. Se quiser denunciar oficialmente, você pode ligar 180, 181, 190 ou usar a Delegacia Virtual.
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
            <p className="text-xs text-[#6b5e77]">
              Modo de localização:{' '}
              <strong>
                {submittedReport.locationMode === 'fictitious'
                  ? 'Localização fictícia (GPS não coletado)'
                  : 'Localização aproximada protegida'}
              </strong>
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
                <span>Acompanhar meu relato</span>
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
