import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Report, SupportCenter, ReportComment, User } from '../types';
import { ReportCommentsSection } from './ReportCommentsSection';
import L from 'leaflet';
import { 
  MapPin, ShieldCheck, Phone, Navigation, PlusCircle, 
  Clock, ShieldAlert, MessageSquare, ExternalLink, 
  Globe, Locate, Footprints, Car, X, Compass,
  ArrowRight, RefreshCw, Mail, Maximize2, Minimize2, HelpCircle
} from 'lucide-react';
import {
  calculateDistanceKm,
  findNearestPair,
  formatDistance,
  NearestResult,
  clusterReportsByProximity,
  isDemoExampleReport,
  PrivacyCluster,
  applyPrivacyRadiusOffset
} from '../lib/geo';
import { SC_CITY_COORDINATES_MAP, SC_CITIES_NAMES } from '../lib/scCities';
import { LocationPrivacyModal } from './LocationPrivacyModal';

type HeatCluster = PrivacyCluster;

const getTipoViolenciaPt = (category: string): string => {
  switch (category) {
    case 'importunacao_sexual':
      return 'Importunação sexual';
    case 'estupro':
      return 'Estupro';
    case 'assedio_sexual':
      return 'Assédio sexual';
    case 'assedio_moral':
      return 'Assédio moral';
    case 'perseguicao':
      return 'Perseguição (stalking)';
    case 'violencia_psicologica':
      return 'Violência emocional';
    case 'violencia_virtual':
      return 'Violência na internet';
    default:
      return 'Situação de assédio ou violência';
  }
};

const getTipoLocalPt = (locationType: string, address?: string): string => {
  switch (locationType) {
    case 'transporte_publico':
      return 'Transporte público / ônibus';
    case 'trabalho':
      return 'Ambiente de trabalho';
    case 'escola_universidade':
      return 'Escola ou universidade';
    case 'via_publica':
      return 'Rua ou espaço público';
    case 'evento_festa':
      return 'Evento ou festa';
    case 'internet':
      return 'Internet / redes sociais';
    case 'local_privado':
      return 'Casa ou local privado';
    default:
      return address ? address.split('-')[0].trim() : 'Local público';
  }
};

const formatarDataHoraPt = (dateTimeStr: string, periodOfDay: string): string => {
  try {
    const d = new Date(dateTimeStr);
    const dia = String(d.getDate()).padStart(2, '0');
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const mes = meses[d.getMonth()] || 'agosto';
    const ano = d.getFullYear() || 2026;
    
    let periodoFormatado = '';
    if (periodOfDay === 'manha') periodoFormatado = 'Manhã (6h às 12h)';
    else if (periodOfDay === 'tarde') periodoFormatado = 'Tarde (12h às 18h)';
    else if (periodOfDay === 'noite') periodoFormatado = 'Noite (18h às 0h)';
    else if (periodOfDay === 'madrugada') periodoFormatado = 'Madrugada (0h às 6h)';
    else periodoFormatado = 'Noite (18h às 0h)';

    return `${dia} de ${mes} de ${ano} · ${periodoFormatado}`;
  } catch {
    return 'Data recente informada';
  }
};

interface HeatmapViewProps {
  reports: Report[];
  supportCenters: SupportCenter[];
  onNewReportAtLocation?: (lat: number, lng: number, address: string) => void;
  onOpenNewReport?: () => void;
  onSelectReportForTrack?: (reportId: string) => void;
  mode?: 'heatmap' | 'locator';
  currentUser?: User | null;
  onAddComment?: (reportId: string, comment: ReportComment) => void;
  focusedReportRequest?: { reportId: string; nonce: number } | null;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({
  reports,
  supportCenters,
  onNewReportAtLocation,
  onOpenNewReport,
  onSelectReportForTrack,
  mode = 'heatmap',
  currentUser,
  onAddComment,
  focusedReportRequest
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const userLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [dataScope, setDataScope] = useState<'all' | 'real_only'>('all');
  
  // Support Center / DEAM / Hospital filters & selection
  const [centerTypeFilter, setCenterTypeFilter] = useState<'all' | 'delegacia' | 'hospital' | 'none'>('all');
  const [selectedDeamId, setSelectedDeamId] = useState<string>('all');
  const [selectedCenter, setSelectedCenter] = useState<SupportCenter | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<HeatCluster | null>(null);

  // User location and "Localizar Mais Próximo" state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    source: 'gps' | 'map' | 'city';
    cityName?: string;
    hasOffset?: boolean;
    offsetMeters?: number;
  } | null>(null);
  const [pendingGpsTarget, setPendingGpsTarget] = useState<'both' | 'delegacia' | 'hospital' | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [isNearestPanelOpen, setIsNearestPanelOpen] = useState<boolean>(false);
  const [nearestTarget, setNearestTarget] = useState<'both' | 'delegacia' | 'hospital'>('both');
  const [nearestResult, setNearestResult] = useState<{
    delegacia: NearestResult | null;
    hospital: NearestResult | null;
  } | null>(null);
  const [activeNearestTab, setActiveNearestTab] = useState<'delegacia' | 'hospital'>('delegacia');
  const [isClickToLocateActive, setIsClickToLocateActive] = useState<boolean>(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);
  const nearestTargetRef = useRef<'both' | 'delegacia' | 'hospital'>(nearestTarget);
  nearestTargetRef.current = nearestTarget;

  // Handle ESC key to exit fullscreen map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isEsc = e.key === 'Escape' || e.key === 'Esc' || e.code === 'Escape' || e.keyCode === 27;
      if (isEsc && isMapFullscreen) {
        setIsMapFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMapFullscreen]);

  // When map fullscreen toggles, lock body scroll, mark dataset flag, and invalidate Leaflet map size
  useEffect(() => {
    if (isMapFullscreen) {
      document.body.style.overflow = 'hidden';
      document.body.dataset.mapFullscreen = 'true';
    } else {
      document.body.style.overflow = '';
      delete document.body.dataset.mapFullscreen;
    }
    const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50);
    const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 250);
    const t3 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 500);
    return () => {
      document.body.style.overflow = '';
      delete document.body.dataset.mapFullscreen;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isMapFullscreen]);

  const formatSupportUnitLabel = (center: SupportCenter): string => {
    if (center.type === 'delegacia') {
      const suffixMatch = center.name.match(/\(([^)]+)\)\s*$/);
      const suffix = suffixMatch ? ` (${suffixMatch[1]})` : '';
      return `${center.city} - DPCAMI/DEAM${suffix}`;
    }
    if (center.type === 'hospital') {
      const escapedCity = center.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const cleanName = center.name
        .replace(new RegExp(`\\s*\\(${escapedCity}\\)\\s*$`, 'i'), '')
        .replace(new RegExp(`\\(${escapedCity}\\s*-\\s*`, 'i'), '(')
        .replace(new RegExp(`\\s*-\\s*${escapedCity}\\)\\s*$`, 'i'), ')')
        .trim();
      return `${center.city} - ${cleanName}`;
    }
    return `${center.city} - ${center.name}`;
  };

  // List of all Delegacias da Mulher (DPCAMI / DEAM) sorted A-Z by city
  const delegacias = useMemo(() => {
    return supportCenters
      .filter(c => c.type === 'delegacia')
      .sort((a, b) => {
        const cityCmp = a.city.localeCompare(b.city, 'pt-BR', { sensitivity: 'base' });
        if (cityCmp !== 0) return cityCmp;
        return formatSupportUnitLabel(a).localeCompare(formatSupportUnitLabel(b), 'pt-BR', { sensitivity: 'base' });
      });
  }, [supportCenters]);

  // List of all Hospitais de Santa Catarina sorted A-Z by city
  const hospitais = useMemo(() => {
    return supportCenters
      .filter(c => c.type === 'hospital')
      .sort((a, b) => {
        const cityCmp = a.city.localeCompare(b.city, 'pt-BR', { sensitivity: 'base' });
        if (cityCmp !== 0) return cityCmp;
        return formatSupportUnitLabel(a).localeCompare(formatSupportUnitLabel(b), 'pt-BR', { sensitivity: 'base' });
      });
  }, [supportCenters]);

  const closestUnitResult = useMemo<NearestResult | null>(() => {
    if (!nearestResult) return null;
    const { delegacia, hospital } = nearestResult;
    if (delegacia && hospital) {
      return delegacia.distanceKm <= hospital.distanceKm ? delegacia : hospital;
    }
    return delegacia || hospital || null;
  }, [nearestResult]);

  // City default coordinates mapping (All 295 Santa Catarina municipalities)
  const cityCoordinates = SC_CITY_COORDINATES_MAP;

  // Filter reports according to current controls
  const filteredReports = useMemo(() => {
    return reports.filter(rep => {
      if (dataScope === 'real_only' && isDemoExampleReport(rep)) return false;
      if (selectedCity !== 'all' && rep.city !== selectedCity) return false;
      if (categoryFilter !== 'all' && rep.category !== categoryFilter) return false;
      if (periodFilter !== 'all' && rep.periodOfDay !== periodFilter) return false;
      if (riskFilter !== 'all') {
        const isGrave = rep.riskLevel === 'grave' || rep.riskLevel === 'urgente' || rep.riskLevel === 'alto';
        const isMedio = rep.riskLevel === 'medio' || rep.riskLevel === 'moderado';
        const isBaixo = rep.riskLevel === 'baixo' || rep.riskLevel === 'leve';

        if (riskFilter === 'grave' && !isGrave) return false;
        if ((riskFilter === 'medio' || riskFilter === 'moderado') && !isMedio) return false;
        if ((riskFilter === 'baixo' || riskFilter === 'leve') && !isBaixo) return false;
      }
      return true;
    });
  }, [reports, dataScope, selectedCity, categoryFilter, periodFilter, riskFilter]);

  // Automatically close report inspector if filtered out by active filter
  useEffect(() => {
    if (selectedReport && !filteredReports.some(r => r.id === selectedReport.id)) {
      setSelectedReport(null);
      setSelectedCluster(null);
    }
  }, [filteredReports, selectedReport]);

  // Keep selectedReport synchronized with latest reports array state
  useEffect(() => {
    if (selectedReport) {
      const fresh = reports.find(r => r.id === selectedReport.id);
      if (fresh && fresh !== selectedReport) {
        setSelectedReport(fresh);
      }
    }
  }, [reports, selectedReport]);

  // Direct navigation when selecting a report from Meus relatos or Perfis denunciados
  useEffect(() => {
    if (!focusedReportRequest?.reportId) return;
    const target = reports.find((r) => r.id === focusedReportRequest.reportId);
    if (!target) return;

    setDataScope('all');
    setSelectedCity('all');
    setCategoryFilter('all');
    setPeriodFilter('all');
    setRiskFilter('all');
    setSelectedCenter(null);
    setSelectedCluster(null);
    setSelectedReport(target);

    if (mapInstanceRef.current && !target.hideLocation) {
      mapInstanceRef.current.setView([target.lat, target.lng], 15);
    }

    const timer = setTimeout(() => {
      const el = document.getElementById('report-inspector-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [focusedReportRequest, reports]);

  // Handler para o botão "Ver detalhes" no popup do mapa
  useEffect(() => {
    (window as any).__abrirDetalhesOcorrencia = (reportId: string) => {
      const rep = reports.find(r => r.id === reportId);
      if (rep) {
        setSelectedReport(rep);
        setSelectedCenter(null);
        setTimeout(() => {
          const el = document.getElementById('report-inspector-card');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 60);
      }
    };
    return () => {
      delete (window as any).__abrirDetalhesOcorrencia;
    };
  }, [reports]);

  // Filter support centers / delegacias / hospitais
  const filteredCenters = useMemo(() => {
    return supportCenters.filter(sc => {
      if (centerTypeFilter === 'delegacia' && sc.type !== 'delegacia') return false;
      if (centerTypeFilter === 'hospital' && sc.type !== 'hospital') return false;
      if (centerTypeFilter === 'none') return false;
      if (selectedDeamId !== 'all') {
        return sc.id === selectedDeamId;
      }
      if (selectedCity !== 'all' && sc.city !== selectedCity) return false;
      return true;
    });
  }, [supportCenters, centerTypeFilter, selectedCity, selectedDeamId]);

  // Calculate and activate nearest support facility (delegacia and/or hospital)
  const calculateAndShowNearest = (
    lat: number,
    lng: number,
    target: 'both' | 'delegacia' | 'hospital' = nearestTargetRef.current
  ) => {
    const pair = findNearestPair(lat, lng, supportCenters);
    setNearestResult({
      delegacia: pair.nearestDelegacia,
      hospital: pair.nearestHospital
    });

    if (target === 'hospital') {
      setCenterTypeFilter('hospital');
      setActiveNearestTab('hospital');
      if (pair.nearestHospital) {
        setSelectedCenter(pair.nearestHospital.center);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([pair.nearestHospital.center.lat, pair.nearestHospital.center.lng], 15);
        }
      } else {
        setSelectedCenter(null);
      }
      setSelectedReport(null);
    } else if (target === 'delegacia') {
      setCenterTypeFilter('delegacia');
      setActiveNearestTab('delegacia');
      if (pair.nearestDelegacia) {
        setSelectedCenter(pair.nearestDelegacia.center);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([pair.nearestDelegacia.center.lat, pair.nearestDelegacia.center.lng], 15);
        }
      } else {
        setSelectedCenter(null);
      }
      setSelectedReport(null);
    } else {
      setCenterTypeFilter('all');
      if (pair.nearestDelegacia && pair.nearestHospital) {
        if (pair.nearestDelegacia.distanceKm <= pair.nearestHospital.distanceKm) {
          setSelectedCenter(pair.nearestDelegacia.center);
          setActiveNearestTab('delegacia');
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([pair.nearestDelegacia.center.lat, pair.nearestDelegacia.center.lng], 15);
          }
        } else {
          setSelectedCenter(pair.nearestHospital.center);
          setActiveNearestTab('hospital');
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([pair.nearestHospital.center.lat, pair.nearestHospital.center.lng], 15);
          }
        }
      } else if (pair.nearestDelegacia) {
        setSelectedCenter(pair.nearestDelegacia.center);
        setActiveNearestTab('delegacia');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([pair.nearestDelegacia.center.lat, pair.nearestDelegacia.center.lng], 15);
        }
      } else if (pair.nearestHospital) {
        setSelectedCenter(pair.nearestHospital.center);
        setActiveNearestTab('hospital');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([pair.nearestHospital.center.lat, pair.nearestHospital.center.lng], 15);
        }
      }
      setSelectedReport(null);
    }
  };

  const executeLocateGPS = (
    target: 'both' | 'delegacia' | 'hospital' = nearestTargetRef.current,
    useOffset = true
  ) => {
    setNearestTarget(target);
    nearestTargetRef.current = target;
    if (target === 'hospital') {
      setCenterTypeFilter('hospital');
      setActiveNearestTab('hospital');
    } else if (target === 'delegacia') {
      setCenterTypeFilter('delegacia');
      setActiveNearestTab('delegacia');
    } else {
      setCenterTypeFilter('all');
    }
    setSelectedDeamId('all');
    setIsLocating(true);
    setLocateError(null);
    setIsNearestPanelOpen(true);

    if (!navigator.geolocation) {
      setLocateError('Este navegador não consegue usar sua localização. Tudo bem: escolha sua cidade abaixo ou toque em um ponto do mapa.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const rawLat = position.coords.latitude;
        const rawLng = position.coords.longitude;
        if (useOffset) {
          const displaced = applyPrivacyRadiusOffset(rawLat, rawLng, 200, 500);
          setUserLocation({
            lat: displaced.lat,
            lng: displaced.lng,
            source: 'gps',
            hasOffset: true,
            offsetMeters: displaced.offsetMeters
          });
          calculateAndShowNearest(displaced.lat, displaced.lng, target);
        } else {
          setUserLocation({
            lat: rawLat,
            lng: rawLng,
            source: 'gps',
            hasOffset: false
          });
          calculateAndShowNearest(rawLat, rawLng, target);
        }
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        let msg = 'Não conseguimos encontrar sua localização agora.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'A localização está desligada no navegador, e tudo bem. Você pode escolher sua cidade abaixo ou tocar no mapa.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Não conseguimos localizar seu aparelho agora. Escolha uma cidade de SC abaixo ou toque no mapa.';
        } else {
          msg = 'A busca de localização demorou além do esperado. Escolha sua cidade abaixo ou toque no mapa.';
        }
        setLocateError(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleLocateGPS = (target: 'both' | 'delegacia' | 'hospital' = nearestTargetRef.current) => {
    setLocateError(null);
    setPendingGpsTarget(target);
  };

  // Sync mode changes (auto-open and auto-GPS on 'locator' mode, close on 'heatmap' mode)
  useEffect(() => {
    if (mode === 'locator') {
      setIsNearestPanelOpen(true);
      if (!userLocation && !isLocating) {
        handleLocateGPS(nearestTarget);
      }
    } else {
      setIsNearestPanelOpen(false);
    }
  }, [mode]);

  const handleLocateFromCity = (cityName: string, target: 'both' | 'delegacia' | 'hospital' = nearestTargetRef.current) => {
    const coords = cityCoordinates[cityName];
    if (!coords) return;
    setUserLocation({ lat: coords[0], lng: coords[1], source: 'city', cityName });
    setLocateError(null);
    setIsNearestPanelOpen(true);
    setNearestTarget(target);
    nearestTargetRef.current = target;
    if (target === 'hospital') {
      setCenterTypeFilter('hospital');
      setActiveNearestTab('hospital');
    } else if (target === 'delegacia') {
      setCenterTypeFilter('delegacia');
      setActiveNearestTab('delegacia');
    } else {
      setCenterTypeFilter('all');
    }
    calculateAndShowNearest(coords[0], coords[1], target);
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setNearestResult(null);
    setLocateError(null);
    setIsClickToLocateActive(false);
    setSelectedCenter(null);
    if (userLayerGroupRef.current) {
      userLayerGroupRef.current.clearLayers();
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCoords: [number, number] = [-27.5954, -48.5480]; // Default Florianópolis SC
      const map = L.map(mapContainerRef.current, {
        center: initialCoords,
        zoom: 12,
        zoomControl: false
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      const userLayerGroup = L.layerGroup().addTo(map);
      userLayerGroupRef.current = userLayerGroup;

      map.on('click', (e: L.LeafletMouseEvent) => {
        setUserLocation({ lat: e.latlng.lat, lng: e.latlng.lng, source: 'map' });
        setLocateError(null);
        setIsNearestPanelOpen(true);
        calculateAndShowNearest(e.latlng.lat, e.latlng.lng, nearestTargetRef.current);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center map on city change
  useEffect(() => {
    if (mapInstanceRef.current && selectedCity !== 'all' && cityCoordinates[selectedCity]) {
      mapInstanceRef.current.setView(cityCoordinates[selectedCity], 13);
    }
  }, [selectedCity]);

  // Handle specific Support Unit (DPCAMI / DEAM / Hospital) selection dropdown
  const handleSelectDeam = (deamId: string) => {
    setSelectedDeamId(deamId);
    if (deamId === 'all') {
      setSelectedCenter(null);
      return;
    }
    const deam = supportCenters.find(c => c.id === deamId);
    if (deam) {
      if (centerTypeFilter === 'none' || (centerTypeFilter !== 'all' && centerTypeFilter !== deam.type)) {
        setCenterTypeFilter('all');
      }
      setSelectedCenter(deam);
      setSelectedReport(null);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([deam.lat, deam.lng], 15);
      }
    }
  };

  // Update map markers and heat circle overlays
  useEffect(() => {
    if (!layerGroupRef.current || !mapInstanceRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // Group filteredReports (excluding hidden-location reports) into privacy-safe spatial clusters
    const clusters = clusterReportsByProximity(
      filteredReports.filter((r) => !r.hideLocation),
      0.008
    );

    clusters.forEach((cluster) => {
      let color = '#6d4c82'; // ameixa suave (baixo)
      let radius = 380;
      let opacity = 0.24;

      const isClusterGrave = cluster.highestRisk === 'grave' || cluster.highestRisk === 'urgente' || cluster.highestRisk === 'alto';
      const isClusterModerado = cluster.highestRisk === 'moderado' || cluster.highestRisk === 'medio';

      if (isClusterGrave) {
        color = '#b05c72'; // rosa queimado (grave)
        radius = 560;
        opacity = 0.30;
      } else if (isClusterModerado) {
        color = '#9a6b4c'; // tom terroso/ocre suave (médio)
        radius = 460;
        opacity = 0.27;
      }

      radius += Math.min(340, (cluster.count - 1) * 90);

      const isSelected = (selectedReport && cluster.reports.some(r => r.id === selectedReport.id)) || (selectedCluster?.id === cluster.id);

      const outerHeatRing = L.circle([cluster.lat, cluster.lng], {
        color: 'transparent',
        fillColor: color,
        fillOpacity: opacity * 0.42,
        radius: isSelected ? radius * 1.45 : radius * 1.35,
        stroke: false
      });
      layerGroup.addLayer(outerHeatRing);

      const circle = L.circle([cluster.lat, cluster.lng], {
        color: color,
        fillColor: color,
        fillOpacity: opacity,
        radius: isSelected ? radius * 1.1 : radius * 0.85,
        stroke: true,
        weight: isSelected ? 2 : 1
      });

      const size = isSelected
        ? (cluster.count > 4 ? 40 : cluster.count > 1 ? 34 : 28)
        : (cluster.count > 4 ? 36 : cluster.count > 1 ? 30 : 25);
      const fontSize = cluster.count > 99 ? 10 : cluster.count > 9 ? 12 : 12.5;

      const iconHtml = `
        <div style="
          background: ${color};
          color: #ffffff;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 8px rgba(38, 29, 46, ${isSelected ? '0.35' : '0.2'});
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: ${fontSize}px;
          line-height: 1;
          cursor: pointer;
          transition: transform 0.2s ease;
        " title="${cluster.count} ${cluster.count === 1 ? 'relato nesta área' : 'relatos nesta área'}">
          ${cluster.count}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-heat-pin',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker([cluster.lat, cluster.lng], { icon: customIcon });

      const report = cluster.reports[0];
      const tipoViolencia = getTipoViolenciaPt(report.category);
      const tipoLocal = getTipoLocalPt(report.locationType, report.address);
      const dataHora = formatarDataHoraPt(report.dateTime, report.periodOfDay);

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; font-size: 12.5px; line-height: 1.5; color: #261d2e; padding: 4px 2px; min-width: 240px;">
          <div style="margin-bottom: 6px; border-bottom: 1px solid #efe9f4; padding-bottom: 5px;">
            <span style="color: #5a4e66; font-weight: 600; font-size: 11px;">O que aconteceu</span><br/>
            <strong style="color: #4f3461; font-size: 13px; font-weight: 700;">${tipoViolencia}</strong>
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: #5a4e66; font-weight: 600; font-size: 11px;">Onde foi (aproximado)</span><br/>
            <strong style="color: #261d2e; font-weight: 600;">${tipoLocal}, ${report.city}</strong>
          </div>
          <div style="margin-bottom: 8px;">
            <span style="color: #5a4e66; font-weight: 600; font-size: 11px;">Quando foi</span><br/>
            <strong style="color: #261d2e; font-weight: 600;">${dataHora}</strong>
          </div>
          <div style="padding-top: 5px; border-top: 1px solid #efe9f4;">
            <button onclick="window.__abrirDetalhesOcorrencia && window.__abrirDetalhesOcorrencia('${report.id}')" style="width: 100%; background: #6d4c82; color: #ffffff; font-weight: 600; font-size: 12px; padding: 7px 12px; border-radius: 10px; border: none; cursor: pointer; text-align: center; display: block;">
              Ver detalhes →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        offset: [0, -size / 2],
        maxWidth: 320,
        className: 'occurrence-popup'
      });

      marker.on('click', () => {
        setSelectedCluster(cluster);
        setSelectedReport(cluster.reports[0]);
        setSelectedCenter(null);
        marker.openPopup();
      });

      const formatRiskLabel = (risk: string) => {
        if (risk === 'grave' || risk === 'urgente' || risk === 'alto') return 'Grave';
        if (risk === 'medio' || risk === 'moderado') return 'Médio';
        return 'Baixo';
      };

      if (cluster.count === 1) {
        const report = cluster.reports[0];
        const categoryLabel = getTipoViolenciaPt(report.category);

        marker.bindTooltip(
          `<div style="font-weight: 700; font-size: 12px; color: #261d2e;">${report.title}</div>
           <div style="font-size: 11px; color: #5a4e66; margin-top: 2px;">
             <span style="font-weight: 700; color: ${color};">● 1 relato</span> · ${categoryLabel} · ${formatRiskLabel(report.riskLevel)}
           </div>
           <div style="font-size: 10.5px; color: #6b5e77; margin-top: 2px;">${report.address}, ${report.city}</div>`,
          { direction: 'top', offset: [0, -size / 2] }
        );
      } else {
        marker.bindTooltip(
          `<div style="font-weight: 700; font-size: 12px; color: #261d2e;">${cluster.count} relatos nesta área aproximada</div>
           <div style="font-size: 11px; color: ${color}; font-weight: 600; margin-top: 2px;">
             Nível mais alto: ${formatRiskLabel(cluster.highestRisk)}
           </div>
           <div style="font-size: 10.5px; color: #6b5e77; margin-top: 2px;">${cluster.address}, ${cluster.city}</div>
           <div style="font-size: 10.5px; color: #6d4c82; font-weight: 600; margin-top: 4px;">Toque para ver os ${cluster.count} relatos</div>`,
          { direction: 'top', offset: [0, -size / 2] }
        );
      }

      layerGroup.addLayer(circle);
      layerGroup.addLayer(marker);
    });

    // Render Support Centers / Delegacias da Mulher
    if (centerTypeFilter !== 'none') {
      filteredCenters.forEach((center) => {
        const isDelegacia = center.type === 'delegacia' || center.type === 'central_policia';
        const isSelected = selectedCenter?.id === center.id;

        const supportIconHtml = isDelegacia ? `
          <div style="
            background: #4f3461;
            color: #ffffff;
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 9px;
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '16px' : '14px'};
            box-shadow: 0 2px 8px rgba(38, 29, 46, 0.28);
            cursor: pointer;
            transition: all 0.2s ease;
          " title="Delegacia que atende mulheres (DPCAMI / DEAM)">🚓</div>
        ` : `
          <div style="
            background: #ffffff;
            color: #b05c72;
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 9px;
            border: 2px solid #b05c72;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(176, 92, 114, 0.25);
            cursor: pointer;
            transition: all 0.2s ease;
          " title="Hospital 24h de acolhimento em SC">
            <svg viewBox="0 0 24 24" width="${isSelected ? '18' : '15'}" height="${isSelected ? '18' : '15'}" fill="#b05c72">
              <path d="M8.5 2h7v6.5H22v7h-6.5V22h-7v-6.5H2v-7h6.5V2z"/>
            </svg>
          </div>
        `;

        const supportIcon = L.divIcon({
          html: supportIconHtml,
          className: 'custom-support-pin',
          iconSize: isSelected ? [34, 34] : [28, 28],
          iconAnchor: isSelected ? [17, 17] : [14, 14]
        });

        const supportMarker = L.marker([center.lat, center.lng], { icon: supportIcon });

        supportMarker.on('click', () => {
          setSelectedCenter(center);
          setSelectedReport(null);
          setSelectedDeamId(center.type === 'delegacia' ? center.id : 'all');
        });

        supportMarker.bindTooltip(`
          <div style="font-weight: 600; font-size: 11.5px; color: #261d2e;">${center.name}</div>
          <div style="font-size: 10.5px; color: #5a4e66;">${center.city} (${center.state})</div>
        `, { direction: 'top', offset: [0, -12] });

        layerGroup.addLayer(supportMarker);
      });
    }

  }, [filteredReports, filteredCenters, centerTypeFilter, selectedCenter, selectedReport, selectedCluster]);

  // Render user location pin and connecting dashed polyline to nearest facilities
  useEffect(() => {
    if (!userLayerGroupRef.current || !mapInstanceRef.current) return;
    const group = userLayerGroupRef.current;
    group.clearLayers();

    if (!userLocation) return;

    if (userLocation.source !== 'city') {
      const userPinHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
        ">
          <div style="
            position: relative;
            background: #6d4c82;
            color: #ffffff;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 3px 10px rgba(109, 76, 130, 0.35);
          ">📍</div>
        </div>
      `;

      const userPinIcon = L.divIcon({
        html: userPinHtml,
        className: 'custom-user-marker',
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { 
        icon: userPinIcon, 
        zIndexOffset: 1000 
      });

      userMarker.bindTooltip(`
        <div style="font-weight: 600; font-size: 11px; color: #4f3461;">Ponto de referência</div>
        <div style="font-size: 10px; color: #5a4e66;">${userLocation.source === 'gps' ? 'Sua localização atual' : 'Ponto marcado no mapa'}</div>
      `, { direction: 'top', offset: [0, -14] });

      group.addLayer(userMarker);
    }

    const boundsPoints: [number, number][] = userLocation.source !== 'city' ? [[userLocation.lat, userLocation.lng]] : [];

    if (nearestResult && userLocation.source !== 'city') {
      if ((nearestTarget === 'both' || nearestTarget === 'delegacia') && nearestResult.delegacia) {
        const deam = nearestResult.delegacia.center;
        boundsPoints.push([deam.lat, deam.lng]);

        const polyline = L.polyline([
          [userLocation.lat, userLocation.lng],
          [deam.lat, deam.lng]
        ], {
          color: '#6d4c82',
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.85
        });
        polyline.bindTooltip(`Delegacia mais próxima: ${formatDistance(nearestResult.delegacia.distanceKm)}`, {
          sticky: true
        });
        group.addLayer(polyline);
      }

      if ((nearestTarget === 'both' || nearestTarget === 'hospital') && nearestResult.hospital) {
        const hosp = nearestResult.hospital.center;
        boundsPoints.push([hosp.lat, hosp.lng]);

        const polyline = L.polyline([
          [userLocation.lat, userLocation.lng],
          [hosp.lat, hosp.lng]
        ], {
          color: '#b05c72',
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.85
        });
        polyline.bindTooltip(`Hospital mais próximo: ${formatDistance(nearestResult.hospital.distanceKm)}`, {
          sticky: true
        });
        group.addLayer(polyline);
      }
    }

    if (userLocation.source === 'city') {
      const targetCenter = selectedCenter || (nearestTarget === 'hospital' ? nearestResult?.hospital?.center : nearestResult?.delegacia?.center);
      if (targetCenter && mapInstanceRef.current) {
        mapInstanceRef.current.setView([targetCenter.lat, targetCenter.lng], 15);
      } else if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
      }
    } else {
      if (boundsPoints.length > 1 && mapInstanceRef.current) {
        const bounds = L.latLngBounds(boundsPoints);
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 15
        });
      } else if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14);
      }
    }
  }, [userLocation, nearestResult, nearestTarget, selectedCenter]);

  // Inspector card renderer (reused in both standard split layout and fullscreen overlay)
  const renderInspectorContent = () => {
    if (selectedCenter && (centerTypeFilter === 'all' || selectedCenter.type === centerTypeFilter)) {
      return (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-[#efe9f4] pb-3">
            <div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border inline-block ${
                selectedCenter.type === 'delegacia'
                  ? 'text-[#4f3461] bg-[#f3eef8] border-[#ddd1ea]'
                  : selectedCenter.type === 'central_policia'
                  ? 'text-[#6e4f16] bg-[#fcf7eb] border-[#ebd7ad]'
                  : 'text-[#7f3347] bg-[#fbf2f4] border-[#ead4dc]'
              }`}>
                {selectedCenter.type === 'delegacia' 
                  ? 'DPCAMI / DEAM · Delegacia que atende mulheres' 
                  : selectedCenter.type === 'central_policia'
                  ? 'Central de Plantão Policial (24h)'
                  : 'Hospital 24h de acolhimento (SC)'}
              </span>
              <h3 className="text-base font-semibold text-[#261d2e] mt-1.5 font-heading">
                {selectedCenter.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCenter(null);
                setSelectedDeamId('all');
              }}
              className="min-h-[44px] min-w-[44px] text-[#5a4e66] hover:text-[#261d2e] text-xs bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] px-3 py-2 rounded-xl cursor-pointer font-semibold"
            >
              Fechar
            </button>
          </div>

          {userLocation && (
            <div className="p-3 bg-[#f3eef8] border border-[#ddd1ea] rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-[#261d2e]">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                  <span>Distância aproximada:</span>
                </span>
                <span className="bg-white px-2.5 py-0.5 rounded-lg border border-[#ddd1ea] text-[#4f3461] font-semibold tabular-nums">
                  {formatDistance(calculateDistanceKm(userLocation.lat, userLocation.lng, selectedCenter.lat, selectedCenter.lng))}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#5a4e66]">
                <span className="flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                  <span>~{Math.max(1, Math.round((calculateDistanceKm(userLocation.lat, userLocation.lng, selectedCenter.lat, selectedCenter.lng) / 4.5) * 60))} min a pé</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                  <span>~{Math.max(1, Math.round((calculateDistanceKm(userLocation.lat, userLocation.lng, selectedCenter.lat, selectedCenter.lng) / 35) * 60))} min de carro</span>
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2 text-xs sm:text-sm text-[#493d54]">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#6d4c82] shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                {selectedCenter.address}, {selectedCenter.city} ({selectedCenter.state})
                {selectedCenter.postalCode && <span className="text-[#6b5e77] block text-xs">CEP: {selectedCenter.postalCode}</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
              <span>Horário: <strong className="text-[#261d2e]">{selectedCenter.hours}</strong></span>
            </div>
          </div>

          <div className="p-3.5 bg-[#faf8fb] rounded-xl border border-[#efe9f4] space-y-2 text-xs sm:text-sm">
            <p className="text-[#493d54]">
              <strong className="text-[#261d2e]">Telefone:</strong> {selectedCenter.phone}
              {selectedCenter.ramal && (
                <span className="ml-2 text-[#4f3461] font-medium bg-[#f3eef8] px-2 py-0.5 rounded-lg border border-[#ddd1ea] text-xs">
                  Ramal: {selectedCenter.ramal}
                </span>
              )}
            </p>

            {selectedCenter.email && (
              <p className="text-[#493d54] flex items-center gap-1.5 flex-wrap">
                <strong className="text-[#261d2e]">E-mail:</strong>
                <a
                  href={`mailto:${selectedCenter.email}`}
                  className="text-[#4f3461] hover:text-[#261d2e] font-medium flex items-center gap-1 underline break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                  <span>{selectedCenter.email}</span>
                </a>
              </p>
            )}

            {selectedCenter.whatsapp && (
              <p className="text-[#493d54] flex items-center gap-1.5 flex-wrap">
                <strong className="text-[#261d2e]">WhatsApp:</strong>
                <a
                  href={`https://wa.me/${selectedCenter.whatsapp}?text=${encodeURIComponent('Olá, gostaria de orientação e apoio.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#26543b] hover:underline font-semibold flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>(48) 98844-0083</span>
                </a>
              </p>
            )}
          </div>

          <div className="pt-1 space-y-2">
            <div className="flex gap-2">
              <a
                href={`tel:${(() => {
                  const parts = selectedCenter.phone.split('/');
                  const dddPart = parts.find((p) => /\(\d{2}\)/.test(p)) || parts[0] || '';
                  return dddPart.replace(/[^0-9]/g, '');
                })()}`}
                className="flex-1 min-h-[44px] py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Ligar</span>
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.lat},${selectedCenter.lng}${userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] py-2 bg-[#f3eef8] hover:bg-[#eae1f3] border border-[#ddd1ea] text-[#4f3461] font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Como chegar</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>

            {selectedCenter.website && (
              <a
                href={selectedCenter.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-2 bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#493d54] font-medium rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                <span>Abrir site do local</span>
                <ExternalLink className="w-3 h-3 text-[#6b5e77]" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      );
    }

    if (selectedReport) {
      return (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-[#efe9f4] pb-3">
            <div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border inline-block ${
                (selectedReport.riskLevel === 'grave' || selectedReport.riskLevel === 'urgente' || selectedReport.riskLevel === 'alto')
                  ? 'bg-[#fbf2f4] text-[#7f3347] border-[#ead4dc]' :
                (selectedReport.riskLevel === 'moderado' || selectedReport.riskLevel === 'medio')
                  ? 'bg-[#faf5ee] text-[#6b4f2d] border-[#e8dcc8]' :
                  'bg-[#f3eef8] text-[#4f3461] border-[#ddd1ea]'
              }`}>
                Nível {
                  (selectedReport.riskLevel === 'grave' || selectedReport.riskLevel === 'urgente' || selectedReport.riskLevel === 'alto') ? 'grave' :
                  (selectedReport.riskLevel === 'moderado' || selectedReport.riskLevel === 'medio') ? 'médio' : 'baixo'
                }
              </span>
              <h3 className="text-base font-semibold text-[#261d2e] mt-1.5 font-heading">
                {selectedReport.title}
              </h3>
            </div>
            <button 
              type="button"
              onClick={() => {
                setSelectedReport(null);
                setSelectedCluster(null);
              }}
              className="min-h-[44px] min-w-[44px] text-[#5a4e66] hover:text-[#261d2e] text-xs bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] px-3 py-2 rounded-xl font-semibold cursor-pointer"
            >
              Fechar
            </button>
          </div>

          {selectedCluster && selectedCluster.reports.length > 1 && (
            <div className="bg-[#f3eef8] p-3 rounded-xl border border-[#ddd1ea] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#261d2e] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#6d4c82] text-white font-semibold text-[11px] flex items-center justify-center tabular-nums">
                    {selectedCluster.reports.length}
                  </span>
                  <span>Relatos nesta mesma área</span>
                </span>
                <span className="text-[11px] bg-white text-[#4f3461] border border-[#ddd1ea] font-medium px-2 py-0.5 rounded-lg">
                  Área aproximada
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {selectedCluster.reports.map((r, idx) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReport(r)}
                    className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedReport.id === r.id
                        ? 'bg-[#6d4c82] text-white'
                        : 'bg-white text-[#493d54] hover:bg-[#faf8fb] border border-[#ddd1ea]'
                    }`}
                  >
                    #{idx + 1} ({
                      (r.riskLevel === 'grave' || r.riskLevel === 'urgente' || r.riskLevel === 'alto') ? 'Grave' :
                      (r.riskLevel === 'moderado' || r.riskLevel === 'medio') ? 'Médio' : 'Baixo'
                    })
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#faf8fb] border border-[#efe9f4] rounded-xl p-3.5 space-y-1.5 text-xs sm:text-sm text-[#493d54] leading-relaxed">
            <div>
              <span className="text-[#5a4e66] font-medium">O que aconteceu: </span>
              <strong className="text-[#261d2e] font-semibold">{getTipoViolenciaPt(selectedReport.category)}</strong>
            </div>
            <div>
              <span className="text-[#5a4e66] font-medium">Onde foi: </span>
              <strong className="text-[#261d2e] font-semibold">{getTipoLocalPt(selectedReport.locationType, selectedReport.address)}, {selectedReport.city}</strong>
            </div>
            <div>
              <span className="text-[#5a4e66] font-medium">Quando foi: </span>
              <strong className="text-[#261d2e] font-semibold">{formatarDataHoraPt(selectedReport.dateTime, selectedReport.periodOfDay)}</strong>
            </div>
            {((selectedReport.socialPlatforms && selectedReport.socialPlatforms.length > 0) || selectedReport.socialPlatform) && (
              <div>
                <span className="text-[#5a4e66] font-medium">Rede social / aplicativo: </span>
                <strong className="text-[#4f3461] font-semibold">
                  {(selectedReport.socialPlatforms && selectedReport.socialPlatforms.length > 0
                    ? selectedReport.socialPlatforms
                    : selectedReport.socialPlatform
                    ? [selectedReport.socialPlatform]
                    : []
                  )
                    .map((plat) =>
                      plat === 'outros'
                        ? selectedReport.socialPlatformOther || 'Outros'
                        : plat.charAt(0).toUpperCase() + plat.slice(1)
                    )
                    .join(', ')}
                </strong>
              </div>
            )}
            {selectedReport.aggressorProfile && (
              <div>
                <span className="text-[#5a4e66] font-medium">Perfil citado: </span>
                <strong className="text-[#7f3347] font-mono font-semibold break-all">{selectedReport.aggressorProfile}</strong>
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-xs text-[#5a4e66]">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#6d4c82] shrink-0" aria-hidden="true" />
              <span>{selectedReport.address}, {selectedReport.city} ({selectedReport.state})</span>
            </div>
            {selectedReport.hideLocation ? (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#7f3347] bg-[#fbf2f4] border border-[#e7cbd3] px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Sem ponto no mapa por escolha de privacidade</span>
              </div>
            ) : selectedReport.hasLocationOffset ? (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#26543b] bg-[#f1f6f3] border border-[#cde0d4] px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  Ponto aproximado para proteger quem contou{selectedReport.locationOffsetMeters ? ` (~${selectedReport.locationOffsetMeters} m)` : ''}
                </span>
              </div>
            ) : null}
          </div>

          <div className="p-3.5 bg-[#faf8fb] rounded-xl border border-[#efe9f4] text-xs sm:text-sm text-[#493d54] leading-relaxed max-h-36 overflow-y-auto">
            <p className="font-semibold text-[#261d2e] mb-1">O que foi contado:</p>
            {selectedReport.description}
          </div>

          <div className="pt-1 space-y-2">
            {onSelectReportForTrack && (
              <button
                type="button"
                onClick={() => onSelectReportForTrack(selectedReport.id)}
                className="w-full min-h-[44px] py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Acompanhar relato {selectedReport.id}</span>
              </button>
            )}
          </div>

          {onAddComment && (
            <ReportCommentsSection
              reportId={selectedReport.id}
              comments={selectedReport.comments || []}
              currentUser={currentUser}
              onAddComment={onAddComment}
            />
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#efe9f4] pb-2.5">
            <h3 className="text-sm font-semibold text-[#261d2e] font-heading">
              {riskFilter === 'grave' ? 'Relatos no mapa · Nível grave' :
               riskFilter === 'medio' || riskFilter === 'moderado' ? 'Relatos no mapa · Nível médio' :
               riskFilter === 'baixo' || riskFilter === 'leve' ? 'Relatos no mapa · Nível baixo' :
               'Relatos no mapa'}
            </h3>
            <span className="text-xs bg-[#f3eef8] text-[#4f3461] px-2.5 py-0.5 rounded-lg border border-[#ddd1ea] font-semibold tabular-nums">
              {filteredReports.length} {filteredReports.length === 1 ? 'relato' : 'relatos'}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {filteredReports.length === 0 ? (
              <div className="p-5 text-center bg-[#faf8fb] rounded-xl border border-dashed border-[#ddd1ea] text-[#5a4e66] space-y-3">
                <p className="text-sm font-semibold text-[#261d2e]">
                  {dataScope === 'real_only'
                    ? 'Ainda não há novos relatos enviados neste filtro.'
                    : 'Não encontramos relatos com os filtros escolhidos.'}
                </p>
                <p className="text-xs text-[#5a4e66] leading-relaxed">
                  Se quiser, você pode contar o que aconteceu usando um ponto aproximado e sem se identificar.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {onOpenNewReport && (
                    <button
                      type="button"
                      onClick={onOpenNewReport}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#b05c72] hover:bg-[#914358] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Contar o que aconteceu</span>
                    </button>
                  )}
                  {(dataScope === 'real_only' || riskFilter !== 'all' || selectedCity !== 'all' || categoryFilter !== 'all' || periodFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setDataScope('all');
                        setRiskFilter('all');
                        setSelectedCity('all');
                        setCategoryFilter('all');
                        setPeriodFilter('all');
                      }}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-[#e6dfee] text-xs font-medium text-[#4f3461] cursor-pointer"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredReports.map((rep) => (
                <article 
                  key={rep.id}
                  className="p-3.5 bg-[#faf8fb] hover:bg-[#f3eef8]/50 border border-[#e6dfee] rounded-xl space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-[#efe9f4] pb-1.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${
                      (rep.riskLevel === 'grave' || rep.riskLevel === 'urgente' || rep.riskLevel === 'alto') ? 'bg-[#fbf2f4] text-[#7f3347] border border-[#ead4dc]' :
                      (rep.riskLevel === 'moderado' || rep.riskLevel === 'medio') ? 'bg-[#faf5ee] text-[#6b4f2d] border border-[#e8dcc8]' :
                      'bg-[#f3eef8] text-[#4f3461] border border-[#ddd1ea]'
                    }`}>
                      Nível {(rep.riskLevel === 'grave' || rep.riskLevel === 'urgente' || rep.riskLevel === 'alto') ? 'grave' :
                       (rep.riskLevel === 'moderado' || rep.riskLevel === 'medio') ? 'médio' : 'baixo'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {rep.comments && rep.comments.length > 0 && (
                        <span className="text-[11px] text-[#4f3461] bg-[#f3eef8] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1" title={`${rep.comments.length} mensagens de apoio`}>
                          <MessageSquare className="w-3 h-3" aria-hidden="true" />
                          <span>{rep.comments.length}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-[#5a4e66] font-medium bg-white px-2 py-0.5 rounded-lg border border-[#e6dfee]">
                        #{rep.id.replace(/^ASK-\d{4}-/, '')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-[#493d54] leading-snug">
                    <div>
                      <span className="text-[#5a4e66]">O que aconteceu: </span>
                      <strong className="text-[#261d2e] font-semibold">{getTipoViolenciaPt(rep.category)}</strong>
                    </div>
                    <div>
                      <span className="text-[#5a4e66]">Onde foi: </span>
                      <strong className="text-[#261d2e] font-semibold">{getTipoLocalPt(rep.locationType, rep.address)}, {rep.city}</strong>
                    </div>
                    <div>
                      <span className="text-[#5a4e66]">Quando foi: </span>
                      <strong className="text-[#261d2e] font-semibold">{formatarDataHoraPt(rep.dateTime, rep.periodOfDay)}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#efe9f4] flex items-center justify-between gap-2">
                    <span className="text-xs text-[#5a4e66] truncate max-w-[165px]" title={rep.address}>
                      {rep.address}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReport(rep);
                        setSelectedCenter(null);
                        if (mapInstanceRef.current && !rep.hideLocation) {
                          mapInstanceRef.current.setView([rep.lat, rep.lng], 15);
                        }
                      }}
                      className="min-h-[44px] px-3.5 py-2 bg-[#6d4c82] hover:bg-[#593c6b] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Ver detalhes</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="p-3.5 bg-[#f3eef8] border border-[#ddd1ea] rounded-xl text-xs text-[#493d54] space-y-1">
          <div className="flex items-center gap-2 font-semibold text-[#4f3461]">
            <ShieldAlert className="w-4 h-4 text-[#6d4c82]" aria-hidden="true" />
            <span>Se precisar de ajuda agora</span>
          </div>
          <p className="text-xs text-[#493d54] leading-relaxed">
            Em perigo imediato, ligue <strong className="text-[#261d2e]">190</strong>. Para apoio à mulher 24h, ligue <strong className="text-[#261d2e]">180</strong>. Em SC, também há o <strong className="text-[#261d2e]">181</strong> e o WhatsApp <strong className="text-[#26543b]">(48) 98844-0083</strong>.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <LocationPrivacyModal
        isOpen={pendingGpsTarget !== null}
        context="locator"
        onConfirmOffset={() => {
          const target = pendingGpsTarget || nearestTargetRef.current;
          setPendingGpsTarget(null);
          executeLocateGPS(target, true);
        }}
        onConfirmExact={() => {
          const target = pendingGpsTarget || nearestTargetRef.current;
          setPendingGpsTarget(null);
          executeLocateGPS(target, false);
        }}
        onCancel={() => {
          setPendingGpsTarget(null);
          setIsLocating(false);
        }}
      />

      {/* Map Header & Filter Controls Bar */}
      <div className="bg-white border border-[#e6dfee] rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            {mode === 'locator' ? (
              <>
                <p className="text-xs font-semibold text-[#6d4c82]">
                  Ajuda perto de você em Santa Catarina
                </p>
                <h2 className="text-lg sm:text-2xl font-semibold text-[#261d2e] font-heading">
                  Delegacia da mulher ou hospital mais perto de você
                </h2>
                <p className="text-xs sm:text-sm text-[#5a4e66] max-w-2xl leading-relaxed">
                  Veja no mapa as DPCAMIs / DEAMs (delegacias que atendem mulheres) e os hospitais 24h em Santa Catarina.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-[#6d4c82]">
                  Mapa de segurança em Santa Catarina
                </p>
                <h2 className="text-lg sm:text-2xl font-semibold text-[#261d2e] font-heading">
                  Onde há mais relatos e onde você pode buscar ajuda
                </h2>
                <p className="text-xs sm:text-sm text-[#5a4e66] max-w-2xl leading-relaxed">
                  Os pontos no mapa são aproximados, para proteger quem conta o que viveu. Aqui você também encontra delegacias e hospitais de SC.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
            {mode === 'heatmap' && (
              <div className="flex items-center gap-1 bg-[#f3eef8] border border-[#ddd1ea] rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDataScope('all')}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                    dataScope === 'all'
                      ? 'bg-[#6d4c82] text-white'
                      : 'text-[#4f3461] hover:bg-white/70'
                  }`}
                >
                  Todos, com exemplos
                </button>
                <button
                  type="button"
                  onClick={() => setDataScope('real_only')}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                    dataScope === 'real_only'
                      ? 'bg-[#6d4c82] text-white'
                      : 'text-[#4f3461] hover:bg-white/70'
                  }`}
                >
                  Somente novos registros
                </button>
              </div>
            )}

            {mode === 'heatmap' && onOpenNewReport && (
              <button
                type="button"
                onClick={onOpenNewReport}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#b05c72] hover:bg-[#914358] text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Contar o que aconteceu</span>
              </button>
            )}

            {mode === 'locator' && (
              <button
                type="button"
                onClick={() => handleLocateGPS(nearestTarget)}
                disabled={isLocating}
                className="min-h-[44px] bg-[#6d4c82] hover:bg-[#593c6b] disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer w-full sm:w-auto"
              >
                <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{isLocating ? 'Buscando sua região...' : 'Usar minha localização'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Nearest Support Facility Panel - ONLY in locator mode */}
        {mode === 'locator' && (
          <div id="nearest-finder-card" className="bg-[#f3eef8] border border-[#ddd1ea] rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#6d4c82] text-white rounded-xl shrink-0">
                  <Locate className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#261d2e]">
                    Como encontrar ajuda perto de você
                  </h3>
                  <p className="text-xs text-[#5a4e66]">
                    Use sua localização, escolha uma cidade de SC ou toque em qualquer ponto do mapa.
                  </p>
                </div>
              </div>

              {userLocation && (
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="min-h-[40px] text-xs font-semibold text-[#5a4e66] hover:text-[#7f3347] bg-white hover:bg-[#fbf2f4] border border-[#ddd1ea] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-[#8c3d52]" aria-hidden="true" />
                  <span>{userLocation.source === 'city' ? 'Limpar cidade' : 'Limpar ponto'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-1">
              <div className="md:col-span-5 flex items-center gap-1 bg-white p-1 rounded-xl border border-[#ddd1ea] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setNearestTarget('both');
                    nearestTargetRef.current = 'both';
                    setCenterTypeFilter('all');
                    if (userLocation) calculateAndShowNearest(userLocation.lat, userLocation.lng, 'both');
                  }}
                  className={`flex-1 min-h-[38px] py-1.5 px-2 rounded-lg font-semibold transition-colors text-center cursor-pointer ${
                    nearestTarget === 'both'
                      ? 'bg-[#6d4c82] text-white'
                      : 'text-[#493d54] hover:bg-[#f3eef8]'
                  }`}
                >
                  Ambos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNearestTarget('delegacia');
                    nearestTargetRef.current = 'delegacia';
                    setCenterTypeFilter('delegacia');
                    setActiveNearestTab('delegacia');
                    if (userLocation) calculateAndShowNearest(userLocation.lat, userLocation.lng, 'delegacia');
                  }}
                  className={`flex-1 min-h-[38px] py-1.5 px-2 rounded-lg font-semibold transition-colors text-center cursor-pointer ${
                    nearestTarget === 'delegacia'
                      ? 'bg-[#6d4c82] text-white'
                      : 'text-[#493d54] hover:bg-[#f3eef8]'
                  }`}
                >
                  Delegacia
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNearestTarget('hospital');
                    nearestTargetRef.current = 'hospital';
                    setCenterTypeFilter('hospital');
                    setActiveNearestTab('hospital');
                    if (userLocation) calculateAndShowNearest(userLocation.lat, userLocation.lng, 'hospital');
                  }}
                  className={`flex-1 min-h-[38px] py-1.5 px-2 rounded-lg font-semibold transition-colors text-center cursor-pointer ${
                    nearestTarget === 'hospital'
                      ? 'bg-[#6d4c82] text-white'
                      : 'text-[#493d54] hover:bg-[#f3eef8]'
                  }`}
                >
                  Hospital
                </button>
              </div>

              <div className="md:col-span-7 flex flex-wrap sm:flex-nowrap items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white px-3 min-h-[44px] rounded-xl border border-[#ddd1ea]">
                  <span className="text-xs text-[#5a4e66] font-medium shrink-0 hidden sm:inline">
                    Cidade:
                  </span>
                  <select
                    value={userLocation?.source === 'city' ? userLocation.cityName : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleLocateFromCity(e.target.value, nearestTarget);
                      }
                    }}
                    className="w-full bg-transparent text-xs sm:text-sm text-[#261d2e] font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="">Escolha uma cidade de SC...</option>
                    {SC_CITIES_NAMES.map(city => (
                      <option key={city} value={city}>{city} (SC)</option>
                    ))}
                  </select>
                </div>

                {userLocation && (
                  <button
                    type="button"
                    onClick={() => handleLocateGPS(nearestTarget)}
                    disabled={isLocating}
                    title="Atualizar sua localização"
                    className="min-h-[44px] bg-white hover:bg-[#faf8fb] text-[#4f3461] border border-[#ddd1ea] py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-[#6d4c82]' : 'text-[#6d4c82]'}`} aria-hidden="true" />
                    <span className="hidden sm:inline">Atualizar</span>
                  </button>
                )}
              </div>
            </div>

            {locateError ? (
              <div className="bg-white border border-[#ddd1ea] text-[#493d54] p-3.5 rounded-xl text-xs space-y-2">
                <p className="font-medium text-[#261d2e]">{locateError}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLocateFromCity('Florianópolis', nearestTarget)}
                    className="text-xs font-semibold text-[#6d4c82] underline hover:text-[#261d2e] cursor-pointer"
                  >
                    Ver em Florianópolis
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => handleLocateFromCity('Joinville', nearestTarget)}
                    className="text-xs font-semibold text-[#6d4c82] underline hover:text-[#261d2e] cursor-pointer"
                  >
                    Ver em Joinville
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => handleLocateFromCity('Blumenau', nearestTarget)}
                    className="text-xs font-semibold text-[#6d4c82] underline hover:text-[#261d2e] cursor-pointer"
                  >
                    Ver em Blumenau
                  </button>
                </div>
              </div>
            ) : !userLocation ? (
              <div className="text-xs text-[#5a4e66] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#6d4c82] shrink-0" aria-hidden="true" />
                <span>Você também pode tocar em qualquer ponto do mapa para ver o que fica mais perto dali.</span>
              </div>
            ) : null}

            {userLocation && nearestResult && (
              <div className="bg-white rounded-xl border border-[#ddd1ea] p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#efe9f4] pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6d4c82]" />
                    <span className="text-xs font-semibold text-[#261d2e]">
                      {userLocation.cityName ? `Cidade escolhida: ${userLocation.cityName} (SC)` : userLocation.source === 'gps' ? 'Sua região atual' : 'Ponto marcado no mapa'}
                    </span>
                    {userLocation.hasOffset && (
                      <span className="text-[11px] font-medium bg-[#f1f6f3] text-[#26543b] border border-[#cde0d4] px-2 py-0.5 rounded-lg inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span>Ponto aproximado (~{userLocation.offsetMeters || 300} m)</span>
                      </span>
                    )}
                  </div>

                  {nearestTarget === 'both' ? (
                    <div className="flex items-center gap-1 bg-[#faf8fb] border border-[#efe9f4] p-1 rounded-lg text-xs">
                      {nearestResult.delegacia && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNearestTab('delegacia');
                            setSelectedCenter(nearestResult.delegacia!.center);
                            if (mapInstanceRef.current) {
                              mapInstanceRef.current.setView([nearestResult.delegacia!.center.lat, nearestResult.delegacia!.center.lng], 15);
                            }
                          }}
                          className={`min-h-[34px] px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                            activeNearestTab === 'delegacia'
                              ? 'bg-[#6d4c82] text-white'
                              : 'text-[#493d54] hover:text-[#261d2e]'
                          }`}
                        >
                          <span>Delegacia</span>
                          <span className="text-[11px] opacity-90">
                            {userLocation.source === 'city' && nearestResult.delegacia.center.city === userLocation.cityName
                              ? '(na cidade)'
                              : `(${formatDistance(nearestResult.delegacia.distanceKm)})`}
                          </span>
                        </button>
                      )}

                      {nearestResult.hospital && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNearestTab('hospital');
                            setSelectedCenter(nearestResult.hospital!.center);
                            if (mapInstanceRef.current) {
                              mapInstanceRef.current.setView([nearestResult.hospital!.center.lat, nearestResult.hospital!.center.lng], 15);
                            }
                          }}
                          className={`min-h-[34px] px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                            activeNearestTab === 'hospital'
                              ? 'bg-[#6d4c82] text-white'
                              : 'text-[#493d54] hover:text-[#261d2e]'
                          }`}
                        >
                          <span>Hospital</span>
                          <span className="text-[11px] opacity-90">
                            {userLocation.source === 'city' && nearestResult.hospital.center.city === userLocation.cityName
                              ? '(na cidade)'
                              : `(${formatDistance(nearestResult.hospital.distanceKm)})`}
                          </span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#f3eef8] text-[#4f3461] border border-[#ddd1ea]">
                      {nearestTarget === 'hospital' ? 'Mostrando hospitais' : 'Mostrando delegacias da mulher'}
                    </span>
                  )}
                </div>

                {(() => {
                  const targetKey = nearestTarget === 'hospital'
                    ? 'hospital'
                    : nearestTarget === 'delegacia'
                      ? 'delegacia'
                      : activeNearestTab;
                  const item = targetKey === 'hospital' ? nearestResult.hospital : nearestResult.delegacia;
                  if (!item) return null;
                  const center = item.center;
                  const isDeam = center.type === 'delegacia';

                  return (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#faf8fb] p-3.5 rounded-xl border border-[#efe9f4]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${
                            isDeam 
                              ? 'bg-[#f3eef8] text-[#4f3461] border-[#ddd1ea]' 
                              : 'bg-[#fbf2f4] text-[#7f3347] border-[#ead4dc]'
                          }`}>
                            {isDeam ? 'DPCAMI / DEAM · Delegacia que atende mulheres' : 'Hospital 24h (SC)'}
                          </span>
                          {userLocation.source === 'city' ? (
                            <span className="text-xs font-medium text-[#4f3461] bg-white border border-[#e6dfee] px-2 py-0.5 rounded-lg">
                              {center.city.toLowerCase() === userLocation.cityName?.toLowerCase()
                                ? `Em ${center.city}`
                                : `Mais próxima: ${center.city} (${formatDistance(item.distanceKm)})`}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-[#26543b] bg-[#f1f6f3] border border-[#cde0d4] px-2 py-0.5 rounded-lg tabular-nums">
                              A {formatDistance(item.distanceKm)}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-[#261d2e] font-heading">
                          {center.name}
                        </h4>
                        <p className="text-xs text-[#5a4e66] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#6d4c82] shrink-0" aria-hidden="true" />
                          <span>{center.address}, {center.city} (SC)</span>
                        </p>
                        {userLocation.source !== 'city' ? (
                          <div className="flex items-center gap-3 text-xs text-[#5a4e66] pt-0.5">
                            <span className="flex items-center gap-1">
                              <Footprints className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                              <span>A pé: <strong className="text-[#261d2e]">~{item.walkingTimeMin} min</strong></span>
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Car className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                              <span>De carro: <strong className="text-[#261d2e]">~{item.drivingTimeMin} min</strong></span>
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                              <span>{center.hours}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-xs text-[#5a4e66] pt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#6d4c82]" aria-hidden="true" />
                              <span>Horário: <strong className="text-[#261d2e]">{center.hours}</strong></span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                        <a
                          href={`tel:${(() => {
                            const parts = center.phone.split('/');
                            const dddPart = parts.find((p) => /\(\d{2}\)/.test(p)) || parts[0] || '';
                            return dddPart.replace(/[^0-9]/g, '');
                          })()}`}
                          className="min-h-[44px] bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Ligar ({center.phone})</span>
                        </a>

                        <a
                          href={userLocation.source === 'city'
                            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ', ' + center.address + ', ' + center.city + ' - SC')}`
                            : `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${center.lat},${center.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] bg-[#f3eef8] hover:bg-[#eae1f3] border border-[#ddd1ea] text-[#4f3461] font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Como chegar</span>
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCenter(center);
                            setSelectedReport(null);
                            if (mapInstanceRef.current) {
                              mapInstanceRef.current.setView([center.lat, center.lng], 16);
                            }
                          }}
                          className="min-h-[44px] bg-white hover:bg-[#faf8fb] text-[#493d54] border border-[#e6dfee] font-semibold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Ver detalhes
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Primary Interactive Filters: Risk Level & Delegacia da Mulher (ONLY in heatmap mode) */}
        {mode === 'heatmap' && (
          <div className="pt-4 border-t border-[#efe9f4] space-y-3.5">
            {/* Row 1: Calm Risk Selection Chips */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-[#faf8fb] p-3 rounded-xl border border-[#efe9f4]">
              <span className="text-xs sm:text-sm font-semibold text-[#261d2e] shrink-0">
                O que você quer ver no mapa?
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRiskFilter('all')}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                    riskFilter === 'all'
                      ? 'bg-[#6d4c82] text-white border-[#6d4c82]'
                      : 'bg-white text-[#493d54] hover:bg-[#f3eef8] border-[#e6dfee]'
                  }`}
                >
                  Todos os relatos
                </button>

                {/* Grave — soft burnt rose */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setRiskFilter('grave')}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      riskFilter === 'grave'
                        ? 'bg-[#b05c72] text-white border-[#b05c72]'
                        : 'bg-[#fbf2f4] text-[#7f3347] hover:bg-[#f5e4e9] border-[#ead4dc]'
                    }`}
                    title="Situações com contato físico, ameaça direta ou perseguição"
                  >
                    <span className={`w-2 h-2 rounded-full ${riskFilter === 'grave' ? 'bg-white' : 'bg-[#b05c72]'}`} />
                    <span>Grave</span>
                    <HelpCircle className="w-3.5 h-3.5 opacity-75" aria-hidden="true" />
                  </button>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex group-focus-within:flex flex-col items-center z-50 pointer-events-none w-60 text-center">
                    <div className="bg-white text-[#261d2e] text-xs rounded-xl p-3 shadow-md border border-[#ddd1ea] leading-relaxed">
                      <strong className="text-[#7f3347] block mb-0.5 font-semibold">Nível grave</strong>
                      Situações com contato físico, ameaça direta ou perseguição insistente.
                    </div>
                  </div>
                </div>

                {/* Médio — soft warm sand/ochre */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setRiskFilter('medio')}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      riskFilter === 'medio' || riskFilter === 'moderado'
                        ? 'bg-[#9a6b4c] text-white border-[#9a6b4c]'
                        : 'bg-[#faf5ee] text-[#6b4f2d] hover:bg-[#f3eadc] border-[#e8dcc8]'
                    }`}
                    title="Constrangimento repetido ou assédio verbal frequente"
                  >
                    <span className={`w-2 h-2 rounded-full ${riskFilter === 'medio' || riskFilter === 'moderado' ? 'bg-white' : 'bg-[#9a6b4c]'}`} />
                    <span>Médio</span>
                    <HelpCircle className="w-3.5 h-3.5 opacity-75" aria-hidden="true" />
                  </button>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex group-focus-within:flex flex-col items-center z-50 pointer-events-none w-60 text-center">
                    <div className="bg-white text-[#261d2e] text-xs rounded-xl p-3 shadow-md border border-[#ddd1ea] leading-relaxed">
                      <strong className="text-[#6b4f2d] block mb-0.5 font-semibold">Nível médio</strong>
                      Constrangimento ou assédio com palavras que se repete no trabalho, estudo ou trajeto.
                    </div>
                  </div>
                </div>

                {/* Baixo — soft plum/lavender */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setRiskFilter('baixo')}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      riskFilter === 'baixo' || riskFilter === 'leve'
                        ? 'bg-[#6d4c82] text-white border-[#6d4c82]'
                        : 'bg-[#f3eef8] text-[#4f3461] hover:bg-[#eae1f3] border-[#ddd1ea]'
                    }`}
                    title="Comentário ou abordagem pontual que causou desconforto"
                  >
                    <span className={`w-2 h-2 rounded-full ${riskFilter === 'baixo' || riskFilter === 'leve' ? 'bg-white' : 'bg-[#6d4c82]'}`} />
                    <span>Baixo</span>
                    <HelpCircle className="w-3.5 h-3.5 opacity-75" aria-hidden="true" />
                  </button>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex group-focus-within:flex flex-col items-center z-50 pointer-events-none w-60 text-center">
                    <div className="bg-white text-[#261d2e] text-xs rounded-xl p-3 shadow-md border border-[#ddd1ea] leading-relaxed">
                      <strong className="text-[#4f3461] block mb-0.5 font-semibold">Nível baixo</strong>
                      Abordagem ou comentário isolado que causou desconforto.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Support Places Focus & Visibility */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 bg-[#f3eef8]/70 border border-[#e6dfee] rounded-xl px-3.5 py-2 text-xs">
                <div className="flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                  <label htmlFor="heatmap-support-select" className="font-semibold text-[#261d2e]">
                    Ver um lugar de ajuda:
                  </label>
                </div>
                <select
                  id="heatmap-support-select"
                  value={selectedDeamId}
                  onChange={(e) => handleSelectDeam(e.target.value)}
                  className="w-full min-h-[38px] bg-white border border-[#ddd1ea] rounded-lg px-2.5 py-1 text-xs text-[#261d2e] font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">Escolha uma delegacia da mulher ou um hospital</option>
                  {userLocation && closestUnitResult && (
                    <optgroup label="Mais perto de você">
                      <option value={closestUnitResult.center.id}>
                        Mais perto: {formatSupportUnitLabel(closestUnitResult.center)} ({formatDistance(closestUnitResult.distanceKm)})
                      </option>
                      {nearestResult?.delegacia && nearestResult.delegacia.center.id !== closestUnitResult.center.id && (
                        <option value={nearestResult.delegacia.center.id}>
                          Delegacia mais próxima: {formatSupportUnitLabel(nearestResult.delegacia.center)} ({formatDistance(nearestResult.delegacia.distanceKm)})
                        </option>
                      )}
                      {nearestResult?.hospital && nearestResult.hospital.center.id !== closestUnitResult.center.id && (
                        <option value={nearestResult.hospital.center.id}>
                          Hospital mais próximo: {formatSupportUnitLabel(nearestResult.hospital.center)} ({formatDistance(nearestResult.hospital.distanceKm)})
                        </option>
                      )}
                    </optgroup>
                  )}
                  <optgroup label="DPCAMI / DEAM — Delegacias que atendem mulheres">
                    {delegacias.map(deam => (
                      <option key={deam.id} value={deam.id}>
                        {formatSupportUnitLabel(deam)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Hospitais 24h de Santa Catarina">
                    {hospitais.map(hosp => (
                      <option key={hosp.id} value={hosp.id}>
                        {formatSupportUnitLabel(hosp)}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-[#faf8fb] border border-[#e6dfee] rounded-xl p-1 text-xs shrink-0 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => {
                    setCenterTypeFilter('all');
                    setNearestTarget('both');
                    nearestTargetRef.current = 'both';
                  }}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    centerTypeFilter === 'all'
                      ? 'bg-[#6d4c82] text-white'
                      : 'text-[#493d54] hover:bg-[#f3eef8]'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCenterTypeFilter('delegacia');
                    setNearestTarget('delegacia');
                    nearestTargetRef.current = 'delegacia';
                    setActiveNearestTab('delegacia');
                    if (selectedCenter && selectedCenter.type !== 'delegacia') {
                      setSelectedCenter(null);
                    }
                  }}
                  title="DPCAMI / DEAM — Delegacias que atendem mulheres"
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    centerTypeFilter === 'delegacia'
                      ? 'bg-[#6d4c82] text-white'
                      : 'text-[#493d54] hover:bg-[#f3eef8]'
                  }`}
                >
                  <span>DPCAMI / DEAM</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCenterTypeFilter('hospital');
                    setNearestTarget('hospital');
                    nearestTargetRef.current = 'hospital';
                    setActiveNearestTab('hospital');
                    if (selectedCenter && selectedCenter.type !== 'hospital') {
                      setSelectedCenter(null);
                    }
                  }}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    centerTypeFilter === 'hospital'
                      ? 'bg-[#6d4c82] text-white'
                      : 'text-[#493d54] hover:bg-[#f3eef8]'
                  }`}
                >
                  <span>Hospitais</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCenterTypeFilter('none');
                    setSelectedCenter(null);
                  }}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    centerTypeFilter === 'none'
                      ? 'bg-[#e6dfee] text-[#261d2e] font-semibold'
                      : 'text-[#5a4e66] hover:text-[#261d2e]'
                  }`}
                >
                  Ocultar
                </button>
              </div>
            </div>

            <p className="text-xs text-[#5a4e66] px-0.5">
              <strong className="font-semibold text-[#4f3461]">DPCAMI / DEAM:</strong> delegacias da Polícia Civil especializadas que atendem mulheres em SC.
            </p>

            {/* Row 3: Secondary Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-0.5">
              <div>
                <label htmlFor="heatmap-city-filter" className="block text-[#261d2e] font-semibold mb-1">
                  Cidade
                </label>
                <select
                  id="heatmap-city-filter"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full min-h-[44px] bg-[#faf8fb] border border-[#e6dfee] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#261d2e] font-medium focus:outline-none"
                >
                  <option value="all">Todas as cidades de SC</option>
                  {SC_CITIES_NAMES.map(city => (
                    <option key={city} value={city}>{city} (SC)</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="heatmap-category-filter" className="block text-[#261d2e] font-semibold mb-1">
                  O que aconteceu
                </label>
                <select
                  id="heatmap-category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full min-h-[44px] bg-[#faf8fb] border border-[#e6dfee] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#261d2e] font-medium focus:outline-none"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="importunacao_sexual">Importunação sexual</option>
                  <option value="estupro">Estupro</option>
                  <option value="assedio_sexual">Assédio sexual</option>
                  <option value="assedio_moral">Assédio moral</option>
                  <option value="perseguicao">Perseguição (stalking)</option>
                  <option value="violencia_psicologica">Violência emocional</option>
                  <option value="violencia_virtual">Violência na internet</option>
                </select>
              </div>

              <div>
                <label htmlFor="heatmap-period-filter" className="block text-[#261d2e] font-semibold mb-1">
                  Horário
                </label>
                <select
                  id="heatmap-period-filter"
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="w-full min-h-[44px] bg-[#faf8fb] border border-[#e6dfee] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#261d2e] font-medium focus:outline-none"
                >
                  <option value="all">Qualquer horário</option>
                  <option value="manha">Manhã (6h às 12h)</option>
                  <option value="tarde">Tarde (12h às 18h)</option>
                  <option value="noite">Noite (18h às 0h)</option>
                  <option value="madrugada">Madrugada (0h às 6h)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Map Canvas & Details Split View */}
      <div className={isMapFullscreen ? '' : 'grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[500px]'}>
        {/* OpenStreetMap Container */}
        <div className={
          isMapFullscreen
            ? 'fixed inset-0 z-[9999] bg-[#faf8fb] w-screen h-screen overflow-hidden'
            : 'lg:col-span-2 relative bg-[#f3eef8] rounded-2xl border border-[#e6dfee] overflow-hidden min-h-[420px] lg:min-h-[520px]'
        }>
          <div ref={mapContainerRef} className="absolute inset-0 z-10 h-full w-full" />

          {isMapFullscreen && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md text-[#261d2e] px-4 py-1.5 rounded-full border border-[#ddd1ea] shadow-sm flex items-center gap-2 text-xs font-semibold pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#6d4c82]" />
              <span>Mapa em tela cheia</span>
              <span className="text-[11px] text-[#5a4e66] hidden sm:inline">· Clique em "Restaurar" para voltar</span>
            </div>
          )}

          {/* Map Legend Floating Overlay */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#e6dfee] text-[11px] text-[#493d54] space-y-1.5 shadow-xs max-w-[235px]">
            <span className="font-semibold text-[#261d2e] block mb-0.5">Legenda do mapa</span>
            <div className="flex items-start gap-2">
              <span className="text-xs leading-none mt-0.5">🚓</span>
              <div>
                <span className="font-semibold text-[#261d2e] block leading-tight">DPCAMI / DEAM</span>
                <span className="text-[10px] text-[#5a4e66] block leading-tight">Delegacias que atendem mulheres</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#b05c72] font-bold text-xs leading-none">✚</span>
              <span className="font-medium text-[#261d2e]">Hospital 24h (SC)</span>
            </div>
            <div className="pt-1 border-t border-[#efe9f4] flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#b05c72] text-white font-semibold text-[10px] flex items-center justify-center border border-white">
                #
              </span>
              <span className="font-medium text-[#493d54]">Relatos na área aproximada</span>
            </div>
            {userLocation && userLocation.source !== 'city' && (
              <div className="flex items-center gap-2 pt-0.5 text-[#4f3461] font-semibold">
                <span>📍</span>
                <span>Onde você marcou</span>
              </div>
            )}
          </div>

          {/* Quick GPS, Fullscreen & Map Actions Floating on Canvas */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setIsMapFullscreen(prev => !prev)}
              title={isMapFullscreen ? "Voltar ao tamanho normal do mapa" : "Ampliar mapa para tela cheia"}
              className={`${
                isMapFullscreen
                  ? 'bg-[#6d4c82] hover:bg-[#593c6b] text-white shadow-md'
                  : 'bg-white/95 hover:bg-white text-[#261d2e] hover:text-[#4f3461] border border-[#e6dfee] shadow-xs'
              } min-h-[40px] px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer`}
            >
              {isMapFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-white" aria-hidden="true" />
                  <span>Restaurar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-[#6d4c82]" aria-hidden="true" />
                  <span className="hidden sm:inline">Tela Cheia</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleLocateGPS(nearestTarget)}
              disabled={isLocating}
              title="Encontrar lugares de ajuda perto de você"
              className="min-h-[40px] bg-white/95 hover:bg-white text-[#261d2e] hover:text-[#4f3461] px-3 py-2 rounded-xl border border-[#e6dfee] shadow-xs flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Locate className={`w-4 h-4 text-[#6d4c82] ${isLocating ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span className="hidden sm:inline">Perto de mim</span>
            </button>
            {userLocation && (
              <button
                type="button"
                onClick={handleClearLocation}
                title="Limpar ponto marcado"
                className="min-h-[40px] bg-white/95 hover:bg-[#fbf2f4] text-[#7f3347] p-2 rounded-xl border border-[#ead4dc] shadow-xs flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {isMapFullscreen && (selectedCenter || selectedReport) && (
            <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-[420px] max-h-[75vh] overflow-y-auto z-30 bg-white rounded-2xl shadow-xl border border-[#ddd1ea] p-4 sm:p-5">
              {renderInspectorContent()}
            </div>
          )}
        </div>

        {/* Selected Inspector (Standard layout) */}
        {!isMapFullscreen && (
          <div id="report-inspector-card" className="bg-white border border-[#e6dfee] rounded-2xl p-5 flex flex-col justify-between space-y-4 scroll-mt-24">
            {renderInspectorContent()}
          </div>
        )}
      </div>
    </div>
  );
};
