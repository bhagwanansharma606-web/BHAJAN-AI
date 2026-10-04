import React from 'react';
import { Sparkles, Music, Mic2, Disc3, Sliders, CheckCircle2 } from 'lucide-react';
import { DeityName } from '../types/bhajan';

interface GenerationModalProps {
  isOpen: boolean;
  currentStep: number;
  stepTitle: string;
  stepSubtitle: string;
  deity: DeityName;
}

const STEPS = [
  { step: 1, title: 'Generating Lyrics', icon: '📜', desc: 'Composing original Mukhda & Antaras' },
  { step: 2, title: 'Creating Melody', icon: '🎵', desc: 'Crafting Raga swaras & melodic contour' },
  { step: 3, title: 'Arranging Indian Instruments', icon: '🪘', desc: 'Harmonium, Tabla, Tanpura & Manjira' },
  { step: 4, title: 'Generating Vocals', icon: '🎙️', desc: 'Infusing devotional voice & bhava' },
  { step: 5, title: 'Mixing Song', icon: '🎛️', desc: 'Balancing instruments & temple acoustics' },
  { step: 6, title: 'Final Bhajan Ready', icon: '✨', desc: 'Blessings manifest — ready to play' },
];

export const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  currentStep,
  stepTitle,
  stepSubtitle,
  deity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-amber-950/80 text-center relative overflow-hidden">
        {/* Sacred Aura Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Central Spinning Sacred Mandala / Diya */}
        <div className="relative mx-auto mb-5 w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/50 animate-spin-slow" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-orange-600 to-red-600 flex items-center justify-center text-3xl shadow-xl shadow-amber-600/30 ring-4 ring-amber-400/30 animate-pulse">
            {STEPS[currentStep - 1]?.icon || '🪔'}
          </div>
        </div>

        {/* Current Step Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>STEP {currentStep} OF 6</span>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl font-bold text-amber-100 font-serif mb-1">
          {stepTitle || STEPS[currentStep - 1]?.title}
        </h3>
        <p className="text-xs text-stone-300 mb-6 px-2 leading-relaxed">
          {stepSubtitle || STEPS[currentStep - 1]?.desc}
        </p>

        {/* Step-by-Step Progress List */}
        <div className="space-y-2 text-left mb-6 bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800">
          {STEPS.map((s) => {
            const isDone = s.step < currentStep;
            const isCurrent = s.step === currentStep;

            return (
              <div
                key={s.step}
                className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-amber-500/20 text-amber-200 font-medium border border-amber-500/30'
                    : isDone
                    ? 'text-stone-400 line-through decoration-amber-500/40'
                    : 'text-stone-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{s.icon}</span>
                  <span>
                    STEP {s.step}: {s.title}
                  </span>
                </div>
                {isDone ? (
                  <CheckCircle2 size={14} className="text-amber-400" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
                )}
              </div>
            );
          })}
        </div>

        {/* Spiritual Mantra Footer */}
        <div className="pt-2 border-t border-stone-800/80">
          <p className="text-[11px] text-amber-400/90 font-serif italic">
            "समर्पण ही भक्ति है, स्वर ही साधना है..."
          </p>
          <p className="text-[9px] text-stone-500 mt-0.5">Creating sacred bhajan for {deity}</p>
        </div>
      </div>
    </div>
  );
};
