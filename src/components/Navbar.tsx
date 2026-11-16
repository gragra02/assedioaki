import React from 'react';
import {
  Home,
  LifeBuoy,
  BookOpen,
  MessageCircleHeart,
  Scale,
  EyeOff
} from 'lucide-react';
import appLogo from '../assets/logo.jpg';
import { AppSection } from './HomeView';

export type NavSection = AppSection | 'report';

interface NavbarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onQuickExit: () => void;
}

const NAV_ITEMS: Array<{
  id: AppSection;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Início', mobileLabel: 'Início', icon: Home },
  { id: 'help', label: 'Preciso de ajuda', mobileLabel: 'Ajuda', icon: LifeBuoy },
  { id: 'understand', label: 'Entender', mobileLabel: 'Entender', icon: BookOpen },
  { id: 'talk', label: 'Conversar', mobileLabel: 'Conversar', icon: MessageCircleHeart },
  { id: 'rights', label: 'Direitos', mobileLabel: 'Direitos', icon: Scale }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onSelectSection,
  onQuickExit
}) => {
  const normalizedActive: AppSection =
    activeSection === 'report' || activeSection === 'track'
      ? 'rights'
      : activeSection === 'map'
        ? 'understand'
        : activeSection;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e6dfee]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Zone 1: Single-line Brand Logo returning Home */}
          <button
            type="button"
            onClick={() => onSelectSection('home')}
            className="flex items-center gap-2.5 min-h-[44px] pr-2 rounded-xl text-left cursor-pointer shrink-0 hover:opacity-90 transition-opacity"
            aria-label="Voltar para a página inicial Assédio Aki"
          >
            <img
              src={appLogo}
              alt=""
              className="w-9 h-9 rounded-full object-cover border border-[#e6dfee] shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="font-heading font-semibold text-base sm:text-lg text-[#261d2e] whitespace-nowrap">
              Assédio Aki
            </span>
          </button>

          {/* Zone 2: Desktop Concise Primary Navigation */}
          <nav
            aria-label="Navegação principal"
            className="hidden lg:flex items-center gap-1"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = normalizedActive === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSection(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#6d4c82] text-white font-semibold'
                      : 'text-[#4f3461] hover:bg-[#f3eef8] font-medium'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Discreet, Always-Accessible Quick Exit */}
          <button
            type="button"
            onClick={onQuickExit}
            title="Disfarçar esta tela imediatamente (tecla ESC)"
            aria-label="Sair rápido e disfarçar tela (ESC)"
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fbf2f4] hover:bg-[#f4e2e7] border border-[#e7cbd3] text-[#7f3347] text-xs sm:text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            <EyeOff className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Sair rápido</span>
            <span className="hidden xl:inline text-[11px] font-medium text-[#914358] opacity-80">
              ESC
            </span>
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Bottom Tab Bar (ergonomic thumb navigation, 5 destinations) */}
      <nav
        aria-label="Navegação móvel"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e6dfee] px-1"
      >
        <div className="max-w-lg mx-auto grid grid-cols-5 h-14">
          {NAV_ITEMS.map((item) => {
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
                <span className="truncate max-w-full">{item.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
