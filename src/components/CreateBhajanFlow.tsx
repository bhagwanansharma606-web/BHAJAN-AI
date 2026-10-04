import React, { useState } from 'react';
import {
  Sparkles,
  Music,
  Flame,
  Globe,
  Radio,
  Clock,
  User,
  Heart,
  Lightbulb,
  Check,
  ChevronRight,
} from 'lucide-react';
import {
  DeityName,
  DurationOption,
  MoodType,
  SingerType,
  SongType,
  SupportedLanguage,
} from '../types/bhajan';
import {
  DEITIES,
  DURATIONS,
  MOODS,
  SINGERS,
  SONG_TYPES,
  SUPPORTED_LANGUAGES,
} from '../data/deities';
import { GenerationParams } from '../services/bhajanGenerator';

interface CreateBhajanFlowProps {
  onGenerate: (params: GenerationParams) => void;
  initialDeity?: DeityName;
}

export const CreateBhajanFlow: React.FC<CreateBhajanFlowProps> = ({
  onGenerate,
  initialDeity = 'Maa Durga',
}) => {
  const [selectedDeity, setSelectedDeity] = useState<DeityName>(initialDeity);
  const [topic, setTopic] = useState('Jai Mata Di');
  const [language, setLanguage] = useState<SupportedLanguage>('Hindi');
  const [songType, setSongType] = useState<SongType>('Traditional Bhajan');
  const [mood, setMood] = useState<MoodType>('Peaceful');
  const [singer, setSinger] = useState<SingerType>('Male');
  const [duration, setDuration] = useState<DurationOption>('3 minutes');
  const [customInspiration, setCustomInspiration] = useState('');

  const currentDeityInfo = DEITIES.find((d) => d.id === selectedDeity) || DEITIES[0];

  const handleDeityChange = (deity: DeityName) => {
    setSelectedDeity(deity);
    const dInfo = DEITIES.find((d) => d.id === deity);
    if (dInfo) {
      if (dInfo.suggestedTopics.length > 0) {
        setTopic(dInfo.suggestedTopics[0]);
      }
      if (dInfo.customLineExamples.length > 0) {
        setCustomInspiration(dInfo.customLineExamples[0]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      deity: selectedDeity,
      topic: topic.trim() || 'Bhakti',
      language,
      songType,
      mood,
      singer,
      duration,
      customInspiration: customInspiration.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-28 animate-fade-in max-w-lg mx-auto px-1">
      {/* 1. Deity Selection Carousel */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🔱</span>
            <label className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif">
              1. Select Deity / God (इष्ट देव)
            </label>
          </div>
          <span className="text-[10px] text-amber-400/80 font-medium">
            {currentDeityInfo.hindiName}
          </span>
        </div>

        {/* Horizontal Scrolling Deities */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
          {DEITIES.map((deity) => {
            const isSelected = selectedDeity === deity.id;
            return (
              <button
                type="button"
                key={deity.id}
                onClick={() => handleDeityChange(deity.id)}
                className={`snap-start flex-shrink-0 w-24 p-2.5 rounded-2xl flex flex-col items-center text-center transition-all transform active:scale-95 border ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-600/30 to-red-600/30 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-950/60 scale-[1.03]'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-300'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-1.5 shadow-md bg-gradient-to-tr ${deity.gradient}`}
                >
                  <span>{deity.avatarIcon}</span>
                </div>
                <span className="text-xs font-bold font-serif leading-tight truncate w-full text-amber-100">
                  {deity.name}
                </span>
                <span className="text-[9px] text-stone-400 truncate w-full mt-0.5">
                  {deity.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Deity Sacred Mantra Banner */}
        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-[11px] text-amber-200/90 font-serif">
          <span className="text-sm">🪔</span>
          <p className="truncate italic">{currentDeityInfo.mantra}</p>
        </div>
      </div>

      {/* 2. Song Topic & Preset Chips */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🕉️</span>
            <label className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif">
              2. Song Topic (भजन विषय)
            </label>
          </div>
          <span className="text-[10px] text-stone-400">Choose or type custom</span>
        </div>

        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Jai Mata Di, Mahadev, Navratri..."
          className="w-full text-sm bg-stone-950 border border-stone-700/80 rounded-2xl px-3.5 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-all font-sans"
        />

        {/* Suggested Topic Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {currentDeityInfo.suggestedTopics.map((sTopic) => (
            <button
              type="button"
              key={sTopic}
              onClick={() => setTopic(sTopic)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                topic === sTopic
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60'
              }`}
            >
              {sTopic}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Custom Line / Lyrics Inspiration (Prompt feature requested) */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base">✍️</span>
            <label className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif">
              Custom Inspiration Line (ऐच्छिक पंक्ति)
            </label>
          </div>
          <span className="text-[10px] text-amber-400/90 font-medium">Optional</span>
        </div>

        <p className="text-[11px] text-stone-400 leading-snug">
          Type your favorite thought or line (e.g. "Lal lal lal Maiya ki chunri hai lal"). The AI will weave it into a fresh, original bhajan.
        </p>

        <input
          type="text"
          value={customInspiration}
          onChange={(e) => setCustomInspiration(e.target.value)}
          placeholder="Type your inspired line or idea..."
          className="w-full text-sm bg-stone-950 border border-stone-700/80 rounded-2xl px-3.5 py-2.5 text-amber-200 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-all font-serif"
        />

        {/* Example Invocations */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] text-stone-500 flex items-center gap-1">
            <Lightbulb size={11} className="text-amber-400" /> Tap inspired lines:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentDeityInfo.customLineExamples.map((ex, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setCustomInspiration(ex)}
                className="text-[11px] text-left px-2.5 py-1 rounded-xl bg-stone-950/80 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/40 transition-all truncate max-w-full"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Language Selection (All 9 Languages Supported) */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base">🌐</span>
          <label className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif">
            3. Devotional Language (भाषा)
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.id;
            return (
              <button
                type="button"
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md font-semibold'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <span className="text-xs block font-serif truncate">{lang.id}</span>
                <span className="text-[10px] text-stone-500 truncate block mt-0.5">
                  {lang.nativeExample}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Song Type (All 10 Traditional Indian Styles) */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base">🎵</span>
          <label className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif">
            4. Song Type / Style (शैली)
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SONG_TYPES.map((type) => {
            const isSelected = songType === type.id;
            return (
              <button
                type="button"
                key={type.id}
                onClick={() => setSongType(type.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{type.icon}</span>
                  <span className="text-xs font-bold font-serif leading-tight">{type.label}</span>
                </div>
                <p className="text-[10px] text-stone-400 leading-snug line-clamp-2">{type.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Mood & Rasa Selection */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base">🕊️</span>
          <label className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif">
            5. Devotional Mood (भाव व रस)
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MOODS.map((m) => {
            const isSelected = mood === m.id;
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-600/30 to-red-600/30 border-amber-400 text-amber-200 font-bold shadow-md'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span className="text-xl block mb-1">{m.icon}</span>
                <span className="text-xs block font-serif">{m.label.split(' ')[0]}</span>
                <span className="text-[9px] text-stone-500 block">{m.hindi}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Singer & Duration */}
      <div className="grid grid-cols-2 gap-3">
        {/* Singer */}
        <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-2">
          <label className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif block">
            6. Singer (गायक)
          </label>
          <div className="space-y-1.5">
            {SINGERS.map((s) => {
              const isSelected = singer === s.id;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSinger(s.id as SingerType)}
                  className={`w-full p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-medium'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400'
                  }`}
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="text-xs font-serif">{s.label.split(' ')[0]} Voice</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-2">
          <label className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif block">
            7. Duration (अवधि)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {DURATIONS.map((d) => {
              const isSelected = duration === d.id;
              return (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => setDuration(d.id as DurationOption)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-400 text-amber-100 font-bold'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400'
                  }`}
                >
                  <span className="text-xs block font-bold">{d.label}</span>
                  <span className="text-[9px] text-stone-500 block">{d.desc.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prominent Large "Create Bhajan" CTA Button */}
      <div className="pt-2 sticky bottom-20 z-20">
        <button
          type="submit"
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:via-orange-500 hover:to-red-500 text-white font-serif font-extrabold text-lg shadow-2xl shadow-orange-600/50 border border-amber-300 ring-4 ring-amber-500/30 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all group"
        >
          <span className="text-2xl animate-bounce">🪔</span>
          <span>Create Bhajan (भजन बनाएं)</span>
          <Sparkles size={20} className="text-amber-200 group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </form>
  );
};
