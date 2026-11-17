import React, { useMemo } from 'react';
import { Flame, ArrowRight, PlusCircle, ShieldCheck, MapPin } from 'lucide-react';
import { Report } from '../types';
import { clusterReportsByProximity, isDemoExampleReport } from '../lib/geo';

interface HeatmapPreviewCardProps {
  reports: Report[];
  totalSupportCenters: number;
  onExploreHeatmap: () => void;
  onNewReport: () => void;
}

// Projects Santa Catarina lat/lng roughly into a 360x200 SVG viewport for a calm preview
function projectScPoint(lat: number, lng: number): { x: number; y: number } {
  // SC bounds approx: lat [-29.4, -25.9], lng [-53.9, -48.3]
  const minLng = -53.9;
  const maxLng = -48.2;
  const minLat = -29.4;
  const maxLat = -25.9;
  const xRatio = Math.min(1, Math.max(0, (lng - minLng) / (maxLng - minLng)));
  const yRatio = Math.min(1, Math.max(0, (maxLat - lat) / (maxLat - minLat)));
  return {
    x: 24 + xRatio * 312,
    y: 22 + yRatio * 156
  };
}

export const HeatmapPreviewCard: React.FC<HeatmapPreviewCardProps> = ({
  reports,
  totalSupportCenters,
  onExploreHeatmap,
  onNewReport
}) => {
  const clusters = useMemo(() => clusterReportsByProximity(reports), [reports]);
  const svgClusters = useMemo(() => {
    const rank = (risk: Report['riskLevel']) =>
      risk === 'urgente' || risk === 'grave' ? 3 : risk === 'alto' || risk === 'medio' ? 2 : 1;
    const merged: Array<{
      id: string;
      x: number;
      y: number;
      count: number;
      highestRisk: Report['riskLevel'];
    }> = [];
    for (const c of clusters) {
      const p = projectScPoint(c.lat, c.lng);
      const hit = merged.find((m) => Math.hypot(m.x - p.x, m.y - p.y) < 22);
      if (hit) {
        const total = hit.count + c.count;
        hit.x = (hit.x * hit.count + p.x * c.count) / total;
        hit.y = (hit.y * hit.count + p.y * c.count) / total;
        hit.count = total;
        if (rank(c.highestRisk) > rank(hit.highestRisk)) {
          hit.highestRisk = c.highestRisk;
        }
      } else {
        merged.push({
          id: c.id,
          x: p.x,
          y: p.y,
          count: c.count,
          highestRisk: c.highestRisk
        });
      }
    }
    return merged;
  }, [clusters]);
  const userSubmittedCount = useMemo(
    () => reports.filter((r) => !isDemoExampleReport(r)).length,
    [reports]
  );
  const distinctCities = useMemo(() => {
    const cities = new Set(reports.map((r) => r.city).filter(Boolean));
    return cities.size;
  }, [reports]);

  return (
    <section
      aria-labelledby="home-heatmap-heading"
      className="max-w-5xl mx-auto"
    >
      <div className="bg-white border border-[#e2d6ee] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Copy & Main CTA */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8c3d52] bg-[#fbf2f4] border border-[#ead4dc] px-3 py-1 rounded-xl">
              <Flame className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Recurso principal de proteção coletiva</span>
            </div>

            <div className="space-y-2">
              <h2
                id="home-heatmap-heading"
                className="text-2xl sm:text-3xl font-semibold text-[#261d2e] font-heading tracking-tight"
              >
                MAPA DE CALOR
              </h2>
              <p className="text-sm sm:text-base text-[#5a4e66] leading-relaxed max-w-xl">
                Visualize regiões com registros de assédio e ajude a construir uma rede de informação e proteção.
              </p>
            </div>

            {/* Honest live stats from project records */}
            <div className="flex flex-wrap gap-3 pt-1 text-xs text-[#493d54]">
              <div className="px-3 py-2 rounded-xl bg-[#faf8fb] border border-[#e6dfee]">
                <strong className="text-[#261d2e] tabular-nums">{reports.length}</strong>{' '}
                {reports.length === 1 ? 'registro no mapa' : 'registros no mapa'}
                {userSubmittedCount > 0 ? ` (${userSubmittedCount} enviado${userSubmittedCount > 1 ? 's' : ''} por você/usuárias)` : ' (inclui exemplos iniciais)'}
              </div>
              <div className="px-3 py-2 rounded-xl bg-[#faf8fb] border border-[#e6dfee]">
                <strong className="text-[#261d2e] tabular-nums">{distinctCities}</strong>{' '}
                {distinctCities === 1 ? 'município' : 'municípios'} em SC
              </div>
              <div className="px-3 py-2 rounded-xl bg-[#faf8fb] border border-[#e6dfee]">
                <strong className="text-[#261d2e] tabular-nums">{totalSupportCenters}</strong>{' '}
                delegacias e hospitais mapeados
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onExploreHeatmap}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-[#6d4c82] hover:bg-[#593c6b] text-white font-semibold text-sm sm:text-base inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Explorar Mapa de Calor</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onNewReport}
                className="min-h-[48px] px-4 py-3 rounded-xl bg-[#fbf2f4] hover:bg-[#f4e3e8] border border-[#e7cbd3] text-[#7f3347] font-semibold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Registrar ocorrência</span>
              </button>
            </div>

            <p className="text-xs text-[#5a4e66] flex items-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#6d4c82] shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Os pontos exibidos são aproximados ou fictícios para proteger a identidade de quem registra.
              </span>
            </p>
          </div>

          {/* Right Visual Map Preview (SVG rendered dynamically from real cluster data) */}
          <div className="lg:col-span-5">
            <button
              type="button"
              onClick={onExploreHeatmap}
              aria-label="Abrir prévia interativa do Mapa de Calor de Santa Catarina"
              className="w-full text-left bg-[#f3eef8] hover:bg-[#ede5f5] border border-[#ddd1ea] rounded-2xl p-4 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 mb-2 text-xs text-[#4f3461] font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Prévia em Santa Catarina</span>
                </span>
                <span className="text-[11px] text-[#6d4c82] group-hover:underline">
                  Abrir mapa completo
                </span>
              </div>

              <div className="bg-white rounded-xl border border-[#e6dfee] p-2 overflow-hidden">
                <svg
                  viewBox="0 0 360 200"
                  role="img"
                  aria-label="Mapa esquemático de áreas aproximadas com registros em Santa Catarina"
                  className="w-full h-44 sm:h-48"
                >
                  <defs>
                    <radialGradient id="heatRose">
                      <stop offset="0%" stopColor="#b05c72" stopOpacity="0.55" />
                      <stop offset="65%" stopColor="#b05c72" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#b05c72" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="heatPlum">
                      <stop offset="0%" stopColor="#6d4c82" stopOpacity="0.45" />
                      <stop offset="70%" stopColor="#6d4c82" stopOpacity="0.16" />
                      <stop offset="100%" stopColor="#6d4c82" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Soft grid */}
                  <rect x="0" y="0" width="360" height="200" fill="#faf8fb" rx="8" />
                  <path
                    d="M 28 52 C 80 34, 175 24, 268 38 C 304 45, 326 68, 326 112 C 325 148, 294 178, 250 178 C 195 178, 128 158, 70 144 C 36 136, 18 96, 28 52 Z"
                    fill="#f3eef8"
                    stroke="#ddd1ea"
                    strokeWidth="2"
                  />

                  {/* Geographic reference labels positioned away from coastal & western pins */}
                  <text x="52" y="126" fontSize="9" fill="#6b5e77" fontWeight="600">Oeste</text>
                  <text x="152" y="106" fontSize="9" fill="#6b5e77" fontWeight="600">Serra / Meio</text>
                  <text x="230" y="24" fontSize="9" fill="#6b5e77" fontWeight="600">Norte</text>
                  <text x="208" y="168" fontSize="9" fill="#6b5e77" fontWeight="600">Litoral / Sul</text>

                  {/* Dynamic heat clusters */}
                  {svgClusters.length === 0 ? (
                    <text x="180" y="102" textAnchor="middle" fontSize="11" fill="#5a4e66" fontWeight="600">
                      Nenhum registro filtrado no momento
                    </text>
                  ) : (
                    svgClusters.map((cluster) => {
                      const isHigh =
                        cluster.highestRisk === 'grave' ||
                        cluster.highestRisk === 'urgente' ||
                        cluster.highestRisk === 'alto';
                      const rGlow = Math.min(34, 18 + cluster.count * 5);

                      return (
                        <g key={cluster.id}>
                          <circle
                            cx={cluster.x}
                            cy={cluster.y}
                            r={rGlow}
                            fill={isHigh ? 'url(#heatRose)' : 'url(#heatPlum)'}
                          />
                          <circle
                            cx={cluster.x}
                            cy={cluster.y}
                            r="9"
                            fill={isHigh ? '#b05c72' : '#6d4c82'}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <text
                            x={cluster.x}
                            y={cluster.y + 3}
                            textAnchor="middle"
                            fontSize="8.5"
                            fontWeight="700"
                            fill="#ffffff"
                          >
                            {cluster.count}
                          </text>
                        </g>
                      );
                    })
                  )}
                </svg>
              </div>

              <div className="flex items-center justify-between gap-2 mt-2.5 text-[11px] text-[#5a4e66]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b05c72] inline-block" />
                  <span>Maior alerta</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6d4c82] inline-block" />
                  <span>Moderado / Baixo</span>
                </span>
                <span className="font-medium text-[#4f3461]">Toque para explorar →</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
