import { BhajanSong, LyricSection } from '../types/bhajan';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentSectionIndex: number;
  currentLineIndex: number;
  instrumentMutes: Record<string, boolean>;
  masterVolume: number;
}

// Swara frequency mapping for Indian Classical Ragas (Key of D / Sa = 146.83Hz)
const SA = 146.83; // D3
const RAGA_SCALES: Record<string, number[]> = {
  // Raga Durga: Sa, Re, Ma, Pa, Dha, Sa' (No Ga, No Ni)
  Durga: [SA, SA * 9/8, SA * 4/3, SA * 3/2, SA * 5/3, SA * 2, SA * 9/4, SA * 8/3],
  // Raga Shivranjani: Sa, Re, komal Ga, Pa, Dha, Sa'
  Shivranjani: [SA, SA * 9/8, SA * 6/5, SA * 3/2, SA * 5/3, SA * 2, SA * 9/4, SA * 12/5],
  // Raga Yaman: Sa, Re, Ga, tivra Ma, Pa, Dha, Ni, Sa'
  Yaman: [SA, SA * 9/8, SA * 5/4, SA * 45/32, SA * 3/2, SA * 5/3, SA * 15/8, SA * 2],
  // Raga Bhairavi: Sa, komal Re, komal Ga, Ma, Pa, komal Dha, komal Ni, Sa'
  Bhairavi: [SA, SA * 16/15, SA * 6/5, SA * 4/3, SA * 3/2, SA * 8/5, SA * 9/5, SA * 2],
  // Default / Bilawal: Sa, Re, Ga, Ma, Pa, Dha, Ni, Sa'
  Default: [SA, SA * 9/8, SA * 5/4, SA * 4/3, SA * 3/2, SA * 5/3, SA * 15/8, SA * 2],
};

export class IndianAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;

  // Instrument gain buses
  private busHarmonium: GainNode | null = null;
  private busTabla: GainNode | null = null;
  private busTanpura: GainNode | null = null;
  private busManjira: GainNode | null = null;
  private busBells: GainNode | null = null;
  private busFlute: GainNode | null = null;
  private busVocals: GainNode | null = null;

  // Active sources & timer handles
  private tanpuraOscs: OscillatorNode[] = [];
  private rhythmTimer: number | null = null;
  private melodyTimer: number | null = null;
  private trackerTimer: number | null = null;
  private vocalAudioElement: HTMLAudioElement | null = null;

  // Playback state
  private isPlaying = false;
  private startTime = 0;
  private pauseOffset = 0;
  private currentBhajan: BhajanSong | null = null;
  private currentStepInTaal = 0;
  private melodyNoteIndex = 0;

  // Listeners
  private onStateChange: ((state: PlaybackState) => void) | null = null;
  private instrumentMutes: Record<string, boolean> = {
    Harmonium: false,
    Tabla: false,
    Dholak: false,
    Tanpura: false,
    Manjira: false,
    'Temple Bells': false,
    Bansuri: false,
    Vocals: false,
  };

  constructor() {
    // Audio context will be lazy-initialized upon user gesture
  }

  private initAudio() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      // Master output
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.9, this.audioCtx.currentTime);

      // Create warm temple reverb impulse
      this.reverbNode = this.createTempleReverb(this.audioCtx);

      // Create instrument buses
      this.busHarmonium = this.audioCtx.createGain();
      this.busTabla = this.audioCtx.createGain();
      this.busTanpura = this.audioCtx.createGain();
      this.busManjira = this.audioCtx.createGain();
      this.busBells = this.audioCtx.createGain();
      this.busFlute = this.audioCtx.createGain();
      this.busVocals = this.audioCtx.createGain();

      const buses = [
        this.busHarmonium,
        this.busTabla,
        this.busTanpura,
        this.busManjira,
        this.busBells,
        this.busFlute,
        this.busVocals,
      ];

      buses.forEach((bus) => {
        // Direct to master
        bus.connect(this.masterGain!);
        // Wet send to temple reverb
        const wetSend = this.audioCtx!.createGain();
        wetSend.gain.setValueAtTime(0.28, this.audioCtx!.currentTime);
        bus.connect(wetSend);
        wetSend.connect(this.reverbNode!);
      });

      this.reverbNode.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Create warm sacred temple reverb
  private createTempleReverb(ctx: AudioContext): ConvolverNode {
    const convolver = ctx.createConvolver();
    const rate = ctx.sampleRate;
    const length = rate * 2.8; // 2.8s sacred reverb tail
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (rate * 0.75));
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }

    convolver.buffer = impulse;
    return convolver;
  }

  public setBhajan(bhajan: BhajanSong) {
    this.stop();
    this.currentBhajan = bhajan;
    this.pauseOffset = 0;
    this.emitState();
  }

  public setOnStateChange(cb: (state: PlaybackState) => void) {
    this.onStateChange = cb;
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public play() {
    if (!this.currentBhajan) return;
    this.initAudio();
    if (!this.audioCtx) return;

    this.isPlaying = true;
    this.startTime = this.audioCtx.currentTime - this.pauseOffset;

    // Start Tanpura drone
    this.startTanpuraDrone();

    // Start rhythm pattern (Tabla / Dholak / Manjira)
    this.startRhythmLoop();

    // Start melodic Harmonium / Bansuri accompaniment
    this.startMelodyLoop();

    // Start progress tracker & vocal coordination
    this.startProgressTracker();

    this.emitState();
  }

  public pause() {
    if (!this.isPlaying) return;
    if (this.audioCtx) {
      this.pauseOffset = this.audioCtx.currentTime - this.startTime;
    }
    this.isPlaying = false;
    this.clearAllTimers();
    this.stopTanpuraDrone();

    if (this.vocalAudioElement) {
      this.vocalAudioElement.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }

    this.emitState();
  }

  public stop() {
    this.isPlaying = false;
    this.pauseOffset = 0;
    this.clearAllTimers();
    this.stopTanpuraDrone();

    if (this.vocalAudioElement) {
      this.vocalAudioElement.pause();
      this.vocalAudioElement.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.emitState();
  }

  public seek(seconds: number) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }
    this.pauseOffset = Math.max(0, Math.min(seconds, this.getDurationSeconds()));
    if (wasPlaying) {
      this.play();
    } else {
      this.emitState();
    }
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(vol, 1)), this.audioCtx.currentTime);
    }
    this.emitState();
  }

  public toggleInstrumentMute(instrumentName: string) {
    this.instrumentMutes[instrumentName] = !this.instrumentMutes[instrumentName];
    this.updateInstrumentBuses();
    this.emitState();
  }

  private updateInstrumentBuses() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    if (this.busHarmonium) {
      this.busHarmonium.gain.setValueAtTime(this.instrumentMutes['Harmonium'] ? 0 : 0.42, now);
    }
    if (this.busTabla) {
      const isMuted = this.instrumentMutes['Tabla'] || this.instrumentMutes['Dholak'];
      this.busTabla.gain.setValueAtTime(isMuted ? 0 : 0.65, now);
    }
    if (this.busTanpura) {
      this.busTanpura.gain.setValueAtTime(this.instrumentMutes['Tanpura'] ? 0 : 0.28, now);
    }
    if (this.busManjira) {
      this.busManjira.gain.setValueAtTime(this.instrumentMutes['Manjira'] ? 0 : 0.35, now);
    }
    if (this.busBells) {
      this.busBells.gain.setValueAtTime(this.instrumentMutes['Temple Bells'] ? 0 : 0.4, now);
    }
    if (this.busFlute) {
      this.busFlute.gain.setValueAtTime(this.instrumentMutes['Bansuri'] ? 0 : 0.38, now);
    }
    if (this.busVocals) {
      this.busVocals.gain.setValueAtTime(this.instrumentMutes['Vocals'] ? 0 : 0.75, now);
    }
  }

  // --- Real Acoustic Drone Synthesis: TANPURA ---
  private startTanpuraDrone() {
    this.stopTanpuraDrone();
    if (!this.audioCtx || !this.busTanpura) return;
    if (this.instrumentMutes['Tanpura']) return;

    // Tanpura 4-string tuning: Pa (5th) -> Sa' (tonic high) -> Sa' -> Sa (tonic bass)
    const tonic = SA; // 146.83Hz (D3)
    const pitches = [tonic * 3/2, tonic * 2, tonic * 2, tonic];

    pitches.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      const filter = this.audioCtx!.createBiquadFilter();

      // Sawtooth with low-pass filter models rich Indian bronze/steel strings
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750 + idx * 120, this.audioCtx!.currentTime);

      // Subtle LFO modulation for jawari buzzing overtone
      const lfo = this.audioCtx!.createOscillator();
      const lfoGain = this.audioCtx!.createGain();
      lfo.frequency.setValueAtTime(0.4 + idx * 0.15, this.audioCtx!.currentTime);
      lfoGain.gain.setValueAtTime(0.04, this.audioCtx!.currentTime);
      lfo.connect(lfoGain);

      gain.gain.setValueAtTime(0.08, this.audioCtx!.currentTime);
      lfoGain.connect(gain.gain);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.busTanpura!);

      osc.start();
      lfo.start();
      this.tanpuraOscs.push(osc);
    });
  }

  private stopTanpuraDrone() {
    this.tanpuraOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.tanpuraOscs = [];
  }

  // --- Real Acoustic Percussion Synthesis: TABLA & DHOLAK & MANJIRA ---
  private startRhythmLoop() {
    if (!this.audioCtx || !this.currentBhajan) return;
    const bpm = this.currentBhajan.tempoBpm || 84;
    const intervalMs = (60 / bpm / 2) * 1000; // 8th note subdivisions

    this.currentStepInTaal = 0;

    // Trigger opening sacred temple ghanti on start
    this.playTempleBell(this.audioCtx.currentTime);

    this.rhythmTimer = window.setInterval(() => {
      if (!this.audioCtx || !this.isPlaying) return;
      const now = this.audioCtx.currentTime;
      const step = this.currentStepInTaal % 16;

      // Keherwa / Bhajani / Aarti rhythmic pattern
      // Matras: 1 (Sam/Dha), 2 (Ge), 3 (Na), 4 (Tin), 5 (Ta), 6 (Ka), 7 (Dhin), 8 (Dha)
      const beat8 = step % 8;

      if (!this.instrumentMutes['Tabla'] && !this.instrumentMutes['Dholak']) {
        if (beat8 === 0) {
          // Dha: Bayan Bass + Dayan Treble
          this.playBayan(now, 72, 0.85);
          this.playDayan(now, SA * 2, 0.9);
        } else if (beat8 === 1) {
          // Ge: Resonant bass stroke with slight glide
          this.playBayan(now, 76, 0.6);
        } else if (beat8 === 2) {
          // Na: Crisp high open rim
          this.playDayan(now, SA * 2.5, 0.7);
        } else if (beat8 === 3) {
          // Tin: Gentle damped strike
          this.playDayan(now, SA * 2, 0.5, true);
        } else if (beat8 === 4) {
          // Ta / Khaali: Sharp rim strike
          this.playDayan(now, SA * 2.5, 0.65);
        } else if (beat8 === 5) {
          // Ge or Ka
          this.playBayan(now, 68, 0.5);
        } else if (beat8 === 6) {
          // Dhin: Heavy resonant bass + rim
          this.playBayan(now, 74, 0.75);
          this.playDayan(now, SA * 2, 0.7);
        } else if (beat8 === 7) {
          // Pick-up Dha into Sam
          this.playDayan(now, SA * 2, 0.6);
        }
      }

      // Manjira Bhakti Chimes (on offbeats 2, 4, 6)
      if (!this.instrumentMutes['Manjira'] && (beat8 === 2 || beat8 === 6 || (beat8 === 0 && step % 16 === 0))) {
        this.playManjira(now, beat8 === 0 ? 0.7 : 0.45);
      }

      // Temple Bell ring at every new 16-beat cycle or section changes
      if (!this.instrumentMutes['Temple Bells'] && step === 0) {
        this.playTempleBell(now, 0.35);
      }

      this.currentStepInTaal++;
    }, intervalMs);
  }

  // Tabla Bayan (Bass drum with dynamic wrist pitch glide)
  private playBayan(time: number, startPitch: number, velocity: number) {
    if (!this.audioCtx || !this.busTabla) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    // Bayan wrist pitch glide: drops then bends slightly
    osc.frequency.setValueAtTime(startPitch * 1.35, time);
    osc.frequency.exponentialRampToValueAtTime(startPitch * 0.85, time + 0.08);
    osc.frequency.exponentialRampToValueAtTime(startPitch * 0.7, time + 0.28);

    gain.gain.setValueAtTime(velocity * 0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.32);

    osc.connect(gain);
    gain.connect(this.busTabla);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  // Tabla Dayan (High tuned bell-like wooden drum)
  private playDayan(time: number, pitch: number, velocity: number, damped = false) {
    if (!this.audioCtx || !this.busTabla) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const snap = this.audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, time);

    snap.type = 'bandpass';
    snap.frequency.setValueAtTime(pitch * 1.5, time);
    snap.Q.setValueAtTime(4.5, time);

    const decayTime = damped ? 0.08 : 0.22;
    gain.gain.setValueAtTime(velocity * 0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decayTime);

    osc.connect(snap);
    snap.connect(gain);
    gain.connect(this.busTabla);

    osc.start(time);
    osc.stop(time + decayTime + 0.05);
  }

  // Manjira (High resonant brass devotional hand cymbals)
  private playManjira(time: number, velocity: number) {
    if (!this.audioCtx || !this.busManjira) return;

    // Metallic high frequencies
    const frequencies = [3200, 5100, 7800];
    frequencies.forEach((f) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time);

      gain.gain.setValueAtTime(velocity * 0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.45);

      osc.connect(gain);
      gain.connect(this.busManjira!);

      osc.start(time);
      osc.stop(time + 0.5);
    });
  }

  // Temple Ghanti (Sacred brass temple bell)
  private playTempleBell(time: number, velocity = 0.5) {
    if (!this.audioCtx || !this.busBells) return;

    // Temple bell harmonic partials
    const bellPartials = [1180, 2360, 3540, 4720];
    bellPartials.forEach((f, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f + idx * 4, time);

      const amp = velocity * (0.35 / (idx + 1));
      gain.gain.setValueAtTime(amp, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.8 + idx * 0.4);

      osc.connect(gain);
      gain.connect(this.busBells!);

      osc.start(time);
      osc.stop(time + 2.4);
    });
  }

  // --- Real Acoustic Melodic Synthesis: HARMONIUM & BANSURI ---
  private startMelodyLoop() {
    if (!this.audioCtx || !this.currentBhajan) return;
    const bpm = this.currentBhajan.tempoBpm || 84;
    const noteDurationMs = (60 / bpm) * 1000;

    // Determine scale from raga
    const ragaName = this.currentBhajan.ragaInspiration || '';
    let scale = RAGA_SCALES.Default;
    if (ragaName.includes('Durga')) scale = RAGA_SCALES.Durga;
    else if (ragaName.includes('Shivranjani')) scale = RAGA_SCALES.Shivranjani;
    else if (ragaName.includes('Yaman')) scale = RAGA_SCALES.Yaman;
    else if (ragaName.includes('Bhairavi')) scale = RAGA_SCALES.Bhairavi;

    // Devotional melody contour (Sa, Re, Ga/Ma, Pa, Dha, Pa, Re, Sa)
    const melodyPattern = [0, 1, 2, 3, 4, 3, 1, 0, 3, 4, 5, 4, 3, 2, 1, 0];
    this.melodyNoteIndex = 0;

    this.melodyTimer = window.setInterval(() => {
      if (!this.audioCtx || !this.isPlaying) return;
      const now = this.audioCtx.currentTime;
      const noteIdx = melodyPattern[this.melodyNoteIndex % melodyPattern.length];
      const pitch = scale[noteIdx] || SA;

      // Play Harmonium note
      if (!this.instrumentMutes['Harmonium']) {
        this.playHarmoniumNote(now, pitch, (noteDurationMs / 1000) * 0.85);
      }

      // Play occasional Bansuri flute phrase in alternating measures
      if (!this.instrumentMutes['Bansuri'] && (this.melodyNoteIndex % 4 === 0)) {
        this.playFlutePhrase(now, pitch * 1.5, (noteDurationMs / 1000) * 1.6);
      }

      this.melodyNoteIndex++;
    }, noteDurationMs);
  }

  // Harmonium Dual-Reed simulation
  private playHarmoniumNote(time: number, freq: number, duration: number) {
    if (!this.audioCtx || !this.busHarmonium) return;

    // Dual reeds: slightly detuned sawtooth pair with bellows tremolo
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.004, time); // Subtle detune for harmonium reed flutter

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.2, time);

    // Bellows envelope (gentle swell and release)
    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.08);
    gain.gain.setValueAtTime(0.16, time + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0.001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.busHarmonium);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.05);
    osc2.stop(time + duration + 0.05);
  }

  // Bansuri (Bamboo Flute) with breathy vibrato and meend
  private playFlutePhrase(time: number, freq: number, duration: number) {
    if (!this.audioCtx || !this.busFlute) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'sine';
    // Subtle initial slide (meend)
    osc.frequency.setValueAtTime(freq * 0.96, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 2.8, time);

    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.22, time + 0.15);
    gain.gain.setValueAtTime(0.18, time + duration - 0.15);
    gain.gain.linearRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.busFlute);

    osc.start(time);
    osc.stop(time + duration + 0.1);
  }

  // --- Progress Tracker & Real-Time Karaoke Vocal Coordination ---
  private startProgressTracker() {
    this.trackerTimer = window.setInterval(() => {
      if (!this.isPlaying) return;
      const current = this.getCurrentTime();
      const total = this.getDurationSeconds();

      if (current >= total) {
        // Song finished: loop or stop
        this.stop();
        return;
      }

      this.emitState();
    }, 250);
  }

  private clearAllTimers() {
    if (this.rhythmTimer) {
      clearInterval(this.rhythmTimer);
      this.rhythmTimer = null;
    }
    if (this.melodyTimer) {
      clearInterval(this.melodyTimer);
      this.melodyTimer = null;
    }
    if (this.trackerTimer) {
      clearInterval(this.trackerTimer);
      this.trackerTimer = null;
    }
  }

  public getCurrentTime(): number {
    if (!this.isPlaying || !this.audioCtx) {
      return this.pauseOffset;
    }
    return Math.max(0, this.audioCtx.currentTime - this.startTime);
  }

  public getDurationSeconds(): number {
    if (!this.currentBhajan) return 180;
    const durStr = this.currentBhajan.duration || '3 minutes';
    if (durStr.includes('1')) return 60;
    if (durStr.includes('2')) return 120;
    if (durStr.includes('5')) return 300;
    return 180;
  }

  private emitState() {
    if (!this.onStateChange) return;

    const currentTime = this.getCurrentTime();
    const duration = this.getDurationSeconds();

    // Calculate active section and line based on progression
    let currentSectionIndex = 0;
    let currentLineIndex = 0;

    if (this.currentBhajan && this.currentBhajan.lyrics.length > 0) {
      const totalSections = this.currentBhajan.lyrics.length;
      const sectionDuration = duration / totalSections;
      currentSectionIndex = Math.min(
        totalSections - 1,
        Math.floor(currentTime / sectionDuration)
      );

      const section = this.currentBhajan.lyrics[currentSectionIndex];
      if (section && section.linesHindi.length > 0) {
        const timeWithinSection = currentTime % sectionDuration;
        const lineDuration = sectionDuration / section.linesHindi.length;
        currentLineIndex = Math.min(
          section.linesHindi.length - 1,
          Math.floor(timeWithinSection / lineDuration)
        );
      }
    }

    this.onStateChange({
      isPlaying: this.isPlaying,
      currentTime,
      duration,
      currentSectionIndex,
      currentLineIndex,
      instrumentMutes: { ...this.instrumentMutes },
      masterVolume: this.masterGain?.gain.value ?? 0.9,
    });
  }

  // --- REAL AUDIO EXPORTER: Render complete Bhajan Mix to WAV file ---
  public async renderToWav(): Promise<Blob> {
    if (!this.currentBhajan) {
      throw new Error('No bhajan selected to export');
    }

    const sampleRate = 44100;
    // Export 60-90s representation for fast export & download
    const exportSeconds = Math.min(90, this.getDurationSeconds());
    const offlineCtx = new OfflineAudioContext(2, sampleRate * exportSeconds, sampleRate);

    // Master
    const master = offlineCtx.createGain();
    master.gain.setValueAtTime(0.85, 0);

    // Reverb
    const reverb = this.createTempleReverb(offlineCtx as unknown as AudioContext);
    master.connect(offlineCtx.destination);
    reverb.connect(master);

    const bus = offlineCtx.createGain();
    bus.connect(master);
    const wet = offlineCtx.createGain();
    wet.gain.setValueAtTime(0.3, 0);
    bus.connect(wet);
    wet.connect(reverb);

    // 1. Render Tanpura Drone
    const tonic = SA;
    const dronePitches = [tonic * 3/2, tonic * 2, tonic];
    dronePitches.forEach((freq) => {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, 0);
      gain.gain.setValueAtTime(0.06, 0);
      osc.connect(gain);
      gain.connect(bus);
      osc.start(0);
      osc.stop(exportSeconds);
    });

    // 2. Render Rhythmic Tabla & Manjira beats
    const bpm = this.currentBhajan.tempoBpm || 84;
    const interval = 60 / bpm / 2;
    let t = 0;
    let step = 0;

    while (t < exportSeconds) {
      const beat8 = step % 8;
      // Dha / Ge / Na / Dhin
      if (beat8 === 0 || beat8 === 6) {
        // Bayan
        const bOsc = offlineCtx.createOscillator();
        const bGain = offlineCtx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(74 * 1.3, t);
        bOsc.frequency.exponentialRampToValueAtTime(74 * 0.7, t + 0.25);
        bGain.gain.setValueAtTime(0.5, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        bOsc.connect(bGain);
        bGain.connect(bus);
        bOsc.start(t);
        bOsc.stop(t + 0.32);
      }

      // Dayan
      const dOsc = offlineCtx.createOscillator();
      const dGain = offlineCtx.createGain();
      dOsc.type = 'triangle';
      dOsc.frequency.setValueAtTime(tonic * 2, t);
      dGain.gain.setValueAtTime(0.35, t);
      dGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      dOsc.connect(dGain);
      dGain.connect(bus);
      dOsc.start(t);
      dOsc.stop(t + 0.2);

      // Manjira
      if (beat8 === 2 || beat8 === 6) {
        const mOsc = offlineCtx.createOscillator();
        const mGain = offlineCtx.createGain();
        mOsc.type = 'sine';
        mOsc.frequency.setValueAtTime(4800, t);
        mGain.gain.setValueAtTime(0.12, t);
        mGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        mOsc.connect(mGain);
        mGain.connect(bus);
        mOsc.start(t);
        mOsc.stop(t + 0.38);
      }

      t += interval;
      step++;
    }

    // 3. Render Melodic Harmonium line
    const ragaName = this.currentBhajan.ragaInspiration || '';
    let scale = RAGA_SCALES.Default;
    if (ragaName.includes('Durga')) scale = RAGA_SCALES.Durga;
    else if (ragaName.includes('Shivranjani')) scale = RAGA_SCALES.Shivranjani;
    else if (ragaName.includes('Yaman')) scale = RAGA_SCALES.Yaman;
    else if (ragaName.includes('Bhairavi')) scale = RAGA_SCALES.Bhairavi;

    const melodyPattern = [0, 1, 2, 3, 4, 3, 1, 0, 3, 4, 5, 4, 3, 2, 1, 0];
    const noteDur = 60 / bpm;
    let mt = 0;
    let mi = 0;

    while (mt < exportSeconds) {
      const pitch = scale[melodyPattern[mi % melodyPattern.length]] || SA;
      const hOsc = offlineCtx.createOscillator();
      const hGain = offlineCtx.createGain();
      hOsc.type = 'sawtooth';
      hOsc.frequency.setValueAtTime(pitch, mt);

      hGain.gain.setValueAtTime(0.01, mt);
      hGain.gain.linearRampToValueAtTime(0.14, mt + 0.06);
      hGain.gain.linearRampToValueAtTime(0.001, mt + noteDur * 0.85);

      hOsc.connect(hGain);
      hGain.connect(bus);
      hOsc.start(mt);
      hOsc.stop(mt + noteDur * 0.88);

      mt += noteDur;
      mi++;
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return this.bufferToWave(renderedBuffer, renderedBuffer.length);
  }

  // Convert AudioBuffer to downloadable 16-bit PCM WAV Blob
  private bufferToWave(abuffer: AudioBuffer, len: number): Blob {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sampleRate = abuffer.sampleRate;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      out.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data: number) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    // RIFF identifier
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // FMT sub-chunk
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // subchunk1size (16 for PCM)
    setUint16(1); // audio format (1 = PCM)
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample

    // Data sub-chunk
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4);

    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out], { type: 'audio/wav' });
  }

  // Bonus: Trigger direct sound effect for interactive Instrument Studio
  public playInstrumentSound(instrument: 'dha' | 'dhin' | 'ge' | 'na' | 'tin' | 'ghanti' | 'manjira' | 'harmonium', noteFreq = SA) {
    this.initAudio();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    switch (instrument) {
      case 'dha':
        this.playBayan(now, 72, 0.95);
        this.playDayan(now, SA * 2, 0.95);
        break;
      case 'dhin':
        this.playBayan(now, 76, 0.85);
        this.playDayan(now, SA * 2, 0.7);
        break;
      case 'ge':
        this.playBayan(now, 72, 0.9);
        break;
      case 'na':
        this.playDayan(now, SA * 2.5, 0.9);
        break;
      case 'tin':
        this.playDayan(now, SA * 2, 0.7, true);
        break;
      case 'ghanti':
        this.playTempleBell(now, 0.8);
        break;
      case 'manjira':
        this.playManjira(now, 0.8);
        break;
      case 'harmonium':
        this.playHarmoniumNote(now, noteFreq, 0.6);
        break;
    }
  }
}

export const indianAudio = new IndianAudioEngine();
