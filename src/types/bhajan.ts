export type DeityName =
  | 'Maa Durga'
  | 'Shiv Ji'
  | 'Krishna'
  | 'Ram'
  | 'Hanuman'
  | 'Ganesh'
  | 'Saraswati'
  | 'Lakshmi'
  | 'Kali'
  | 'Navratri Mata';

export type SupportedLanguage =
  | 'Hindi'
  | 'Bhojpuri'
  | 'Maithili'
  | 'Sanskrit'
  | 'Bengali'
  | 'Marathi'
  | 'Gujarati'
  | 'Punjabi'
  | 'English devotional songs';

export type SongType =
  | 'Traditional Bhajan'
  | 'Fast/Joshila Bhajan'
  | 'Aarti'
  | 'Kirtan'
  | 'Jagran Bhajan'
  | 'Shanti Bhajan'
  | 'Folk Devotional'
  | 'Bhojpuri Bhajan'
  | 'Garba-style devotional'
  | 'Mantra-based devotional song';

export type MoodType =
  | 'Peaceful'
  | 'Emotional'
  | 'Powerful'
  | 'Energetic'
  | 'Spiritual'
  | 'Festive';

export type SingerType = 'Male' | 'Female' | 'Group/Chorus';

export type DurationOption = '1 minute' | '2 minutes' | '3 minutes' | '5 minutes';

export interface DeityInfo {
  id: DeityName;
  name: string;
  hindiName: string;
  title: string;
  avatarIcon: string;
  gradient: string;
  primaryColor: string;
  mantra: string;
  associatedRagas: string[];
  suggestedTopics: string[];
  customLineExamples: string[];
}

export interface InstrumentItem {
  name: string;
  hindiName: string;
  category: 'percussion' | 'drone' | 'melody' | 'chime' | 'vocal';
  icon: string;
  role: string;
  volume?: number;
  muted?: boolean;
}

export interface LyricSection {
  sectionType: string;
  linesHindi: string[];
  linesRoman: string[];
  meaningEnglish: string;
  musicalNote?: string;
  timestampStart?: number;
  timestampEnd?: number;
}

export interface BhajanSong {
  id: string;
  title: string;
  titleHindi?: string;
  deity: DeityName;
  topic: string;
  language: SupportedLanguage;
  songType: SongType;
  mood: MoodType;
  singer: SingerType;
  duration: DurationOption;
  customInspiration?: string;
  openingChant: string;
  ragaInspiration: string;
  taal: string;
  tempoBpm: number;
  instruments: InstrumentItem[];
  lyrics: LyricSection[];
  singingStyle: string;
  audioSynthesisGuide?: string;
  audioBase64?: string;
  isFavorite?: boolean;
  createdAt: string;
  variationCount?: number;
}

export interface GenerationStepInfo {
  step: number;
  title: string;
  subtitle: string;
  icon: string;
  mantraChant: string;
}
