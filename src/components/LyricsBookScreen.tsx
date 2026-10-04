import React, { useState } from 'react';
import { BookOpen, Search, Copy, Check, Sparkles, Filter } from 'lucide-react';
import { BhajanSong, DeityName } from '../types/bhajan';
import { DEITIES } from '../data/deities';

interface LyricsBookScreenProps {
  songs: BhajanSong[];
  onSelectBhajan: (bhajan: BhajanSong) => void;
}

export const LyricsBookScreen: React.FC<LyricsBookScreenProps> = ({
  songs,
  onSelectBhajan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeity, setSelectedDeity] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSongs = songs.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.titleHindi && s.titleHindi.includes(searchTerm)) ||
      s.lyrics.some((sec) =>
        sec.linesHindi.some((l) => l.includes(searchTerm))
      );
    const matchesDeity = selectedDeity === 'All' || s.deity === selectedDeity;
    return matchesSearch && matchesDeity;
  });

  const handleCopy = (song: BhajanSong) => {
    const fullText = `🌸 ${song.titleHindi || song.title} 🌸\nDeity: ${song.deity} | Raga: ${song.ragaInspiration}\n\n${song.lyrics
      .map(
        (sec) =>
          `[${sec.sectionType}]\n` + sec.linesHindi.join('\n')
      )
      .join('\n\n')}\n\n- Composed with Bhajan AI 🪔`;

    navigator.clipboard.writeText(fullText);
    setCopiedId(song.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-4 pb-28 animate-fade-in max-w-lg mx-auto px-1">
      {/* Header */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h2 className="text-base font-bold text-amber-100 font-serif">Devotional Lyrics Book</h2>
              <p className="text-[11px] text-stone-400">Pavitra Bhajan Sahitya & Mantras</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-mono">
            {filteredSongs.length} items
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lyrics, deity or words..."
            className="w-full text-xs bg-stone-950 border border-stone-800 rounded-2xl pl-9 pr-3.5 py-2.5 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Deity Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pt-2.5 scrollbar-none">
          <button
            onClick={() => setSelectedDeity('All')}
            className={`px-2.5 py-1 rounded-xl text-[11px] whitespace-nowrap transition-all ${
              selectedDeity === 'All'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            All Deities
          </button>
          {DEITIES.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeity(d.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] whitespace-nowrap flex items-center gap-1 transition-all ${
                selectedDeity === d.id
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <span>{d.avatarIcon}</span>
              <span>{d.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lyrics Cards */}
      <div className="space-y-3">
        {filteredSongs.map((song) => (
          <div
            key={song.id}
            className="bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 rounded-3xl p-4 shadow-lg space-y-3 transition-all"
          >
            <div className="flex items-start justify-between gap-2 border-b border-stone-800/80 pb-2.5">
              <div>
                <h4 className="text-sm font-bold text-amber-200 font-serif">
                  {song.titleHindi || song.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                  <span className="text-amber-400 font-medium">{song.deity}</span>
                  <span>•</span>
                  <span>{song.language}</span>
                  <span>•</span>
                  <span>{song.songType}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(song)}
                  title="Copy full lyrics"
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 active:scale-95 transition-all"
                >
                  {copiedId === song.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => onSelectBhajan(song)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-serif font-bold active:scale-95 transition-all shadow-md"
                >
                  Play
                </button>
              </div>
            </div>

            {/* Snippet preview: Mukhda & Antara */}
            <div className="space-y-2 font-serif text-xs text-stone-200 bg-stone-950/60 p-3 rounded-2xl border border-stone-800/60">
              <span className="text-[10px] uppercase font-bold text-amber-400/90 block">
                {song.lyrics[1]?.sectionType || 'Mukhda'}
              </span>
              <div className="space-y-1">
                {song.lyrics[1]?.linesHindi.slice(0, 3).map((l, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {l}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
