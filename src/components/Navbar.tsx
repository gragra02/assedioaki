import React from 'react';
import {
  Home,
  Flame,
  HeartHandshake,
  LifeBuoy,
  BookOpen,
  MessageCircleHeart,
  Scale,
  EyeOff,
  LogIn,
  LogOut,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import appLogo from '../assets/logo.jpg';
import { AppSection } from './HomeView';
import { User } from '../types';

export type NavSection = AppSection | 'report';

interface NavbarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onQuickExit: () => void;
  user?: User | null;
  onOpenAuth?: () => void;
  onOpenAdminPanel?: () => void;
  onLogout?: () => void;
}

const DESKTOP_NAV_ITEMS: Array<{
  id: AppSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'map', label: 'Mapa de Calor', icon: Flame },
  { id: 'community', label: 'Comunidade', icon: HeartHandshake },
  { id: 'help', label: 'Ajuda', icon: LifeBuoy },
  { id: 'understand', label: 'Entender', icon: BookOpen },
  { id: 'talk', label: 'Conversar', icon: MessageCircleHeart },
  { id: 'rights', label: 'Direitos', icon: Scale }
];

const MOBILE_NAV_ITEMS: Array<{
  id: AppSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'map', label: 'Mapa', icon: Flame },
  { id: 'community', label: 'Comunidade', icon: HeartHandshake },
  { id: 'talk', label: 'Conversar', icon: MessageCircleHeart },
  { id: 'rights', label: 'Direitos', icon: Scale }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onSelectSection,
  onQuickExit,
  user,
  onOpenAuth,
  onOpenAdminPanel,
  onLogout
}) => {
  const normalizedActive: AppSection | null =
    activeSection === 'track'
      ? 'rights'
      : activeSection === 'report'
      ? null
      : activeSection;

  return (
    <>
      <header className="lg:sticky lg:top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e6dfee]">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Zone 1: Single-line Brand Logo returning Home */}
          <button
            type="button"
            onClick={() => onSelectSection('home')}
            className="flex items-center gap-2 min-h-[44px] pr-1 rounded-xl text-left cursor-pointer shrink-0 hover:opacity-90 transition-opacity"
            aria-label="Voltar para a página inicial Assédio Aki"
          >
            <img
              src={appLogo}
              alt=""
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-[#e6dfee] shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="font-heading font-semibold text-base xl:text-lg text-[#261d2e] whitespace-nowrap">
              Assédio Aki
            </span>
          </button>

          {/* Zone 2: Desktop Concise Primary Navigation (includes Mapa de Calor & Comunidade) */}
          <nav
            aria-label="Navegação principal"
            className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0"
          >
            {DESKTOP_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = normalizedActive === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSection(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[44px] px-2 xl:px-3.5 py-2 rounded-xl text-[13px] xl:text-sm inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#6d4c82] text-white font-semibold'
                      : 'text-[#4f3461] hover:bg-[#f3eef8] font-medium'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Optional Login / Account + Always-Accessible Quick Exit */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
          </div>
        </div>
      </header>

      {/* Mobile / Tablet Bottom Tab Bar (ergonomic thumb navigation including Mapa & Comunidade) */}
      <nav
        aria-label="Navegação móvel"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e6dfee] px-1"
      >
        <div className="max-w-lg mx-auto grid grid-cols-5 h-14">
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = normalizedActive === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 text-[11px] leading-tight transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#6d4c82] font-semibold'
                    : 'text-[#5a4e66] hover:text-[#261d2e] font-medium'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
