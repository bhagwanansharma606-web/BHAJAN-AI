import React, { useState } from 'react';
import { Sparkles, Sun, Moon, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  onOpenDarshan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  isMobileFrame,
  setIsMobileFrame,
  onOpenDarshan,
}) => {
  const [bellRinging, setBellRinging] = useState(false);

  const ringBell = () => {
    setBellRinging(true);
    setTimeout(() => setBellRinging(false), 800);
    onOpenDarshan();
  };

  return (
    <header className="sticky top-0 z-30 px-4 py-3 bg-stone-900/90 dark:bg-stone-950/95 backdrop-blur-md border-b border-amber-900/30 transition-colors">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Brand & Sacred Icon */}
        <div className="flex items-center gap-2.5">
          <div className="relative group cursor-pointer" onClick={ringBell}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-orange-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 ring-2 ring-amber-400/40 transform active:scale-95 transition-all">
              <span className={`text-xl select-none ${bellRinging ? 'animate-bounce' : ''}`}>
                🕉️
              </span>
            </div>
            {/* Sacred Diya flame glow */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold tracking-tight text-amber-100 flex items-center gap-1 font-serif">
                Bhajan <span className="text-amber-500 font-sans font-extrabold text-sm px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">AI</span>
              </h1>
              <span className="text-xs text-amber-400/80 font-medium">भजन रचनाकार</span>
            </div>
            <p className="text-[10px] text-stone-400 leading-none">Indian Devotional Song Maker</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Daily Darshan / Blessing Button */}
          <button
            onClick={ringBell}
            title="Daily Darshan & Blessing"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 active:scale-95 transition-all"
          >
            <span className="text-sm">🪔</span>
            <span className="hidden sm:inline text-[11px]">दर्शन</span>
          </button>

          {/* Frame View Toggle (Mobile / Fullscreen) */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title={isMobileFrame ? 'Expand to Full View' : 'Show Mobile Device Frame'}
            className="p-2 rounded-full text-stone-300 hover:text-amber-400 hover:bg-stone-800/80 active:scale-95 transition-all"
          >
            {isMobileFrame ? <Monitor size={17} /> : <Smartphone size={17} />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Devotional Theme' : 'Switch to Dark Temple Theme'}
            className="p-2 rounded-full text-stone-300 hover:text-amber-400 hover:bg-stone-800/80 active:scale-95 transition-all"
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
};
