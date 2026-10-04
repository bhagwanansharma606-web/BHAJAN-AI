import React from 'react';
import {
  Sparkles,
  Play,
  ArrowRight,
  Flame,
  Music,
  Heart,
  BookOpen,
  Disc3,
  Clock,
  Layers,
} from 'lucide-react';
import { BhajanSong, DeityName, SongType } from '../types/bhajan';
import { DEITIES, SONG_TYPES } from '../data/deities';
import { BHAJAN_TEMPLATES } from '../data/templates';

interface HomeScreenProps {
  onStartCreate: (deity?: DeityName) => void;
  onSelectBhajan: (bhajan: BhajanSong) => void;
  onOpenStudio: () => void;
  savedSongs: BhajanSong[];
  onOpenDarshan: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartCreate,
  onSelectBhajan,
  onOpenStudio,
  savedSongs,
  onOpenDarshan,
}) => {
  return (
    <div className="space-y-6 pb-28 animate-fade-in max-w-lg mx-auto px-1">
      {/* 1. Daily Darshan & Temple Blessing Banner */}
      <div
        onClick={onOpenDarshan}
        className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-r from-amber-900/60 via-orange-950/70 to-red-950/60 border border-amber-500/35 shadow-xl cursor-pointer hover:border-amber-400/50 transition-all group"
      >
        <div className="absolute top-1 right-2 text-4xl opacity-20 font-serif">🕉️</div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center text-2xl shadow-lg ring-2 ring-amber-400/30 group-hover:scale-105 transition-transform">
            🪔
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                DAILY PRABHAT DARSHAN
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-amber-100 font-serif truncate">
              "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता..."
            </h3>
            <p className="text-[11px] text-stone-300">Tap to ring the temple bell & receive blessings</p>
          </div>
        </div>
      </div>

      {/* 2. Hero: "Create New Bhajan" Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-amber-700 via-orange-600 to-red-700 text-white shadow-2xl border-2 border-amber-300/40">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-amber-200 text-xs font-semibold border border-white/15">
            <Sparkles size={13} className="text-amber-300" />
            <span>AI Devotional Composer</span>
          </div>

          <h2 className="text-2xl font-bold font-serif leading-tight drop-shadow-md">
            Create Original Indian Devotional Bhajans
          </h2>

          <p className="text-xs text-amber-100/90 leading-relaxed font-sans max-w-sm">
            Generate authentic lyrics in 9 languages, classical Ragas, Indian instruments (Harmonium, Tabla, Tanpura) & devotional singing.
          </p>

          <button
            onClick={() => onStartCreate()}
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-amber-50 text-stone-950 font-serif font-bold text-sm shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all"
          >
            <span className="text-lg">🪔</span>
            <span>Create New Bhajan (नया भजन बनाएं)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 3. Quick Deity Shortcuts */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif flex items-center gap-1.5">
            <span>🔱</span> Deities & Divine Forms
          </h3>
          <span className="text-[10px] text-stone-400">Tap to compose</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {DEITIES.slice(0, 10).map((d) => (
            <button
              key={d.id}
              onClick={() => onStartCreate(d.id)}
              className="flex flex-col items-center p-2 rounded-2xl bg-stone-900/90 border border-stone-800/80 hover:border-amber-500/40 active:scale-95 transition-all text-center group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 shadow-md bg-gradient-to-tr ${d.gradient} group-hover:scale-110 transition-transform`}
              >
                <span>{d.avatarIcon}</span>
              </div>
              <span className="text-[10px] font-bold text-stone-200 font-serif truncate w-full">
                {d.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Quick Templates Carousel (Requested by User) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif flex items-center gap-1.5">
            <span>✨</span> Popular Bhajan Templates
          </h3>
          <span className="text-[10px] text-amber-400/90 font-medium">Ready to play</span>
        </div>

        <div className="space-y-2.5">
          {BHAJAN_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => onSelectBhajan(tpl)}
              className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Play size={18} className="fill-white ml-0.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-amber-100 font-serif truncate">
                    {tpl.titleHindi || tpl.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
                    <span className="text-amber-400/90 font-medium">{tpl.deity}</span>
                    <span>•</span>
                    <span>{tpl.songType}</span>
                    <span>•</span>
                    <span>{tpl.ragaInspiration.split(' ')[1]}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                  {tpl.duration}
                </span>
                <ArrowRight size={15} className="text-stone-500 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Popular Devotional Song Styles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif flex items-center gap-1.5">
            <span>🎵</span> Popular Bhajan Styles
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SONG_TYPES.slice(0, 6).map((st) => (
            <button
              key={st.id}
              onClick={() => onStartCreate()}
              className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl group-hover:scale-110 transition-transform">{st.icon}</span>
                <span className="text-xs font-bold text-amber-100 font-serif leading-tight">
                  {st.label}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 line-clamp-1">{st.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Interactive Instrument Studio Banner */}
      <div
        onClick={onOpenStudio}
        className="p-4 rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-400/50 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-2xl shadow-lg">
            🪘
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-200 font-serif">Interactive Instrument Studio</h4>
            <p className="text-[10px] text-stone-400">Play Tabla, Harmonium, Ghanti & Tanpura live</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* 7. Recently Created / Saved Songs Shortcut */}
      {savedSongs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif flex items-center gap-1.5">
              <span>❤️</span> My Saved Bhajans
            </h3>
            <span className="text-[10px] text-stone-400">{savedSongs.length} songs</span>
          </div>

          <div className="space-y-2">
            {savedSongs.slice(0, 3).map((song) => (
              <div
                key={song.id}
                onClick={() => onSelectBhajan(song)}
                className="p-3 rounded-2xl bg-stone-900/90 border border-stone-800 flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base">🪔</span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-amber-100 font-serif truncate">
                      {song.titleHindi || song.title}
                    </p>
                    <p className="text-[10px] text-stone-400">{song.deity} • {song.language}</p>
                  </div>
                </div>
                <Play size={14} className="text-amber-400 fill-amber-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
