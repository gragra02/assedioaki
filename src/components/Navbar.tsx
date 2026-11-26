import React, { useState, useRef, useEffect } from 'react';
import {
  PlusCircle,
  Menu,
  X,
  HeartHandshake,
  BookOpen,
  EyeOff,
  LogIn,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  FileText,
  ShieldAlert,
  Info,
  HelpCircle,
  Mail,
  Users
} from 'lucide-react';
import appLogo from '../assets/logo.jpg';
import { hasReportDraft } from '../lib/draftStorage';
import { User } from '../types';
import { MenuModalSection } from './MenuModal';

export type AppSection =
  | 'report'
  | 'heatmap'
  | 'locator'
  | 'authorities'
  | 'support'
  | 'track';

export type NavSection = AppSection;

interface NavbarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onQuickExit: () => void;
  user?: User | null;
  onOpenAuth?: () => void;
  onOpenAdminPanel?: () => void;
  onLogout?: () => void;
  onOpenMenuSection?: (section: MenuModalSection) => void;
}

const CENTER_TABS: Array<{
  id: 'heatmap' | 'locator' | 'authorities' | 'support';
  label: string;
}> = [
  { id: 'heatmap', label: 'Mapa de Calor' },
  { id: 'locator', label: 'Preciso de ajuda agora' },
  { id: 'authorities', label: 'Onde buscar atendimento' },
  { id: 'support', label: 'Quem pode me ajudar' }
];

const MENU_SUBITEMS: Array<{
  id: MenuModalSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'identify', label: 'Entender o que vivi', icon: BookOpen },
  { id: 'my_reports', label: 'Meus relatos', icon: FileText },
  { id: 'suspect_profiles', label: 'Perfis denunciados', icon: ShieldAlert },
  { id: 'privacy', label: 'Privacidade e limites', icon: ShieldCheck },
  { id: 'about', label: 'Sobre o projeto', icon: Info },
  { id: 'faqs', label: 'Dúvidas frequentes', icon: HelpCircle },
  { id: 'contact', label: 'Contato', icon: Mail },
  { id: 'volunteer', label: 'Voluntariado', icon: Users },
  { id: 'donate', label: 'Apoiar', icon: HeartHandshake }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onSelectSection,
  onQuickExit,
  user,
  onOpenAuth,
  onOpenAdminPanel,
  onLogout,
  onOpenMenuSection
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isDraftAvailable = hasReportDraft();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isReportActive = activeSection === 'report';
  const reportTooltip = isDraftAvailable
    ? 'Contar o que aconteceu — Rascunho salvo'
    : 'Contar o que aconteceu — Protegido';
  const reportAriaLabel = isDraftAvailable
    ? 'Contar o que aconteceu (Rascunho salvo)'
    : 'Contar o que aconteceu';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#e6dfee]">
      <div className="w-full px-3 sm:px-6 min-[1366px]:px-6 min-[1536px]:px-8 flex flex-wrap min-[1366px]:flex-nowrap items-center justify-between gap-x-3 min-[1366px]:h-16">
        {/* Left: Brand Logo + Title + Subtitle */}
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            onSelectSection('heatmap');
          }}
          className="order-1 flex items-center gap-2 sm:gap-2.5 min-h-[44px] py-2 min-[1366px]:py-0 pr-1 rounded-xl text-left cursor-pointer shrink-0 hover:opacity-90 transition-opacity"
          aria-label="Voltar para o Mapa de Calor do Assédio Aki"
        >
          <img
            src={appLogo}
            alt=""
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-[#e6dfee] shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col items-start leading-tight whitespace-nowrap">
            <span className="font-heading font-semibold text-sm sm:text-base min-[1440px]:text-lg text-[#261d2e]">
              Assédio Aki
            </span>
            <span className="hidden sm:block text-[11px] text-[#5c3e70] font-medium">
              Acolhimento em Santa Catarina
            </span>
          </div>
        </button>

        {/* Center (≥1366px single row) / Bottom full-width row (1024px–1365px): Plain text tabs + "Mais ▾" */}
        <nav
          aria-label="Navegação principal"
          className="hidden lg:flex order-3 min-[1366px]:order-2 w-full min-[1366px]:w-auto items-center justify-between min-[1366px]:justify-center gap-1 min-[1440px]:gap-2 border-t border-[#efe9f4] min-[1366px]:border-t-0 py-1.5 min-[1366px]:py-0"
        >
          {CENTER_TABS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative min-h-[44px] px-2.5 min-[1440px]:px-3.5 py-2 rounded-lg text-[13px] min-[1440px]:text-sm inline-flex items-center justify-center whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#f5f0fa] text-[#261d2e] font-semibold after:content-[""] after:absolute after:inset-x-2.5 after:bottom-0.5 after:h-[2.5px] after:rounded-full after:bg-[#6d4c82]'
                    : 'text-[#493857] hover:text-[#261d2e] hover:bg-[#f7f4fb] font-medium'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}

          {onOpenMenuSection && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                title="Abrir Mais opções e informações"
                className={`relative min-h-[44px] px-2.5 min-[1440px]:px-3.5 py-2 rounded-lg text-[13px] min-[1440px]:text-sm inline-flex items-center justify-center gap-1 whitespace-nowrap transition-colors cursor-pointer ${
                  menuOpen
                    ? 'bg-[#f5f0fa] text-[#261d2e] font-semibold after:content-[""] after:absolute after:inset-x-2.5 after:bottom-0.5 after:h-[2.5px] after:rounded-full after:bg-[#6d4c82]'
                    : 'text-[#493857] hover:text-[#261d2e] hover:bg-[#f7f4fb] font-medium'
                }`}
              >
                <span>Mais</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#5c3e70] transition-transform ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 bg-white border border-[#e6dfee] rounded-2xl shadow-lg shadow-[#261d2e]/8 p-1.5 z-50 space-y-0.5"
                >
                  {MENU_SUBITEMS.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenMenuSection(sub.id);
                        }}
                        className="w-full min-h-[42px] px-3 py-2 rounded-xl text-left text-xs sm:text-sm text-[#493857] hover:bg-[#f5f0fa] hover:text-[#261d2e] font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <SubIcon className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right: "Contar o que aconteceu" (only filled button) + "Entrar"/Account (≥1024px) + "Sair rápido" (always visible) + Hamburger (<1024px) */}
        <div className="order-2 min-[1366px]:order-3 flex items-center gap-1.5 sm:gap-2 py-2 min-[1366px]:py-0 shrink-0">
          {/* 1. Primary Action: ONLY filled button in the top bar (soft burnt rose) */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onSelectSection('report');
            }}
            aria-current={isReportActive ? 'page' : undefined}
            aria-label={reportAriaLabel}
            title={reportTooltip}
            className={`relative min-h-[42px] sm:min-h-[44px] min-w-[42px] px-2.5 sm:px-3.5 py-2 rounded-xl text-white text-xs sm:text-[13px] min-[1440px]:text-sm font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              isReportActive
                ? 'bg-[#8d3d52] ring-2 ring-[#e3c5ce]'
                : 'bg-[#a44d63] hover:bg-[#8d3d52]'
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Contar o que aconteceu</span>
            {isDraftAvailable && (
              <span
                role="status"
                title="Rascunho salvo"
                aria-label="Rascunho salvo"
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#e09f3e] ring-2 ring-white"
              />
            )}
          </button>

          {/* 2. Optional Login / Account Area (visible on ≥1024px; inside hamburger below 1024px to avoid duplication) */}
          <div className="hidden lg:flex items-center gap-1.5">
            {!user ? (
              onOpenAuth && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  aria-label="Entrar na conta"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#f7f4fb] border border-[#e6dfee] text-[#493857] hover:text-[#261d2e] text-[13px] min-[1440px]:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                  <span>Entrar</span>
                </button>
              )
            ) : user.role === 'admin' ? (
              <div className="flex items-center gap-1">
                {onOpenAdminPanel && (
                  <button
                    type="button"
                    onClick={onOpenAdminPanel}
                    aria-label="Abrir painel administrativo"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#f5f0fa] border border-[#ddd1ea] text-[#493857] text-[13px] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                    <span>Admin</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Sair da conta"
                    aria-label="Sair da conta"
                    className="min-h-[44px] min-w-[42px] px-2.5 py-2 rounded-xl bg-white hover:bg-[#f7f4fb] border border-[#e6dfee] text-[#5a4e66] hover:text-[#261d2e] inline-flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  title={user.name}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#f7f4fb] border border-[#e6dfee] text-[#493857] text-[13px] font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer max-w-[132px]"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#6d4c82] shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {user.isAnonymous ? 'Anônima' : user.name.split(' ')[0]}
                  </span>
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Sair da conta"
                    aria-label="Sair da conta"
                    className="min-h-[44px] min-w-[42px] px-2.5 py-2 rounded-xl bg-white hover:bg-[#f7f4fb] border border-[#e6dfee] text-[#5a4e66] hover:text-[#261d2e] inline-flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 3. Critical Always-Visible Quick Exit ("Sair rápido" + ESC) on ALL widths */}
          <button
            type="button"
            onClick={onQuickExit}
            title="Disfarçar esta tela imediatamente (tecla ESC)"
            aria-label="Sair rápido e disfarçar tela (ESC)"
            className="min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-white hover:bg-[#fbf2f4] border border-[#e3c5ce] text-[#7a2e43] text-xs sm:text-[13px] min-[1440px]:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            <EyeOff className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Sair rápido</span>
            <span className="hidden xl:inline text-[11px] font-medium text-[#8d3d52] bg-[#fbf2f4] px-1.5 py-0.5 rounded border border-[#edd7de]">
              ESC
            </span>
          </button>

          {/* 4. Mobile & Tablet Hamburger Toggle (<1024px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            className="lg:hidden min-h-[42px] sm:min-h-[44px] min-w-[42px] sm:min-w-[44px] p-2 text-[#493857] hover:text-[#261d2e] bg-white hover:bg-[#f5f0fa] rounded-xl border border-[#e6dfee] inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer (<1024px): Tabs + "Mais" + "Entrar"/Account (no duplicated Quick Exit or Report button) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#e6dfee] px-4 py-3 space-y-1.5 shadow-md shadow-[#261d2e]/5">
          {CENTER_TABS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  setMobileMenuOpen(false);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#f5f0fa] text-[#261d2e] font-semibold border-l-4 border-[#6d4c82]'
                    : 'text-[#493857] hover:text-[#261d2e] hover:bg-[#faf8fb] font-medium'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}

          {onOpenMenuSection && (
            <div className="pt-1 border-t border-[#efe9f4]">
              <button
                type="button"
                onClick={() => setMobileSubMenuOpen((prev) => !prev)}
                aria-expanded={mobileSubMenuOpen}
                className="w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#493857] hover:text-[#261d2e] hover:bg-[#f5f0fa] transition-colors cursor-pointer"
              >
                <span>Mais</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6d4c82] transition-transform ${
                    mobileSubMenuOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {mobileSubMenuOpen && (
                <div className="pl-2 pr-1 pt-1 space-y-1">
                  {MENU_SUBITEMS.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileSubMenuOpen(false);
                          onOpenMenuSection(sub.id);
                        }}
                        className="w-full min-h-[42px] flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#493857] hover:text-[#261d2e] hover:bg-[#f5f0fa] transition-colors text-left cursor-pointer"
                      >
                        <SubIcon className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Account / Login inside Mobile Drawer (<1024px) */}
          <div className="pt-2 border-t border-[#efe9f4]">
            {!user ? (
              onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#faf8fb] hover:bg-[#f5f0fa] border border-[#e6dfee] text-[#493857] text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                  <span>Entrar</span>
                </button>
              )
            ) : (
              <div className="flex items-center justify-between gap-2 px-1">
                {user.role === 'admin' && onOpenAdminPanel ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminPanel();
                    }}
                    className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#f5f0fa] hover:bg-[#ebe1f5] border border-[#ddd1ea] text-[#493857] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                    <span>Admin</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth?.();
                    }}
                    className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#faf8fb] hover:bg-[#f5f0fa] border border-[#e6dfee] text-[#493857] text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer truncate"
                  >
                    <UserIcon className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {user.isAnonymous ? 'Anônima' : user.name}
                    </span>
                  </button>
                )}

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-[#fbf2f4] border border-[#e6dfee] text-[#7a2e43] text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Sair</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
