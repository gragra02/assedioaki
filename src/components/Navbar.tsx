import React from 'react';
import { User } from '../types';
import { 
  Shield, PlusCircle, MapPin, Search, PhoneCall, Zap, UserCheck, 
  LogOut, Menu, X, Heart, ShieldCheck, ShieldAlert, Locate, 
  ChevronDown, BookOpen, Mail, Info, HeartHandshake, Users, HelpCircle 
} from 'lucide-react';
import { hasReportDraft } from '../lib/draftStorage';
import { MenuModalSection } from './MenuModal';
import appLogo from '../assets/logo.jpg';

interface NavbarProps {
  activeTab: 'report' | 'heatmap' | 'locator' | 'authorities' | 'support';
  onSelectTab: (tab: 'report' | 'heatmap' | 'locator' | 'authorities' | 'support') => void;
  onQuickExit: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenMenuModal?: (section: MenuModalSection) => void;
  onOpenAdminPanel?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onQuickExit,
  user,
  onOpenAuth,
  onLogout,
  onOpenMenuModal,
  onOpenAdminPanel
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = React.useState(false);
  const [menuDropdownOpen, setMenuDropdownOpen] = React.useState(false);
  const menuDropdownRef = React.useRef<HTMLDivElement>(null);
  const isDraftAvailable = hasReportDraft();

  // Close dropdown when clicked outside
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(e.target as Node)) {
        setMenuDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const subMenuItems: Array<{
    id: MenuModalSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'identify', label: 'Identifique o Tipo de Violência', icon: BookOpen },
    { id: 'contact', label: 'Entre em Contato', icon: Mail },
    { id: 'about', label: 'Sobre AssédioAki', icon: Info },
    { id: 'donate', label: 'Doe para AssédioAki', icon: HeartHandshake },
    { id: 'volunteer', label: 'Seja Voluntário no AssédioAki', icon: Users },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  ];

  const navItems: Array<{
    id: 'report' | 'heatmap' | 'locator' | 'authorities' | 'support';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    isDraftBadge?: boolean;
  }> = [
    { 
      id: 'report', 
      label: 'Registrar Denúncia', 
      icon: PlusCircle, 
      badge: isDraftAvailable ? 'Rascunho Salvo' : 'Criptografado',
      isDraftBadge: isDraftAvailable
    },
    { id: 'heatmap', label: 'Mapa de Calor', icon: MapPin },
    { id: 'locator', label: 'Localizador de Emergência', icon: Locate },
    { id: 'authorities', label: 'Autoridades', icon: Shield },
    { id: 'support', label: 'Rede de Apoio', icon: Heart }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTab('heatmap')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800 p-0.5 shadow-md shadow-purple-900/20 group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden shrink-0">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src={appLogo} 
                alt="Logo AssédioAki" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-xl font-extrabold tracking-tight font-heading text-purple-950 block leading-tight">
              AssédioAki
            </span>
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] text-purple-700 font-semibold block leading-tight">
                Denúncias de Assédio
              </span>
              <span className="text-[10px] text-purple-700 font-semibold block leading-tight">
                em Santa Catarina
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Nav Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isReport = item.id === 'report';
            const isHighlightBlack = ['locator', 'authorities', 'support'].includes(item.id);

            // Red emergency highlight styling for "Registrar Denúncia"
            const buttonClasses = isReport
              ? isActive
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold shadow-md shadow-red-500/30 ring-2 ring-red-400'
                : 'bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-sm shadow-red-500/25 ring-1 ring-red-500 hover:scale-[1.02]'
              : isActive 
                ? 'bg-purple-600 text-white font-extrabold shadow-sm shadow-purple-200' 
                : isHighlightBlack
                ? 'text-black font-extrabold hover:bg-slate-200/80 hover:text-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60';

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all relative cursor-pointer ${buttonClasses}`}
              >
                <Icon className={`w-4 h-4 ${isReport ? 'text-white shrink-0' : isHighlightBlack && !isActive ? 'text-black stroke-[2.5px] shrink-0' : 'shrink-0'}`} />
                <span className={isReport || isHighlightBlack || isActive ? 'font-extrabold tracking-wide' : 'font-semibold'}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border ${
                    item.isDraftBadge
                      ? 'bg-amber-100 text-amber-950 border-amber-300 font-extrabold animate-pulse'
                      : isReport
                      ? 'bg-red-800/80 text-white border-red-400/60 font-bold'
                      : isActive
                      ? 'bg-purple-700 text-purple-100 border-purple-500'
                      : 'bg-pink-100 text-pink-700 border-pink-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Item "Menu" no Menu Horizontal com Submenus */}
          <div ref={menuDropdownRef} className="relative">
            <button
              onClick={() => setMenuDropdownOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold text-black transition-all cursor-pointer ${
                menuDropdownOpen ? 'bg-slate-200 text-purple-950 shadow-2xs' : 'hover:bg-slate-200/80 hover:text-black'
              }`}
              title="Abrir Menu & Informações"
            >
              <Menu className="w-4 h-4 text-black stroke-[2.5px] shrink-0" />
              <span>Menu</span>
              <ChevronDown className={`w-3.5 h-3.5 text-black transition-transform duration-200 ${menuDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Submenus Dropdown */}
            {menuDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-1.5 z-50 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-extrabold text-purple-900 uppercase tracking-wider">
                  Menu & Informações
                </div>
                {subMenuItems.map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setMenuDropdownOpen(false);
                        onOpenMenuModal?.(sub.id);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-purple-950 hover:bg-purple-50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-purple-100 group-hover:bg-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                        <SubIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="flex-1">{sub.label}</span>
                    </button>
                  );
                })}

                {/* Opção Menu do Administrador no Dropdown */}
                <div className="pt-1.5 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setMenuDropdownOpen(false);
                      if (user?.role === 'admin') {
                        onOpenAdminPanel?.();
                      } else {
                        onOpenAuth();
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-purple-950 bg-purple-50 hover:bg-purple-100 transition-colors text-left cursor-pointer group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                    <span className="flex-1">Menu do Administrador</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 font-extrabold">
                      {user?.role === 'admin' ? 'Ativo' : 'Restrito'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* User Auth and Admin Panel Button */}
        <div className="hidden sm:flex items-center gap-2.5">
          {user?.role === 'admin' && (
            <button
              onClick={onOpenAdminPanel}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-purple-400/40"
              title="Abrir Painel de Gestão e Logs"
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Painel Admin</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${
                  user.role === 'admin' ? 'bg-indigo-700' : 'bg-purple-600'
                }`}>
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block leading-tight">{user.name}</span>
                <span className="text-[10px] text-purple-700 font-medium block">
                  {user.role === 'admin' ? '👑 Administrador' : user.isAnonymous ? 'Modo Anônimo' : 'Conta Verificada'}
                </span>
              </div>
              <button 
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-slate-900 bg-slate-100 rounded-lg border border-slate-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 animate-in slide-in-from-top-2 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isReport = item.id === 'report';
            const isHighlightBlack = ['locator', 'authorities', 'support'].includes(item.id);

            const mobileButtonClasses = isReport
              ? isActive
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold shadow-md ring-2 ring-red-400'
                : 'bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-sm'
              : isActive 
                ? 'bg-purple-600 text-white font-extrabold' 
                : isHighlightBlack
                ? 'text-black font-extrabold hover:bg-slate-100'
                : 'text-slate-700 hover:bg-slate-100 font-medium';

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${mobileButtonClasses}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isReport ? 'text-white' : isHighlightBlack && !isActive ? 'text-black stroke-[2.5px]' : ''}`} />
                  <span className={isReport || isHighlightBlack || isActive ? 'font-extrabold' : 'font-semibold'}>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                    item.isDraftBadge
                      ? 'bg-amber-100 text-amber-950 border-amber-300 animate-pulse'
                      : isReport
                      ? 'bg-red-800/80 text-white border-red-400/60'
                      : 'bg-pink-100 text-pink-700 border-pink-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Menu Dropdown Expandable in Mobile Drawer */}
          <div className="pt-1 border-t border-slate-100">
            <button
              onClick={() => setMobileSubMenuOpen(prev => !prev)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-extrabold text-black bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Menu className="w-4 h-4 text-black stroke-[2.5px]" />
                <span>Menu</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${mobileSubMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileSubMenuOpen && (
              <div className="pl-3 pr-1 pt-1.5 space-y-1 animate-in fade-in">
                {subMenuItems.map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileSubMenuOpen(false);
                        onOpenMenuModal?.(sub.id);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold text-slate-700 hover:text-purple-900 hover:bg-purple-50 transition-colors text-left cursor-pointer"
                    >
                      <SubIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Menu do Administrador no Mobile Drawer */}
          <div className="pt-1.5 border-t border-slate-200">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (user?.role === 'admin') {
                  onOpenAdminPanel?.();
                } else {
                  onOpenAuth();
                }
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-black bg-purple-900 text-white transition-colors cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-300" />
                <span>Menu do Administrador (Gestão & Logs)</span>
              </div>
              <span className="text-[9px] bg-purple-700 text-purple-200 px-1.5 py-0.5 rounded font-extrabold uppercase">
                {user?.role === 'admin' ? 'Ativo' : 'Restrito'}
              </span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-slate-700 font-medium">Conectado como: {user.name}</span>
                <button onClick={onLogout} className="text-xs text-rose-600 font-bold">Sair</button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold text-center shadow-xs"
              >
                Entrar ou Cadastrar
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
