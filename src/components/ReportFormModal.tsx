import React, { useState, useEffect } from 'react';
import {
  Report,
  HarassmentType,
  LocationType,
  RiskLevel,
  User,
  ReportDraft,
  SocialPlatformType
} from '../types';
import { encryptData } from '../lib/crypto';
import { saveReportDraft, getReportDraft, clearReportDraft } from '../lib/draftStorage';
import { SC_CITIES_NAMES, getCityCoordinates } from '../lib/scCities';
import { applyPrivacyRadiusOffset } from '../lib/geo';
import { LocationPrivacyModal } from './LocationPrivacyModal';
import {
  Shield,
  ShieldCheck,
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
  Globe,
  AtSign,
  Check,
  FileText
} from 'lucide-react';

const SOCIAL_PLATFORM_OPTIONS: Array<{ id: SocialPlatformType; label: string }> = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'discord', label: 'Discord' },
  { id: 'outros', label: 'Outros' }
];

interface ReportFormModalProps {
  user: User | null;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  editingReport?: Report | null;
  onSubmitSuccess: (newReport: Report) => void;
  onUpdateSuccess?: (updatedReport: Report) => void;
  onCancel: () => void;
  onEmergencyExit?: () => void;
  onGoToTrack?: (reportId: string) => void;
  onRequireAuth?: () => void;
  onOpenMyReports?: () => void;
}

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  user,
  initialLat,
  initialLng,
  initialAddress,
  editingReport = null,
  onSubmitSuccess,
  onUpdateSuccess,
  onCancel,
  onEmergencyExit,
  onGoToTrack,
  onRequireAuth,
  onOpenMyReports
}) => {
  const isEditMode = Boolean(editingReport);
  const [step, setStep] = useState<number>(1);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(editingReport?.isAnonymous ?? true);
  const [pendingIdentifiedAuth, setPendingIdentifiedAuth] = useState<boolean>(false);
  const [category, setCategory] = useState<HarassmentType>(editingReport?.category ?? 'importunacao_sexual');
  const [isOnlineStalking, setIsOnlineStalking] = useState<boolean>(
    editingReport?.isOnlineStalking ?? (editingReport?.locationType === 'internet')
  );
  const [socialPlatforms, setSocialPlatforms] = useState<SocialPlatformType[]>(
    editingReport?.socialPlatforms?.length
      ? editingReport.socialPlatforms
      : editingReport?.socialPlatform
      ? [editingReport.socialPlatform]
      : []
  );
  const [socialPlatformOther, setSocialPlatformOther] = useState<string>(editingReport?.socialPlatformOther || '');
  const [aggressorProfile, setAggressorProfile] = useState<string>(editingReport?.aggressorProfile || '');
  const [title, setTitle] = useState<string>(editingReport?.title || '');
  const [locationType, setLocationType] = useState<LocationType>(editingReport?.locationType ?? 'transporte_publico');
  const [address, setAddress] = useState<string>(editingReport?.address || initialAddress || '');
  const [city, setCity] = useState<string>(editingReport?.city || 'Florianópolis');
  const [state, setState] = useState<string>(editingReport?.state || 'SC');
  const [lat, setLat] = useState<number>(editingReport?.lat ?? initialLat ?? -27.5954);
  const [lng, setLng] = useState<number>(editingReport?.lng ?? initialLng ?? -48.5480);
  const [rawLat, setRawLat] = useState<number>(editingReport?.lat ?? initialLat ?? -27.5954);
  const [rawLng, setRawLng] = useState<number>(editingReport?.lng ?? initialLng ?? -48.5480);
  const [locationPrivacyMode, setLocationPrivacyMode] = useState<'offset' | 'exact' | 'none' | null>(
    editingReport
      ? editingReport.hideLocation
        ? 'none'
        : editingReport.hasLocationOffset
        ? 'offset'
        : 'exact'
      : null
  );
  const [locationOffsetMeters, setLocationOffsetMeters] = useState<number | undefined>(
    editingReport?.locationOffsetMeters
  );
  const [pendingPrivacyAction, setPendingPrivacyAction] = useState<
    'gps' | 'manual_coords' | 'next_step' | 'change_mode' | null
  >(null);
  const [showManualCoords, setShowManualCoords] = useState<boolean>(false);
  const [manualLatInput, setManualLatInput] = useState<string>(String(editingReport?.lat ?? initialLat ?? -27.5954));
  const [manualLngInput, setManualLngInput] = useState<string>(String(editingReport?.lng ?? initialLng ?? -48.5480));

  const [dateTime, setDateTime] = useState<string>(
    (editingReport?.dateTime || new Date().toISOString()).slice(0, 16)
  );
  const [periodOfDay, setPeriodOfDay] = useState<'manha' | 'tarde' | 'noite' | 'madrugada'>(
    editingReport?.periodOfDay ?? 'noite'
  );
  const [description, setDescription] = useState<string>(editingReport?.description || '');
  const [aggressorDetails, setAggressorDetails] = useState<string>(editingReport?.aggressorDetails || '');
  const [witnesses, setWitnesses] = useState<string>(editingReport?.witnesses || '');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(editingReport?.riskLevel ?? 'alto');
  const [secretPin, setSecretPin] = useState<string>(editingReport?.accessKey || '1234');
  const [attachmentName, setAttachmentName] = useState<string>(editingReport?.attachments?.[0]?.name || '');
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  const [savedDraftPrompt, setSavedDraftPrompt] = useState<ReportDraft | null>(null);
  const [draftSavedNotice, setDraftSavedNotice] = useState<string | null>(null);
  const [geoFeedback, setGeoFeedback] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync form state when editingReport changes or check draft for new reports
  useEffect(() => {
    if (editingReport) {
      setStep(1);
      setSubmittedReport(null);
      setSavedDraftPrompt(null);
      setIsAnonymous(editingReport.isAnonymous);
      setCategory(editingReport.category);
      setIsOnlineStalking(editingReport.isOnlineStalking ?? (editingReport.locationType === 'internet'));
      setSocialPlatforms(
        editingReport.socialPlatforms?.length
          ? editingReport.socialPlatforms
          : editingReport.socialPlatform
          ? [editingReport.socialPlatform]
          : []
      );
      setSocialPlatformOther(editingReport.socialPlatformOther || '');
      setAggressorProfile(editingReport.aggressorProfile || '');
      setTitle(editingReport.title || '');
      setLocationType(editingReport.locationType);
      setAddress(editingReport.address || '');
      setCity(editingReport.city || 'Florianópolis');
      setState(editingReport.state || 'SC');
      setLat(editingReport.lat);
      setLng(editingReport.lng);
      setRawLat(editingReport.lat);
      setRawLng(editingReport.lng);
      setManualLatInput(String(editingReport.lat));
      setManualLngInput(String(editingReport.lng));
      setLocationPrivacyMode(
        editingReport.hideLocation
          ? 'none'
          : editingReport.hasLocationOffset
          ? 'offset'
          : 'exact'
      );
      setLocationOffsetMeters(editingReport.locationOffsetMeters);
      setDateTime((editingReport.dateTime || new Date().toISOString()).slice(0, 16));
      setPeriodOfDay(editingReport.periodOfDay || 'noite');
      setDescription(editingReport.description || '');
      setAggressorDetails(editingReport.aggressorDetails || '');
      setWitnesses(editingReport.witnesses || '');
      setRiskLevel(editingReport.riskLevel || 'alto');
      setSecretPin(editingReport.accessKey || '1234');
      setAttachmentName(editingReport.attachments?.[0]?.name || '');
      return;
    }

    const existingDraft = getReportDraft();
    if (existingDraft) {
      setSavedDraftPrompt(existingDraft);
    }
  }, [editingReport]);

  // Automatically select identified mode once user finishes authentication
  useEffect(() => {
    if (pendingIdentifiedAuth && user && !user.isAnonymous) {
      setIsAnonymous(false);
      setPendingIdentifiedAuth(false);
      setDraftSavedNotice(`Você entrou como ${user.name}. Seu relato ficará ligado ao seu perfil com sigilo.`);
      setTimeout(() => setDraftSavedNotice(null), 4000);
    }
  }, [pendingIdentifiedAuth, user]);

  // If user logs out or switches to anonymous while in identified mode, revert safely
  useEffect(() => {
    if (editingReport && editingReport.isAnonymous === false) return;
    if (!isAnonymous && (!user || user.isAnonymous)) {
      setIsAnonymous(true);
    }
  }, [user, isAnonymous, editingReport]);

  const getCurrentDraftObject = (
    reason: 'aggressor_present' | 'quick_exit' | 'user_pause' = 'user_pause'
  ): ReportDraft => ({
    savedAt: new Date().toISOString(),
    step,
    isAnonymous,
    locationMode: locationPrivacyMode === 'none' ? 'fictitious' : 'real_approximate',
    category,
    isOnlineStalking,
    socialPlatform: socialPlatforms[0] || '',
    socialPlatforms,
    socialPlatformOther,
    aggressorProfile,
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
    reasonForPause: reason,
    locationPrivacyMode,
    locationOffsetMeters
  });

  // Debounced auto-save for new reports
  useEffect(() => {
    if (isEditMode) return;
    if (
      !submittedReport &&
      (title.trim() ||
        description.trim() ||
        aggressorDetails.trim() ||
        aggressorProfile.trim() ||
        socialPlatforms.length > 0 ||
        step > 1)
    ) {
      const timer = setTimeout(() => {
        saveReportDraft(getCurrentDraftObject('user_pause'));
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [
    isEditMode,
    step,
    isAnonymous,
    category,
    isOnlineStalking,
    socialPlatforms,
    socialPlatformOther,
    aggressorProfile,
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
    locationPrivacyMode,
    locationOffsetMeters,
    submittedReport
  ]);

  const handleApplyDraft = () => {
    if (!savedDraftPrompt) return;
    setStep(savedDraftPrompt.step || 1);
    setIsAnonymous(savedDraftPrompt.isAnonymous ?? true);
    setCategory(savedDraftPrompt.category || 'importunacao_sexual');
    setIsOnlineStalking(savedDraftPrompt.isOnlineStalking ?? false);
    const restoredPlatforms = savedDraftPrompt.socialPlatforms?.length
      ? savedDraftPrompt.socialPlatforms
      : savedDraftPrompt.socialPlatform
      ? [savedDraftPrompt.socialPlatform]
      : [];
    setSocialPlatforms(restoredPlatforms);
    setSocialPlatformOther(savedDraftPrompt.socialPlatformOther || '');
    setAggressorProfile(savedDraftPrompt.aggressorProfile || '');
    setTitle(savedDraftPrompt.title || '');
    setLocationType(savedDraftPrompt.locationType || 'transporte_publico');
    setAddress(savedDraftPrompt.address || '');
    setCity(savedDraftPrompt.city || 'Florianópolis');
    setState(savedDraftPrompt.state || 'SC');
    const draftLat = savedDraftPrompt.lat || -27.5954;
    const draftLng = savedDraftPrompt.lng || -48.5480;
    setLat(draftLat);
    setLng(draftLng);
    setRawLat(draftLat);
    setRawLng(draftLng);
    setManualLatInput(String(draftLat));
    setManualLngInput(String(draftLng));
    setLocationPrivacyMode(savedDraftPrompt.locationPrivacyMode ?? null);
    setLocationOffsetMeters(savedDraftPrompt.locationOffsetMeters);
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
    if (!isEditMode) {
      const draft = getCurrentDraftObject('aggressor_present');
      saveReportDraft(draft);
    }
    if (onEmergencyExit) {
      onEmergencyExit();
    } else {
      onCancel();
    }
  };

  const handleNormalSaveDraft = () => {
    const draft = getCurrentDraftObject('user_pause');
    saveReportDraft(draft);
    setDraftSavedNotice('Rascunho salvo neste aparelho.');
    setTimeout(() => {
      onCancel();
    }, 700);
  };

  const getSelectedPlatformLabel = (): string => {
    if (socialPlatforms.length === 0) return '';
    return socialPlatforms
      .map((plat) => {
        if (plat === 'outros') {
          return socialPlatformOther.trim()
            ? `Outros (${socialPlatformOther.trim()})`
            : 'Outros aplicativos/redes';
        }
        return SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === plat)?.label || plat;
      })
      .join(', ');
  };

  const toggleSocialPlatform = (plat: SocialPlatformType) => {
    setSocialPlatforms((prev) =>
      prev.includes(plat) ? prev.filter((item) => item !== plat) : [...prev, plat]
    );
  };

  const isDigitalModality =
    category === 'violencia_virtual' ||
    (category === 'perseguicao' && (isOnlineStalking || locationType === 'internet'));

  const isDigitalReportContext = isDigitalModality || locationType === 'internet';

  useEffect(() => {
    if (!isAnonymous && !isDigitalModality && locationPrivacyMode === 'none') {
      setLocationPrivacyMode(null);
    }
  }, [isAnonymous, isDigitalModality, locationPrivacyMode]);

  const applyCoordinatesWithPrivacy = (
    baseLat: number,
    baseLng: number,
    useOffset: boolean,
    fromGps = false
  ) => {
    setRawLat(baseLat);
    setRawLng(baseLng);
    setManualLatInput(String(baseLat));
    setManualLngInput(String(baseLng));

    if (useOffset) {
      const displaced = applyPrivacyRadiusOffset(baseLat, baseLng, 200, 500);
      setLat(displaced.lat);
      setLng(displaced.lng);
      setLocationPrivacyMode('offset');
      setLocationOffsetMeters(displaced.offsetMeters);
      if (
        fromGps ||
        !address.trim() ||
        address.startsWith('Localização exata:') ||
        address.startsWith('Ponto aproximado')
      ) {
        setAddress(`Ponto aproximado em ${city} (~${displaced.offsetMeters} m)`);
      }
      setGeoFeedback(
        `Mostramos um ponto aproximado (~${displaced.offsetMeters} m), para proteger você.`
      );
    } else {
      setLat(baseLat);
      setLng(baseLng);
      setLocationPrivacyMode('exact');
      setLocationOffsetMeters(undefined);
      if (fromGps || address.startsWith('Ponto aproximado')) {
        setAddress(`Localização informada em ${city}`);
      }
      setGeoFeedback('O ponto exato escolhido será mantido conforme sua preferência.');
    }
    setTimeout(() => setGeoFeedback(null), 4000);
  };

  const executeGpsCapture = (useOffset: boolean) => {
    setGeoFeedback(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyCoordinatesWithPrivacy(pos.coords.latitude, pos.coords.longitude, useOffset, true);
        },
        () => {
          setGeoFeedback(
            'Não conseguimos acessar o GPS agora, e tudo bem. Você pode escolher a cidade ou escrever uma referência abaixo.'
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setGeoFeedback('Este navegador não oferece localização por GPS. Escolha sua cidade abaixo.');
    }
  };

  const handleFetchCurrentLocation = () => {
    setGeoFeedback(null);
    setPendingPrivacyAction('gps');
  };

  const handleToggleManualCoords = () => {
    if (!showManualCoords && locationPrivacyMode === null) {
      setPendingPrivacyAction('manual_coords');
      return;
    }
    setShowManualCoords((prev) => !prev);
  };

  const handleApplyManualCoords = () => {
    const parsedLat = parseFloat(manualLatInput.replace(',', '.'));
    const parsedLng = parseFloat(manualLngInput.replace(',', '.'));
    if (
      Number.isNaN(parsedLat) ||
      Number.isNaN(parsedLng) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      setGeoFeedback('Confira os números informados (ex.: Latitude -27.5954 e Longitude -48.5480).');
      return;
    }
    applyCoordinatesWithPrivacy(parsedLat, parsedLng, locationPrivacyMode === 'offset', false);
  };

  const handlePrivacyDecision = (useOffset: boolean) => {
    const action = pendingPrivacyAction;
    setPendingPrivacyAction(null);

    if (action === 'gps') {
      executeGpsCapture(useOffset);
      return;
    }

    if (action === 'manual_coords') {
      setLocationPrivacyMode(useOffset ? 'offset' : 'exact');
      setShowManualCoords(true);
      if (useOffset) {
        applyCoordinatesWithPrivacy(rawLat, rawLng, true, false);
      } else {
        setLat(rawLat);
        setLng(rawLng);
        setLocationOffsetMeters(undefined);
      }
      return;
    }

    if (action === 'change_mode') {
      applyCoordinatesWithPrivacy(rawLat, rawLng, useOffset, false);
      return;
    }

    if (action === 'next_step') {
      applyCoordinatesWithPrivacy(rawLat, rawLng, useOffset, false);
      setStep(3);
    }
  };

  const handleNoLocationDecision = () => {
    const action = pendingPrivacyAction;
    setPendingPrivacyAction(null);
    setLocationPrivacyMode('none');
    setLocationOffsetMeters(undefined);
    setShowManualCoords(false);
    const pLabel = getSelectedPlatformLabel();
    if (
      !address.trim() ||
      address.startsWith('Localização') ||
      address.startsWith('Ponto aproximado') ||
      address.startsWith('Ambiente Virtual •') ||
      address.startsWith('Sem localização')
    ) {
      setAddress(
        isDigitalReportContext
          ? `Ambiente Virtual • ${pLabel || 'Sem localização no mapa'}`
          : 'Sem localização no mapa (apenas relato)'
      );
    }
    setGeoFeedback('Combinado: seu relato será salvo sem marcar nenhum ponto no mapa.');
    setTimeout(() => setGeoFeedback(null), 4000);
    if (action === 'next_step') {
      setStep(3);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsEncrypting(true);

    try {
      const protocolId = editingReport
        ? editingReport.id
        : 'ASK-2026-' + Math.floor(10000 + Math.random() * 90000);
      const internalEncryptionKey = secretPin.trim() || editingReport?.accessKey?.trim() || '1234';
      const normalizedPlatforms = socialPlatforms.length > 0 ? socialPlatforms : undefined;
      const normalizedPlatform = socialPlatforms[0] || undefined;
      const normalizedPlatformOther =
        socialPlatforms.includes('outros') && socialPlatformOther.trim()
          ? socialPlatformOther.trim()
          : undefined;
      const normalizedAggressorProfile = aggressorProfile.trim() || undefined;
      const platformLabel = getSelectedPlatformLabel();
      const nowIso = new Date().toISOString();

      const sensitiveDataToEncrypt = JSON.stringify({
        title,
        description,
        aggressorDetails,
        socialPlatform: platformLabel || undefined,
        socialPlatforms: normalizedPlatforms,
        aggressorProfile: normalizedAggressorProfile,
        witnesses,
        userEmail: isAnonymous
          ? 'ANONIMO'
          : user?.email || editingReport?.authorEmail || 'NAO_INFORMADO',
        createdAt: editingReport?.createdAt || nowIso
      });

      const encrypted = await encryptData(sensitiveDataToEncrypt, internalEncryptionKey);

      const privacyNoteSuffix = `${platformLabel ? ` · Aplicativo: ${platformLabel}.` : ''}${
        locationPrivacyMode === 'offset' && locationOffsetMeters
          ? ` · Ponto aproximado (~${locationOffsetMeters} m).`
          : locationPrivacyMode === 'none'
          ? ' · Sem ponto exibido no mapa.'
          : ''
      }`;

      const savedReport: Report = {
        id: protocolId,
        accessKey: internalEncryptionKey,
        isAnonymous,
        locationMode: locationPrivacyMode === 'none' ? 'fictitious' : 'real_approximate',
        title: title || 'Relato sem título',
        category,
        isOnlineStalking:
          category === 'perseguicao' ? isOnlineStalking || locationType === 'internet' : undefined,
        socialPlatform: normalizedPlatform,
        socialPlatforms: normalizedPlatforms,
        socialPlatformOther: normalizedPlatformOther,
        aggressorProfile: normalizedAggressorProfile,
        locationType,
        address:
          address.trim() ||
          (locationPrivacyMode === 'none'
            ? isDigitalReportContext
              ? `Ambiente Virtual • ${platformLabel || 'Sem localização no mapa'}`
              : 'Sem localização no mapa (apenas relato)'
            : platformLabel
            ? `Ambiente Virtual • ${platformLabel}`
            : `${city} (${state})`),
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
        status: editingReport ? editingReport.status : 'registrada',
        forwardDestination: editingReport?.forwardDestination || 'Central 180 / Delegacia Virtual SC',
        createdAt: editingReport?.createdAt || nowIso,
        updatedAt: nowIso,
        encryptedPayload: JSON.stringify(encrypted),
        encryptionHash: encrypted.hash,
        hasLocationOffset: locationPrivacyMode === 'offset',
        locationOffsetMeters: locationPrivacyMode === 'offset' ? locationOffsetMeters : undefined,
        hideLocation: locationPrivacyMode === 'none' ? true : undefined,
        registeredByCurrentUser: true,
        authorUserId: !isAnonymous
          ? user && !user.isAnonymous
            ? user.id
            : editingReport?.authorUserId
          : undefined,
        authorEmail: !isAnonymous
          ? user && !user.isAnonymous
            ? user.email
            : editingReport?.authorEmail
          : undefined,
        comments: editingReport?.comments,
        timeline: editingReport
          ? [
              ...(editingReport.timeline || []),
              {
                id: 'tl-' + Date.now(),
                date: nowIso,
                title: 'Relato atualizado por você',
                note: `Informações editadas e protegidas novamente com seu PIN${privacyNoteSuffix}`,
                actor: 'Usuária'
              }
            ]
          : [
              {
                id: 'tl-' + Date.now(),
                date: nowIso,
                title: 'Relato salvo no aplicativo',
                note: `Salvo sob o código ${protocolId} com proteção por PIN${privacyNoteSuffix}`,
                actor: 'Sistema AssédioAki'
              }
            ],
        attachments: editingReport?.attachments
          ? editingReport.attachments
          : attachmentName
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

      if (editingReport && onUpdateSuccess) {
        setSubmittedReport(savedReport);
        onUpdateSuccess(savedReport);
      } else {
        clearReportDraft();
        setSubmittedReport(savedReport);
        onSubmitSuccess(savedReport);
      }
    } catch {
      setSubmitError(
        'Não conseguimos enviar agora. Seus dados não foram perdidos. Tente de novo em instantes.'
      );
    } finally {
      setIsEncrypting(false);
    }
  };

  const renderDigitalPlatformFields = () => (
    <div className="p-4 bg-[#faf8fb] border border-[#ddd1ea] rounded-xl space-y-3.5">
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-xl bg-[#f3eef8] text-[#6d4c82] border border-[#ddd1ea] shrink-0">
          <Globe className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-[#261d2e]">
            Onde isso aconteceu na internet? (opcional)
          </h4>
          <p className="text-xs text-[#5a4e66] mt-0.5 leading-relaxed">
            Se quiser, marque a rede social ou aplicativo e o perfil usado pela pessoa. Sua identidade continua protegida.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="block text-xs font-semibold text-[#261d2e]">
            Qual rede social ou aplicativo?
          </span>
          <span className="text-xs text-[#6d4c82]">Pode marcar mais de um</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SOCIAL_PLATFORM_OPTIONS.map((opt) => {
            const isSelected = socialPlatforms.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleSocialPlatform(opt.id)}
                aria-pressed={isSelected}
                className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#6d4c82] text-white border-[#6d4c82]'
                    : 'bg-white border-[#e6dfee] text-[#493d54] hover:bg-[#f3eef8]'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {socialPlatforms.includes('outros') && (
        <div className="space-y-1">
          <label htmlFor="report-social-other" className="block text-xs font-semibold text-[#261d2e]">
            Qual outro aplicativo, site ou jogo?
          </label>
          <input
            id="report-social-other"
            type="text"
            value={socialPlatformOther}
            onChange={(e) => setSocialPlatformOther(e.target.value)}
            placeholder="Ex: TikTok, X (Twitter), Tinder, e-mail, SMS..."
            className="w-full min-h-[42px] px-3.5 py-2 bg-white border border-[#e6dfee] rounded-xl text-xs sm:text-sm text-[#261d2e]"
          />
        </div>
      )}

      <div className="space-y-1">
        <label
          htmlFor="report-aggressor-profile"
          className="block text-xs font-semibold text-[#261d2e] flex items-center gap-1.5"
        >
          <AtSign className="w-3.5 h-3.5 text-[#b05c72] shrink-0" aria-hidden="true" />
          <span>Perfil, @usuário ou número usado (opcional)</span>
        </label>
        <input
          id="report-aggressor-profile"
          type="text"
          value={aggressorProfile}
          onChange={(e) => setAggressorProfile(e.target.value)}
          placeholder="Ex: @perfil_suspeito, link do perfil ou telefone..."
          className="w-full min-h-[42px] px-3.5 py-2 bg-white border border-[#e6dfee] rounded-xl text-xs sm:text-sm text-[#261d2e]"
        />
        <p className="text-[11px] text-[#5a4e66] leading-snug">
          Se informado, esse perfil aparece parcialmente protegido em <strong>Menu → Perfis denunciados</strong> para ajudar outras mulheres, sem nunca mostrar quem enviou.
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-[#e6dfee] rounded-2xl max-w-3xl mx-auto p-5 sm:p-8 space-y-6">
      <LocationPrivacyModal
        isOpen={pendingPrivacyAction !== null}
        context="report"
        showNoLocationOption={isAnonymous || isDigitalModality}
        onConfirmOffset={() => handlePrivacyDecision(true)}
        onConfirmExact={() => handlePrivacyDecision(false)}
        onConfirmNoLocation={handleNoLocationDecision}
        onCancel={() => setPendingPrivacyAction(null)}
      />

      {/* Header with Pause & Quick Disguise */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#efe9f4] pb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#f3eef8] text-[#6d4c82] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#261d2e] font-heading flex items-center gap-2 flex-wrap">
              <span>{isEditMode ? 'Editar meu relato' : 'Contar o que aconteceu'}</span>
              {editingReport && (
                <span className="text-xs font-mono text-[#4f3461] bg-[#f3eef8] border border-[#ddd1ea] px-2.5 py-0.5 rounded-lg">
                  {editingReport.id}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#5a4e66]">
              {isEditMode
                ? 'Ajuste o que precisar, no seu tempo, e salve novamente com proteção.'
                : 'Você pode usar sem se identificar · Seu rascunho é salvo sozinho neste aparelho'}
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

              {!isEditMode && (
                <button
                  type="button"
                  onClick={handleNormalSaveDraft}
                  className="min-h-[44px] px-3.5 py-2 bg-[#faf8fb] hover:bg-[#f3eef8] text-[#4f3461] text-xs font-medium rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-[#e6dfee]"
                >
                  <PauseCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Salvar rascunho</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-[#5a4e66] hover:text-[#261d2e] bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] rounded-xl transition-colors cursor-pointer"
          >
            {isEditMode && !submittedReport ? 'Cancelar edição' : 'Voltar'}
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

      {savedDraftPrompt && !submittedReport && !isEditMode && (
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
              {[
                { num: 1, label: '1. Tipo' },
                { num: 2, label: '2. Local e data' },
                { num: 3, label: '3. Relato' },
                { num: 4, label: isEditMode ? '4. Salvar' : '4. Proteção' }
              ].map((st) =>
                isEditMode ? (
                  <button
                    key={st.num}
                    type="button"
                    onClick={() => setStep(st.num)}
                    className={`text-left cursor-pointer transition-colors hover:text-[#4f3461] ${
                      step >= st.num ? 'text-[#6d4c82] font-semibold' : ''
                    }`}
                  >
                    {st.label}
                  </button>
                ) : (
                  <span key={st.num} className={step >= st.num ? 'text-[#6d4c82] font-semibold' : ''}>
                    {st.label}
                  </span>
                )
              )}
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
                      Nenhum nome ou e-mail pessoal fica ligado ao seu relato. Ninguém vai saber que foi você.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!user || user.isAnonymous) {
                        if (!isEditMode) {
                          saveReportDraft(getCurrentDraftObject('user_pause'));
                        }
                        setPendingIdentifiedAuth(true);
                        if (onRequireAuth) {
                          onRequireAuth();
                        }
                        return;
                      }
                      setIsAnonymous(false);
                    }}
                    aria-pressed={!isAnonymous}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                      !isAnonymous
                        ? 'bg-[#f3eef8] border-[#6d4c82] text-[#261d2e] ring-1 ring-[#6d4c82]'
                        : 'bg-[#faf8fb] border-[#e6dfee] text-[#5a4e66]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-semibold text-sm text-[#261d2e]">
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#6d4c82]" aria-hidden="true" />
                        <span>Com meu perfil (em sigilo)</span>
                      </span>
                      {(!user || user.isAnonymous) && (
                        <span className="text-[11px] font-medium bg-white text-[#4f3461] px-2 py-0.5 rounded-lg border border-[#ddd1ea]">
                          Pede login
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5a4e66] mt-1">
                      {user && !user.isAnonymous
                        ? `Conectada como ${user.name}. Seus dados continuam em sigilo.`
                        : 'Se preferir vincular à sua conta, abriremos o login e voltaremos direto para cá.'}
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#261d2e] mb-2">
                  O que você viveu? (escolha a opção mais parecida)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (category !== 'importunacao_sexual' && category !== 'estupro') {
                        setCategory('importunacao_sexual');
                      }
                    }}
                    aria-pressed={category === 'importunacao_sexual' || category === 'estupro'}
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      category === 'importunacao_sexual' || category === 'estupro'
                        ? 'bg-[#f3eef8] border-[#6d4c82] text-[#261d2e] ring-1 ring-[#6d4c82]'
                        : 'bg-[#faf8fb] hover:bg-[#f3eef8]/50 border-[#e6dfee] text-[#493d54]'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-semibold block text-[#261d2e]">
                      Importunação sexual ou estupro
                    </span>
                    <span className="text-xs text-[#5a4e66] block mt-1 leading-snug">
                      Toques sem permissão, beijos forçados ou ato sexual mediante força ou ameaça.
                    </span>
                  </button>

                  {(
                    [
                      {
                        id: 'assedio_sexual',
                        title: 'Assédio sexual',
                        desc: 'Chantagem ou pressão sexual em relação de trabalho ou ensino.'
                      },
                      {
                        id: 'assedio_moral',
                        title: 'Assédio moral',
                        desc: 'Humilhações repetidas, gritos ou isolamento no trabalho ou estudo.'
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
                        onClick={() => {
                          setCategory(item.id);
                          if (item.id === 'violencia_virtual') {
                            setLocationType('internet');
                          }
                        }}
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

              {/* Sub-choice for Importunação sexual vs Estupro */}
              {(category === 'importunacao_sexual' || category === 'estupro') && (
                <div className="p-4 bg-[#faf8fb] border border-[#e6dfee] rounded-xl space-y-2.5">
                  <span className="block text-xs font-semibold text-[#261d2e]">
                    Qual destas duas opções se aproxima mais do que aconteceu?
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCategory('importunacao_sexual')}
                      aria-pressed={category === 'importunacao_sexual'}
                      className={`p-3.5 rounded-xl border text-xs transition-colors cursor-pointer text-left ${
                        category === 'importunacao_sexual'
                          ? 'bg-[#f3eef8] border-[#6d4c82] text-[#261d2e] ring-1 ring-[#6d4c82]'
                          : 'bg-white border-[#e6dfee] text-[#493d54] hover:bg-[#f3eef8]/40'
                      }`}
                    >
                      <span className="font-semibold text-[#261d2e] block">Importunação sexual</span>
                      <span className="block text-xs text-[#5a4e66] mt-1 leading-snug">
                        Toques sem permissão, beijo forçado ou gestos obscenos, sem uso de violência física grave.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory('estupro')}
                      aria-pressed={category === 'estupro'}
                      className={`p-3.5 rounded-xl border text-xs transition-colors cursor-pointer text-left ${
                        category === 'estupro'
                          ? 'bg-[#fbf2f4] border-[#b05c72] text-[#261d2e] ring-1 ring-[#b05c72]'
                          : 'bg-white border-[#e6dfee] text-[#493d54] hover:bg-[#fbf2f4]/40'
                      }`}
                    >
                      <span className="font-semibold text-[#261d2e] block">Estupro</span>
                      <span className="block text-xs text-[#5a4e66] mt-1 leading-snug">
                        Ato sexual forçado com violência física, grave ameaça ou quando você não tinha condições de consentir.
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-choice for Perseguição (Presencial vs Online) */}
              {category === 'perseguicao' && (
                <div className="p-4 bg-[#faf8fb] border border-[#e6dfee] rounded-xl space-y-2.5">
                  <span className="block text-xs font-semibold text-[#261d2e]">
                    Essa perseguição aconteceu pessoalmente ou pela internet?
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsOnlineStalking(false)}
                      aria-pressed={!isOnlineStalking}
                      className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        !isOnlineStalking
                          ? 'bg-[#6d4c82] text-white border-[#6d4c82]'
                          : 'bg-white border-[#e6dfee] text-[#493d54] hover:bg-[#f3eef8]'
                      }`}
                    >
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                      <span>Pessoalmente (na rua, trabalho, etc.)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOnlineStalking(true);
                        setLocationType('internet');
                      }}
                      aria-pressed={isOnlineStalking}
                      className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        isOnlineStalking
                          ? 'bg-[#6d4c82] text-white border-[#6d4c82]'
                          : 'bg-white border-[#e6dfee] text-[#493d54] hover:bg-[#f3eef8]'
                      }`}
                    >
                      <Globe className="w-4 h-4" aria-hidden="true" />
                      <span>Pela internet ou redes sociais</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Digital platform fields in Step 1 */}
              {(category === 'violencia_virtual' || (category === 'perseguicao' && isOnlineStalking)) &&
                renderDigitalPlatformFields()}

              <div>
                <label htmlFor="report-title-input" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Resumo curto da situação
                </label>
                <input
                  id="report-title-input"
                  type="text"
                  required
                  placeholder={
                    isDigitalReportContext
                      ? 'Ex: Mensagens insistentes e ameaças por perfil no Instagram'
                      : 'Ex: Abordagem insistente no ponto de ônibus do Centro'
                  }
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

          {/* STEP 2 — Location & Date */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#f3eef8] border border-[#ddd1ea] text-xs sm:text-sm text-[#493d54] leading-relaxed">
                <strong className="text-[#261d2e] block mb-1">
                  Você escolhe como cuidar da sua localização
                </strong>
                Mostramos um ponto aproximado por padrão para proteger você — ou, se preferir, você pode deixar o relato sem marcar localização no mapa.
              </div>

              <div>
                <label htmlFor="report-location-type" className="block text-xs font-semibold text-[#261d2e] mb-1">
                  Onde aconteceu?
                </label>
                <select
                  id="report-location-type"
                  value={locationType}
                  onChange={(e) => {
                    const nextLoc = e.target.value as LocationType;
                    setLocationType(nextLoc);
                    if (nextLoc === 'internet' && category === 'perseguicao') {
                      setIsOnlineStalking(true);
                    }
                  }}
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

              {isDigitalReportContext && renderDigitalPlatformFields()}

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <label htmlFor="report-address-input" className="block text-xs font-semibold text-[#261d2e]">
                    Bairro ou ponto de referência
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleManualCoords}
                      className="text-xs text-[#5a4e66] hover:text-[#4f3461] underline cursor-pointer font-medium"
                    >
                      {showManualCoords ? 'Ocultar coordenadas' : 'Digitar coordenadas'}
                    </button>
                    <button
                      type="button"
                      onClick={handleFetchCurrentLocation}
                      className="text-xs text-[#6d4c82] hover:text-[#4f3461] inline-flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Usar minha localização</span>
                    </button>
                  </div>
                </div>

                <input
                  id="report-address-input"
                  type="text"
                  required={locationPrivacyMode !== 'none' && !isDigitalReportContext && !isAnonymous}
                  placeholder={
                    locationPrivacyMode === 'none'
                      ? 'Sem localização no mapa (apenas relato)'
                      : 'Evite colocar o número exato de casa; informe apenas bairro ou ponto de referência'
                  }
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
                />

                {geoFeedback && (
                  <div className="mt-2 p-3 bg-white border border-[#ddd1ea] rounded-xl text-xs text-[#4f3461] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{geoFeedback}</span>
                  </div>
                )}

                {/* Privacy mode status card */}
                <div
                  className={`mt-2.5 p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
                    locationPrivacyMode === 'offset'
                      ? 'bg-[#f1f6f3] border-[#cde0d4] text-[#26543b]'
                      : locationPrivacyMode === 'none'
                      ? 'bg-[#fbf2f4] border-[#e7cbd3] text-[#7f3347]'
                      : 'bg-[#faf8fb] border-[#e6dfee] text-[#493d54]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>
                      {locationPrivacyMode === 'offset'
                        ? `Ponto aproximado ativo (~${locationOffsetMeters || 300} m), para proteger seu endereço.`
                        : locationPrivacyMode === 'none'
                        ? 'Sem ponto no mapa: seu relato não mostrará coordenadas no Mapa de Calor.'
                        : locationPrivacyMode === 'exact'
                        ? 'Ponto exato escolhido por você.'
                        : 'Ao avançar ou usar o GPS, perguntaremos como você prefere proteger seu endereço.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingPrivacyAction('change_mode')}
                    className="text-xs font-semibold text-[#4f3461] hover:text-[#261d2e] underline cursor-pointer shrink-0"
                  >
                    {locationPrivacyMode ? 'Trocar opção' : 'Escolher agora'}
                  </button>
                </div>

                {showManualCoords && (
                  <div className="mt-2.5 p-3.5 bg-[#faf8fb] border border-[#e6dfee] rounded-xl space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                      <span className="font-semibold text-[#261d2e]">Coordenadas informadas</span>
                      <span className="text-[#5a4e66]">
                        {locationPrivacyMode === 'offset'
                          ? `No mapa (aproximado): (${lat.toFixed(4)}, ${lng.toFixed(4)})`
                          : `No mapa: (${lat.toFixed(4)}, ${lng.toFixed(4)})`}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={manualLatInput}
                        onChange={(e) => setManualLatInput(e.target.value)}
                        placeholder="Latitude (ex: -27.5954)"
                        className="min-h-[40px] px-3 py-1.5 bg-white border border-[#e6dfee] rounded-xl text-xs text-[#261d2e]"
                      />
                      <input
                        type="text"
                        value={manualLngInput}
                        onChange={(e) => setManualLngInput(e.target.value)}
                        placeholder="Longitude (ex: -48.5480)"
                        className="min-h-[40px] px-3 py-1.5 bg-white border border-[#e6dfee] rounded-xl text-xs text-[#261d2e]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyManualCoords}
                        className="min-h-[40px] px-3 py-1.5 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="report-city-select" className="block text-xs font-semibold text-[#261d2e] mb-1">
                    Cidade em Santa Catarina
                  </label>
                  <select
                    id="report-city-select"
                    value={city}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      setCity(newCity);
                      const coords = getCityCoordinates(newCity);
                      setRawLat(coords[0]);
                      setRawLng(coords[1]);
                      setManualLatInput(String(coords[0]));
                      setManualLngInput(String(coords[1]));
                      if (locationPrivacyMode === 'offset') {
                        const displaced = applyPrivacyRadiusOffset(coords[0], coords[1], 200, 500);
                        setLat(displaced.lat);
                        setLng(displaced.lng);
                        setLocationOffsetMeters(displaced.offsetMeters);
                      } else {
                        setLat(coords[0]);
                        setLng(coords[1]);
                      }
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
                    Horário aproximado
                  </label>
                  <select
                    id="report-period-select"
                    value={periodOfDay}
                    onChange={(e) => setPeriodOfDay(e.target.value as 'manha' | 'tarde' | 'noite' | 'madrugada')}
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
                  disabled={
                    !isAnonymous &&
                    !address.trim() &&
                    locationPrivacyMode !== 'none' &&
                    !(isDigitalReportContext && (socialPlatforms.length > 0 || aggressorProfile.trim() !== ''))
                  }
                  onClick={() => {
                    if (!address.trim() && (isDigitalReportContext || locationPrivacyMode === 'none')) {
                      const pLabel = getSelectedPlatformLabel();
                      setAddress(
                        isDigitalReportContext
                          ? `Ambiente Virtual • ${
                              pLabel || (locationPrivacyMode === 'none' ? 'Sem localização no mapa' : 'Internet')
                            }${aggressorProfile.trim() ? ` (${aggressorProfile.trim()})` : ''}`
                          : 'Sem localização no mapa (apenas relato)'
                      );
                    }
                    if (locationPrivacyMode === null) {
                      setPendingPrivacyAction('next_step');
                    } else {
                      setStep(3);
                    }
                  }}
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
                  Localização escolhida:{' '}
                  <strong>
                    {locationPrivacyMode === 'none'
                      ? 'Sem ponto no mapa (apenas relato)'
                      : locationPrivacyMode === 'offset'
                      ? `Ponto aproximado em ${city} (~${locationOffsetMeters || 300} m)`
                      : `${address || city} (${state})`}
                  </strong>
                  .
                </p>
                <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                  O texto completo do seu relato fica protegido com o seu PIN. Você poderá consultar, editar ou apagar quando quiser em <strong>Menu → Meus relatos</strong>.
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
                  <span>
                    {isEncrypting
                      ? 'Salvando com segurança...'
                      : isEditMode
                      ? 'Salvar alterações com proteção'
                      : 'Salvar relato com proteção'}
                  </span>
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
            <p className="text-xs font-semibold text-[#26543b]">
              {isEditMode ? 'Alterações salvas com proteção' : 'Relato salvo com proteção'}
            </p>
            <h2 className="text-2xl font-semibold text-[#261d2e] font-heading">
              {isEditMode ? 'Seu relato foi atualizado' : 'Guarde o código do seu relato'}
            </h2>
          </div>

          <div className="p-5 bg-[#faf8fb] border border-[#e6dfee] rounded-2xl max-w-md mx-auto space-y-2.5">
            <p className="text-xs text-[#5a4e66]">Código do relato:</p>
            <div className="text-2xl font-mono font-bold text-[#4f3461] tracking-wider bg-white py-2.5 px-4 rounded-xl border border-[#ddd1ea]">
              {submittedReport.id}
            </div>
            <p className="text-xs text-[#5a4e66]">
              PIN escolhido: <strong className="text-[#261d2e] font-mono">{submittedReport.accessKey}</strong>
            </p>
            <p className="text-xs text-[#6b5e77]">
              Você também pode consultar, editar ou apagar este relato quando quiser em <strong>Menu → Meus relatos</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onOpenMyReports && (
              <button
                type="button"
                onClick={onOpenMyReports}
                className="min-h-[44px] px-5 py-2.5 bg-[#f3eef8] hover:bg-[#e6dfee] text-[#4f3461] border border-[#ddd1ea] font-semibold text-sm rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>Meus relatos</span>
              </button>
            )}

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
