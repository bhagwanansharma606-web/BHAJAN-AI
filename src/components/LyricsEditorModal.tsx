import React, { useState } from 'react';
import { X, RefreshCw, Plus, Check, Sparkles, BookOpen, Trash2 } from 'lucide-react';
import { BhajanSong, LyricSection, MoodType, SongType, SupportedLanguage } from '../types/bhajan';
import { MOODS, SONG_TYPES, SUPPORTED_LANGUAGES } from '../data/deities';

interface LyricsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  bhajan: BhajanSong;
  onSave: (updatedBhajan: BhajanSong) => void;
  onRegenerateAllLyrics: () => void;
}

export const LyricsEditorModal: React.FC<LyricsEditorModalProps> = ({
  isOpen,
  onClose,
  bhajan,
  onSave,
  onRegenerateAllLyrics,
}) => {
  if (!isOpen) return null;

  const [sections, setSections] = useState<LyricSection[]>(JSON.stringify(bhajan.lyrics) ? JSON.parse(JSON.stringify(bhajan.lyrics)) : []);
  const [language, setLanguage] = useState<SupportedLanguage>(bhajan.language);
  const [mood, setMood] = useState<MoodType>(bhajan.mood);
  const [songType, setSongType] = useState<SongType>(bhajan.songType);
  const [isRegeneratingLine, setIsRegeneratingLine] = useState<string | null>(null);
  const [newLineText, setNewLineText] = useState('');
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(1); // default to Mukhda

  // Update line text
  const handleLineChange = (secIdx: number, lineIdx: number, val: string) => {
    const updated = [...sections];
    updated[secIdx].linesHindi[lineIdx] = val;
    setSections(updated);
  };

  // Delete line
  const handleDeleteLine = (secIdx: number, lineIdx: number) => {
    const updated = [...sections];
    updated[secIdx].linesHindi.splice(lineIdx, 1);
    setSections(updated);
  };

  // Add custom line
  const handleAddCustomLine = () => {
    if (!newLineText.trim()) return;
    const updated = [...sections];
    if (updated[selectedSectionIdx]) {
      updated[selectedSectionIdx].linesHindi.push(newLineText.trim());
      setSections(updated);
      setNewLineText('');
    }
  };

  // Regenerate single line with AI
  const handleRegenerateLine = async (secIdx: number, lineIdx: number) => {
    const currentLine = sections[secIdx].linesHindi[lineIdx];
    const lineKey = `${secIdx}_${lineIdx}`;
    setIsRegeneratingLine(lineKey);

    try {
      const res = await fetch('/api/regenerate-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deity: bhajan.deity,
          language,
          mood,
          currentLine,
          context: sections[secIdx].sectionType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.variations && data.variations.length > 0) {
          const updated = [...sections];
          updated[secIdx].linesHindi[lineIdx] = data.variations[0].native || currentLine;
          setSections(updated);
        }
      }
    } catch {
      // Local devotional alternative generator
      const alternatives = [
        `चरणों में तेरे शीश झुकाएं, जय ${bhajan.deity} दया निधान`,
        `मन मंदिर में ज्योति जलाए, कृपा करो हे पालनहार`,
        `तेरी महिमा अपरंपार, भक्ति रस बरसे अपार`,
      ];
      const updated = [...sections];
      updated[secIdx].linesHindi[lineIdx] = alternatives[Math.floor(Math.random() * alternatives.length)];
      setSections(updated);
    } finally {
      setIsRegeneratingLine(null);
    }
  };

  const handleSaveAndApply = () => {
    const updated: BhajanSong = {
      ...bhajan,
      language,
      mood,
      songType,
      lyrics: sections,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-stone-900 border border-amber-600/40 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <div>
              <h3 className="text-base font-bold text-amber-100 font-serif">Devotional Lyrics Editor</h3>
              <p className="text-[11px] text-stone-400">Edit, add lines, or regenerate with AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {/* Quick Adjustments: Language / Mood / Song Type */}
          <div className="bg-stone-950/70 p-3 rounded-2xl border border-stone-800 space-y-2.5">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
              Song Attributes
            </span>
            <div className="grid grid-cols-3 gap-2">
              {/* Language */}
              <div>
                <label className="text-[10px] text-stone-400 block mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full text-xs bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mood */}
              <div>
                <label className="text-[10px] text-stone-400 block mb-1">Mood</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as MoodType)}
                  className="w-full text-xs bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  {MOODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Song Type */}
              <div>
                <label className="text-[10px] text-stone-400 block mb-1">Type</label>
                <select
                  value={songType}
                  onChange={(e) => setSongType(e.target.value as SongType)}
                  className="w-full text-xs bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  {SONG_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Add Custom Line Input */}
          <div className="bg-stone-950/70 p-3 rounded-2xl border border-stone-800">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-1.5">
              Add Custom Line
            </span>
            <div className="flex gap-2">
              <select
                value={selectedSectionIdx}
                onChange={(e) => setSelectedSectionIdx(Number(e.target.value))}
                className="text-xs bg-stone-900 border border-stone-700 rounded-xl px-2 py-1.5 text-stone-200 focus:outline-none"
              >
                {sections.map((sec, i) => (
                  <option key={i} value={i}>
                    {sec.sectionType}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newLineText}
                onChange={(e) => setNewLineText(e.target.value)}
                placeholder="Type custom devotion line..."
                className="flex-1 text-xs bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddCustomLine}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Section by Section Lyrics Editor */}
          <div className="space-y-3">
            {sections.map((section, secIdx) => (
              <div key={secIdx} className="bg-stone-950/60 p-3 rounded-2xl border border-stone-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-300 font-serif">
                    {section.sectionType}
                  </span>
                  <span className="text-[10px] text-stone-500">{section.linesHindi.length} lines</span>
                </div>

                <div className="space-y-2">
                  {section.linesHindi.map((line, lineIdx) => {
                    const lineKey = `${secIdx}_${lineIdx}`;
                    const isBusy = isRegeneratingLine === lineKey;

                    return (
                      <div key={lineIdx} className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-500 w-4">{lineIdx + 1}.</span>
                        <input
                          type="text"
                          value={line}
                          onChange={(e) => handleLineChange(secIdx, lineIdx, e.target.value)}
                          className="flex-1 text-xs bg-stone-900/90 border border-stone-700/80 rounded-xl px-2.5 py-1.5 text-amber-50 focus:border-amber-400 focus:outline-none"
                        />

                        {/* Regenerate Line Button */}
                        <button
                          onClick={() => handleRegenerateLine(secIdx, lineIdx)}
                          disabled={isBusy}
                          title="Regenerate this line with AI"
                          className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-lg active:scale-95 transition-all disabled:opacity-50"
                        >
                          <RefreshCw size={13} className={isBusy ? 'animate-spin' : ''} />
                        </button>

                        {/* Delete Line */}
                        <button
                          onClick={() => handleDeleteLine(secIdx, lineIdx)}
                          title="Delete line"
                          className="p-1.5 bg-stone-800/80 hover:bg-red-900/50 text-stone-400 hover:text-red-400 rounded-lg active:scale-95 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
          <button
            onClick={onRegenerateAllLyrics}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium active:scale-95 transition-all"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>Regenerate All</span>
          </button>

          <button
            onClick={handleSaveAndApply}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 active:scale-95 transition-all"
          >
            <Check size={15} />
            <span>Save & Update Song</span>
          </button>
        </div>
      </div>
    </div>
  );
};
