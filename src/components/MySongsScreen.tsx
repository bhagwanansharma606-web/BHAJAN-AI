import React, { useState } from 'react';
import {
  Play,
  Pause,
  Download,
  Trash2,
  Heart,
  Music,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';
import { BhajanSong } from '../types/bhajan';
import { DEITIES } from '../data/deities';
import { indianAudio } from '../services/indianAudioEngine';

interface MySongsScreenProps {
  songs: BhajanSong[];
  onSelectSong: (song: BhajanSong) => void;
  onDeleteSong: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStartCreate: () => void;
}

export const MySongsScreen: React.FC<MySongsScreenProps> = ({
  songs,
  onSelectSong,
  onDeleteSong,
  onToggleFavorite,
  onStartCreate,
}) => {
  const [filterFav, setFilterFav] = useState(false);

  const displayedSongs = filterFav ? songs.filter((s) => s.isFavorite) : songs;

  return (
    <div className="space-y-4 pb-28 animate-fade-in max-w-lg mx-auto px-1">
      {/* Header Bar */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-amber-100 font-serif flex items-center gap-1.5">
            <span>🎵</span> My Bhajan Library ({songs.length})
          </h2>
          <p className="text-[11px] text-stone-400">Your created & saved devotional songs</p>
        </div>

        <button
          onClick={() => setFilterFav(!filterFav)}
          className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all ${
            filterFav
              ? 'bg-red-500/20 border-red-500/40 text-red-400 font-bold'
              : 'bg-stone-800 border-stone-700 text-stone-400'
          }`}
        >
          <Heart size={14} className={filterFav ? 'fill-red-500 text-red-500' : ''} />
          <span>Favorites</span>
        </button>
      </div>

      {/* Empty State */}
      {displayedSongs.length === 0 ? (
        <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-3xl mx-auto text-amber-400">
            🪔
          </div>
          <h3 className="text-base font-bold text-amber-200 font-serif">
            {filterFav ? 'No favorite bhajans yet' : 'No saved bhajans yet'}
          </h3>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            Compose your first original bhajan with Indian classical instruments and devotional vocals.
          </p>
          <button
            onClick={onStartCreate}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-red-600 text-white text-xs font-bold font-serif shadow-lg active:scale-95 transition-all"
          >
            Create Bhajan Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedSongs.map((song) => {
            const deity = DEITIES.find((d) => d.id === song.deity) || DEITIES[0];

            return (
              <div
                key={song.id}
                className="bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 rounded-3xl p-4 shadow-lg flex items-center justify-between gap-3 group transition-all"
              >
                {/* Play Thumbnail */}
                <button
                  onClick={() => onSelectSong(song)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0 bg-gradient-to-tr ${deity.gradient} group-hover:scale-105 active:scale-95 transition-transform`}
                >
                  <Play size={20} className="fill-white ml-0.5" />
                </button>

                {/* Info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSelectSong(song)}
                >
                  <h4 className="text-xs font-bold text-amber-100 font-serif truncate">
                    {song.titleHindi || song.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                    <span className="text-amber-400 font-medium">{song.deity}</span>
                    <span>•</span>
                    <span>{song.songType}</span>
                    <span>•</span>
                    <span className="font-mono">{song.duration}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 italic truncate mt-1">
                    "{song.lyrics[1]?.linesHindi[0] || song.openingChant}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onToggleFavorite(song.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-red-400 transition-colors"
                  >
                    <Heart
                      size={15}
                      className={song.isFavorite ? 'fill-red-500 text-red-500' : ''}
                    />
                  </button>

                  <button
                    onClick={() => onDeleteSong(song.id)}
                    className="p-2 rounded-xl text-stone-500 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
