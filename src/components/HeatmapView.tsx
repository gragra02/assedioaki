import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Report, SupportCenter, ReportComment, User } from '../types';
import { ReportCommentsSection } from './ReportCommentsSection';
import L from 'leaflet';
import { 
  MapPin, Filter, AlertTriangle, ShieldCheck, Phone, Navigation, PlusCircle, 
  Building2, Flame, Layers, Clock, ShieldAlert, MessageSquare, ExternalLink, 
  Globe, Sparkles, Locate, Crosshair, Footprints, Car, X, Compass, CheckCircle2,
  ArrowRight, HeartPulse, RefreshCw, Mail, Maximize2, Minimize2, HelpCircle
} from 'lucide-react';
import { calculateDistanceKm, findNearestPair, formatDistance, NearestResult } from '../lib/geo';
import { SC_CITY_COORDINATES_MAP, SC_CITIES_NAMES } from '../lib/scCities';

interface HeatCluster {
  id: string;
  lat: number;
  lng: number;
  reports: Report[];
  count: number;
  highestRisk: 'urgente' | 'alto' | 'medio' | 'baixo' | 'grave' | 'moderado' | 'leve';
  address: string;
  city: string;
}

const getTipoViolenciaPt = (category: string): string => {
  switch (category) {
    case 'importunacao_sexual':
      return 'Importunação Sexual';
    case 'assedio_sexual':
      return 'Assédio Sexual';
    case 'assedio_moral':
      return 'Assédio Moral';
    case 'perseguicao':
      return 'Perseguição (Stalking)';
    case 'violencia_psicologica':
      return 'Violência Psicológica';
    case 'violencia_virtual':
      return 'Violência Virtual / Nudez';
    default:
      return 'Violência contra a Mulher / Assédio';
  }
};

const getTipoLocalPt = (locationType: string, address?: string): string => {
  switch (locationType) {
    case 'transporte_publico':
      return 'Transporte Público / Ônibus';
    case 'trabalho':
      return 'Ambiente de Trabalho';
    case 'escola_universidade':
      return 'Escola / Universidade';
    case 'via_publica':
      return 'Via Pública / Rua';
    case 'evento_festa':
      return 'Evento / Festa';
    case 'internet':
      return 'Ambiente Virtual / Internet';
    case 'local_privado':
      return 'Local Privado / Residência';
    default:
      return address ? address.split('-')[0].trim() : 'Local Público';
  }
};

const formatarDataHoraPt = (dateTimeStr: string, periodOfDay: string): string => {
  try {
    const d = new Date(dateTimeStr);
    const dia = String(d.getDate()).padStart(2, '0');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mes = meses[d.getMonth()] || 'Agosto';
    const ano = d.getFullYear() || 2026;
    
    let periodoFormatado = '';
    if (periodOfDay === 'manha') periodoFormatado = 'Manhã (entre 06:00 e 12:00)';
    else if (periodOfDay === 'tarde') periodoFormatado = 'Tarde (entre 12:00 e 18:00)';
    else if (periodOfDay === 'noite') periodoFormatado = 'Noite (entre 18:00 e 00:00)';
    else if (periodOfDay === 'madrugada') periodoFormatado = 'Madrugada (entre 00:00 e 06:00)';
    else periodoFormatado = 'Entre 18:00 e 00:00';

    return `${dia} de ${mes} de ${ano} • ${periodoFormatado}`;
  } catch {
    return 'Data recente informada pela vítima';
  }
};

interface HeatmapViewProps {
  reports: Report[];
  supportCenters: SupportCenter[];
  onNewReportAtLocation?: (lat: number, lng: number, address: string) => void;
  onSelectReportForTrack?: (reportId: string) => void;
  mode?: 'heatmap' | 'locator';
  currentUser?: User | null;
  onAddComment?: (reportId: string, comment: ReportComment) => void;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({
  reports,
  supportCenters,
  onNewReportAtLocation,
  onSelectReportForTrack,
  mode = 'heatmap',
  currentUser,
  onAddComment
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const userLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  
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
  } | null>(null);
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
      if (e.key === 'Escape' && isMapFullscreen) {
        setIsMapFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMapFullscreen]);

  // When map fullscreen toggles, lock body scroll and invalidate Leaflet map size
  useEffect(() => {
    if (isMapFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50);
    const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 250);
    const t3 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 500);
    return () => {
      document.body.style.overflow = '';
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isMapFullscreen]);

  // List of all Delegacias da Mulher (DPCAMI / DEAM)
  const delegacias = useMemo(() => {
    return supportCenters.filter(c => c.type === 'delegacia');
  }, [supportCenters]);

  // List of all Hospitais de Santa Catarina
  const hospitais = useMemo(() => {
    return supportCenters.filter(c => c.type === 'hospital');
  }, [supportCenters]);

  // City default coordinates mapping (All 295 Santa Catarina municipalities)
  const cityCoordinates = SC_CITY_COORDINATES_MAP;

  // Filter reports according to current controls
  const filteredReports = useMemo(() => {
    return reports.filter(rep => {
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
  }, [reports, selectedCity, categoryFilter, periodFilter, riskFilter]);

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

  // Handler para o botão "Mais Detalhes" no mapa de calor
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
      // Type filtering (strict enforcement: if hospital is chosen, never show delegacias, and vice-versa)
      if (centerTypeFilter === 'delegacia' && sc.type !== 'delegacia') return false;
      if (centerTypeFilter === 'hospital' && sc.type !== 'hospital') return false;
      if (centerTypeFilter === 'none') return false;

      // Direct unit focus dropdown
      if (selectedDeamId !== 'all' && sc.id !== selectedDeamId) return false;

      // City filter
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
    setNearestResult(pair);

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

  const handleLocateGPS = (target: 'both' | 'delegacia' | 'hospital' = nearestTargetRef.current) => {
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
    setIsLocating(true);
    setLocateError(null);
    setIsNearestPanelOpen(true);

    if (!navigator.geolocation) {
      setLocateError('Seu navegador não possui suporte a geolocalização. Selecione uma cidade de SC ou clique no mapa para definir seu ponto.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng, source: 'gps' });
        calculateAndShowNearest(lat, lng, target);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        let msg = 'Não foi possível obter o GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permissão de localização negada pelo navegador. Você pode selecionar sua cidade abaixo ou clicar diretamente no mapa para definir sua posição.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Informações de GPS indisponíveis. Selecione uma cidade de referência de SC ou clique no mapa.';
        } else {
          msg = 'Tempo limite de GPS esgotado. Selecione uma cidade de referência ou clique no mapa.';
        }
        setLocateError(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
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

      // OpenStreetMap Official Standard Tiles (100% Gratuito, Sem Chave de API)
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
        // Set user location when map is clicked if panel is open or locate mode is active
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

  // Handle specific Delegacia da Mulher selection dropdown
  const handleSelectDeam = (deamId: string) => {
    setSelectedDeamId(deamId);
    if (deamId === 'all') {
      setSelectedCenter(null);
      return;
    }
    const deam = supportCenters.find(c => c.id === deamId);
    if (deam) {
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

    // Group filteredReports into spatial clusters to display occurrence count on bubbles
    const clusters: HeatCluster[] = [];
    const CLUSTER_THRESHOLD = 0.005; // ~500m radius threshold for clustering nearby incidents

    filteredReports.forEach((report) => {
      const existing = clusters.find(c => {
        const dLat = Math.abs(c.lat - report.lat);
        const dLng = Math.abs(c.lng - report.lng);
        return dLat <= CLUSTER_THRESHOLD && dLng <= CLUSTER_THRESHOLD;
      });

      if (existing) {
        existing.reports.push(report);
        existing.count += 1;
        const riskPriority: Record<string, number> = { 
          grave: 4, urgente: 4, alto: 3, moderado: 2, medio: 2, leve: 1, baixo: 1 
        };
        if ((riskPriority[report.riskLevel] || 1) > (riskPriority[existing.highestRisk] || 1)) {
          existing.highestRisk = report.riskLevel;
        }
      } else {
        clusters.push({
          id: `cluster-${report.id}`,
          lat: report.lat,
          lng: report.lng,
          reports: [report],
          count: 1,
          highestRisk: report.riskLevel,
          address: report.address,
          city: report.city
        });
      }
    });

    // Render Heat circles and incident bubble markers with number of occurrences
    clusters.forEach((cluster) => {
      let color = '#3b82f6'; // blue default (leve)
      let radius = 180;
      let opacity = 0.5;

      const isClusterGrave = cluster.highestRisk === 'grave' || cluster.highestRisk === 'urgente' || cluster.highestRisk === 'alto';
      const isClusterModerado = cluster.highestRisk === 'moderado' || cluster.highestRisk === 'medio';

      if (isClusterGrave) {
        color = '#ef4444'; // Red (Grave)
        radius = 320;
        opacity = 0.7;
      } else if (isClusterModerado) {
        color = '#f97316'; // Orange / Amber (Moderado)
        radius = 240;
        opacity = 0.6;
      }

      // Bonus radius for multiple incidents in the cluster
      radius += Math.min(180, (cluster.count - 1) * 50);

      const isSelected = (selectedReport && cluster.reports.some(r => r.id === selectedReport.id)) || (selectedCluster?.id === cluster.id);

      // Outer heat circle pulse effect
      const circle = L.circle([cluster.lat, cluster.lng], {
        color: color,
        fillColor: color,
        fillOpacity: opacity,
        radius: isSelected ? radius * 1.3 : radius,
        stroke: true,
        weight: isSelected ? 3 : 1.5
      });

      // Size calculation based on count
      const size = isSelected
        ? (cluster.count > 4 ? 42 : cluster.count > 1 ? 36 : 30)
        : (cluster.count > 4 ? 38 : cluster.count > 1 ? 32 : 26);
      const fontSize = cluster.count > 99 ? 10 : cluster.count > 9 ? 12 : 13;

      // Custom DivIcon with number of occurrences inside the bubble
      const iconHtml = `
        <div style="
          background: ${color};
          color: #ffffff;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 ${isSelected ? '20px #facc15' : '10px ' + color}, 0 2px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: ${fontSize}px;
          line-height: 1;
          text-shadow: 0 1px 2px rgba(0,0,0,0.6);
          cursor: pointer;
          transition: transform 0.15s ease;
        " title="${cluster.count} ocorrência(s) registrada(s)">
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
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px; line-height: 1.5; color: #0f172a; padding: 4px 2px; min-width: 250px;">
          <div style="margin-bottom: 5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
            <span style="color: #64748b; font-weight: 700; font-size: 11px; text-transform: uppercase;">Tipo de Violência:</span><br/>
            <strong style="color: #581c87; font-size: 13px; font-weight: 800;">${tipoViolencia}</strong>
          </div>
          <div style="margin-bottom: 5px;">
            <span style="color: #64748b; font-weight: 700; font-size: 11px; text-transform: uppercase;">Tipo de Local do Ocorrido:</span><br/>
            <strong style="color: #0f172a; font-weight: 700;">${tipoLocal}, ${report.city}</strong>
          </div>
          <div style="margin-bottom: 8px;">
            <span style="color: #64748b; font-weight: 700; font-size: 11px; text-transform: uppercase;">Data e Hora:</span><br/>
            <strong style="color: #0f172a; font-weight: 700;">${dataHora}</strong>
          </div>
          <div style="padding-top: 4px; border-top: 1px solid #f1f5f9;">
            <button onclick="window.__abrirDetalhesOcorrencia && window.__abrirDetalhesOcorrencia('${report.id}')" style="width: 100%; background: #7c3aed; color: #ffffff; font-weight: 800; font-size: 12px; padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: block;">
              Mais Detalhes →
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
          `<div style="font-weight: 800; font-size: 12px; color: #0f172a;">${report.title}</div>
           <div style="font-size: 11px; color: #475569; margin-top: 2px;">
             <span style="font-weight: 800; color: ${color};">● 1 ocorrência</span> • ${categoryLabel} • Gravidade ${formatRiskLabel(report.riskLevel)}
           </div>
           <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${report.address}, ${report.city}</div>`,
          { direction: 'top', offset: [0, -size / 2] }
        );
      } else {
        marker.bindTooltip(
          `<div style="font-weight: 800; font-size: 12px; color: #0f172a;">📍 Hotspot: ${cluster.count} ocorrências na região</div>
           <div style="font-size: 11px; color: ${color}; font-weight: 700; margin-top: 2px;">
             Gravidade máxima: ${formatRiskLabel(cluster.highestRisk)}
           </div>
           <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${cluster.address}, ${cluster.city}</div>
           <div style="font-size: 10px; color: #7c3aed; font-weight: 700; margin-top: 4px;">Clique para inspecionar os ${cluster.count} relatos</div>`,
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

        // Custom marker pin: Viatura Policial para Delegacia, Cruz Vermelha para Hospital
        const supportIconHtml = isDelegacia ? `
          <div style="
            background: #1e1b4b;
            color: #ffffff;
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 8px;
            border: 2px solid ${isSelected ? '#facc15' : '#ffffff'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '18px' : '15px'};
            box-shadow: 0 0 ${isSelected ? '18px #facc15' : '10px rgba(30, 27, 75, 0.8)'};
            cursor: pointer;
            transition: all 0.2s ease;
          " title="Viatura Policial - Delegacia da Mulher (DPCAMI / DEAM)">🚓</div>
        ` : `
          <div style="
            background: #ffffff;
            color: #dc2626;
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 8px;
            border: 2px solid ${isSelected ? '#facc15' : '#ef4444'};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 ${isSelected ? '18px #facc15' : '10px rgba(220, 38, 38, 0.5)'};
            cursor: pointer;
            transition: all 0.2s ease;
          " title="Cruz Vermelha - Hospital de Urgência SC">
            <svg viewBox="0 0 24 24" width="${isSelected ? '20' : '16'}" height="${isSelected ? '20' : '16'}" fill="#dc2626">
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
          <div style="font-weight: bold; font-size: 11px; color: #0f172a;">${center.name}</div>
          <div style="font-size: 10px; color: #475569;">${center.city} (${center.state})</div>
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

    // User location marker
    // CRITICAL: When the user chooses based on city (source === 'city'), EXCLUDE "Sua Localização" and dashed lines from the map!
    // The user's location pin should ONLY appear when using actual GPS (source === 'gps') or map click (source === 'map').
    if (userLocation.source !== 'city') {
      const userPinHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
        ">
          <div style="
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: rgba(37, 99, 235, 0.35);
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: relative;
            background: #2563eb;
            color: #ffffff;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.6);
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
        <div style="font-weight: bold; font-size: 11px; color: #1e3a8a;">Sua Localização</div>
        <div style="font-size: 10px; color: #475569;">${userLocation.source === 'gps' ? 'Localização GPS' : 'Ponto Marcado no Mapa'}</div>
      `, { direction: 'top', offset: [0, -14] });

      group.addLayer(userMarker);
    }

    const boundsPoints: [number, number][] = userLocation.source !== 'city' ? [[userLocation.lat, userLocation.lng]] : [];

    // Polyline to nearest facilities - ONLY when user provided real GPS or clicked on map (exclude for city selection)
    if (nearestResult && userLocation.source !== 'city') {
      if ((nearestTarget === 'both' || nearestTarget === 'delegacia') && nearestResult.delegacia) {
        const deam = nearestResult.delegacia.center;
        boundsPoints.push([deam.lat, deam.lng]);

        const polyline = L.polyline([
          [userLocation.lat, userLocation.lng],
          [deam.lat, deam.lng]
        ], {
          color: '#9333ea',
          weight: 3.5,
          dashArray: '6, 8',
          opacity: 0.9
        });
        polyline.bindTooltip(`🚓 Delegacia mais próxima: ${formatDistance(nearestResult.delegacia.distanceKm)}`, {
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
          color: '#0284c7',
          weight: 3.5,
          dashArray: '6, 8',
          opacity: 0.9
        });
        polyline.bindTooltip(`✚ Hospital mais próximo: ${formatDistance(nearestResult.hospital.distanceKm)}`, {
          sticky: true
        });
        group.addLayer(polyline);
      }
    }

    if (userLocation.source === 'city') {
      // When locating based on city: focus cleanly on the hospital/delegacia in that city without displaying any user location marker
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
          <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border inline-block ${
                selectedCenter.type === 'delegacia'
                  ? 'text-purple-900 bg-purple-100 border-purple-200'
                  : selectedCenter.type === 'central_policia'
                  ? 'text-amber-900 bg-amber-100 border-amber-200'
                  : 'text-rose-900 bg-rose-100 border-rose-200'
              }`}>
                {selectedCenter.type === 'delegacia' 
                  ? '🚓 Delegacia da Mulher (DPCAMI / DEAM)' 
                  : selectedCenter.type === 'central_policia'
                  ? '🚨 Central de Plantão Policial (CPP 24h)'
                  : '✚ Hospital de Apoio SC'}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1.5 font-heading">
                {selectedCenter.name}
              </h3>
            </div>
            <button 
              onClick={() => {
                setSelectedCenter(null);
                setSelectedDeamId('all');
              }}
              className="text-slate-500 hover:text-slate-900 text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer font-bold"
            >
              Fechar
            </button>
          </div>

          {/* Distance from User if location is set */}
          {userLocation && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-blue-950">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Distância de você:</span>
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900 font-extrabold">
                  {formatDistance(calculateDistanceKm(userLocation.lat, userLocation.lng, selectedCenter.lat, selectedCenter.lng))}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-blue-800">
                <span className="flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-blue-600" />
                  <span>~{Math.max(1, Math.round((calculateDistanceKm(userLocation.lat, userLocation.lng, selectedCenter.lat, selectedCenter.lng) / 4.5) * 60))} min a pé</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Car className="w-3 h-3 text-blue-600" />
                  <span>~{Math.max(1, Math.round((calculateDistanceKm(userLocation.lat, userLocation.lng, selectedCenter.lat, selectedCenter.lng) / 35) * 60))} min de carro</span>
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>
                {selectedCenter.address}, {selectedCenter.city} ({selectedCenter.state})
                {selectedCenter.postalCode && <span className="text-slate-500 block text-[11px]">CEP: {selectedCenter.postalCode}</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Atendimento: <strong>{selectedCenter.hours}</strong></span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <p className="text-slate-700">
              <strong className="text-slate-900">Telefone:</strong> {selectedCenter.phone}
              {selectedCenter.ramal && (
                <span className="ml-2 text-purple-800 font-semibold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  Ramal: {selectedCenter.ramal}
                </span>
              )}
            </p>

            {selectedCenter.email && (
              <p className="text-slate-700 flex items-center gap-1.5 flex-wrap">
                <strong className="text-slate-900">E-mail Oficial:</strong>
                <a
                  href={`mailto:${selectedCenter.email}`}
                  className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 underline break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>{selectedCenter.email}</span>
                </a>
              </p>
            )}

            {selectedCenter.whatsapp && (
              <p className="text-slate-700 flex items-center gap-1.5 flex-wrap">
                <strong className="text-slate-900">WhatsApp Denúncia:</strong>
                <a
                  href={`https://wa.me/${selectedCenter.whatsapp}?text=${encodeURIComponent('Olá, gostaria de orientação/denúncia.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>(48) 98844-0083</span>
                </a>
              </p>
            )}
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex gap-2">
              <a
                href={`tel:${selectedCenter.phone.replace(/[^0-9]/g, '')}`}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Ligar</span>
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.lat},${selectedCenter.lng}${userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Como Chegar</span>
                <ExternalLink className="w-3 h-3 text-purple-200" />
              </a>
            </div>

            {selectedCenter.website && (
              <a
                href={selectedCenter.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <span>Acessar Portal da Unidade</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
          </div>
        </div>
      );
    }

    if (selectedReport) {
      return (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${
                (selectedReport.riskLevel === 'grave' || selectedReport.riskLevel === 'urgente' || selectedReport.riskLevel === 'alto')
                  ? 'bg-rose-100 text-rose-800 border-rose-200' :
                (selectedReport.riskLevel === 'moderado' || selectedReport.riskLevel === 'medio')
                  ? 'bg-amber-100 text-amber-900 border-amber-200' :
                  'bg-blue-100 text-blue-800 border-blue-200'
              }`}>
                Gravidade {
                  (selectedReport.riskLevel === 'grave' || selectedReport.riskLevel === 'urgente' || selectedReport.riskLevel === 'alto') ? 'Grave' :
                  (selectedReport.riskLevel === 'moderado' || selectedReport.riskLevel === 'medio') ? 'Média' : 'Baixa'
                }
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1.5 font-heading">
                {selectedReport.title}
              </h3>
            </div>
            <button 
              onClick={() => {
                setSelectedReport(null);
                setSelectedCluster(null);
              }}
              className="text-slate-500 hover:text-slate-900 text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-bold cursor-pointer"
            >
              Fechar
            </button>
          </div>

          {/* Multi-report cluster selector if bubble has multiple occurrences */}
          {selectedCluster && selectedCluster.reports.length > 1 && (
            <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-purple-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-[11px] flex items-center justify-center">
                    {selectedCluster.reports.length}
                  </span>
                  <span>Denúncias nesta mesma área</span>
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-900 font-extrabold px-1.5 py-0.5 rounded">
                  Hotspot
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {selectedCluster.reports.map((r, idx) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedReport.id === r.id
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-purple-100 border border-purple-200'
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

          {/* Informações Estruturadas em Português */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-800 shadow-2xs font-sans leading-relaxed">
            <div>
              <span className="text-slate-500 font-semibold">Tipo de Violência: </span>
              <strong className="text-purple-950 font-black">{getTipoViolenciaPt(selectedReport.category)}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Tipo de Local do Ocorrido: </span>
              <strong className="text-slate-900 font-black">{getTipoLocalPt(selectedReport.locationType, selectedReport.address)}, {selectedReport.city}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Data e Hora: </span>
              <strong className="text-slate-900 font-black">{formatarDataHoraPt(selectedReport.dateTime, selectedReport.periodOfDay)}</strong>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>{selectedReport.address}, {selectedReport.city} ({selectedReport.state})</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Data: {new Date(selectedReport.dateTime).toLocaleDateString('pt-BR')} • Período: {selectedReport.periodOfDay}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
            <p className="font-bold text-slate-900 mb-1">Descrição do Relato:</p>
            {selectedReport.description}
          </div>

          <div className="pt-2 space-y-2">
            {onSelectReportForTrack && (
              <button
                onClick={() => onSelectReportForTrack(selectedReport.id)}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>Acompanhar Protocolo {selectedReport.id}</span>
              </button>
            )}
          </div>

          {/* Seção Interativa de Comentários e Apoio */}
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
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">
              {riskFilter === 'grave' ? 'Ocorrências: Gravidade Grave' :
               riskFilter === 'medio' || riskFilter === 'moderado' ? 'Ocorrências: Gravidade Média' :
               riskFilter === 'baixo' || riskFilter === 'leve' ? 'Ocorrências: Gravidade Baixa' :
               'Todas as Ocorrências Registradas'}
            </h3>
            <span className="text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-200 font-bold">
              {filteredReports.length} {filteredReports.length === 1 ? 'Relato' : 'Relatos'}
            </span>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {filteredReports.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                Nenhuma ocorrência encontrada para o filtro de gravidade selecionado.
              </div>
            ) : (
              filteredReports.map((rep) => (
                <div 
                  key={rep.id}
                  onClick={() => {
                    setSelectedReport(rep);
                    setSelectedCenter(null);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([rep.lat, rep.lng], 15);
                    }
                  }}
                  className="p-3.5 bg-white hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 rounded-xl transition-all cursor-pointer space-y-2 shadow-2xs group"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      (rep.riskLevel === 'grave' || rep.riskLevel === 'urgente' || rep.riskLevel === 'alto') ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      (rep.riskLevel === 'moderado' || rep.riskLevel === 'medio') ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                      'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      Gravidade: {(rep.riskLevel === 'grave' || rep.riskLevel === 'urgente' || rep.riskLevel === 'alto') ? 'Grave' :
                       (rep.riskLevel === 'moderado' || rep.riskLevel === 'medio') ? 'Média' : 'Baixa'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {rep.comments && rep.comments.length > 0 && (
                        <span className="text-[10px] text-purple-700 bg-purple-100 font-bold px-1.5 py-0.5 rounded flex items-center gap-1" title={`${rep.comments.length} comentários`}>
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>{rep.comments.length}</span>
                        </span>
                      )}
                      <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        #{rep.id.replace(/^ASK-\d{4}-/, '')}
                      </span>
                    </div>
                  </div>

                  {/* Informações Obrigatórias em Português */}
                  <div className="space-y-1.5 text-xs text-slate-700 leading-snug">
                    <div>
                      <span className="text-slate-500 font-semibold">Tipo de Violência: </span>
                      <strong className="text-purple-950 font-bold">{getTipoViolenciaPt(rep.category)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Tipo de Local do Ocorrido: </span>
                      <strong className="text-slate-900 font-bold">{getTipoLocalPt(rep.locationType, rep.address)}, {rep.city}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Data e Hora: </span>
                      <strong className="text-slate-900 font-bold">{formatarDataHoraPt(rep.dateTime, rep.periodOfDay)}</strong>
                    </div>
                  </div>

                  {/* Botão Mais Detalhes */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 truncate max-w-[170px]" title={rep.address}>
                      {rep.address}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(rep);
                        setSelectedCenter(null);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.setView([rep.lat, rep.lng], 15);
                        }
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs group-hover:scale-[1.02] cursor-pointer shrink-0"
                    >
                      <span>Mais Detalhes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-purple-900">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            <span>Canais de Atendimento Imediato</span>
          </div>
          <p className="text-[11px] text-purple-900/90 leading-normal font-medium">
            <strong className="text-slate-900 font-extrabold">190</strong> (Polícia Militar) e Denúncia Anônima <strong className="text-slate-900 font-extrabold">181</strong> ou pelo WhatsApp no <strong className="text-emerald-700 font-extrabold">(48) 98844-0083</strong> (Polícia Civil de Santa Catarina).
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Map Header & Filter Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {mode === 'locator' ? (
              <>
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
                  <Locate className="w-4 h-4 text-purple-600" />
                  <span>Localizador de Emergência</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-heading mt-0.5">
                  Unidades de Apoio Mais Próximas de Você
                </h2>
                <p className="text-xs text-slate-600">
                  Localize no mapa a Delegacia da Mulher (DPCAMI / DEAM) ou Hospital de Urgência mais próximo para acolhimento imediato em Santa Catarina.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-pink-600 font-bold text-xs uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>Mapa de Calor Interativo</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-heading mt-0.5">
                  Zonas de Incidência de Ocorrências
                </h2>
                <p className="text-xs text-slate-600">
                  Visualização espacial das ocorrências registradas e localização das unidades de apoio de Santa Catarina.
                </p>
              </>
            )}
          </div>

          {/* Action Slot on the right side of header (Point circled by user) */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            {mode === 'locator' && (
              <button
                onClick={() => handleLocateGPS(nearestTarget)}
                disabled={isLocating}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer w-full sm:w-auto"
              >
                <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Obtendo GPS...' : 'Atualizar Meu GPS'}</span>
              </button>
            )}
            <div id="floating-report-btn-slot" className="min-h-[44px] flex items-center"></div>
          </div>
        </div>

        {/* Interactive Nearest Support Facility Panel (Delegacia / Hospital) - ONLY in locator mode */}
        {mode === 'locator' && (
          <div id="nearest-finder-card" className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                <Locate className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>Localizador de Emergência: Unidade Mais Próxima de Você</span>
                  <span className="text-[10px] uppercase font-black bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full">
                    Santa Catarina
                  </span>
                </h3>
                <p className="text-xs text-slate-600">
                  Localize no mapa a <strong>Delegacia da Mulher (DPCAMI / DEAM)</strong> e/ou o <strong>Hospital de Referência</strong> mais próximo da sua localização.
                </p>
              </div>
            </div>

            {userLocation && (
              <button
                onClick={handleClearLocation}
                className="text-xs font-bold text-slate-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-xs"
              >
                <X className="w-3.5 h-3.5 text-rose-500" />
                <span>{userLocation.source === 'city' ? 'Limpar Busca por Cidade' : 'Limpar Localização'}</span>
              </button>
            )}
          </div>

          {/* Control triggers: Target selector & Location input methods */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-1">
            {/* Target Selection: Delegacia, Hospital, or Both */}
            <div className="md:col-span-5 flex items-center gap-1 bg-white p-1 rounded-xl border border-purple-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  setNearestTarget('both');
                  nearestTargetRef.current = 'both';
                  setCenterTypeFilter('all');
                  if (userLocation) calculateAndShowNearest(userLocation.lat, userLocation.lng, 'both');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  nearestTarget === 'both'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Ambos
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
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  nearestTarget === 'delegacia'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🚓 Delegacia
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
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  nearestTarget === 'hospital'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✚ Hospital
              </button>
            </div>

            {/* Location triggers: City Selector & Refresh */}
            <div className="md:col-span-7 flex flex-wrap sm:flex-nowrap items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-purple-200">
                <span className="text-[11px] text-slate-500 font-bold shrink-0 hidden sm:inline">
                  Ou escolher cidade:
                </span>
                <select
                  value={userLocation?.source === 'city' ? userLocation.cityName : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleLocateFromCity(e.target.value, nearestTarget);
                    }
                  }}
                  className="w-full bg-transparent text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="">Selecione um município de SC (295 municípios)...</option>
                  {SC_CITIES_NAMES.map(city => (
                    <option key={city} value={city}>{city} (SC)</option>
                  ))}
                </select>
              </div>

              {/* Botão sutil para re-sincronizar GPS se desejado */}
              {userLocation && (
                <button
                  type="button"
                  onClick={() => handleLocateGPS(nearestTarget)}
                  disabled={isLocating}
                  title="Atualizar posição atual pelo GPS"
                  className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-purple-600' : 'text-purple-700'}`} />
                  <span className="hidden sm:inline">Atualizar GPS</span>
                </button>
              )}
            </div>
          </div>

          {/* Geolocation warning or instruction */}
          {locateError ? (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 p-2.5 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">{locateError}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    onClick={() => handleLocateFromCity('Florianópolis', nearestTarget)}
                    className="text-[11px] font-bold text-amber-950 underline hover:text-black cursor-pointer"
                  >
                    Usar Florianópolis
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => handleLocateFromCity('Joinville', nearestTarget)}
                    className="text-[11px] font-bold text-amber-950 underline hover:text-black cursor-pointer"
                  >
                    Usar Joinville
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => handleLocateFromCity('Blumenau', nearestTarget)}
                    className="text-[11px] font-bold text-amber-950 underline hover:text-black cursor-pointer"
                  >
                    Usar Blumenau
                  </button>
                </div>
              </div>
            </div>
          ) : !userLocation ? (
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Dica: Você também pode clicar diretamente em qualquer ponto do mapa para definir sua posição exata.</span>
            </div>
          ) : null}

          {/* Nearest Results Summary Card when user location is set */}
          {userLocation && nearestResult && (
            <div className="bg-white rounded-xl border border-purple-200 p-3.5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${userLocation.source === 'city' ? 'bg-purple-600' : 'bg-emerald-500 animate-pulse'}`} />
                  <span className="text-xs font-extrabold text-slate-900">
                    {userLocation.cityName ? `Cidade de Referência: ${userLocation.cityName} (SC)` : userLocation.source === 'gps' ? 'Sua Localização GPS Ativa' : 'Ponto Marcado no Mapa'}
                  </span>
                  {userLocation.source !== 'city' && (
                    <span className="text-[10px] text-slate-500">
                      ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
                    </span>
                  )}
                </div>

                {/* Tab switcher for Nearest delegacia vs Nearest hospital */}
                {nearestTarget === 'both' ? (
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    {nearestResult.delegacia && (
                      <button
                        onClick={() => {
                          setActiveNearestTab('delegacia');
                          setSelectedCenter(nearestResult.delegacia!.center);
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.setView([nearestResult.delegacia!.center.lat, nearestResult.delegacia!.center.lng], 15);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          activeNearestTab === 'delegacia'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>🚓 Delegacia</span>
                        <span className="text-[10px] opacity-90">
                          {userLocation.source === 'city' && nearestResult.delegacia.center.city === userLocation.cityName
                            ? '(Na cidade)'
                            : `(${formatDistance(nearestResult.delegacia.distanceKm)})`}
                        </span>
                      </button>
                    )}

                    {nearestResult.hospital && (
                      <button
                        onClick={() => {
                          setActiveNearestTab('hospital');
                          setSelectedCenter(nearestResult.hospital!.center);
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.setView([nearestResult.hospital!.center.lat, nearestResult.hospital!.center.lng], 15);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          activeNearestTab === 'hospital'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>✚ Hospital</span>
                        <span className="text-[10px] opacity-90">
                          {userLocation.source === 'city' && nearestResult.hospital.center.city === userLocation.cityName
                            ? '(Na cidade)'
                            : `(${formatDistance(nearestResult.hospital.distanceKm)})`}
                        </span>
                      </button>
                    )}
                  </div>
                ) : (
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${
                    nearestTarget === 'hospital'
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : 'bg-purple-100 text-purple-900 border-purple-300'
                  }`}>
                    {nearestTarget === 'hospital' ? '✚ Apenas Hospital Filtrado' : '🚓 Apenas Delegacia Filtrada'}
                  </span>
                )}
              </div>

              {/* Active Tab Result Item */}
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${
                          isDeam 
                            ? 'bg-purple-100 text-purple-900 border-purple-300' 
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}>
                          {isDeam ? '🚓 Delegacia da Mulher (DPCAMI / DEAM)' : '✚ Hospital de Urgência (SC)'}
                        </span>
                        {userLocation.source === 'city' ? (
                          <span className="text-xs font-black text-purple-900 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded">
                            {center.city.toLowerCase() === userLocation.cityName?.toLowerCase()
                              ? `Localizada em ${center.city}`
                              : `Unidade de referência: ${center.city} (${formatDistance(item.distanceKm)})`}
                          </span>
                        ) : (
                          <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                            Apenas {formatDistance(item.distanceKm)}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        {center.name}
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{center.address}, {center.city} (SC)</span>
                      </p>
                      {userLocation.source !== 'city' ? (
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Footprints className="w-3 h-3 text-purple-600" />
                            <span>A pé: <strong>{item.estimatedTimeWalk}</strong></span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Car className="w-3 h-3 text-purple-600" />
                            <span>De carro: <strong>{item.estimatedTimeDrive}</strong></span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{center.hours}</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                            <span>Atendimento: <strong>{center.hours}</strong></span>
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">
                            Cidade selecionada: <strong className="text-slate-800">{userLocation.cityName}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                      <a
                        href={`tel:${center.phone.replace(/[^0-9]/g, '')}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Ligar ({center.phone})</span>
                      </a>

                      <a
                        href={userLocation.source === 'city'
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ', ' + center.address + ', ' + center.city + ' - SC')}`
                          : `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${center.lat},${center.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Ver no Maps</span>
                        <ExternalLink className="w-3 h-3 text-purple-200" />
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
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Ver Ficha
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
          <div className="pt-3 border-t border-slate-200 space-y-3">
          {/* Row 1: Interactive Risk Selection Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 shrink-0">
              <AlertTriangle className="w-4 h-4 text-purple-600" />
              <span>Selecione o nível de gravidade da ocorrência:</span>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setRiskFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  riskFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                Todos Níveis
              </button>

              {/* Grave */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setRiskFilter('grave')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    riskFilter === 'grave'
                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                  title="Envolve violência física, ameaça direta, coerção ou reincidência insistente (ex: stalking ou chantagem)"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  <span>🔴 Grave</span>
                  <HelpCircle className="w-3.5 h-3.5 text-rose-500 group-hover:text-rose-700 opacity-80" />
                </button>

                {/* Balão de Dica (Tooltip Flutuante) */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex group-focus-within:flex flex-col items-center z-50 pointer-events-none w-64 text-center animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[11px] rounded-xl p-2.5 shadow-2xl border border-slate-700 leading-snug">
                    <strong className="text-rose-400 block mb-1 font-bold">🔴 Nível Grave:</strong>
                    Envolve violência física, ameaça direta, coerção ou reincidência insistente (ex: stalking ou chantagem).
                  </div>
                  <div className="w-2.5 h-2.5 bg-slate-900 border-b border-r border-slate-700 rotate-45 -mt-1.5" />
                </div>
              </div>

              {/* Médio */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setRiskFilter('medio')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    riskFilter === 'medio' || riskFilter === 'moderado'
                      ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                  title="Envolve assédio verbal recorrente, constrangimento no ambiente de trabalho/estudo ou condutas inapropiadas repetidas"
                >
                  <span>🟡 Médio</span>
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 group-hover:text-amber-800 opacity-80" />
                </button>

                {/* Balão de Dica (Tooltip Flutuante) */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex group-focus-within:flex flex-col items-center z-50 pointer-events-none w-64 text-center animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[11px] rounded-xl p-2.5 shadow-2xl border border-slate-700 leading-snug">
                    <strong className="text-amber-400 block mb-1 font-bold">🟡 Nível Médio:</strong>
                    Envolve assédio verbal recorrente, constrangimento no ambiente de trabalho/estudo ou condutas inapropiadas repetidas.
                  </div>
                  <div className="w-2.5 h-2.5 bg-slate-900 border-b border-r border-slate-700 rotate-45 -mt-1.5" />
                </div>
              </div>

              {/* Baixo */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setRiskFilter('baixo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    riskFilter === 'baixo' || riskFilter === 'leve'
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                  title="Relatos de comentários isolados ou situações de desconforto único, onde a orientação preventiva ou escuta é suficiente."
                >
                  <span>🔵 Baixo</span>
                  <HelpCircle className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-700 opacity-80" />
                </button>

                {/* Balão de Dica (Tooltip Flutuante) */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex group-focus-within:flex flex-col items-center z-50 pointer-events-none w-64 text-center animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[11px] rounded-xl p-2.5 shadow-2xl border border-slate-700 leading-snug">
                    <strong className="text-blue-400 block mb-1 font-bold">🔵 Nível Baixo:</strong>
                    Relatos de comentários isolados ou situações de desconforto único, onde a orientação preventiva ou escuta é suficiente.
                  </div>
                  <div className="w-2.5 h-2.5 bg-slate-900 border-b border-r border-slate-700 rotate-45 -mt-1.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Delegacia da Mulher Direct Selection Dropdown & Support Center Visibility */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex-1 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="font-bold text-purple-900 shrink-0">Centralizar Unidade:</span>
              <select
                value={selectedDeamId}
                onChange={(e) => handleSelectDeam(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1 text-xs text-purple-950 font-bold focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs"
              >
                <option value="all">Selecione uma DPCAMI / DEAM ou Hospital para focar...</option>
                <optgroup label="🚓 Delegacias da Mulher (DPCAMI / DEAM)">
                  {delegacias.map(deam => (
                    <option key={deam.id} value={deam.id}>
                      {deam.name} - {deam.city} ({deam.state})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="✚ Hospitais de Santa Catarina">
                  {hospitais.map(hosp => (
                    <option key={hosp.id} value={hosp.id}>
                      {hosp.name} - {hosp.city} ({hosp.state})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs shrink-0 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => {
                  setCenterTypeFilter('all');
                  setNearestTarget('both');
                  nearestTargetRef.current = 'both';
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  centerTypeFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => {
                  setCenterTypeFilter('delegacia');
                  setNearestTarget('delegacia');
                  nearestTargetRef.current = 'delegacia';
                  setActiveNearestTab('delegacia');
                  if (selectedCenter && selectedCenter.type !== 'delegacia') {
                    setSelectedCenter(null);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  centerTypeFilter === 'delegacia'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🚓 DPCAMI / DEAM</span>
              </button>
              <button
                onClick={() => {
                  setCenterTypeFilter('hospital');
                  setNearestTarget('hospital');
                  nearestTargetRef.current = 'hospital';
                  setActiveNearestTab('hospital');
                  if (selectedCenter && selectedCenter.type !== 'hospital') {
                    setSelectedCenter(null);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  centerTypeFilter === 'hospital'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>✚ Hospitais</span>
              </button>
              <button
                onClick={() => {
                  setCenterTypeFilter('none');
                  setSelectedCenter(null);
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  centerTypeFilter === 'none'
                    ? 'bg-slate-200 text-slate-800'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Ocultar
              </button>
            </div>
          </div>

          {/* Row 3: Secondary Filters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 text-xs pt-1">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Cidade (Santa Catarina)</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-purple-500 shadow-xs"
              >
                <option value="all">Todas as Cidades (SC) • 295 Municípios</option>
                {SC_CITIES_NAMES.map(city => (
                  <option key={city} value={city}>{city} (SC)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Tipo de Ocorrência</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-purple-500 shadow-xs"
              >
                <option value="all">Todos os Tipos</option>
                <option value="importunacao_sexual">Importunação Sexual</option>
                <option value="assedio_sexual">Assédio Sexual</option>
                <option value="assedio_moral">Assédio Moral</option>
                <option value="perseguicao">Perseguição (Stalking)</option>
                <option value="violencia_psicologica">Violência Psicológica</option>
                <option value="violencia_virtual">Violência Virtual / Nudez</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Período do Dia</label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-purple-500 shadow-xs"
              >
                <option value="all">Qualquer Horário</option>
                <option value="manha">Manhã (06h - 12h)</option>
                <option value="tarde">Tarde (12h - 18h)</option>
                <option value="noite">Noite (18h - 00h)</option>
                <option value="madrugada">Madrugada (00h - 06h)</option>
              </select>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Main Map Canvas & Details Split View */}
      <div className={isMapFullscreen ? '' : 'grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[500px]'}>
        {/* OpenStreetMap Container */}
        <div className={
          isMapFullscreen
            ? 'fixed inset-0 z-[9999] bg-slate-900 w-screen h-screen overflow-hidden'
            : 'lg:col-span-2 relative bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[420px] lg:min-h-[520px]'
        }>
          <div ref={mapContainerRef} className="absolute inset-0 z-10 h-full w-full" />

          {/* Fullscreen Mode Indicator Badge */}
          {isMapFullscreen && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full border border-slate-700 shadow-xl flex items-center gap-2 text-xs font-semibold pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mapa em Tela Cheia</span>
              <span className="text-[10px] text-slate-300 hidden sm:inline">• Pressione ESC ou clique em "Restaurar" para sair</span>
            </div>
          )}

          {/* Map Legend Floating Overlay */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1.5 shadow-md">
            <span className="font-extrabold text-slate-900 block mb-0.5">Unidades de Apoio</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">🚓</span>
              <span className="font-bold text-slate-900">Delegacia da Mulher (DPCAMI / DEAM)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-extrabold text-sm">✚</span>
              <span className="font-bold text-rose-900">Hospital de Urgência (SC)</span>
            </div>
            <div className="pt-1 border-t border-slate-200 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center border border-white shadow-xs">
                #
              </span>
              <span className="font-bold text-slate-800">Qtd. Ocorrências na Bolha</span>
            </div>
            {userLocation && userLocation.source !== 'city' && (
              <div className="flex items-center gap-2 pt-0.5 text-blue-700 font-bold">
                <span>📍</span>
                <span>Sua Localização</span>
              </div>
            )}
          </div>

          {/* Quick GPS, Fullscreen & Map Actions Floating on Canvas */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            {/* Toggle Fullscreen Map Button */}
            <button
              onClick={() => setIsMapFullscreen(prev => !prev)}
              title={isMapFullscreen ? "Restaurar tamanho normal do mapa (ESC)" : "Ampliar mapa para ocupar toda a tela"}
              className={`${
                isMapFullscreen
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg ring-2 ring-purple-300'
                  : 'bg-white/95 hover:bg-white text-slate-800 hover:text-purple-700 border border-slate-200 shadow-md'
              } p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer`}
            >
              {isMapFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-white" />
                  <span className="font-extrabold">Restaurar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-purple-600" />
                  <span className="hidden sm:inline">Tela Cheia</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleLocateGPS(nearestTarget)}
              disabled={isLocating}
              title="Localizar mais próximo da minha localização"
              className="bg-white/95 hover:bg-white text-slate-800 hover:text-purple-700 p-2.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              <Locate className={`w-4 h-4 text-purple-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Meu Local</span>
            </button>
            {userLocation && (
              <button
                onClick={handleClearLocation}
                title="Limpar localização"
                className="bg-white/95 hover:bg-rose-50 text-rose-600 p-2 rounded-xl border border-rose-200 shadow-md flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Floating Inspector in Fullscreen Mode */}
          {isMapFullscreen && (selectedCenter || selectedReport) && (
            <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-[420px] max-h-[75vh] overflow-y-auto z-30 bg-white rounded-2xl shadow-2xl border border-slate-300 p-4 sm:p-5 animate-in slide-in-from-bottom-3">
              {renderInspectorContent()}
            </div>
          )}
        </div>

        {/* Selected Inspector (Standard layout) */}
        {!isMapFullscreen && (
          <div id="report-inspector-card" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm scroll-mt-24">
            {renderInspectorContent()}
          </div>
        )}
      </div>
    </div>
  );
};

