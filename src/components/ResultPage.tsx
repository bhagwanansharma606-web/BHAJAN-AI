import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Share2,
  Heart,
  Edit3,
  Sliders,
  Volume2,
  VolumeX,
  Languages,
  Check,
  Music2,
  Clock,
  Mic2,
  Disc,
} from 'lucide-react';
import { BhajanSong, LyricSection } from '../types/bhajan';
import { DEITIES } from '../data/deities';
import { indianAudio, PlaybackState } from '../services/indianAudioEngine';

interface ResultPageProps {
  bhajan: BhajanSong;
  onEditLyrics: () => void;
  onRegenerate: () => void;
  onCreateVariation: () => void;
  onSaveToMySongs: (bhajan: BhajanSong) => void;
  isSaved?: boolean;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  bhajan,
  onEditLyrics,
  onRegenerate,
  onCreateVariation,
  onSaveToMySongs,
  isSaved = false,
}) => {
  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 180,
    currentSectionIndex: 0,
    currentLineIndex: 0,
    instrumentMutes: {},
    masterVolume: 0.9,
  });

  const [scriptMode, setScriptMode] = useState<'native' | 'roman' | 'meaning'>('native');
  const [showMixer, setShowMixer] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [savedLocal, setSavedLocal] = useState(isSaved);

  const deityInfo = DEITIES.find((d) => d.id === bhajan.deity) || DEITIES[0];

  useEffect(() => {
    indianAudio.setBhajan(bhajan);
    indianAudio.setOnStateChange((state) => {
      setPlayback(state);
    });

    return () => {
      indianAudio.stop();
    };
  }, [bhajan]);

  const togglePlay = () => {
    indianAudio.togglePlay();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    indianAudio.seek(val);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Download real rendered audio WAV file
  const handleDownloadAudio = async () => {
    try {
      setIsDownloading(true);
      const wavBlob = await indianAudio.renderToWav();
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bhajan.title.replace(/[^a-zA-Z0-9]/g, '_')}_BhajanAI.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download audio error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Native share or clipboard copy
  const handleShare = async () => {
    const shareText = `🌸 *${bhajan.title}* 🌸\nDevotional Bhajan for ${bhajan.deity}\nRaga: ${bhajan.ragaInspiration} | Taal: ${bhajan.taal}\n\n"${bhajan.lyrics[1]?.linesHindi?.[0] || bhajan.openingChant}"\n\nCreated with Bhajan AI – Indian Devotional Song Maker 🪔`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: bhajan.title,
          text: shareText,
        });
        return;
      } catch {}
    }

    navigator.clipboard.writeText(shareText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleSave = () => {
    setSavedLocal(true);
    onSaveToMySongs(bhajan);
  };

  return (
    <div className="space-y-4 pb-28 animate-fade-in max-w-lg mx-auto px-1">
      {/* Devotional Hero Header Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br ${deityInfo.gradient} shadow-2xl border border-amber-400/30`}
      >
        <div className="absolute top-2 right-3 text-5xl opacity-15 select-none font-serif">
          {deityInfo.avatarIcon}
        </div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />

        {/* Deity & Song Type Tag Bar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-black/35 backdrop-blur-md text-amber-200 text-[11px] font-semibold flex items-center gap-1 border border-white/10">
            <span>{deityInfo.avatarIcon}</span>
            <span>{bhajan.deity}</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-black/35 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
            {bhajan.songType}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-black/35 backdrop-blur-md text-amber-300 text-[11px] font-medium border border-white/10">
            {bhajan.mood}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-black/35 backdrop-blur-md text-stone-200 text-[11px] font-medium border border-white/10">
            {bhajan.language}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold tracking-tight font-serif text-white mb-1 drop-shadow-md">
          {bhajan.titleHindi || bhajan.title}
        </h2>
        <p className="text-xs text-amber-100/90 font-sans">{bhajan.title}</p>

        {/* Opening Sacred Chant */}
        <div className="mt-3 pt-2.5 border-t border-white/20 flex items-start gap-2">
          <span className="text-sm">🪔</span>
          <p className="text-[11px] text-amber-100 italic leading-snug font-serif">
            {bhajan.openingChant}
          </p>
        </div>

        {/* Indian Musical Meta (Raga, Taal, BPM) */}
        <div className="mt-3 grid grid-cols-3 gap-2 bg-black/30 backdrop-blur-sm rounded-xl p-2 text-center text-[10px] border border-white/10">
          <div>
            <span className="text-amber-200/70 block">RAGA</span>
            <span className="font-semibold text-white truncate block">{bhajan.ragaInspiration}</span>
          </div>
          <div>
            <span className="text-amber-200/70 block">TAAL</span>
            <span className="font-semibold text-white truncate block">{bhajan.taal}</span>
          </div>
          <div>
            <span className="text-amber-200/70 block">TEMPO</span>
            <span className="font-semibold text-white">{bhajan.tempoBpm} BPM</span>
          </div>
        </div>
      </div>

      {/* Audio Player & Scrubber Card */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl">
        {/* Animated Sound Waveform while playing */}
        <div className="flex items-center justify-center gap-1 h-8 mb-3 px-2">
          {[...Array(24)].map((_, i) => {
            const heights = [20, 45, 80, 60, 30, 90, 70, 40, 65, 85, 35, 75, 50, 95, 40, 60, 80, 50, 70, 30, 65, 90, 40, 20];
            const h = playback.isPlaying ? `${heights[i % heights.length]}%` : '18%';
            return (
              <span
                key={i}
                style={{ height: h }}
                className="w-1 bg-gradient-to-t from-amber-600 to-amber-400 rounded-full transition-all duration-300"
              />
            );
          })}
        </div>

        {/* Time Progress Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={playback.duration || 180}
            step={0.5}
            value={playback.currentTime}
            onChange={handleSeek}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
          />
          <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
            <span>{formatTime(playback.currentTime)}</span>
            <span className="flex items-center gap-1 text-amber-400/90 font-sans">
              <Clock size={11} /> {bhajan.duration}
            </span>
            <span>{formatTime(playback.duration)}</span>
          </div>
        </div>

        {/* Playback Controls Row */}
        <div className="flex items-center justify-between mt-3 pt-2">
          {/* Mixer Toggle */}
          <button
            onClick={() => setShowMixer(!showMixer)}
            title="Instrument Mixer"
            className={`p-2.5 rounded-full border transition-all ${
              showMixer
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-stone-800/80 text-stone-400 border-stone-700/60 hover:text-stone-200'
            }`}
          >
            <Sliders size={18} />
          </button>

          {/* Central Play/Pause Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => indianAudio.seek(0)}
              title="Restart"
              className="p-2.5 rounded-full bg-stone-800 text-stone-300 hover:text-white active:scale-95 transition-all"
            >
              <RotateCcw size={17} />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-red-600 flex items-center justify-center text-white shadow-xl shadow-orange-600/40 border-2 border-amber-300 ring-4 ring-amber-500/25 active:scale-95 transition-all"
            >
              {playback.isPlaying ? (
                <Pause size={24} className="fill-white" />
              ) : (
                <Play size={24} className="fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={handleSave}
              title={savedLocal ? 'Saved to My Songs' : 'Save to My Songs'}
              className={`p-2.5 rounded-full border transition-all active:scale-95 ${
                savedLocal
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
              }`}
            >
              <Heart size={18} className={savedLocal ? 'fill-red-500 text-red-500' : ''} />
            </button>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            title="Share Bhajan"
            className="p-2.5 rounded-full bg-stone-800/80 text-stone-400 hover:text-stone-200 border border-stone-700/60 active:scale-95 transition-all relative"
          >
            {copiedMessage ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
          </button>
        </div>

        {/* Collapsible Multi-Track Instrument Mixer */}
        {showMixer && (
          <div className="mt-3 pt-3 border-t border-stone-800 animate-fade-in bg-stone-950/80 p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Sliders size={13} /> Indian Instrument Channels
              </span>
              <span className="text-[10px] text-stone-400">Tap to mute / solo</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: 'Harmonium', icon: '🎹', label: 'Harmonium' },
                { name: 'Tabla', icon: '🥁', label: 'Tabla & Dholak' },
                { name: 'Tanpura', icon: '🎻', label: 'Tanpura Drone' },
                { name: 'Manjira', icon: '🔔', label: 'Bhakti Manjira' },
                { name: 'Temple Bells', icon: '🔔', label: 'Temple Ghanti' },
                { name: 'Bansuri', icon: '🪈', label: 'Bansuri Flute' },
              ].map((inst) => {
                const isMuted = playback.instrumentMutes[inst.name];
                return (
                  <button
                    key={inst.name}
                    onClick={() => indianAudio.toggleInstrumentMute(inst.name)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] transition-all ${
                      isMuted
                        ? 'bg-stone-900 border-stone-800 text-stone-500'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{inst.icon}</span>
                      <span>{inst.label}</span>
                    </span>
                    {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Toolbar */}
      <div className="grid grid-cols-3 gap-2">
        {/* Edit Lyrics */}
        <button
          onClick={onEditLyrics}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-amber-200 text-xs font-medium active:scale-95 transition-all shadow-md"
        >
          <Edit3 size={15} className="text-amber-400" />
          <span>Edit Lyrics</span>
        </button>

        {/* Create Another Version */}
        <button
          onClick={onCreateVariation}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-amber-600/40 text-amber-300 text-xs font-medium active:scale-95 transition-all shadow-md"
        >
          <Sparkles size={15} className="text-amber-400" />
          <span>New Version</span>
        </button>

        {/* Download Audio */}
        <button
          onClick={handleDownloadAudio}
          disabled={isDownloading}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold active:scale-95 transition-all shadow-md shadow-orange-600/20 disabled:opacity-60"
        >
          <Download size={15} className={isDownloading ? 'animate-bounce' : ''} />
          <span>{isDownloading ? 'Rendering...' : 'Download WAV'}</span>
        </button>
      </div>

      {/* Lyrics Presentation & Real-Time Karaoke Sync */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl">
        {/* Language & Script Toggle Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">📜</span>
            <span className="text-xs font-bold text-amber-200 font-serif">Original Devotional Lyrics</span>
          </div>

          <div className="flex bg-stone-950 p-0.5 rounded-xl border border-stone-800 text-[10px]">
            <button
              onClick={() => setScriptMode('native')}
              className={`px-2 py-1 rounded-lg transition-all ${
                scriptMode === 'native' ? 'bg-amber-600 text-white font-medium' : 'text-stone-400'
              }`}
            >
              हिन्दी / Native
            </button>
            <button
              onClick={() => setScriptMode('roman')}
              className={`px-2 py-1 rounded-lg transition-all ${
                scriptMode === 'roman' ? 'bg-amber-600 text-white font-medium' : 'text-stone-400'
              }`}
            >
              Roman
            </button>
            <button
              onClick={() => setScriptMode('meaning')}
              className={`px-2 py-1 rounded-lg transition-all ${
                scriptMode === 'meaning' ? 'bg-amber-600 text-white font-medium' : 'text-stone-400'
              }`}
            >
              Meaning
            </button>
          </div>
        </div>

        {/* Verse Sections */}
        <div className="mt-3 space-y-4">
          {bhajan.lyrics.map((sec, secIdx) => {
            const isCurrentSection = playback.isPlaying && playback.currentSectionIndex === secIdx;

            return (
              <div
                key={secIdx}
                className={`p-3.5 rounded-2xl transition-all ${
                  isCurrentSection
                    ? 'bg-amber-500/10 border border-amber-500/35 shadow-lg shadow-amber-950/40'
                    : 'bg-stone-950/50 border border-stone-800/80'
                }`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider font-serif ${
                      isCurrentSection ? 'text-amber-300' : 'text-stone-400'
                    }`}
                  >
                    {sec.sectionType}
                  </span>
                  {sec.musicalNote && (
                    <span className="text-[10px] text-amber-400/70 italic flex items-center gap-1">
                      <Music2 size={10} /> {sec.musicalNote}
                    </span>
                  )}
                </div>

                {/* Lines with Karaoke Highlighting */}
                <div className="space-y-1.5 font-serif text-sm">
                  {sec.linesHindi.map((lineHindi, lineIdx) => {
                    const isCurrentLine = isCurrentSection && playback.currentLineIndex === lineIdx;
                    const lineRoman = sec.linesRoman[lineIdx] || '';

                    return (
                      <div
                        key={lineIdx}
                        className={`transition-all duration-300 px-2 py-1 rounded-lg ${
                          isCurrentLine
                            ? 'bg-amber-500/25 text-amber-200 font-bold scale-[1.01] shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'text-stone-200'
                        }`}
                      >
                        {scriptMode === 'native' ? (
                          <p className="leading-relaxed">{lineHindi}</p>
                        ) : scriptMode === 'roman' ? (
                          <p className="font-sans text-xs leading-relaxed">{lineRoman}</p>
                        ) : (
                          <p className="leading-relaxed">{lineHindi}</p>
                        )}
                      </div>
                    );
                  })}

                  {/* English Devotional Meaning */}
                  {scriptMode === 'meaning' && sec.meaningEnglish && (
                    <p className="text-[11px] text-stone-400 font-sans italic pt-1.5 mt-1 border-t border-stone-800">
                      "{sec.meaningEnglish}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Singing Style & Arrangement Guide */}
      <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-3.5 text-xs text-stone-400 space-y-1.5">
        <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
          <Mic2 size={13} />
          <span>Vocal Expression & Ornamentation</span>
        </div>
        <p className="leading-relaxed">{bhajan.singingStyle}</p>
      </div>

      {/* Toast Notification */}
      {copiedMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-stone-900 border border-emerald-500/40 text-emerald-300 text-xs font-medium rounded-full shadow-2xl flex items-center gap-1.5 animate-bounce">
          <Check size={14} /> Bhajan lyrics & blessings copied to clipboard!
        </div>
      )}
    </div>
  );
};
