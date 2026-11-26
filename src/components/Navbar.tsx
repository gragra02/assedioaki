import React, { useState, useRef, useEffect } from 'react';
import {
  PlusCircle,
  MapPin,
  Locate,
  Shield,
  Heart,
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

  const navItems: Array<{
    id: 'report' | 'heatmap' | 'locator' | 'authorities' | 'support';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    isDraftBadge?: boolean;
  }> = [
    {
      id: 'report',
      label: 'Contar o que aconteceu',
      icon: PlusCircle,
      badge: isDraftAvailable ? 'Rascunho salvo' : 'Protegido',
      isDraftBadge: isDraftAvailable
    },
    { id: 'heatmap', label: 'Mapa de Calor', icon: MapPin },
    { id: 'locator', label: 'Preciso de ajuda agora', icon: Locate },
    { id: 'authorities', label: 'Onde buscar atendimento', icon: Shield },
    { id: 'support', label: 'Quem pode me ajudar', icon: Heart }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e6dfee]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap 2xl:flex-nowrap items-center justify-between gap-x-4 gap-y-2.5">
        {/* Zone 1: Brand Logo returning to Heatmap (initial section) */}
        <button
          type="button"
          onClick={() => onSelectSection('heatmap')}
          className="flex items-center gap-2 sm:gap-2.5 min-h-[44px] pr-1 rounded-xl text-left cursor-pointer shrink-0 hover:opacity-90 transition-opacity"
          aria-label="Voltar para o Mapa de Calor do Assédio Aki"
        >
          <img
            src={appLogo}
            alt=""
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-[#e6dfee] shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col items-start leading-tight whitespace-nowrap">
            <span className="font-heading font-semibold text-base sm:text-lg text-[#261d2e]">
              Assédio Aki
            </span>
            <span className="hidden sm:block text-[11px] text-[#6d4c82] font-medium">
              Acolhimento em Santa Catarina
            </span>
          </div>
        </button>

        {/* Zone 2: Original Desktop Navigation Structure in Refined Aesthetic */}
        <nav
          aria-label="Navegação principal"
          className="hidden lg:flex items-center justify-center flex-wrap gap-1.5 bg-[#f8f5fb] p-1.5 rounded-2xl border border-[#e6dfee] w-full order-3 2xl:w-auto 2xl:order-2"
        >
          {/* Vertical Column: "Contar o que aconteceu" above "Mapa de Calor" */}
          <div className="flex flex-col items-stretch gap-1 shrink-0">
            {navItems
              .filter((item) => item.id === 'report' || item.id === 'heatmap')
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const isReport = item.id === 'report';

                const buttonClasses = isReport
                  ? isActive
                    ? 'bg-[#914358] text-white font-semibold ring-2 ring-[#e7cbd3]'
                    : 'bg-[#b05c72] hover:bg-[#914358] text-white font-semibold'
                  : isActive
                  ? 'bg-[#6d4c82] text-white font-semibold'
                  : 'bg-white text-[#4f3461] hover:bg-[#f3eef8] border border-[#e6dfee] font-medium';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer ${buttonClasses}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md border whitespace-nowrap shrink-0 font-semibold ${
                          item.isDraftBadge
                            ? 'bg-[#fef6e4] text-[#7a4f13] border-[#f2d694]'
                            : 'bg-white/20 text-white border-white/35'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Horizontal Primary Items */}
          {navItems
            .filter((item) => item.id !== 'report' && item.id !== 'heatmap')
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSection(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[40px] px-3 py-2 rounded-xl text-xs xl:text-[13px] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#6d4c82] text-white font-semibold'
                      : 'text-[#3b284a] hover:bg-[#efe8f6] font-medium'
                  }`}
                >
                  <Icon className="w-4 h-4 text-current shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}

          {/* Dropdown "Mais" */}
          {onOpenMenuSection && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                title="Abrir Mais opções e informações"
                className={`min-h-[40px] px-3 py-2 rounded-xl text-xs xl:text-[13px] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  menuOpen
                    ? 'bg-[#e8def2] text-[#261d2e] font-semibold'
                    : 'text-[#3b284a] hover:bg-[#efe8f6] font-medium'
                }`}
              >
                <Menu className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Mais</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#e6dfee] rounded-2xl shadow-xl p-1.5 z-50 space-y-0.5">
                  {MENU_SUBITEMS.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenMenuSection(sub.id);
                        }}
                        className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left text-xs sm:text-sm text-[#493d54] hover:bg-[#f3eef8] hover:text-[#261d2e] font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
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

        {/* Zone 3: Optional Login / Account + Quick Exit (same place as today) + Mobile Menu Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 2xl:order-3">
          {!user ? (
            onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                aria-label="Entrar na conta"
                className="min-h-[44px] px-2.5 xl:px-3.5 py-2 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#4f3461] text-xs xl:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4 shrink-0" aria-hidden="true" />
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
                  className="min-h-[44px] px-2.5 xl:px-3 py-2 rounded-xl bg-[#f3eef8] hover:bg-[#e8def2] border border-[#ddd1ea] text-[#4f3461] text-xs xl:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Admin</span>
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Sair da conta"
                  aria-label="Sair da conta"
                  className="min-h-[44px] min-w-[40px] px-2 py-2 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#5a4e66] hover:text-[#261d2e] inline-flex items-center justify-center transition-colors cursor-pointer"
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
                className="min-h-[44px] px-2.5 py-2 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#4f3461] text-xs xl:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer max-w-[120px]"
              >
                <UserIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{user.isAnonymous ? 'Anônima' : user.name.split(' ')[0]}</span>
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Sair da conta"
                  aria-label="Sair da conta"
                  className="min-h-[44px] min-w-[40px] px-2 py-2 rounded-xl bg-[#faf8fb] hover:bg-[#f3eef8] border border-[#e6dfee] text-[#5a4e66] hover:text-[#261d2e] inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onQuickExit}
            title="Disfarçar esta tela imediatamente (tecla ESC)"
            aria-label="Sair rápido e disfarçar tela (ESC)"
            className="min-h-[44px] px-2.5 xl:px-3.5 py-2 rounded-xl bg-[#fbf2f4] hover:bg-[#f4e2e7] border border-[#e7cbd3] text-[#7f3347] text-xs xl:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            <EyeOff className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Sair rápido</span>
            <span className="hidden xl:inline text-[11px] font-medium text-[#914358] opacity-80">
              ESC
            </span>
          </button>

          {/* Mobile Drawer Toggle (original mobile behavior) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            className="lg:hidden min-h-[44px] min-w-[44px] p-2 text-[#4f3461] hover:text-[#261d2e] bg-[#faf8fb] hover:bg-[#f3eef8] rounded-xl border border-[#e6dfee] inline-flex items-center justify-center transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Original Collapsible Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#faf8fb] border-t border-[#e6dfee] px-4 py-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const isReport = item.id === 'report';

            const mobileClasses = isReport
              ? isActive
                ? 'bg-[#914358] text-white font-semibold'
                : 'bg-[#b05c72] hover:bg-[#914358] text-white font-semibold'
              : isActive
              ? 'bg-[#6d4c82] text-white font-semibold'
              : 'bg-white text-[#3b284a] hover:bg-[#f3eef8] border border-[#e6dfee] font-medium';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  setMobileMenuOpen(false);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer ${mobileClasses}`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${
                      item.isDraftBadge
                        ? 'bg-[#fef6e4] text-[#7a4f13] border-[#f2d694]'
                        : 'bg-white/20 text-white border-white/35'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Expandable "Mais" Submenu in Mobile Drawer */}
          {onOpenMenuSection && (
            <div className="pt-1 border-t border-[#efe9f4]">
              <button
                type="button"
                onClick={() => setMobileSubMenuOpen((prev) => !prev)}
                aria-expanded={mobileSubMenuOpen}
                className="w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#3b284a] bg-[#f3eef8] hover:bg-[#e8def2] border border-[#ddd1ea] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Menu className="w-4 h-4 text-[#6d4c82] shrink-0" aria-hidden="true" />
                  <span>Mais</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6d4c82] transition-transform ${
                    mobileSubMenuOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {mobileSubMenuOpen && (
                <div className="pl-2 pr-1 pt-1.5 space-y-1">
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
                        className="w-full min-h-[40px] flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#493d54] hover:text-[#261d2e] hover:bg-[#f3eef8] transition-colors text-left cursor-pointer"
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
        </div>
      )}
    </header>
  );
};
