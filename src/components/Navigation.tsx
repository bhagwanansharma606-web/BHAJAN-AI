import React from 'react';
import { Home, Sparkles, Music, BookOpen, Disc3 } from 'lucide-react';

export type NavTab = 'home' | 'create' | 'songs' | 'lyrics' | 'studio';

interface NavigationProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-xl border-t border-amber-900/40 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'home'
              ? 'text-amber-400 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Home size={20} className={currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Songs Library */}
        <button
          onClick={() => onChangeTab('songs')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'songs'
              ? 'text-amber-400 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Music size={20} className={currentTab === 'songs' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-tight">My Songs</span>
        </button>

        {/* Big Elevated Create Button */}
        <div className="-mt-6 relative">
          <button
            onClick={() => onChangeTab('create')}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-amber-600/40 border-2 transition-all transform active:scale-95 ${
              currentTab === 'create'
                ? 'bg-gradient-to-tr from-amber-600 via-orange-500 to-red-600 border-amber-300 ring-4 ring-amber-500/30 scale-105'
                : 'bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 border-amber-400/80 hover:scale-105'
            }`}
          >
            <span className="text-xl leading-none">🪔</span>
            <span className="text-[9px] font-bold tracking-tight uppercase mt-0.5">Create</span>
          </button>
        </div>

        {/* Lyrics Book */}
        <button
          onClick={() => onChangeTab('lyrics')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'lyrics'
              ? 'text-amber-400 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BookOpen size={20} className={currentTab === 'lyrics' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-tight">Lyrics</span>
        </button>

        {/* Instrument Studio */}
        <button
          onClick={() => onChangeTab('studio')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'studio'
              ? 'text-amber-400 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Disc3 size={20} className={currentTab === 'studio' ? 'stroke-[2.5] animate-spin-slow' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-tight">Studio</span>
        </button>
      </div>
    </nav>
  );
};
