import React, { useEffect, useState } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  isMobileFrame: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, isMobileFrame }) => {
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setTimeStr(`${hours % 12 || 12}:${mStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isMobileFrame) {
    return (
      <div className="min-h-screen w-full bg-stone-950 flex flex-col justify-between">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-stone-950 flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Smartphone Casing on Desktop, or Full Screen on Phone */}
      <div className="w-full sm:max-w-[430px] h-screen sm:h-[880px] bg-stone-950 sm:rounded-[48px] sm:border-[10px] sm:border-stone-800 shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col relative overflow-hidden ring-1 ring-amber-500/20">
        {/* Dynamic Island / Mobile Notch Status Bar */}
        <div className="h-10 px-6 flex items-center justify-between text-stone-300 text-xs font-semibold z-40 bg-stone-950/80 backdrop-blur-md flex-shrink-0 select-none">
          <span className="font-mono text-[11px]">{timeStr}</span>

          {/* Notch pill */}
          <div className="w-20 h-4 bg-black rounded-full border border-stone-800 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500/80 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
          </div>

          <div className="flex items-center gap-1.5 text-stone-300">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={14} className="fill-stone-300 text-stone-300" />
          </div>
        </div>

        {/* Scrollable Mobile App Body */}
        <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col relative">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="h-5 flex items-center justify-center bg-stone-950 flex-shrink-0 z-40">
          <div className="w-32 h-1 bg-stone-700/80 rounded-full" />
        </div>
      </div>
    </div>
  );
};
