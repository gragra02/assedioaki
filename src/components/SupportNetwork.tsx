import React, { useState, useMemo } from 'react';
import { SupportCenter } from '../types';
import { 
  Heart, PhoneCall, MapPin, ShieldCheck, BookOpen, Clock, ExternalLink, 
  MessageSquare, AlertCircle, Sparkles, CheckCircle2, Search, Filter, Globe,
  Locate, Navigation, Footprints, Car, X, RefreshCw, Mail, Shield, AlertTriangle, FileText
} from 'lucide-react';
import { calculateDistanceKm, formatDistance } from '../lib/geo';

interface SupportNetworkProps {
  supportCenters: SupportCenter[];
}

export type AuthorityTab = 'deam' | 'hospitais' | 'centrais_policia' | 'delegacia_virtual';

export const SupportNetwork: React.FC<SupportNetworkProps> = ({ supportCenters }) => {
  const [selectedState, setSelectedState] = useState<string>('SC');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AuthorityTab>('deam');
  const [showLegalGuide, setShowLegalGuide] = useState<boolean>(false);
  const [showCrisisChecklist, setShowCrisisChecklist] = useState<boolean>(false);

  // User location for nearest sorting
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Navegador sem suporte a GPS');
      return;
    }
    setIsLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        setLocateError('Não foi possível obter sua localização atual.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const availableStates = useMemo(() => {
    const states = Array.from(new Set(supportCenters.map(c => c.state)));
    return states.sort();
  }, [supportCenters]);

  const availableCities = useMemo(() => {
    let targetType: 'delegacia' | 'hospital' | 'central_policia' | null = null;
    if (activeTab === 'deam') targetType = 'delegacia';
    else if (activeTab === 'hospitais') targetType = 'hospital';
    else if (activeTab === 'centrais_policia') targetType = 'central_policia';

    const centersInState = supportCenters.filter(c => {
      if (selectedState !== 'all' && c.state !== selectedState) return false;
      if (targetType && c.type !== targetType) return false;
      return true;
    });
    const cities = Array.from(new Set(centersInState.map(c => c.city)));
    return cities.sort();
  }, [supportCenters, selectedState, activeTab]);

  const filteredCenters = useMemo(() => {
    let targetType: 'delegacia' | 'hospital' | 'central_policia' | null = null;
    if (activeTab === 'deam') targetType = 'delegacia';
    else if (activeTab === 'hospitais') targetType = 'hospital';
    else if (activeTab === 'centrais_policia') targetType = 'central_policia';

    if (!targetType) return [];

    const list = supportCenters.filter(c => {
      if (c.type !== targetType) return false;
      if (selectedState !== 'all' && c.state !== selectedState) return false;
      if (selectedCity !== 'all' && c.city !== selectedCity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        const matchAddress = c.address.toLowerCase().includes(q);
        return matchName || matchCity || matchAddress;
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
  }, [supportCenters, selectedState, selectedCity, activeTab, searchQuery, userLocation]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header com os quatro botões solicitados pelo usuário */}
      <div className="bg-slate-900 border border-purple-900/40 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20 shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white font-heading leading-tight">
              Endereços/Contatos de Delegacias da Mulher, Hospitais, Centrais de Polícia e Delegacia Virtual de Santa Catarina
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Guia oficial de acolhimento emergencial, delegacias especializadas, unidades hospitalares SAVIS e registro online de B.O.
            </p>
          </div>
        </div>

        {/* 4 Botões Principais com Balões Explicativos */}
        <div className="space-y-3 border-t border-slate-800 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            
            {/* BOTÃO 1: Delegacias da Mulher */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setActiveTab('deam'); setSelectedCity('all'); }}
                className={`w-full px-3.5 py-3 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                  activeTab === 'deam' 
                    ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400/80 font-black' 
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span className="font-extrabold text-xs">🏢 Delegacias da Mulher</span>
                <span className="text-[10px] opacity-85 font-medium">(DPCAMI / DEAM)</span>
              </button>
              {/* Balão Explicativo */}
              <div className="relative bg-purple-950/70 border border-purple-800/60 rounded-xl p-2.5 text-[11px] text-purple-200 leading-snug shadow-sm">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-950/70 border-t border-l border-purple-800/60 rotate-45"></div>
                <p className="relative z-10 text-center">
                  💬 <strong>31 Unidades DPCAMI:</strong> Atendimento especializado presencial das <strong>12h às 19h</strong> com salas acolhedoras.
                </p>
              </div>
            </div>

            {/* BOTÃO 2: Hospitais */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setActiveTab('hospitais'); setSelectedCity('all'); }}
                className={`w-full px-3.5 py-3 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                  activeTab === 'hospitais' 
                    ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400/80 font-black' 
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span className="font-extrabold text-xs">🏥 Hospitais</span>
                <span className="text-[10px] opacity-85 font-medium">(Rede SAVIS SC)</span>
              </button>
              {/* Balão Explicativo */}
              <div className="relative bg-purple-950/70 border border-purple-800/60 rounded-xl p-2.5 text-[11px] text-purple-200 leading-snug shadow-sm">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-950/70 border-t border-l border-purple-800/60 rotate-45"></div>
                <p className="relative z-10 text-center">
                  💬 <strong>Emergência 24 Horas:</strong> Suporte médico humanizado, profilaxia PEP e acolhimento multiprofissional.
                </p>
              </div>
            </div>

            {/* BOTÃO 3: Centrais de Polícia */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setActiveTab('centrais_policia'); setSelectedCity('all'); }}
                className={`w-full px-3.5 py-3 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                  activeTab === 'centrais_policia' 
                    ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400/80 font-black' 
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span className="font-extrabold text-xs">🚓 Centrais de Polícia</span>
                <span className="text-[10px] opacity-85 font-medium">(Plantão 24 Horas)</span>
              </button>
              {/* Balão Explicativo */}
              <div className="relative bg-purple-950/70 border border-purple-800/60 rounded-xl p-2.5 text-[11px] text-purple-200 leading-snug shadow-sm">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-950/70 border-t border-l border-purple-800/60 rotate-45"></div>
                <p className="relative z-10 text-center">
                  💬 <strong>Plantão Policial 24h:</strong> Registro presencial contínuo de ocorrências urgentes e prisões em flagrante.
                </p>
              </div>
            </div>

            {/* BOTÃO 4: Delegacia Virtual */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setActiveTab('delegacia_virtual'); }}
                className={`w-full px-3.5 py-3 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                  activeTab === 'delegacia_virtual' 
                    ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400/80 font-black' 
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span className="font-extrabold text-xs">💻 Delegacia Virtual</span>
                <span className="text-[10px] opacity-85 font-medium">(Polícia Civil SC)</span>
              </button>
              {/* Balão Explicativo */}
              <div className="relative bg-purple-950/70 border border-purple-800/60 rounded-xl p-2.5 text-[11px] text-purple-200 leading-snug shadow-sm">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-950/70 border-t border-l border-purple-800/60 rotate-45"></div>
                <p className="relative z-10 text-center">
                  💬 <strong>B.O. e Medida Protetiva Online:</strong> Registro eletrônico seguro de 13 tipos de crimes sem sair de casa.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CONTEÚDO 1, 2 E 3: DIRETÓRIO DE UNIDADES FÍSICAS (DEAM, HOSPITAIS OU CENTRAIS DE POLÍCIA) */}
      {activeTab !== 'delegacia_virtual' && (
        <div className="space-y-4">
          {/* Header descritivo da categoria selecionada */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                {activeTab === 'deam' && <Shield className="w-4 h-4 text-purple-400" />}
                {activeTab === 'hospitais' && <Heart className="w-4 h-4 text-pink-400" />}
                {activeTab === 'centrais_policia' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              </div>
              <div>
                <strong className="text-white text-sm block">
                  {activeTab === 'deam' && 'Delegacias de Proteção à Mulher (DPCAMI / DEAM)'}
                  {activeTab === 'hospitais' && 'Hospitais de Referência e Acolhimento SAVIS (24h)'}
                  {activeTab === 'centrais_policia' && 'Centrais de Plantão Policial (CPP) de Santa Catarina (24h)'}
                </strong>
                <span className="text-slate-400 text-xs">
                  {activeTab === 'deam' && '31 Unidades Oficiais de SC • Atendimento especializado das 12h às 19h (Segunda a Sexta).'}
                  {activeTab === 'hospitais' && 'Atendimento médico humanizado, profilaxia PEP e acolhimento ininterrupto 24 horas.'}
                  {activeTab === 'centrais_policia' && 'Plantão permanente 24h para registro de flagrantes e emergências policiais.'}
                </span>
              </div>
            </div>

            <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-purple-300 rounded-xl font-bold text-xs self-start sm:self-center shrink-0">
              {filteredCenters.length} unidade(s) encontrada(s)
            </span>
          </div>

          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="flex flex-1 items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                <Search className="w-4 h-4 text-purple-400 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'deam' 
                      ? "Buscar delegacia por cidade, bairro ou rua..." 
                      : activeTab === 'hospitais'
                      ? "Buscar hospital por nome ou município..."
                      : "Buscar Central de Polícia (CPP) por cidade..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white placeholder-slate-500 w-full text-xs"
                />
              </div>

              {/* Botão de Ordenar por Mais Próximo com GPS */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    userLocation 
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white ring-1 ring-emerald-400' 
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {isLocating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Localizando...</span>
                    </>
                  ) : (
                    <>
                      <Locate className="w-3.5 h-3.5" />
                      <span>{userLocation ? '✓ Mais Próximos de Você' : 'Ordenar por Mais Próximo (GPS)'}</span>
                    </>
                  )}
                </button>

                {userLocation && (
                  <button
                    type="button"
                    onClick={() => setUserLocation(null)}
                    title="Remover ordenação por distância"
                    className="p-2 bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por Cidade */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-slate-400 font-bold">Filtrar por Município de SC:</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-slate-950 text-xs text-white font-semibold outline-none border border-slate-800 rounded-lg px-2.5 py-1.5 cursor-pointer max-w-[200px] truncate"
                >
                  <option value="all" className="bg-slate-900 text-white">Todos os Municípios ({availableCities.length})</option>
                  {availableCities.map(ct => (
                    <option key={ct} value={ct} className="bg-slate-900 text-white">{ct}</option>
                  ))}
                </select>
              </div>

              {selectedCity !== 'all' && (
                <button
                  onClick={() => setSelectedCity('all')}
                  className="text-xs text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer"
                >
                  Limpar filtro de cidade
                </button>
              )}
            </div>
          </div>

          {locateError && (
            <div className="bg-amber-950/40 border border-amber-800 text-amber-300 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{locateError}</span>
            </div>
          )}

          {/* Lista de Unidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCenters.map((center) => {
              const distanceKm = userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, center.lat, center.lng) : null;
              const isDeam = center.type === 'delegacia';
              const isHospital = center.type === 'hospital';
              const isCpp = center.type === 'central_policia';

              return (
                <div 
                  key={center.id}
                  className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 space-y-3 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border inline-block ${
                          isDeam
                            ? 'text-purple-400 bg-purple-950 border-purple-800'
                            : isHospital
                            ? 'text-sky-400 bg-sky-950 border-sky-800'
                            : 'text-amber-400 bg-amber-950 border-amber-800'
                        }`}>
                          {isDeam && '🛡️ DPCAMI / DEAM Santa Catarina'}
                          {isHospital && '✚ Hospital de Referência & SAVIS'}
                          {isCpp && '🚨 Central de Plantão Policial (CPP 24h)'}
                        </span>
                        <h3 className="text-base font-bold text-white font-heading mt-2">
                          {center.name}
                        </h3>
                      </div>

                      {distanceKm !== null && (
                        <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 font-extrabold text-xs px-2.5 py-1 rounded-xl shrink-0 text-right">
                          <span>{formatDistance(distanceKm)}</span>
                          <span className="block text-[10px] font-normal text-emerald-400">de distância</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <p className="flex items-start gap-2 text-slate-400">
                        <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>
                          {center.address}, {center.city} ({center.state})
                          {center.postalCode && <span className="block text-[11px] text-slate-500">CEP: {center.postalCode}</span>}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="font-semibold text-slate-200">{center.hours}</span>
                      </p>
                      {center.ramal && (
                        <p className="text-[11px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-900 inline-block">
                          Ramal: <strong>{center.ramal}</strong>
                        </p>
                      )}
                      {center.email && (
                        <p className="flex items-center gap-1.5 text-[11px] text-purple-300 pt-0.5">
                          <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <a href={`mailto:${center.email}`} className="hover:text-purple-100 underline truncate">
                            {center.email}
                          </a>
                        </p>
                      )}
                    </div>

                    {distanceKm !== null && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Footprints className="w-3.5 h-3.5 text-purple-400" />
                          <span>~{Math.max(1, Math.round((distanceKm / 4.5) * 60))} min a pé</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Car className="w-3.5 h-3.5 text-purple-400" />
                          <span>~{Math.max(1, Math.round((distanceKm / 35) * 60))} min de carro</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${center.phone.replace(/[^0-9]/g, '')}`}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span className="truncate">{center.phone}</span>
                      </a>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}${userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                        title="Ver rota no Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5 text-purple-400" />
                        <span className="hidden sm:inline">Rota</span>
                      </a>

                      {center.whatsapp && (
                        <a
                          href={`https://wa.me/${center.whatsapp}?text=${encodeURIComponent('Olá, preciso de informações e orientação sobre acolhimento e denúncia em Santa Catarina.')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                          title="Abrir WhatsApp Oficial da Polícia Civil SC"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      )}
                    </div>

                    {center.website && (
                      <a
                        href={center.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5 text-purple-400" />
                        <span>Acessar Delegacia Virtual de SC</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTEÚDO 4: DELEGACIA VIRTUAL DE SANTA CATARINA */}
      {activeTab === 'delegacia_virtual' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Hero Banner Oficial Delegacia Virtual */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-950/60 to-slate-900 border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Portal Oficial • Polícia Civil de Santa Catarina</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                  Delegacia Virtual de Santa Catarina
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Registre seu Boletim de Ocorrência oficial online com validade jurídica perante a Polícia Civil de SC. O serviço funciona 24 horas por dia, 7 dias por semana, com sigilo e segurança.
                </p>
              </div>

              {/* Botão Oficial Externo */}
              <div className="shrink-0">
                <a
                  href="https://delegaciavirtual.sc.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Acessar Delegacia Virtual de SC</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Números e Contatos Imediatos de Emergência */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/80">
              <a 
                href="tel:190" 
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
              >
                <span className="text-lg font-black text-rose-400 group-hover:scale-110 transition-transform">190</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-0.5">Polícia Militar SC</span>
                <span className="text-[10px] text-slate-500">Risco Imediato</span>
              </a>

              <a 
                href="tel:181" 
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
              >
                <span className="text-lg font-black text-purple-400 group-hover:scale-110 transition-transform">181</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-0.5">Disque Denúncia SC</span>
                <span className="text-[10px] text-slate-500">100% Anônimo</span>
              </a>

              <a 
                href="https://wa.me/5548988440083?text=Ol%C3%A1%2C+preciso+de+informa%C3%A7%C3%B5es+sobre+den%C3%BAncia+ou+acolhimento." 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
              >
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-3.5 h-3.5" /> (48) 98844-0083
                </span>
                <span className="text-[11px] text-slate-400 font-semibold mt-1">WhatsApp Polícia Civil</span>
                <span className="text-[10px] text-emerald-400/80">Atendimento Oficial</span>
              </a>

              <a 
                href="tel:180" 
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-pink-500/40 p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
              >
                <span className="text-lg font-black text-pink-400 group-hover:scale-110 transition-transform">180</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-0.5">Central da Mulher</span>
                <span className="text-[10px] text-slate-500">Apoio Nacional</span>
              </a>
            </div>
          </div>

          {/* Boletins de Ocorrência Disponíveis na Delegacia Virtual de SC */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white font-heading">
                    Boletins de Ocorrência Disponíveis
                  </h4>
                  <p className="text-xs text-slate-400">
                    Relação oficial de boletins que podem ser registrados online na Delegacia Virtual de Santa Catarina
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 shrink-0 self-start sm:self-auto">
                13 Modalidades Disponíveis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Coluna 1 - Item 1 */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  🗣️
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight">
                  AMEAÇA, CALÚNIA, INJÚRIA OU DIFAMAÇÃO
                </span>
              </div>

              {/* Coluna 2 - Item 8 */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  🌐
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight flex items-center gap-1.5 flex-wrap">
                  <span>BOLETIM DE OCORRÊNCIA PARA ESTRANGEIRO</span>
                  <span className="inline-flex gap-1 text-xs">🇺🇸 🇪🇸</span>
                </span>
              </div>

              {/* Coluna 1 - Item 2 */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  🚜
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight">
                  CRIME CONTRA O AGRONEGÓCIO
                </span>
              </div>

              {/* Coluna 2 - Item 9 */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  🧓
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight">
                  CRIME CONTRA PESSOA IDOSA
                </span>
              </div>

              {/* Coluna 1 - Item 3 */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  ⛈️
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight">
                  DANO CAUSADO POR FENÔMENOS NATURAIS
                </span>
              </div>

              {/* Coluna 2 - Item 10 */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  ♿
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight">
                  DISCRIMINAÇÃO DE PESSOA EM RAZÃO DE SUA DEFICIÊNCIA
                </span>
              </div>

              {/* Coluna 1 - Item 4 */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  💰
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight">
                  FURTO OU ROUBO
                </span>
              </div>

              {/* Coluna 2 - Item 11 */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  🐾
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight">
                  MAUS-TRATOS CONTRA ANIMAIS
                </span>
              </div>

              {/* Coluna 1 - Item 5 */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  🚶‍♂️
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight">
                  PERDA DE DOCUMENTOS E/OU OBJETOS
                </span>
              </div>

              {/* Coluna 2 - Item 12 */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  🪪
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight">
                  RECUPERAÇÃO DE DOCUMENTOS E/OU OBJETOS
                </span>
              </div>

              {/* Coluna 1 - Item 6 */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  🚗
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight">
                  SINISTRO (ACIDENTE) DE TRÂNSITO SEM VÍTIMAS
                </span>
              </div>

              {/* Coluna 2 - Item 13: VIOLÊNCIA DOMÉSTICA COM DESTAQUE */}
              <div className="flex items-center gap-3 p-3 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/50 hover:border-purple-400 rounded-xl transition-all shadow-sm group">
                <div className="w-9 h-9 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0 text-base font-bold shadow-xs group-hover:scale-105 transition-transform">
                  🛡️
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-purple-200 tracking-tight">
                    VIOLÊNCIA DOMÉSTICA
                  </span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-purple-800 text-purple-100 font-extrabold border border-purple-600">
                    Prioridade
                  </span>
                </div>
              </div>

              {/* Coluna 1 - Item 7: OUTRAS OCORRÊNCIAS (LARGURA DUPLA) */}
              <div className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl transition-all shadow-2xs md:col-span-2 group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 text-base font-bold group-hover:scale-105 transition-transform">
                  👮
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight">
                  OUTRAS OCORRÊNCIAS
                </span>
              </div>
            </div>
          </div>

          {/* Passo a Passo para o Registro Seguro do B.O. */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-800 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Passo a Passo para o Registro do Boletim de Ocorrência na Delegacia Virtual</span>
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 list-decimal pl-4 leading-relaxed">
              <li>
                Acesse o portal oficial em <a href="https://delegaciavirtual.sc.gov.br/" target="_blank" rel="noopener noreferrer" className="text-purple-300 underline font-semibold">delegaciavirtual.sc.gov.br</a>.
              </li>
              <li>
                Localize na lista acima o tipo de ocorrência correspondente ao seu caso (ex.: <em>"VIOLÊNCIA DOMÉSTICA"</em> ou <em>"AMEAÇA, CALÚNIA, INJÚRIA OU DIFAMAÇÃO"</em>).
              </li>
              <li>
                Identifique-se com sua conta <strong>Gov.br</strong> (prata ou ouro) ou informe seus dados com total sigilo.
              </li>
              <li>
                Relate os detalhes do fato: data, hora aproximada, endereço ou ponto de referência em Santa Catarina.
              </li>
              <li>
                Anexe capturas de tela (prints de mensagens), áudios, fotos ou documentos comprobatórios.
              </li>
              <li>
                Ao concluir o envio, anote o <strong>número de protocolo</strong> gerado para acompanhar a análise policial.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Seção Adicional: Botões Expansíveis de Guia Jurídico e Orientações em Crise */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-medium">Informações Complementares e Suporte:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLegalGuide(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              showLegalGuide 
                ? 'bg-purple-900/60 text-purple-200 border border-purple-600' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>{showLegalGuide ? 'Ocultar Guia Jurídico' : 'Ver Direitos & Legislação'}</span>
          </button>

          <button
            onClick={() => setShowCrisisChecklist(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              showCrisisChecklist 
                ? 'bg-purple-900/60 text-purple-200 border border-purple-600' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showCrisisChecklist ? 'Ocultar Orientações em Crise' : 'Ver O Que Fazer em Crise'}</span>
          </button>
        </div>
      </div>

      {/* GUIA JURÍDICO EXPANSÍVEL */}
      {showLegalGuide && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-in fade-in duration-150">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white font-heading">
              Entenda os Seus Direitos e a Legislação Brasileira
            </h3>
            <p className="text-xs text-slate-400">
              Diferenças legais e tipificação das condutas conforme o Código Penal e leis especiais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-xl space-y-2">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider block">1. Importunação Sexual (Lei 13.718/18)</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Praticar contra alguém e sem a sua anuência ato libidinoso com o objetivo de satisfazer a própria lascívia ou a de terceiro (ex: tocar sem consentimento, se masturbar em local público).
              </p>
              <p className="text-[11px] text-purple-300 font-semibold">Pena: Reclusão de 1 a 5 anos.</p>
            </div>

            <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-xl space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">2. Assédio Sexual (Art. 216-A CP)</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Constranger alguém com o intuito de obter vantagem ou favorecimento sexual, prevalecendo-se da condição de superioridade hierárquica no ambiente de trabalho ou estudo.
              </p>
              <p className="text-[11px] text-purple-300 font-semibold">Pena: Detenção de 1 a 2 anos.</p>
            </div>

            <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-xl space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">3. Perseguição / Stalking (Art. 147-A)</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Perseguir alguém, reiteradamente e por qualquer meio, ameaçando-lhe a integridade física ou psicológica, restringindo-lhe a capacidade de locomoção ou invadindo sua privacidade.
              </p>
              <p className="text-[11px] text-purple-300 font-semibold">Pena: Reclusão de 6 meses a 2 anos e multa.</p>
            </div>
          </div>
        </div>
      )}

      {/* ORIENTAÇÕES EM CRISE EXPANSÍVEL */}
      {showCrisisChecklist && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-in fade-in duration-150">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white font-heading">
              Passo a Passo de Proteção após um Incidente
            </h3>
            <p className="text-xs text-slate-400">
              Orientações práticas para preservar sua integridade física e evidências.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">1. Busque um Local Seguro</strong>
                <span className="text-slate-400 text-xs">Procure imediatamente um estabelecimento comercial movimentado, posto policial ou pessoas de confiança.</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">2. Preserve Provas e Vestígios</strong>
                <span className="text-slate-400 text-xs">Tire prints com data e horário de mensagens, não apague registros e preserve roupas se houver contato físico.</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">3. Anote Detalhes e Testemunhas</strong>
                <span className="text-slate-400 text-xs">Anote nomes, horários, placas de veículos, linha de transporte coletivo e características do agressor.</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">4. Formalize o Registro Oficial</strong>
                <span className="text-slate-400 text-xs">Utilize a Delegacia Virtual de SC ou dirija-se à DPCAMI / DEAM ou Central de Plantão Policial (CPP).</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
