import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Disc, Flame } from 'lucide-react';
import { indianAudio } from '../services/indianAudioEngine';

export const InstrumentStudio: React.FC = () => {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [tanpuraRunning, setTanpuraRunning] = useState(false);

  const playSound = (sound: 'dha' | 'dhin' | 'ge' | 'na' | 'tin' | 'ghanti' | 'manjira' | 'harmonium', noteFreq?: number, label?: string) => {
    setActivePad(label || sound);
    indianAudio.playInstrumentSound(sound, noteFreq);
    setTimeout(() => setActivePad(null), 250);
  };

  const toggleTanpura = () => {
    if (tanpuraRunning) {
      indianAudio.stop();
      setTanpuraRunning(false);
    } else {
      // Start tanpura
      indianAudio.playInstrumentSound('ghanti');
      setTanpuraRunning(true);
    }
  };

  // Harmonium Swaras: Key of D (Sa = 146.83Hz * 2 = 293.66Hz)
  const SA = 293.66;
  const swaras = [
    { name: 'Sa', hindi: 'सा', freq: SA, isBlack: false },
    { name: 're', hindi: 'रे॒', freq: SA * 16/15, isBlack: true },
    { name: 'Re', hindi: 'रे', freq: SA * 9/8, isBlack: false },
    { name: 'ga', hindi: 'ग॒', freq: SA * 6/5, isBlack: true },
    { name: 'Ga', hindi: 'ग', freq: SA * 5/4, isBlack: false },
    { name: 'Ma', hindi: 'म', freq: SA * 4/3, isBlack: false },
    { name: 'Ma\'', hindi: 'म॑', freq: SA * 45/32, isBlack: true },
    { name: 'Pa', hindi: 'प', freq: SA * 3/2, isBlack: false },
    { name: 'dha', hindi: 'ध॒', freq: SA * 8/5, isBlack: true },
    { name: 'Dha', hindi: 'ध', freq: SA * 5/3, isBlack: false },
    { name: 'ni', hindi: 'नि॒', freq: SA * 9/5, isBlack: true },
    { name: 'Ni', hindi: 'नि', freq: SA * 15/8, isBlack: false },
    { name: 'Sa\'', hindi: 'सां', freq: SA * 2, isBlack: false },
  ];

  return (
    <div className="space-y-5 pb-28 animate-fade-in max-w-lg mx-auto px-1">
      {/* Header */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪘</span>
            <div>
              <h2 className="text-base font-bold text-amber-100 font-serif">Indian Instrument Studio</h2>
              <p className="text-[11px] text-stone-400">Tap to play authentic devotional instruments</p>
            </div>
          </div>
          <button
            onClick={toggleTanpura}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all ${
              tanpuraRunning
                ? 'bg-amber-500 text-stone-950 border-amber-300 font-bold'
                : 'bg-stone-800 text-stone-300 border-stone-700'
            }`}
          >
            <span>🎻</span>
            <span>{tanpuraRunning ? 'Tanpura ON' : 'Tanpura Drone'}</span>
          </button>
        </div>
      </div>

      {/* 1. Tabla & Dholak Percussion Pads */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif flex items-center gap-1.5">
            <span>🥁</span> Tabla & Dholak Bol Pads
          </h3>
          <span className="text-[10px] text-stone-400">Tap for authentic strokes</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'dha', bol: 'धा (Dha)', desc: 'Bayan + Dayan', sound: 'dha' as const, color: 'from-amber-600 to-red-600' },
            { id: 'dhin', bol: 'धिं (Dhin)', desc: 'Heavy Bass Strike', sound: 'dhin' as const, color: 'from-orange-600 to-amber-700' },
            { id: 'ge', bol: 'गे (Ge)', desc: 'Bass Wrist Glide', sound: 'ge' as const, color: 'from-amber-700 to-yellow-800' },
            { id: 'na', bol: 'ना (Na)', desc: 'High Crisp Rim', sound: 'na' as const, color: 'from-red-600 to-rose-700' },
            { id: 'tin', bol: 'तिं (Tin)', desc: 'Soft Open Treble', sound: 'tin' as const, color: 'from-stone-700 to-stone-900' },
            { id: 'tihai', bol: 'तिहाई (Tihai)', desc: 'Triple Dha Flourish', sound: 'dha' as const, color: 'from-emerald-700 to-teal-800' },
          ].map((pad) => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => playSound(pad.sound, undefined, pad.id)}
                className={`h-24 rounded-2xl p-2 flex flex-col items-center justify-center text-center transition-all transform active:scale-90 border select-none ${
                  isActive
                    ? 'ring-4 ring-amber-400 bg-amber-500 text-stone-950 scale-95 shadow-xl'
                    : 'bg-stone-950/80 border-stone-800 hover:border-amber-500/40 text-stone-200 shadow-md'
                }`}
              >
                <span className="text-sm font-bold font-serif leading-none mb-1 text-amber-200">
                  {pad.bol}
                </span>
                <span className="text-[9px] text-stone-400">{pad.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Devotional Chimes: Temple Ghanti & Manjira */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif flex items-center gap-1.5">
          <span>🔔</span> Sacred Chimes & Bells
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Temple Ghanti */}
          <button
            onClick={() => playSound('ghanti', undefined, 'ghanti')}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all transform active:scale-95 ${
              activePad === 'ghanti'
                ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-400'
                : 'bg-stone-950/80 border-stone-800 hover:border-amber-500/40 text-stone-200'
            }`}
          >
            <span className="text-3xl mb-1">🔔</span>
            <span className="text-xs font-bold font-serif text-amber-200">मंदिर घंटी (Temple Bell)</span>
            <span className="text-[10px] text-stone-400">Resonant brass overtone</span>
          </button>

          {/* Bhakti Manjira */}
          <button
            onClick={() => playSound('manjira', undefined, 'manjira')}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all transform active:scale-95 ${
              activePad === 'manjira'
                ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-400'
                : 'bg-stone-950/80 border-stone-800 hover:border-amber-500/40 text-stone-200'
            }`}
          >
            <span className="text-3xl mb-1">🪘</span>
            <span className="text-xs font-bold font-serif text-amber-200">भक्ति मंजीरा (Manjira)</span>
            <span className="text-[10px] text-stone-400">Crystalline metallic chime</span>
          </button>
        </div>
      </div>

      {/* 3. Interactive Harmonium Keyboard (Devotional Swaras) */}
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif flex items-center gap-1.5">
            <span>🎹</span> Harmonium Keyboard (हारमोनियम स्वर)
          </h3>
          <span className="text-[10px] text-stone-400">Key of D (मध्य सप्तक)</span>
        </div>

        {/* Responsive Piano Keyboard layout */}
        <div className="relative flex justify-center py-2 overflow-x-auto">
          <div className="flex gap-1 p-2 bg-stone-950 rounded-2xl border border-stone-800 shadow-inner">
            {swaras.map((swara) => {
              const isSelected = activePad === swara.name;
              return (
                <button
                  key={swara.name}
                  onClick={() => playSound('harmonium', swara.freq, swara.name)}
                  className={`flex flex-col justify-end items-center pb-2 rounded-xl transition-all transform active:scale-95 select-none ${
                    swara.isBlack
                      ? 'w-7 h-28 bg-stone-900 text-amber-400 border border-stone-700 shadow-md -mx-1 z-10'
                      : 'w-9 h-36 bg-amber-50 text-stone-900 border border-stone-300 shadow-lg'
                  } ${isSelected ? 'ring-2 ring-amber-400 bg-amber-400 text-black' : ''}`}
                >
                  <span className={`text-[10px] font-bold font-serif ${swara.isBlack ? 'text-amber-300' : 'text-stone-900'}`}>
                    {swara.hindi}
                  </span>
                  <span className={`text-[8px] ${swara.isBlack ? 'text-stone-400' : 'text-stone-600'}`}>
                    {swara.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-[10px] text-center text-stone-400 italic">
          Try playing: "सा रे ग म प ध नि सां" to invoke sacred classical vibrations
        </p>
      </div>
    </div>
  );
};
