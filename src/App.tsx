import React, { useState, useEffect } from 'react';
import { Navbar, NavSection } from './components/Navbar';
import { QuickExitMask } from './components/QuickExitMask';
import { AuthModal } from './components/AuthModal';
import { HeatmapView } from './components/HeatmapView';
import { ReportFormModal } from './components/ReportFormModal';
import { CaseTracker } from './components/CaseTracker';
import { MenuModal, MenuModalSection } from './components/MenuModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { SupportNetwork } from './components/SupportNetwork';
import { SupportInstitutions } from './components/SupportInstitutions';
import { FloatingReportButton } from './components/FloatingReportButton';
import { FloatingHelpButton } from './components/FloatingHelpButton';
import { SafeSpaceDeclarationModal } from './components/SafeSpaceDeclarationModal';
import { INITIAL_REPORTS, SUPPORT_CENTERS } from './lib/initialData';
import {
  Report,
  User,
  ReportComment
} from './types';
import { supabase, mapDbRowToReport, mapReportToDbRow } from './lib/supabase';
import { addAccessLog } from './lib/accessLogs';
import { saveRegisteredUser, isUserBlocked } from './lib/adminAuth';
import appLogo from './assets/logo.jpg';

const VALID_SECTIONS: NavSection[] = [
  'report',
  'heatmap',
  'locator',
  'authorities',
  'support',
  'track'
];

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as NavSection | null;
    if (viewParam && VALID_SECTIONS.includes(viewParam)) {
      return viewParam;
    }
    return 'heatmap';
  });

  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authReturnToReport, setAuthReturnToReport] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
  const [isSafeSpaceOpen, setIsSafeSpaceOpen] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('assedioaki_safespace_accepted') !== 'true';
    } catch {
      return true;
    }
  });
  const [menuModalSection, setMenuModalSection] = useState<MenuModalSection>('privacy');
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
          const existingIds = new Set(parsed.map((r: any) => r.id));
          const missing = INITIAL_REPORTS.filter((r) => !existingIds.has(r.id));
          const merged = parsed.map((r: any) => {
            const initialMatch = INITIAL_REPORTS.find((init) => init.id === r.id);
            if (
              initialMatch &&
              (!r.comments || r.comments.length === 0) &&
              initialMatch.comments &&
              initialMatch.comments.length > 0
            ) {
              return { ...r, comments: initialMatch.comments };
            }
            return r;
          });
          return [...merged, ...missing];
        }
        return INITIAL_REPORTS;
      } catch {
        return INITIAL_REPORTS;
      }
    }
    return INITIAL_REPORTS;
  });

  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [myReportIds, setMyReportIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('assedioaki_my_report_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });
  const [focusedReportRequest, setFocusedReportRequest] = useState<{
    reportId: string;
    nonce: number;
  } | null>(null);
  const [reportLocationPreload, setReportLocationPreload] = useState<{
    lat?: number;
    lng?: number;
    address?: string;
  }>({});
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  // Optional Supabase OAuth session listener (e.g. Google/Gmail redirect)
  useEffect(() => {
    if (!supabase) return;

    const applySupabaseSessionUser = async (sessionUser: any) => {
      if (!sessionUser?.email) return;
      if (isUserBlocked(sessionUser.email)) {
        await supabase.auth.signOut();
        return;
      }
      const mappedUser: User = {
        id: sessionUser.id,
        name:
          sessionUser.user_metadata?.full_name ||
          sessionUser.user_metadata?.name ||
          sessionUser.email.split('@')[0] ||
          'Usuária Gmail',
        email: sessionUser.email,
        avatar: sessionUser.user_metadata?.avatar_url || undefined,
        isAnonymous: false,
        role: 'user',
        declarationAcceptedAt: new Date().toISOString(),
        authProvider: 'google'
      };
      setUser(mappedUser);
      await saveRegisteredUser(mappedUser);
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        applySupabaseSessionUser(data.session.user);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        applySupabaseSessionUser(session.user);
        addAccessLog(
          'Autenticação com Gmail / Google Realizada',
          session.user.user_metadata?.full_name || session.user.email || 'Usuária Gmail',
          session.user.email,
          'user'
        );
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Optional Supabase sync when configured
  useEffect(() => {
    async function fetchFromSupabase() {
      if (!supabase) return;

      try {
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: commentsData } = await supabase
          .from('report_comments')
          .select('*')
          .order('created_at', { ascending: false });

        if (!reportsError && reportsData && reportsData.length > 0) {
          let localSavedMap = new Map<string, Partial<Report>>();
          try {
            const rawLocal = localStorage.getItem('assedioaki_reports');
            if (rawLocal) {
              const parsedLocal = JSON.parse(rawLocal);
              if (Array.isArray(parsedLocal)) {
                parsedLocal.forEach((item: Report) => {
                  if (item?.id) localSavedMap.set(item.id, item);
                });
              }
            }
          } catch {
            // ignore
          }

          const mappedReports = reportsData.map((row) => {
            const rowComments: ReportComment[] = (commentsData || [])
              .filter((c) => c.report_id === row.id)
              .map((c) => ({
                id: c.id,
                reportId: c.report_id,
                authorName: c.author_name,
                isAnonymous: c.is_anonymous,
                content: c.content,
                createdAt: c.created_at,
                ip: c.ip,
                timeZone: c.time_zone
              }));
            const baseMapped = mapDbRowToReport(row, rowComments);
            const localExtra = localSavedMap.get(row.id) || INITIAL_REPORTS.find((ir) => ir.id === row.id);
            if (!localExtra) return baseMapped;
            return {
              ...baseMapped,
              isOnlineStalking: localExtra.isOnlineStalking ?? baseMapped.isOnlineStalking,
              socialPlatform: localExtra.socialPlatform ?? baseMapped.socialPlatform,
              socialPlatforms: localExtra.socialPlatforms ?? baseMapped.socialPlatforms,
              socialPlatformOther: localExtra.socialPlatformOther ?? baseMapped.socialPlatformOther,
              aggressorProfile: localExtra.aggressorProfile ?? baseMapped.aggressorProfile,
              hasLocationOffset: localExtra.hasLocationOffset ?? baseMapped.hasLocationOffset,
              locationOffsetMeters: localExtra.locationOffsetMeters ?? baseMapped.locationOffsetMeters,
              hideLocation: localExtra.hideLocation ?? baseMapped.hideLocation,
              registeredByCurrentUser: localExtra.registeredByCurrentUser ?? baseMapped.registeredByCurrentUser,
              authorUserId: localExtra.authorUserId ?? baseMapped.authorUserId,
              authorEmail: localExtra.authorEmail ?? baseMapped.authorEmail
            };
          });
          const mappedIds = new Set(mappedReports.map((r) => r.id));
          const missingInitial = INITIAL_REPORTS.filter((ir) => !mappedIds.has(ir.id));
          setReports([...mappedReports, ...missingInitial]);
        } else if (!reportsError && reportsData && reportsData.length === 0) {
          for (const initReport of INITIAL_REPORTS) {
            await supabase.from('reports').upsert(mapReportToDbRow(initReport));
            if (initReport.comments && initReport.comments.length > 0) {
              for (const cmt of initReport.comments) {
                await supabase.from('report_comments').upsert({
                  id: cmt.id,
                  report_id: initReport.id,
                  author_name: cmt.authorName,
                  is_anonymous: cmt.isAnonymous ?? true,
                  content: cmt.content,
                  ip: cmt.ip || null,
                  time_zone: cmt.timeZone || null,
                  created_at: cmt.createdAt
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Erro na sincronização inicial com Supabase:', err);
      }
    }

    fetchFromSupabase();
  }, []);

  useEffect(() => {
    localStorage.setItem('assedioaki_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('assedioaki_my_report_ids', JSON.stringify(myReportIds));
  }, [myReportIds]);

  // Lock background scroll while mandatory Safe Space Declaration is open
  useEffect(() => {
    if (isSafeSpaceOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSafeSpaceOpen]);

  // ESC shortcut activates Quick Exit Mask in capture phase, respecting map fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isEsc = e.key === 'Escape' || e.key === 'Esc' || e.code === 'Escape' || e.keyCode === 27;
      if (!isEsc) return;
      if (document.body.dataset.mapFullscreen === 'true') return;
      e.preventDefault();
      setIsMasked(true);
    };
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  const navigateTo = (section: NavSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewReport = async (newReport: Report) => {
    setReports((prev) => [newReport, ...prev]);
    setMyReportIds((prev) => (prev.includes(newReport.id) ? prev : [newReport.id, ...prev]));
    if (supabase) {
      await supabase.from('reports').insert(mapReportToDbRow(newReport));
    }
  };

  const handleUpdateReport = async (updatedReport: Report) => {
    setReports((prev) => {
      const updated = prev.map((r) => (r.id === updatedReport.id ? updatedReport : r));
      localStorage.setItem('assedioaki_reports', JSON.stringify(updated));
      return updated;
    });
    setMyReportIds((prev) => (prev.includes(updatedReport.id) ? prev : [updatedReport.id, ...prev]));
    if (supabase) {
      await supabase.from('reports').upsert(mapReportToDbRow(updatedReport));
    }
  };

  const handleAddComment = async (reportId: string, newComment: ReportComment) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id === reportId) {
          const existing = rep.comments || [];
          return {
            ...rep,
            comments: [newComment, ...existing]
          };
        }
        return rep;
      })
    );

    if (supabase) {
      await supabase.from('report_comments').insert({
        id: newComment.id,
        report_id: reportId,
        author_name: newComment.authorName,
        is_anonymous: newComment.isAnonymous ?? true,
        content: newComment.content,
        ip: newComment.ip || null,
        time_zone: newComment.timeZone || null,
        created_at: newComment.createdAt
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    setReports((prev) => {
      const updated = prev.filter((r) => r.id !== reportId);
      localStorage.setItem('assedioaki_reports', JSON.stringify(updated));
      return updated;
    });
    setMyReportIds((prev) => prev.filter((id) => id !== reportId));
    if (supabase) {
      await supabase.from('reports').delete().eq('id', reportId);
    }
  };

  const handleDeleteComment = async (reportId: string, commentId: string) => {
    setReports((prev) => {
      const updated = prev.map((rep) => {
        if (rep.id === reportId && rep.comments) {
          return {
            ...rep,
            comments: rep.comments.filter((c) => c.id !== commentId)
          };
        }
        return rep;
      });
      localStorage.setItem('assedioaki_reports', JSON.stringify(updated));
      return updated;
    });
    if (supabase) {
      await supabase.from('report_comments').delete().eq('id', commentId);
    }
  };

  const handleSelectReportForTrack = (reportId: string) => {
    setSelectedTrackId(reportId);
    navigateTo('track');
  };

  const handleNewReportAtLocation = (lat: number, lng: number, address: string) => {
    setEditingReport(null);
    setReportLocationPreload({ lat, lng, address });
    navigateTo('report');
  };

  const handleAddTimelineNote = async (reportId: string, note: string) => {
    const newEvent = {
      id: 'tl-' + Date.now(),
      date: new Date().toISOString(),
      title: 'Atualização registrada por você',
      note,
      actor: 'Usuária' as const
    };

    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const updatedTimeline = [...r.timeline, newEvent];
          if (supabase) {
            supabase
              .from('reports')
              .update({ timeline: updatedTimeline, updated_at: new Date().toISOString() })
              .eq('id', reportId);
          }
          return {
            ...r,
            timeline: updatedTimeline
          };
        }
        return r;
      })
    );
  };

  const handleRedirectExternal = () => {
    window.location.replace('https://www.google.com');
  };

  const openInfoModal = (section: MenuModalSection) => {
    setMenuModalSection(section);
    setIsMenuModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#faf8fb] text-[#261d2e] font-sans flex flex-col justify-between">
      {/* Quick Exit Mask Overlay */}
      <QuickExitMask
        isMasked={isMasked}
        onUnmask={() => setIsMasked(false)}
        onRedirectExternal={handleRedirectExternal}
      />

      {/* Mandatory Safe Space Declaration Modal on first session visit */}
      <SafeSpaceDeclarationModal
        isOpen={isSafeSpaceOpen}
        onAccept={() => {
          try {
            sessionStorage.setItem('assedioaki_safespace_accepted', 'true');
          } catch {
            // ignore storage restrictions
          }
          setIsSafeSpaceOpen(false);
        }}
        onQuickExit={() => setIsMasked(true)}
      />

      {/* Optional Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        requireIdentified={authReturnToReport}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthReturnToReport(false);
        }}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          if (loggedUser.role === 'admin') {
            setIsAdminPanelOpen(true);
          }
          if (authReturnToReport) {
            setAuthReturnToReport(false);
            navigateTo('report');
          }
        }}
      />

      {/* Information & Privacy Modal */}
      <MenuModal
        isOpen={isMenuModalOpen}
        initialSection={menuModalSection}
        reports={reports}
        myReportIds={myReportIds}
        currentUser={user}
        onClose={() => setIsMenuModalOpen(false)}
        onOpenReport={() => {
          setEditingReport(null);
          setIsMenuModalOpen(false);
          navigateTo('report');
        }}
        onSelectReport={(reportId) => {
          setIsMenuModalOpen(false);
          navigateTo('heatmap');
          setFocusedReportRequest({ reportId, nonce: Date.now() });
        }}
        onTrackReport={(reportId) => {
          setIsMenuModalOpen(false);
          handleSelectReportForTrack(reportId);
        }}
        onEditReport={(report) => {
          setEditingReport(report);
          setIsMenuModalOpen(false);
          navigateTo('report');
        }}
        onDeleteReport={handleDeleteReport}
      />

      {/* Main Navigation */}
      <Navbar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setEditingReport(null);
          navigateTo(sec);
        }}
        onQuickExit={() => setIsMasked(true)}
        user={user}
        onOpenAuth={() => {
          setAuthReturnToReport(false);
          setIsAuthOpen(true);
        }}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onLogout={() => {
          setIsAdminPanelOpen(false);
          setUser(null);
          if (supabase) {
            supabase.auth.signOut().catch(() => {});
          }
        }}
        onOpenMenuSection={(sec) => openInfoModal(sec)}
      />

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-24 w-full flex-1">
        {activeSection === 'heatmap' && (
          <div className="max-w-6xl mx-auto">
            <HeatmapView
              reports={reports}
              supportCenters={SUPPORT_CENTERS}
              mode="heatmap"
              currentUser={user}
              onAddComment={handleAddComment}
              onNewReportAtLocation={handleNewReportAtLocation}
              onOpenNewReport={() => {
                setEditingReport(null);
                navigateTo('report');
              }}
              onSelectReportForTrack={handleSelectReportForTrack}
              focusedReportRequest={focusedReportRequest}
            />
          </div>
        )}

        {activeSection === 'locator' && (
          <div className="max-w-6xl mx-auto">
            <HeatmapView
              reports={reports}
              supportCenters={SUPPORT_CENTERS}
              mode="locator"
              currentUser={user}
              onAddComment={handleAddComment}
              onNewReportAtLocation={handleNewReportAtLocation}
              onSelectReportForTrack={handleSelectReportForTrack}
            />
          </div>
        )}

        {activeSection === 'authorities' && (
          <SupportNetwork supportCenters={SUPPORT_CENTERS} />
        )}

        {activeSection === 'support' && (
          <SupportInstitutions />
        )}

        {activeSection === 'track' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <button
              type="button"
              onClick={() => navigateTo('heatmap')}
              className="min-h-[44px] px-3 py-2 -ml-3 rounded-xl text-sm font-medium text-[#5b3d6e] hover:bg-[#f3eef8] transition-colors cursor-pointer"
            >
              ← Voltar para o Mapa de Calor
            </button>
            <CaseTracker
              reports={reports}
              initialProtocolId={selectedTrackId}
              onAddTimelineNote={handleAddTimelineNote}
            />
          </div>
        )}

        {activeSection === 'report' && (
          <ReportFormModal
            user={user}
            initialLat={reportLocationPreload.lat}
            initialLng={reportLocationPreload.lng}
            initialAddress={reportLocationPreload.address}
            editingReport={editingReport}
            onSubmitSuccess={handleAddNewReport}
            onUpdateSuccess={handleUpdateReport}
            onCancel={() => {
              setEditingReport(null);
              navigateTo('heatmap');
            }}
            onEmergencyExit={() => setIsMasked(true)}
            onGoToTrack={(protocolId) => {
              setEditingReport(null);
              handleSelectReportForTrack(protocolId);
            }}
            onRequireAuth={() => {
              setAuthReturnToReport(true);
              setIsAuthOpen(true);
            }}
            onOpenMyReports={() => {
              setEditingReport(null);
              openInfoModal('my_reports');
            }}
          />
        )}
      </main>

      {/* Calm Institutional & Privacy Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 w-full mb-20 lg:mb-16">
        <div className="bg-white border border-[#e6dfee] rounded-2xl p-6 sm:p-7 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <img
              src={appLogo}
              alt=""
              className="w-9 h-9 rounded-full object-cover border border-[#e6dfee] shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <span className="font-heading font-semibold text-[#261d2e] text-sm block leading-tight">
                Assédio Aki
              </span>
              <span className="text-xs text-[#5a4e66] block leading-tight">
                Apoio e orientação em Santa Catarina
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#5a4e66] max-w-2xl mx-auto">
            Em perigo imediato, ligue <strong className="text-[#261d2e]">190</strong>. Para apoio gratuito à mulher 24h, ligue <strong className="text-[#261d2e]">180</strong>. Denúncia anônima em SC: <strong className="text-[#261d2e]">181</strong> ou WhatsApp <strong className="text-[#261d2e]">(48) 98844-0083</strong>.
          </p>

          <div className="pt-4 border-t border-[#efe9f4] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            <button
              type="button"
              onClick={() => openInfoModal('identify')}
              className="min-h-[36px] px-2 font-medium text-[#4f3461] hover:text-[#261d2e] cursor-pointer"
            >
              Entender o que vivi
            </button>
            <button
              type="button"
              onClick={() => openInfoModal('my_reports')}
              className="min-h-[36px] px-2 font-medium text-[#4f3461] hover:text-[#261d2e] cursor-pointer"
            >
              Meus relatos
            </button>
            <button
              type="button"
              onClick={() => openInfoModal('suspect_profiles')}
              className="min-h-[36px] px-2 font-medium text-[#4f3461] hover:text-[#261d2e] cursor-pointer"
            >
              Perfis denunciados
            </button>
            <button
              type="button"
              onClick={() => openInfoModal('privacy')}
              className="min-h-[36px] px-2 font-medium text-[#4f3461] hover:text-[#261d2e] cursor-pointer"
            >
              Privacidade e limites
            </button>
            <button
              type="button"
              onClick={() => openInfoModal('about')}
              className="min-h-[36px] px-2 font-medium text-[#4f3461] hover:text-[#261d2e] cursor-pointer"
            >
              Sobre o projeto
            </button>
            <button
              type="button"
              onClick={() => openInfoModal('faqs')}
              className="min-h-[36px] px-2 font-medium text-[#4f3461] hover:text-[#261d2e] cursor-pointer"
            >
              Dúvidas frequentes
            </button>
            <button
              type="button"
              onClick={() => navigateTo('track')}
              className="min-h-[36px] px-2 font-medium text-[#4f3461] hover:text-[#261d2e] cursor-pointer"
            >
              Acompanhar meu relato
            </button>
            <button
              type="button"
              onClick={() => openInfoModal('contact')}
              className="min-h-[36px] px-2 font-medium text-[#4f3461] hover:text-[#261d2e] cursor-pointer"
            >
              Contato
            </button>
            <button
              type="button"
              onClick={() => {
                if (user?.role === 'admin') {
                  setIsAdminPanelOpen(true);
                } else {
                  setIsAuthOpen(true);
                }
              }}
              className="min-h-[36px] px-2 font-medium text-[#7c6f88] hover:text-[#4f3461] cursor-pointer"
            >
              {user?.role === 'admin' ? 'Painel administrativo' : 'Acesso administrativo'}
            </button>
          </div>
        </div>
      </footer>

      {/* Original Floating Report Button (docks in Heatmap header or floats on scroll/other tabs) */}
      <FloatingReportButton
        isVisible={activeSection !== 'report' && !isMasked && !isSafeSpaceOpen}
        onOpenReport={() => {
          setEditingReport(null);
          navigateTo('report');
        }}
      />

      {/* Permanent Bottom-Right Quick Help Floating Button (pointing to 'locator') */}
      <FloatingHelpButton
        onGoToHelp={() => navigateTo('locator')}
        onGoToLocator={() => navigateTo('locator')}
        onQuickExit={() => setIsMasked(true)}
        isHidden={isMasked || isSafeSpaceOpen}
      />

      {/* Discreet Admin Management Panel */}
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