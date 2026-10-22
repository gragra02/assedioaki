import React from 'react';

// ==========================================
// 1. POLÍCIA MILITAR DE SANTA CATARINA
// ==========================================
export const PmscLogo: React.FC<{ className?: string; showText?: boolean }> = ({ 
  className = "w-12 h-12", 
  showText = false 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pmscRedToWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="60%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
          <linearGradient id="pmscGreen" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="70%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#86efac" />
          </linearGradient>
          <linearGradient id="pmscBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>

        {/* Outer Red crescent swoosh (top left) */}
        <path 
          d="M 100 15 A 85 85 0 0 1 178 68 A 85 85 0 0 1 168 135 C 158 115 152 95 130 85 C 105 73 80 85 62 102 C 55 85 65 60 78 45 A 85 85 0 0 1 100 15 Z" 
          fill="url(#pmscRedToWhite)" 
        />

        {/* Outer Green crescent swoosh (bottom right) */}
        <path 
          d="M 100 185 A 85 85 0 0 1 22 132 A 85 85 0 0 1 32 65 C 42 85 48 105 70 115 C 95 127 120 115 138 98 C 145 115 135 140 122 155 A 85 85 0 0 1 100 185 Z" 
          fill="url(#pmscGreen)" 
        />

        {/* Center Blue Circle */}
        <circle cx="100" cy="100" r="50" fill="url(#pmscBlue)" stroke="#ffffff" strokeWidth="4" />

        {/* Center White Star */}
        <polygon 
          points="100,62 112,88 140,88 117,105 126,132 100,116 74,132 83,105 60,88 88,88" 
          fill="#ffffff" 
        />
      </svg>
      {showText && (
        <div className="text-center mt-1">
          <span className="block text-[10px] font-black tracking-tight text-slate-900 uppercase leading-none">POLÍCIA MILITAR</span>
          <span className="block text-[8px] font-bold tracking-wider text-slate-700 uppercase leading-tight">SANTA CATARINA</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. POLÍCIA CIVIL DE SANTA CATARINA (PCSC)
// ==========================================
export const PcscLogo: React.FC<{ className?: string; showText?: boolean }> = ({ 
  className = "w-12 h-12", 
  showText = false 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 160 200" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pcscGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          <linearGradient id="pcscInnerGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>

        {/* Golden Shield Contour */}
        <path 
          d="M 80 8 C 125 8 145 22 145 45 C 145 110 120 165 80 185 C 40 165 15 110 15 45 C 15 22 35 8 80 8 Z" 
          fill="url(#pcscInnerGold)" 
          stroke="url(#pcscGold)" 
          strokeWidth="6" 
        />

        {/* Top Banner: POLÍCIA */}
        <path d="M 28 32 Q 80 20 132 32 L 128 54 Q 80 44 32 54 Z" fill="#ffffff" stroke="#ca8a04" strokeWidth="1.5" />
        <text x="80" y="46" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">
          POLÍCIA
        </text>

        {/* Center Coat of Arms Element */}
        <g transform="translate(80, 102)">
          {/* Green laurel wreath */}
          <ellipse cx="0" cy="0" rx="36" ry="32" fill="none" stroke="#16a34a" strokeWidth="4" strokeDasharray="4 2" />
          {/* Inner Red shield */}
          <polygon points="0,-22 22,-8 18,18 0,26 -18,18 -22,-8" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
          {/* Star in shield */}
          <polygon points="0,-15 5,-2 18,-2 8,6 12,20 0,11 -12,20 -8,6 -18,-2 -5,-2" fill="#ffffff" />
          {/* Red Ribbon */}
          <path d="M -30 20 Q 0 28 30 20 L 26 28 Q 0 36 -26 28 Z" fill="#991b1b" stroke="#ffffff" strokeWidth="0.8" />
        </g>

        {/* Bottom Banner: CIVIL SC */}
        <path d="M 36 142 Q 80 152 124 142 L 120 162 Q 80 174 40 162 Z" fill="#ffffff" stroke="#ca8a04" strokeWidth="1.5" />
        <text x="80" y="157" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">
          CIVIL SC
        </text>
      </svg>
      {showText && (
        <div className="text-center mt-1">
          <span className="block text-xs font-black text-purple-950 uppercase">PCSC</span>
          <span className="block text-[8px] font-bold text-slate-700">Polícia Civil SC</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. DEFENDELAS (DEFENSORIA PÚBLICA SC)
// ==========================================
export const DefendelasLogo: React.FC<{ className?: string; showText?: boolean }> = ({ 
  className = "w-12 h-12", 
  showText = false 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 140 170" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left vertical rounded stem (Light Green) */}
        <rect x="20" y="30" width="24" height="110" rx="10" fill="#4ea87d" />
        
        {/* Middle vertical inner pillar (Dark Forest Green) */}
        <rect x="46" y="60" width="26" height="80" rx="6" fill="#1b5e39" />
        
        {/* Horizontal top bar of lowercase 'd' connecting to D */}
        <path 
          d="M 20 62 C 20 40 45 30 75 30 C 115 30 128 55 128 85 C 128 115 115 140 75 140 L 46 140" 
          stroke="#2d372e" 
          strokeWidth="24" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
        />
        
        {/* Inner negative space cut */}
        <ellipse cx="78" cy="85" rx="16" ry="24" fill="#ffffff" />
      </svg>
      {showText && (
        <div className="text-center mt-1">
          <span className="block text-[10px] font-black text-emerald-800 uppercase leading-none">DEFENDELAS</span>
          <span className="block text-[8px] font-bold text-slate-700 uppercase leading-tight">Defensoria Pública</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. OAB (ORDEM DOS ADVOGADOS DO BRASIL)
// ==========================================
export const OabLogo: React.FC<{ className?: string; showText?: boolean }> = ({ 
  className = "w-12 h-12", 
  showText = false 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 240 120" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="oabSphere" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="35%" stopColor="#2563eb" />
            <stop offset="70%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          <linearGradient id="oabRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="60%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>

        {/* 1. Letter 'O' - 3D Blue Sphere with White Curved Band */}
        <circle cx="55" cy="60" r="45" fill="url(#oabSphere)" />
        {/* Curved White equator band */}
        <path 
          d="M 12 60 Q 55 42 98 62 L 97 70 Q 55 52 13 68 Z" 
          fill="#ffffff" 
          opacity="0.95" 
        />
        {/* Sphere reflection highlights */}
        <ellipse cx="40" cy="38" rx="14" ry="8" fill="#ffffff" opacity="0.3" transform="rotate(-20 40 38)" />

        {/* 2. Letter 'A' - Red Stylized Triangle */}
        <polygon points="125,15 155,105 95,105" fill="url(#oabRed)" />
        {/* Inner triangle cutout for 'A' */}
        <polygon points="125,50 140,92 110,92" fill="#ffffff" />

        {/* 3. Letter 'B' - Bold Red Double Curved Letter */}
        <path 
          d="M 165 15 L 200 15 C 218 15 228 25 228 38 C 228 48 220 56 210 58 C 222 62 232 72 232 85 C 232 98 220 105 200 105 L 165 105 Z" 
          fill="url(#oabRed)" 
        />
        {/* Upper inner hole of 'B' */}
        <path d="M 180 30 L 198 30 C 205 30 210 33 210 38 C 210 43 205 46 198 46 L 180 46 Z" fill="#ffffff" />
        {/* Lower inner hole of 'B' */}
        <path d="M 180 62 L 200 62 C 208 62 214 66 214 74 C 214 82 208 86 200 86 L 180 86 Z" fill="#ffffff" />
      </svg>
      {showText && (
        <span className="block text-[9px] font-black text-blue-900 tracking-wider mt-0.5">OAB / SC</span>
      )}
    </div>
  );
};

// ==========================================
// 5. NEAVIT (MINISTÉRIO PÚBLICO SC - MPSC)
// ==========================================
export const NeavitLogo: React.FC<{ className?: string; showText?: boolean }> = ({ 
  className = "w-12 h-12", 
  showText = false 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="neavitPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a044e" />
            <stop offset="50%" stopColor="#701a75" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>
          <linearGradient id="neavitLilac" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#e9d5ff" />
          </linearGradient>
        </defs>

        {/* Outer Circular Ring */}
        <circle cx="100" cy="100" r="92" stroke="#581c87" strokeWidth="8" fill="#ffffff" />

        {/* Inner Solid Violet Circle */}
        <circle cx="100" cy="100" r="76" fill="url(#neavitPurpleGrad)" />

        {/* Woman's Silhouette in White with Flowing Hair */}
        <g transform="translate(100, 100)">
          {/* Profile face and neck */}
          <path 
            d="M 5 -38 C -15 -35 -35 -20 -38 10 C -40 28 -32 45 -18 55 C -5 65 15 62 30 50 C 15 48 2 40 -4 28 C -10 15 -8 -5 0 -20 C 5 -30 15 -35 5 -38 Z" 
            fill="#ffffff" 
          />
          {/* Elegant facial profile facing right */}
          <path 
            d="M 5 -25 C 10 -22 14 -15 14 -8 C 12 -4 10 -2 14 2 C 16 4 19 6 15 12 C 12 16 14 20 18 22 C 12 28 8 36 10 46 C -2 46 -12 36 -12 22 C -12 8 -6 -12 5 -25 Z" 
            fill="#ffffff" 
          />
        </g>

        {/* Lower dynamic swoosh crescent wrapping around */}
        <path 
          d="M 35 110 C 35 145 65 165 100 165 C 135 165 165 140 165 105 C 155 130 130 148 100 148 C 65 148 45 130 35 110 Z" 
          fill="url(#neavitLilac)" 
        />
      </svg>
      {showText && (
        <div className="text-center mt-1">
          <span className="block text-[10px] font-black text-purple-950 uppercase leading-none">NEAVIT</span>
          <span className="block text-[8px] font-bold text-purple-800 uppercase leading-tight">MPSC</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. CEAV (CENTRAL ESPECIALIZADA DE ATENDIMENTO ÀS VÍTIMAS - TJSC)
// ==========================================
export const CeavLogo: React.FC<{ className?: string; showText?: boolean }> = ({ 
  className = "w-12 h-12", 
  showText = false 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ceavRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="40%" stopColor="#7c3aed" />
            <stop offset="75%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <radialGradient id="ceavDot1" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </radialGradient>
          <radialGradient id="ceavDot2" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0d9488" />
          </radialGradient>
          <radialGradient id="ceavDot3" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </radialGradient>
        </defs>

        {/* Circular Outer Gradient Ring */}
        <circle 
          cx="100" 
          cy="100" 
          r="75" 
          stroke="url(#ceavRingGrad)" 
          strokeWidth="11" 
          fill="none" 
        />

        {/* 3 Satellite Gradient Spheres/Nodes */}
        {/* Node 1: Top-Left (~10 o'clock) */}
        <circle cx="47" cy="52" r="14" fill="url(#ceavDot1)" />
        
        {/* Node 2: Right (~3 o'clock) */}
        <circle cx="174" cy="104" r="14" fill="url(#ceavDot2)" />
        
        {/* Node 3: Bottom (~6 o'clock) */}
        <circle cx="95" cy="174" r="14" fill="url(#ceavDot2)" />

        {/* Center: Lady Justice (Dama da Justiça / Themis) in Deep Violet */}
        <g transform="translate(100, 72)" fill="#581c87">
          {/* Head with classical bun & facial silhouette */}
          <circle cx="17" cy="-22" r="6" />
          <path d="M 23 -26 C 28 -24 30 -18 26 -14 C 23 -12 21 -15 21 -19 Z" />
          
          {/* Robe/Drape Torso and Arm extended */}
          <path d="M 8 -14 C 18 -12 28 -4 28 8 L -14 8 C -8 2 -2 -8 8 -14 Z" />
          <path d="M 12 -12 L -6 -24 L -10 -22 L 6 -10 Z" />

          {/* Scale balance beam held by hand */}
          <rect x="-34" y="-24" width="30" height="2.5" rx="1" fill="#581c87" />
          <polygon points="-19,-30 -16,-24 -22,-24" fill="#581c87" />

          {/* Left hanging pan with chains */}
          <line x1="-32" y1="-22" x2="-35" y2="-10" stroke="#581c87" strokeWidth="1" />
          <line x1="-26" y1="-22" x2="-23" y2="-10" stroke="#581c87" strokeWidth="1" />
          <path d="M -37 -10 Q -29 -4 -21 -10 Z" fill="#581c87" />

          {/* Right hanging pan with chains */}
          <line x1="-12" y1="-22" x2="-15" y2="-10" stroke="#581c87" strokeWidth="1" />
          <line x1="-6" y1="-22" x2="-3" y2="-10" stroke="#581c87" strokeWidth="1" />
          <path d="M -17 -10 Q -9 -4 -1 -10 Z" fill="#581c87" />
        </g>

        {/* Center Lower: Bold Text "CEAV" in Teal/Turquoise */}
        <text 
          x="100" 
          y="142" 
          textAnchor="middle" 
          fill="#0d9488" 
          fontSize="33" 
          fontWeight="900" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          letterSpacing="2"
        >
          CEAV
        </text>
      </svg>
      {showText && (
        <div className="text-center mt-0.5">
          <span className="block text-[10px] font-black text-teal-900 uppercase leading-none">CEAV</span>
          <span className="block text-[8px] font-bold text-purple-800 uppercase leading-tight">Poder Judiciário</span>
        </div>
      )}
    </div>
  );
};
