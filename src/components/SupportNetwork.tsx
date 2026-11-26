import React, { useState, useMemo } from 'react';
import { SupportCenter } from '../types';
import {
  Heart,
  PhoneCall,
  MapPin,
  ShieldCheck,
  BookOpen,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Search,
  Globe,
  Locate,
  Navigation,
  Footprints,
  Car,
  X,
  RefreshCw,
  Mail,
  Shield,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { calculateDistanceKm, formatDistance } from '../lib/geo';

interface SupportNetworkProps {
  supportCenters: SupportCenter[];
}

export type AuthorityTab = 'deam' | 'hospitais' | 'centrais_policia' | 'delegacia_virtual';

const DELEGACIA_VIRTUAL_MODALITIES = [
  'Ameaça, calúnia, injúria ou difamação',
  'Violência doméstica',
  'Boletim de ocorrência para estrangeiro',
  'Crime contra pessoa idosa',
  'Discriminação contra pessoa com deficiência',
  'Furto ou roubo',
  'Perda de documentos e/ou objetos',
  'Recuperação de documentos e/ou objetos',
  'Crime contra o agronegócio',
  'Dano causado por fenômenos naturais',
  'Maus-tratos contra animais',
  'Acidente de trânsito sem vítimas',
  'Outras ocorrências'
];

export const SupportNetwork: React.FC<SupportNetworkProps> = ({ supportCenters }) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AuthorityTab>('deam');
  const [showLegalGuide, setShowLegalGuide] = useState<boolean>(false);
  const [showCrisisChecklist, setShowCrisisChecklist] = useState<boolean>(false);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Este navegador não consegue usar sua localização. Tudo bem: escolha sua cidade na lista abaixo.');
      return;
    }
    setIsLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      () => {
        setLocateError('Não conseguimos encontrar sua localização agora. Você pode buscar pela sua cidade abaixo.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const availableCities = useMemo(() => {
    let targetType: 'delegacia' | 'hospital' | 'central_policia' | null = null;
    if (activeTab === 'deam') targetType = 'delegacia';
    else if (activeTab === 'hospitais') targetType = 'hospital';
    else if (activeTab === 'centrais_policia') targetType = 'central_policia';

    const centersInState = supportCenters.filter((c) => {
      if (c.state !== 'SC') return false;
      if (targetType && c.type !== targetType) return false;
      return true;
    });
    return Array.from(new Set(centersInState.map((c) => c.city))).sort();
  }, [supportCenters, activeTab]);

  const filteredCenters = useMemo(() => {
    let targetType: 'delegacia' | 'hospital' | 'central_policia' | null = null;
    if (activeTab === 'deam') targetType = 'delegacia';
    else if (activeTab === 'hospitais') targetType = 'hospital';
    else if (activeTab === 'centrais_policia') targetType = 'central_policia';

    if (!targetType) return [];

    const list = supportCenters.filter((c) => {
      if (c.type !== targetType) return false;
      if (c.state !== 'SC') return false;
      if (selectedCity !== 'all' && c.city !== selectedCity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (userLocation) {
      return [...list].sort((a, b) => {
        const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return list;
  }, [supportCenters, selectedCity, activeTab, searchQuery, userLocation]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Category Selector */}
      <div className="bg-white border border-[#e6dfee] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#f3eef8] text-[#6d4c82] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#261d2e] font-heading">
              Lugares de ajuda e contatos em Santa Catarina
            </h2>
            <p className="text-sm text-[#5a4e66]">
              DPCAMI / DEAM (delegacias que atendem mulheres), hospitais 24h, plantão policial e Delegacia Virtual.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#efe9f4]">
          {(
            [
              {
                id: 'deam',
                title: 'Delegacias da Mulher',
                subtitle: '31 unidades DPCAMI (12h às 19h)'
              },
              {
                id: 'hospitais',
                title: 'Hospitais (SAVIS)',
                subtitle: 'Atendimento médico 24 horas'
              },
              {
                id: 'centrais_policia',
                title: 'Centrais de Polícia',
                subtitle: 'Plantão policial 24 horas'
              },
              {
                id: 'delegacia_virtual',
                title: 'Delegacia Virtual',
                subtitle: 'Registro de B.O. pela internet'
              }
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedCity('all');
                }}
                aria-pressed={isActive}
                className={`min-h-[68px] px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-center ${
                  isActive
                    ? 'bg-[#6d4c82] border-[#6d4c82] text-white'
                    : 'bg-[#faf8fb] hover:bg-[#f3eef8] border-[#e6dfee] text-[#261d2e]'
                }`}
              >
                <span className="font-semibold text-sm block">{tab.title}</span>
                <span className={`text-xs block mt-0.5 ${isActive ? 'text-[#f3eef8]' : 'text-[#5a4e66]'}`}>
                  {tab.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Physical Directory (DEAM, Hospitals, CPP) */}
      {activeTab !== 'delegacia_virtual' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-[#e6dfee] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f3eef8] text-[#6d4c82] flex items-center justify-center shrink-0">
                {activeTab === 'deam' && <Shield className="w-5 h-5" aria-hidden="true" />}
                {activeTab === 'hospitais' && <Heart className="w-5 h-5" aria-hidden="true" />}
                {activeTab === 'centrais_policia' && <AlertTriangle className="w-5 h-5" aria-hidden="true" />}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#261d2e]">
                  {activeTab === 'deam' && 'Delegacias de Proteção à Mulher (DPCAMI / DEAM)'}
                  {activeTab === 'hospitais' && 'Hospitais de Referência SAVIS (24h)'}
                  {activeTab === 'centrais_policia' && 'Centrais de Plantão Policial (CPP 24h)'}
                </h3>
                <p className="text-xs text-[#5a4e66]">
                  {filteredCenters.length} unidade(s) encontrada(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#6d4c82] hover:bg-[#593c6b] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                {isLocating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Localizando...</span>
                  </>
                ) : (
                  <>
                    <Locate className="w-4 h-4" aria-hidden="true" />
                    <span>{userLocation ? 'Ordenado por distância' : 'Ordenar por proximidade'}</span>
                  </>
                )}
              </button>

              {userLocation && (
                <button
                  type="button"
                  onClick={() => setUserLocation(null)}
                  aria-label="Remover ordenação por localização"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#faf8fb] hover:bg-[#fbf2f4] text-[#5a4e66] border border-[#e6dfee] rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Search & City Filters */}
          <div className="bg-white p-4 rounded-2xl border border-[#e6dfee] grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7 relative">
              <label htmlFor="support-network-search" className="sr-only">
                Buscar unidade por cidade ou endereço
              </label>
              <Search className="w-4 h-4 text-[#7c6f88] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id="support-network-search"
                type="text"
                placeholder="Buscar por cidade, nome da unidade ou rua..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e]"
              />
            </div>

            <div className="sm:col-span-5">
              <label htmlFor="support-network-city" className="sr-only">
                Filtrar por município de Santa Catarina
              </label>
              <select
                id="support-network-city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-[#faf8fb] border border-[#e6dfee] rounded-xl text-sm text-[#261d2e] cursor-pointer"
              >
                <option value="all">Todos os municípios ({availableCities.length})</option>
                {availableCities.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {locateError && (
            <div className="bg-[#fbf2f4] border border-[#e7cbd3] text-[#7f3347] px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{locateError}</span>
            </div>
          )}

          {/* Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCenters.map((center) => {
              const distanceKm = userLocation
                ? calculateDistanceKm(userLocation.lat, userLocation.lng, center.lat, center.lng)
                : null;

              return (
                <article
                  key={center.id}
                  className="bg-white border border-[#e6dfee] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-[#6d4c82]">
                          {center.type === 'delegacia' && 'Delegacia da Mulher (DPCAMI)'}
                          {center.type === 'hospital' && 'Hospital de referência SAVIS'}
                          {center.type === 'central_policia' && 'Central de Plantão Policial 24h'}
                        </p>
                        <h4 className="text-base font-semibold text-[#261d2e] font-heading mt-1">
                          {center.name}
                        </h4>
                      </div>

                      {distanceKm !== null && (
                        <div className="bg-[#f3eef8] border border-[#ddd1ea] text-[#4f3461] font-semibold text-xs px-2.5 py-1 rounded-xl shrink-0 text-right tabular-nums">
                          {formatDistance(distanceKm)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm text-[#493d54]">
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#6d4c82] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>
                          {center.address}, {center.city} ({center.state})
                          {center.postalCode && (
                            <span className="block text-xs text-[#6b5e77]">CEP: {center.postalCode}</span>
                          )}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                        <span>{center.hours}</span>
                      </p>
                      {center.ramal && (
                        <p className="text-xs text-[#4f3461]">
                          Ramal: <strong>{center.ramal}</strong>
                        </p>
                      )}
                      {center.email && (
                        <p className="flex items-center gap-1.5 text-xs">
                          <Mail className="w-3.5 h-3.5 text-[#6d4c82] shrink-0" aria-hidden="true" />
                          <a href={`mailto:${center.email}`} className="text-[#4f3461] underline truncate">
                            {center.email}
                          </a>
                        </p>
                      )}
                    </div>

                    {distanceKm !== null && (
                      <div className="flex items-center gap-3 text-xs text-[#5a4e66] bg-[#faf8fb] p-2.5 rounded-xl border border-[#efe9f4]">
                        <span className="flex items-center gap-1">
                          <Footprints className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                          <span>~{Math.max(1, Math.round((distanceKm / 4.5) * 60))} min a pé</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                          <span>~{Math.max(1, Math.round((distanceKm / 35) * 60))} min de carro</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${(() => {
                          const parts = center.phone.split('/');
                          const dddPart = parts.find((p) => /\(\d{2}\)/.test(p)) || parts[0] || '';
                          return dddPart.replace(/[^0-9]/g, '');
                        })()}`}
                        className="flex-1 min-h-[44px] px-3 py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{center.phone}</span>
                      </a>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}${userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-3.5 py-2 bg-[#faf8fb] hover:bg-[#f3eef8] text-[#4f3461] border border-[#ddd1ea] text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
                      >
                        <Navigation className="w-4 h-4" aria-hidden="true" />
                        <span>Rota</span>
                      </a>

                      {center.whatsapp && (
                        <a
                          href={`https://wa.me/${center.whatsapp}?text=${encodeURIComponent('Olá, preciso de orientação sobre acolhimento em Santa Catarina.')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] px-3.5 py-2 bg-[#f1f6f3] hover:bg-[#e4efe8] border border-[#cde0d4] text-[#26543b] text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
                        >
                          <MessageSquare className="w-4 h-4" aria-hidden="true" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    {center.website && (
                      <a
                        href={center.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full min-h-[44px] py-2 bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#4f3461] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Globe className="w-4 h-4" aria-hidden="true" />
                        <span>Acessar portal oficial</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Delegacia Virtual SC */}
      {activeTab === 'delegacia_virtual' && (
        <div className="space-y-6">
          <div className="bg-[#f3eef8] border border-[#ddd1ea] rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#6d4c82]">
                  Portal oficial • Polícia Civil de Santa Catarina
                </p>
                <h3 className="text-xl font-semibold text-[#261d2e] font-heading">
                  Delegacia Virtual de Santa Catarina
                </h3>
                <p className="text-sm text-[#493d54] max-w-2xl leading-relaxed">
                  Você pode registrar Boletim de Ocorrência pela internet, 24 horas por dia, sem precisar ir imediatamente a uma delegacia física.
                </p>
              </div>

              <a
                href="https://delegaciavirtual.sc.gov.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-5 py-3 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-sm rounded-xl inline-flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span>Abrir Delegacia Virtual</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#ddd1ea]">
              <a
                href="tel:190"
                className="min-h-[68px] bg-white hover:bg-[#fbf2f4] border border-[#e6dfee] p-3 rounded-xl flex flex-col items-center justify-center text-center transition-colors"
              >
                <span className="text-base font-bold text-[#8c3d52] tabular-nums">190</span>
                <span className="text-xs text-[#261d2e] font-medium mt-0.5">Polícia Militar</span>
              </a>

              <a
                href="tel:181"
                className="min-h-[68px] bg-white hover:bg-[#faf8fb] border border-[#e6dfee] p-3 rounded-xl flex flex-col items-center justify-center text-center transition-colors"
              >
                <span className="text-base font-bold text-[#6d4c82] tabular-nums">181</span>
                <span className="text-xs text-[#261d2e] font-medium mt-0.5">Disque Denúncia</span>
              </a>

              <a
                href="https://wa.me/5548988440083?text=Ol%C3%A1%2C+preciso+de+informa%C3%A7%C3%B5es+sobre+den%C3%BAncia."
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[68px] bg-white hover:bg-[#f1f6f3] border border-[#e6dfee] p-3 rounded-xl flex flex-col items-center justify-center text-center transition-colors"
              >
                <span className="text-xs sm:text-sm font-bold text-[#26543b] tabular-nums">(48) 98844-0083</span>
                <span className="text-xs text-[#261d2e] font-medium mt-0.5">WhatsApp Polícia Civil</span>
              </a>

              <a
                href="tel:180"
                className="min-h-[68px] bg-white hover:bg-[#faf8fb] border border-[#e6dfee] p-3 rounded-xl flex flex-col items-center justify-center text-center transition-colors"
              >
                <span className="text-base font-bold text-[#6d4c82] tabular-nums">180</span>
                <span className="text-xs text-[#261d2e] font-medium mt-0.5">Central da Mulher</span>
              </a>
            </div>
          </div>

          <div className="bg-white border border-[#e6dfee] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#efe9f4] pb-3">
              <FileText className="w-5 h-5 text-[#6d4c82]" aria-hidden="true" />
              <div>
                <h4 className="text-base font-semibold text-[#261d2e] font-heading">
                  Ocorrências aceitas na Delegacia Virtual de SC
                </h4>
                <p className="text-xs text-[#5a4e66]">
                  Modalidades disponíveis para registro online pela Polícia Civil catarinense
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {DELEGACIA_VIRTUAL_MODALITIES.map((item) => (
                <div
                  key={item}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-medium ${
                    item === 'Violência doméstica'
                      ? 'bg-[#f3eef8] border-[#ddd1ea] text-[#4f3461]'
                      : 'bg-[#faf8fb] border-[#efe9f4] text-[#261d2e]'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e6dfee] rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#261d2e] font-semibold text-sm border-b border-[#efe9f4] pb-2">
              <CheckCircle2 className="w-4 h-4 text-[#6d4c82]" aria-hidden="true" />
              <span>Como registrar na Delegacia Virtual</span>
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-[#493d54] list-decimal pl-5 leading-relaxed">
              <li>Acesse o site delegaciavirtual.sc.gov.br.</li>
              <li>Escolha o tipo de ocorrência (como Violência Doméstica ou Ameaça).</li>
              <li>Entre com sua conta Gov.br ou preencha seus dados com sigilo.</li>
              <li>Informe data, horário aproximado e endereço do ocorrido.</li>
              <li>Anexe prints, áudios ou fotos que tiver guardado.</li>
              <li>Anote o protocolo oficial gerado ao final.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Optional Complementary Guides */}
      <div className="pt-2 border-t border-[#e6dfee] flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs sm:text-sm text-[#5a4e66]">Guias de leitura rápida:</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLegalGuide((prev) => !prev)}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 border ${
              showLegalGuide
                ? 'bg-[#6d4c82] text-white border-[#6d4c82]'
                : 'bg-white hover:bg-[#f3eef8] text-[#4f3461] border-[#e6dfee]'
            }`}
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>{showLegalGuide ? 'Ocultar guia de leis' : 'Ver principais leis'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCrisisChecklist((prev) => !prev)}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 border ${
              showCrisisChecklist
                ? 'bg-[#6d4c82] text-white border-[#6d4c82]'
                : 'bg-white hover:bg-[#f3eef8] text-[#4f3461] border-[#e6dfee]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>{showCrisisChecklist ? 'Ocultar cuidados após incidente' : 'Cuidados após um incidente'}</span>
          </button>
        </div>
      </div>

      {showLegalGuide && (
        <div className="bg-white border border-[#e6dfee] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-[#261d2e] font-heading">
            Como a lei protege você
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-[#faf8fb] border border-[#efe9f4] rounded-xl space-y-2">
              <span className="text-xs font-semibold text-[#6d4c82] block">Importunação sexual (Lei 13.718/18)</span>
              <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                Qualquer toque íntimo, beijo forçado ou ato sexual feito sem a sua permissão é crime.
              </p>
            </div>
            <div className="p-4 bg-[#faf8fb] border border-[#efe9f4] rounded-xl space-y-2">
              <span className="text-xs font-semibold text-[#6d4c82] block">Assédio sexual (Art. 216-A)</span>
              <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                Usar cargo de chefia ou ensino para pressionar ou fazer chantagem sexual também é crime.
              </p>
            </div>
            <div className="p-4 bg-[#faf8fb] border border-[#efe9f4] rounded-xl space-y-2">
              <span className="text-xs font-semibold text-[#6d4c82] block">Perseguição / Stalking (Art. 147-A)</span>
              <p className="text-xs sm:text-sm text-[#493d54] leading-relaxed">
                Seguir, vigiar ou procurar alguém sem parar, tirando sua liberdade e sua paz, é crime.
              </p>
            </div>
          </div>
        </div>
      )}

      {showCrisisChecklist && (
        <div className="bg-white border border-[#e6dfee] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-[#261d2e] font-heading">
            Cuidados práticos após uma situação de assédio
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-4 bg-[#faf8fb] rounded-xl border border-[#efe9f4]">
              <strong className="text-[#261d2e] block mb-1">1. Procure um lugar seguro</strong>
              <span className="text-[#5a4e66]">Fique perto de pessoas de confiança ou em local movimentado.</span>
            </div>
            <div className="p-4 bg-[#faf8fb] rounded-xl border border-[#efe9f4]">
              <strong className="text-[#261d2e] block mb-1">2. Guarde evidências se puder</strong>
              <span className="text-[#5a4e66]">Salve prints de mensagens com data e horário visíveis.</span>
            </div>
            <div className="p-4 bg-[#faf8fb] rounded-xl border border-[#efe9f4]">
              <strong className="text-[#261d2e] block mb-1">3. Anote detalhes importantes</strong>
              <span className="text-[#5a4e66]">Horário, linha de ônibus, local e pessoas que presenciaram.</span>
            </div>
            <div className="p-4 bg-[#faf8fb] rounded-xl border border-[#efe9f4]">
              <strong className="text-[#261d2e] block mb-1">4. Busque apoio ou registro</strong>
              <span className="text-[#5a4e66]">Você pode conversar com o 180 ou registrar B.O. presencial ou online.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
