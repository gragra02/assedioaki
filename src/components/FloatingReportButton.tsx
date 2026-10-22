import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PlusCircle, GripVertical } from 'lucide-react';

interface FloatingReportButtonProps {
  onOpenReport: () => void;
  isVisible: boolean;
}

export const FloatingReportButton: React.FC<FloatingReportButtonProps> = ({
  onOpenReport,
  isVisible
}) => {
  // Saved manual position if user dragged it
  const [manualPosition, setManualPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [slotElement, setSlotElement] = useState<HTMLElement | null>(null);
  const [isSlotScrolledOut, setIsSlotScrolledOut] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    moved: false
  });
  const buttonRef = useRef<HTMLDivElement>(null);

  // Periodically check for slot element in DOM
  useEffect(() => {
    const checkSlot = () => {
      const el = document.getElementById('floating-report-btn-slot');
      setSlotElement(el);
    };
    checkSlot();
    const timer = setTimeout(checkSlot, 100);
    const interval = setInterval(checkSlot, 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Monitor scroll so that if button is in the slot and the slot scrolls off-screen,
  // it gracefully floats near top-right so the user can still register a report at any moment
  useEffect(() => {
    if (manualPosition) return; // User chose a specific position

    const handleScroll = () => {
      if (slotElement) {
        const rect = slotElement.getBoundingClientRect();
        // If the header card slot has scrolled off top of viewport
        if (rect.bottom < 64) {
          setIsSlotScrolledOut(true);
        } else {
          setIsSlotScrolledOut(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slotElement, manualPosition]);

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: rect.left,
      initialY: rect.top,
      moved: false
    };
    setIsDragging(true);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartRef.current.startX;
    const deltaY = clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragStartRef.current.moved = true;
    }

    if (dragStartRef.current.moved) {
      const btnWidth = buttonRef.current?.offsetWidth || 190;
      const btnHeight = buttonRef.current?.offsetHeight || 46;
      const newX = Math.min(Math.max(12, dragStartRef.current.initialX + deltaX), window.innerWidth - btnWidth - 12);
      const newY = Math.min(Math.max(12, dragStartRef.current.initialY + deltaY), window.innerHeight - btnHeight - 12);

      setManualPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Global mousemove and mouseup listeners when dragging
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handlePointerUp();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging]);

  const handleClick = (e: React.MouseEvent) => {
    // If user dragged the button, do not trigger opening report
    if (dragStartRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onOpenReport();
  };

  if (!isVisible) return null;

  // Determine rendering style:
  // 1) User manually dragged it -> fixed at manualPosition
  // 2) Slot is present and not scrolled out -> inline inside slot
  // 3) Slot is scrolled out or not present -> fixed near top-right (never covering bottom buttons)
  let renderStyle: React.CSSProperties;
  let isDockedInSlot = false;

  if (manualPosition) {
    renderStyle = {
      position: 'fixed',
      left: `${manualPosition.x}px`,
      top: `${manualPosition.y}px`,
      zIndex: 50,
      touchAction: 'none'
    };
  } else if (slotElement && !isSlotScrolledOut) {
    isDockedInSlot = true;
    renderStyle = {
      position: 'relative',
      zIndex: 20,
      touchAction: 'none'
    };
  } else {
    renderStyle = {
      position: 'fixed',
      top: '84px',
      right: '24px',
      zIndex: 50,
      touchAction: 'none'
    };
  }

  const buttonElement = (
    <div
      ref={buttonRef}
      style={renderStyle}
      className={`group select-none ${isDockedInSlot ? '' : 'animate-in fade-in duration-200'}`}
    >
      <div
        onMouseDown={(e) => {
          if (e.button === 0) handlePointerDown(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold shadow-lg shadow-red-700/30 ring-4 ring-red-400/40 border-2 border-white cursor-pointer active:scale-95 transition-all ${
          isDragging ? 'opacity-90 scale-105 shadow-2xl' : 'hover:scale-[1.02]'
        }`}
        title="Clique para registrar denúncia a qualquer momento (Arraste para mover na tela)"
      >
        {/* Subtle pulsating beacon */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>

        <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0 drop-shadow" />
        
        <span className="text-xs sm:text-sm font-black tracking-wide drop-shadow-sm whitespace-nowrap">
          Registrar Denúncia
        </span>

        {/* Drag handle icon */}
        <GripVertical className="w-3.5 h-3.5 text-red-200 opacity-60 group-hover:opacity-100 shrink-0 ml-0.5 cursor-grab active:cursor-grabbing" />
      </div>
    </div>
  );

  // If docked in slot and user hasn't dragged, render directly into the slot element
  if (isDockedInSlot && slotElement) {
    return createPortal(buttonElement, slotElement);
  }

  // Otherwise render into normal DOM (body/fixed container)
  return buttonElement;
};
