import React, { useState } from 'react';
import { X, Volume2, Sparkles, Heart } from 'lucide-react';
import { DEITIES } from '../data/deities';
import { indianAudio } from '../services/indianAudioEngine';

interface DarshanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDeity: (deity: string) => void;
}

export const DarshanModal: React.FC<DarshanModalProps> = ({
  isOpen,
  onClose,
  onSelectDeity,
}) => {
  if (!isOpen) return null;

  const [ringCount, setRingCount] = useState(0);

  const ringTempleBell = () => {
    setRingCount((c) => c + 1);
    indianAudio.playInstrumentSound('ghanti');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-all"
        >
          <X size={18} />
        </button>

        {/* Temple Bell */}
        <div className="pt-2 mb-4">
          <button
            onClick={ringTempleBell}
            className="w-20 h-20 rounded-full mx-auto bg-gradient-to-tr from-amber-600 via-orange-600 to-red-600 flex items-center justify-center text-3xl shadow-xl shadow-amber-600/30 ring-4 ring-amber-400/40 active:scale-95 transition-transform"
          >
            🔔
          </button>
          <p className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider mt-2">
            Tap Bell to Ring • {ringCount > 0 ? `${ringCount} Chimes Offered` : 'Offer Worship'}
          </p>
        </div>

        {/* Sacred Quote */}
        <h3 className="text-lg font-bold text-amber-100 font-serif mb-1">
          दैनिक प्रभात दर्शन व आशीर्वाद
        </h3>
        <p className="text-xs text-amber-200/90 italic font-serif leading-relaxed px-2 mb-4">
          "त्वमेव माता च पिता त्वमेव, त्वमेव बन्धुश्च सखा त्वमेव।<br />
          त्वमेव विद्या द्रविणं त्वमेव, त्वमेव सर्वं मम देव देव॥"
        </p>

        {/* Deity Darshan Quick List */}
        <div className="text-left bg-stone-950/80 p-3 rounded-2xl border border-stone-800 mb-4 space-y-2">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
            Today's Sacred Auspicious Mantras:
          </span>
          <div className="space-y-1.5 text-xs text-stone-300 font-serif">
            <p className="flex items-center gap-1.5">
              <span>🔱</span> <span>माँ दुर्गा: "ॐ दुं दुर्गायै नमः"</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span>🕉️</span> <span>शिव जी: "हर हर महादेव! ॐ नमः शिवाय"</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span>🪶</span> <span>श्री कृष्ण: "राधे राधे! हरे कृष्ण हरे राम"</span>
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-serif font-bold text-xs shadow-lg active:scale-95 transition-all"
        >
          आशीर्वाद स्वीकार करें (Accept Blessing)
        </button>
      </div>
    </div>
  );
};
