import React, { useState, useEffect } from 'react';
import { Navbar, NavSection } from './components/Navbar';
import { QuickExitMask } from './components/QuickExitMask';
import { AuthModal } from './components/AuthModal';
import { HeatmapView } from './components/HeatmapView';
import { ReportFormModal } from './components/ReportFormModal';
import { CaseTracker } from './components/CaseTracker';
import { MenuModal, MenuModalSection } from './components/MenuModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { HomeView, AppSection } from './components/HomeView';
import { HelpNowView } from './components/HelpNowView';
import { UnderstandView } from './components/UnderstandView';
import { TalkSupportView } from './components/TalkSupportView';
import { RightsView } from './components/RightsView';
import { CommunityView } from './components/CommunityView';
import { FloatingHelpButton } from './components/FloatingHelpButton';
import { SafeSpaceDeclarationModal } from './components/SafeSpaceDeclarationModal';
import { INITIAL_REPORTS, SUPPORT_CENTERS } from './lib/initialData';
import {
  Report,
  User,
  ReportComment,
  CommunityPost,
  CommunityCategory,
  CommunityFlagReason
} from './types';
import { supabase, mapDbRowToReport, mapReportToDbRow } from './lib/supabase';
import {
  addReplyToCommunityPost,
  createCommunityPost,
  flagCommunityPost,
  getOrCreateLocalAuthorId,
  loadBlockedAuthors,
  loadCommunityPosts,
  moderateCommunityPost,
  saveBlockedAuthors,
  saveCommunityPosts,
  toggleSupportOnCommunityPost
} from './lib/community';
import { addAccessLog } from './lib/accessLogs';
import appLogo from './assets/logo.jpg';

const VALID_SECTIONS: NavSection[] = [
  'home',
  'map',
  'community',
  'help',
  'understand',
  'talk',
  'rights',
  'report',
  'track'
];

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as NavSection | null;
    if (viewParam && VALID_SECTIONS.includes(viewParam)) {
      return viewParam;
    }
    return 'home';
  });

  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
  const [isSafeSpaceOpen, setIsSafeSpaceOpen] = useState<boolean>(false);
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

  // Community state (persisted cleanly in localStorage)
  const [localAuthorId] = useState<string>(() => getOrCreateLocalAuthorId());
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() =>
    loadCommunityPosts()
  );
  const [blockedAuthorIds, setBlockedAuthorIds] = useState<string[]>(() =>
    loadBlockedAuthors()
  );

  useEffect(() => {
    saveCommunityPosts(communityPosts);
  }, [communityPosts]);

  useEffect(() => {
    saveBlockedAuthors(blockedAuthorIds);
  }, [blockedAuthorIds]);

  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [reportLocationPreload, setReportLocationPreload] = useState<{
    lat?: number;
    lng?: number;
    address?: string;
  }>({});

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
            return mapDbRowToReport(row, rowComments);
          });
          setReports(mappedReports);
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

  // ESC shortcut activates Quick Exit Mask
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMasked((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (section: NavSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewReport = async (newReport: Report) => {
    setReports((prev) => [newReport, ...prev]);
    if (supabase) {
      await supabase.from('reports').insert(mapReportToDbRow(newReport));
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

  // Community handlers
  const handleCreateCommunityPost = (input: {
    title: string;
    content: string;
    category: CommunityCategory;
    city?: string;
    isAnonymous: boolean;
    authorDisplayName?: string;
  }) => {
    const newPost = createCommunityPost({
      ...input,
      authorId: localAuthorId
    });
    setCommunityPosts((prev) => [newPost, ...prev]);
    addAccessLog(
      `Publicação na Comunidade (${input.category})`,
      newPost.authorLabel,
      input.isAnonymous ? 'anonimo@assedioaki.com.br' : user?.email || 'comunidade@assedioaki.com.br',
      input.isAnonymous ? 'anonymous' : 'user'
    );
  };

  const handleReplyCommunityPost = (
    postId: string,
    input: { content: string; isAnonymous: boolean; authorDisplayName?: string }
  ) => {
    setCommunityPosts((prev) =>
      addReplyToCommunityPost(prev, postId, {
        ...input,
        authorId: localAuthorId
      })
    );
  };

  const handleToggleCommunitySupport = (postId: string, delta: 1 | -1) => {
    setCommunityPosts((prev) => toggleSupportOnCommunityPost(prev, postId, delta));
  };

  const handleFlagCommunityPost = (postId: string, reason: CommunityFlagReason) => {
    setCommunityPosts((prev) => flagCommunityPost(prev, postId, reason));
    addAccessLog(
      `Denúncia de publicação na comunidade (${postId} · ${reason})`,
      'Participante da Comunidade',
      'anonimo@assedioaki.com.br',
      'anonymous',
      'aviso'
    );
  };

  const handleModerateCommunityPost = (
    postId: string,
    action: 'approve' | 'hide' | 'delete'
  ) => {
    setCommunityPosts((prev) => moderateCommunityPost(prev, postId, action));
    addAccessLog(
      `Moderação na comunidade (${action}: ${postId})`,
      user?.name || 'Administrador',
      user?.email,
      'admin'
    );
  };

  const handleBlockAuthor = (authorId: string) => {
    setBlockedAuthorIds((prev) =>
      prev.includes(authorId) ? prev : [...prev, authorId]
    );
  };

  const handleSelectReportForTrack = (reportId: string) => {
    setSelectedTrackId(reportId);
    navigateTo('track');
  };

  const handleNewReportAtLocation = (lat: number, lng: number, address: string) => {
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

  const visibleCommunityPostsCount = communityPosts.filter(
    (p) => p.moderationStatus !== 'hidden' && !blockedAuthorIds.includes(p.authorId)
  ).length;

  return (
    <div className="min-h-screen bg-[#faf8fb] text-[#261d2e] font-sans flex flex-col justify-between">
      {/* Quick Exit Mask Overlay */}
      <QuickExitMask
        isMasked={isMasked}
        onUnmask={() => setIsMasked(false)}
        onRedirectExternal={handleRedirectExternal}
      />

      {/* Optional Safe Space Declaration Modal (accessible without blocking help) */}
      <SafeSpaceDeclarationModal
        isOpen={isSafeSpaceOpen}
        onAccept={() => setIsSafeSpaceOpen(false)}
      />

      {/* Optional Auth Modal (kept discreet in footer, never blocking support) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => setUser(loggedUser)}
      />

      {/* Information & Privacy Modal */}
      <MenuModal
        isOpen={isMenuModalOpen}
        initialSection={menuModalSection}
        onClose={() => setIsMenuModalOpen(false)}
        onOpenReport={() => {
          setIsMenuModalOpen(false);
          navigateTo('report');
        }}
      />

      {/* Main Navigation */}
      <Navbar
        activeSection={activeSection}
        onSelectSection={(sec) => navigateTo(sec)}
        onQuickExit={() => setIsMasked(true)}
      />

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-32 lg:pb-24 w-full flex-1">
        {activeSection === 'home' && (
          <HomeView
            reports={reports}
            totalSupportCenters={SUPPORT_CENTERS.length}
            communityPostsCount={visibleCommunityPostsCount}
            onNavigate={(sec: AppSection) => navigateTo(sec)}
            onOpenNewReport={() => navigateTo('report')}
            onOpenPrivacy={() => openInfoModal('privacy')}
            onOpenSafeSpaceDeclaration={() => setIsSafeSpaceOpen(true)}
          />
        )}

        {activeSection === 'map' && (
          <div className="max-w-6xl mx-auto space-y-4">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="min-h-[44px] px-3 py-2 -ml-3 rounded-xl text-sm font-medium text-[#5b3d6e] hover:bg-[#f3eef8] transition-colors cursor-pointer"
            >
              ← Voltar para o início
            </button>
            <HeatmapView
              reports={reports}
              supportCenters={SUPPORT_CENTERS}
              mode="heatmap"
              currentUser={user}
              onAddComment={handleAddComment}
              onNewReportAtLocation={handleNewReportAtLocation}
              onOpenNewReport={() => navigateTo('report')}
              onSelectReportForTrack={handleSelectReportForTrack}
            />
          </div>
        )}

        {activeSection === 'community' && (
          <CommunityView
            posts={communityPosts}
            blockedAuthorIds={blockedAuthorIds}
            localAuthorId={localAuthorId}
            currentUser={user}
            onCreatePost={handleCreateCommunityPost}
            onReplyPost={handleReplyCommunityPost}
            onToggleSupport={handleToggleCommunitySupport}
            onFlagPost={handleFlagCommunityPost}
            onBlockAuthor={handleBlockAuthor}
            onUnblockAllAuthors={() => setBlockedAuthorIds([])}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {activeSection === 'help' && (
          <HelpNowView
            reports={reports}
            supportCenters={SUPPORT_CENTERS}
            currentUser={user}
            onAddComment={handleAddComment}
            onNewReportAtLocation={handleNewReportAtLocation}
            onSelectReportForTrack={handleSelectReportForTrack}
            onOpenReportForm={() => navigateTo('report')}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {activeSection === 'understand' && (
          <UnderstandView
            reports={reports}
            supportCenters={SUPPORT_CENTERS}
            currentUser={user}
            onAddComment={handleAddComment}
            onNewReportAtLocation={handleNewReportAtLocation}
            onSelectReportForTrack={handleSelectReportForTrack}
            onGoToTalk={() => navigateTo('talk')}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {activeSection === 'talk' && (
          <TalkSupportView
            supportCenters={SUPPORT_CENTERS}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {activeSection === 'rights' && (
          <RightsView
            reports={reports}
            selectedTrackId={selectedTrackId}
            onOpenReportForm={() => navigateTo('report')}
            onAddTimelineNote={handleAddTimelineNote}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {activeSection === 'track' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="min-h-[44px] px-3 py-2 -ml-3 rounded-xl text-sm font-medium text-[#5b3d6e] hover:bg-[#f3eef8] transition-colors cursor-pointer"
            >
              ← Voltar para o início
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
            onSubmitSuccess={handleAddNewReport}
            onCancel={() => navigateTo('home')}
            onEmergencyExit={() => setIsMasked(true)}
            onGoToTrack={(protocolId) => handleSelectReportForTrack(protocolId)}
          />
        )}
      </main>

      {/* Calm Institutional & Privacy Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 w-full mb-28 lg:mb-16">
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
              Acompanhar protocolo
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

      {/* Permanent Bottom-Right Quick Help Floating Button (all pages) */}
      <FloatingHelpButton
        onGoToHelp={() => navigateTo('help')}
        onGoToLocator={() => navigateTo('help')}
        onQuickExit={() => setIsMasked(true)}
        isHidden={isMasked}
      />

      {/* Discreet Admin Management Panel */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        reports={reports}
        onDeleteReport={handleDeleteReport}
        onDeleteComment={handleDeleteComment}
        communityPosts={communityPosts}
        onModerateCommunityPost={handleModerateCommunityPost}
        currentUser={user}
      />
    </div>
  );
}