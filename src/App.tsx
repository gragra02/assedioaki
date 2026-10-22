import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { QuickExitMask } from './components/QuickExitMask';
import { SafeSpaceDeclarationModal } from './components/SafeSpaceDeclarationModal';
import { AuthModal } from './components/AuthModal';
import { HeatmapView } from './components/HeatmapView';
import { ReportFormModal } from './components/ReportFormModal';
import { CaseTracker } from './components/CaseTracker';
import { AuthoritiesForwarding } from './components/AuthoritiesForwarding';
import { SupportNetwork } from './components/SupportNetwork';
import { SupportInstitutions } from './components/SupportInstitutions';
import { FloatingReportButton } from './components/FloatingReportButton';
import { MenuModal, MenuModalSection } from './components/MenuModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { INITIAL_REPORTS, SUPPORT_CENTERS } from './lib/initialData';
import { Report, User, ReportComment } from './types';
import { ShieldCheck, Lock, Heart, PlusCircle, AlertTriangle } from 'lucide-react';
import appLogo from './assets/logo.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<'report' | 'heatmap' | 'locator' | 'authorities' | 'support'>('heatmap');
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [isDeclarationOpen, setIsDeclarationOpen] = useState<boolean>(true);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
  const [menuModalSection, setMenuModalSection] = useState<MenuModalSection>('identify');
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('assedioaki_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed.some((r: any) => r.state !== 'SC')) {
            return INITIAL_REPORTS;
          }
          // Ensure any initial reports not yet present in localStorage are merged and comments preserved
          const existingIds = new Set(parsed.map((r: any) => r.id));
          const missing = INITIAL_REPORTS.filter(r => !existingIds.has(r.id));
          const merged = parsed.map((r: any) => {
            const initialMatch = INITIAL_REPORTS.find(init => init.id === r.id);
            if (initialMatch && (!r.comments || r.comments.length === 0) && initialMatch.comments && initialMatch.comments.length > 0) {
              return { ...r, comments: initialMatch.comments };
            }
            return r;
          });
          return [...merged, ...missing];
        }
        return INITIAL_REPORTS;
      } catch (e) {
        return INITIAL_REPORTS;
      }
    }
    return INITIAL_REPORTS;
  });
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [reportLocationPreload, setReportLocationPreload] = useState<{ lat?: number; lng?: number; address?: string }>({});

  // Save reports to localStorage
  useEffect(() => {
    localStorage.setItem('assedioaki_reports', JSON.stringify(reports));
  }, [reports]);

  // Keyboard shortcut listener (ESC key activates Quick Exit Mask instantly)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMasked(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddNewReport = (newReport: Report) => {
    setReports(prev => [newReport, ...prev]);
  };

  const handleAddComment = (reportId: string, newComment: ReportComment) => {
    setReports(prev => prev.map(rep => {
      if (rep.id === reportId) {
        const existing = rep.comments || [];
        return {
          ...rep,
          comments: [newComment, ...existing]
        };
      }
      return rep;
    }));
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(prev => {
      const updated = prev.filter(r => r.id !== reportId);
      localStorage.setItem('assedioaki_reports', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteComment = (reportId: string, commentId: string) => {
    setReports(prev => {
      const updated = prev.map(rep => {
        if (rep.id === reportId && rep.comments) {
          return {
            ...rep,
            comments: rep.comments.filter(c => c.id !== commentId)
          };
        }
        return rep;
      });
      localStorage.setItem('assedioaki_reports', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectReportForTrack = (reportId: string) => {
    setSelectedTrackId(reportId);
    setActiveTab('track');
  };

  const handleNewReportAtLocation = (lat: number, lng: number, address: string) => {
    setReportLocationPreload({ lat, lng, address });
    setActiveTab('report');
  };

  const handleRedirectExternal = () => {
    window.location.replace('https://www.google.com');
  };

  return (
    <div className="min-h-screen bg-pink-50/50 text-slate-800 font-sans selection:bg-purple-600 selection:text-white flex flex-col justify-between">
      {/* Quick Exit Mask Overlay */}
      <QuickExitMask
        isMasked={isMasked}
        onUnmask={() => setIsMasked(false)}
        onRedirectExternal={handleRedirectExternal}
      />

      {/* Mandatory Safe Space Declaration Modal */}
      <SafeSpaceDeclarationModal
        isOpen={isDeclarationOpen}
        onAccept={() => setIsDeclarationOpen(false)}
      />

      {/* Auth Modal (Google & Email) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => setUser(loggedUser)}
      />

      {/* Menu & Information Modal (Submenus: Identifique o Tipo de Violência, Entre em Contato, Sobre, Doe, Voluntário, FAQs) */}
      <MenuModal
        isOpen={isMenuModalOpen}
        initialSection={menuModalSection}
        onClose={() => setIsMenuModalOpen(false)}
        onOpenReport={() => {
          setIsMenuModalOpen(false);
          setActiveTab('report');
        }}
      />

      {/* Main Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onQuickExit={() => setIsMasked(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setUser(null)}
        onOpenMenuModal={(section) => {
          setMenuModalSection(section);
          setIsMenuModalOpen(true);
        }}
        onOpenAdminPanel={() => {
          if (user?.role === 'admin') {
            setIsAdminPanelOpen(true);
          } else {
            setIsAuthOpen(true);
          }
        }}
      />

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        {/* Active Tab Component Render */}
        {activeTab === 'heatmap' && (
          <HeatmapView
            reports={reports}
            supportCenters={SUPPORT_CENTERS}
            mode="heatmap"
            currentUser={user}
            onAddComment={handleAddComment}
            onNewReportAtLocation={handleNewReportAtLocation}
            onSelectReportForTrack={handleSelectReportForTrack}
          />
        )}

        {activeTab === 'locator' && (
          <HeatmapView
            reports={reports}
            supportCenters={SUPPORT_CENTERS}
            mode="locator"
            currentUser={user}
            onAddComment={handleAddComment}
            onNewReportAtLocation={handleNewReportAtLocation}
            onSelectReportForTrack={handleSelectReportForTrack}
          />
        )}

        {activeTab === 'report' && (
          <ReportFormModal
            user={user}
            initialLat={reportLocationPreload.lat}
            initialLng={reportLocationPreload.lng}
            initialAddress={reportLocationPreload.address}
            onSubmitSuccess={handleAddNewReport}
            onCancel={() => setActiveTab('heatmap')}
            onEmergencyExit={() => setIsMasked(true)}
          />
        )}

        {activeTab === 'track' && (
          <CaseTracker
            reports={reports}
            initialProtocolId={selectedTrackId}
            onAddTimelineNote={(reportId, note) => {
              setReports(prev => prev.map(r => {
                if (r.id === reportId) {
                  return {
                    ...r,
                    timeline: [
                      ...r.timeline,
                      {
                        id: 'tl-' + Date.now(),
                        date: new Date().toISOString(),
                        title: 'Atualização da Usuária',
                        note,
                        actor: 'Usuária'
                      }
                    ]
                  };
                }
                return r;
              }));
            }}
          />
        )}

        {activeTab === 'authorities' && (
          <SupportNetwork supportCenters={SUPPORT_CENTERS} />
        )}

        {activeTab === 'support' && (
          <SupportInstitutions />
        )}
      </main>

      {/* Botão Móvel / Flutuante em Vermelho para Registrar Denúncia */}
      <FloatingReportButton
        isVisible={activeTab !== 'report' && !isMasked && !isDeclarationOpen}
        onOpenReport={() => setActiveTab('report')}
      />

      {/* Footer com retângulo de cantos arredondados */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 mb-8 text-center text-xs text-slate-500">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-7 space-y-4 flex flex-col items-center justify-center text-center">
          {/* Logo e Nome da Plataforma Centralizados */}
          <div className="flex items-center justify-center gap-2.5 text-purple-950 font-bold">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 p-0.5 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src={appLogo} 
                alt="Logo AssédioAki" 
                className="w-full h-full object-cover rounded-full bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col text-left items-start">
              <span className="font-extrabold text-slate-900 text-sm leading-tight">AssédioAki</span>
              <span className="text-[10px] text-purple-700 font-semibold leading-tight">Denúncias de Assédio</span>
              <span className="text-[10px] text-purple-700 font-semibold leading-tight">em Santa Catarina</span>
            </div>
          </div>

          {/* Texto de Acolhimento e Telefones de Emergência Centralizados */}
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
            <p className="text-slate-600 text-xs italic text-center">
              "Esta plataforma é um espaço seguro voltado ao acolhimento de mulheres e vítimas de violência de gênero."
            </p>
            <p className="text-xs text-purple-950 font-medium text-center">
              <strong className="text-slate-900 font-extrabold">190</strong> (Polícia Militar) e Denúncia Anônima <strong className="text-slate-900 font-extrabold">181</strong> ou pelo WhatsApp no <strong className="text-emerald-700 font-extrabold">(48) 98844-0083</strong> (Polícia Civil de Santa Catarina).
            </p>
          </div>

          {/* Quick Menu Links in Footer - Centralizados e Negritados */}
          <div className="w-full pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 text-xs text-center">
            <button 
              onClick={() => { setMenuModalSection('identify'); setIsMenuModalOpen(true); }} 
              className="font-bold text-slate-800 hover:text-purple-700 transition-colors cursor-pointer"
            >
              Identifique o Tipo de Violência
            </button>
            <span className="text-slate-300 font-extrabold">•</span>
            <button 
              onClick={() => { setMenuModalSection('contact'); setIsMenuModalOpen(true); }} 
              className="font-bold text-slate-800 hover:text-purple-700 transition-colors cursor-pointer"
            >
              Entre em Contato
            </button>
            <span className="text-slate-300 font-extrabold">•</span>
            <button 
              onClick={() => { setMenuModalSection('about'); setIsMenuModalOpen(true); }} 
              className="font-bold text-slate-800 hover:text-purple-700 transition-colors cursor-pointer"
            >
              Sobre AssédioAki
            </button>
            <span className="text-slate-300 font-extrabold">•</span>
            <button 
              onClick={() => { setMenuModalSection('donate'); setIsMenuModalOpen(true); }} 
              className="font-bold text-slate-800 hover:text-purple-700 transition-colors cursor-pointer"
            >
              Doe para AssédioAki
            </button>
            <span className="text-slate-300 font-extrabold">•</span>
            <button 
              onClick={() => { setMenuModalSection('volunteer'); setIsMenuModalOpen(true); }} 
              className="font-bold text-slate-800 hover:text-purple-700 transition-colors cursor-pointer"
            >
              Seja Voluntário no AssédioAki
            </button>
            <span className="text-slate-300 font-extrabold">•</span>
            <button 
              onClick={() => { setMenuModalSection('faqs'); setIsMenuModalOpen(true); }} 
              className="font-bold text-slate-800 hover:text-purple-700 transition-colors cursor-pointer"
            >
              FAQs
            </button>
            <span className="text-slate-300 font-extrabold">•</span>
            <button 
              onClick={() => {
                if (user?.role === 'admin') {
                  setIsAdminPanelOpen(true);
                } else {
                  setIsAuthOpen(true);
                }
              }} 
              className="font-bold text-purple-700 hover:text-purple-950 transition-colors cursor-pointer"
            >
              Menu do Administrador
            </button>
          </div>
        </div>
      </footer>

      {/* Painel Administrativo de Gestão e Logs */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        reports={reports}
        onDeleteReport={handleDeleteReport}
        onDeleteComment={handleDeleteComment}
        currentUser={user}
      />
    </div>
  );
}
