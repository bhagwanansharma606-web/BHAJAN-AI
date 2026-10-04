import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { HomeScreen } from './components/HomeScreen';
import { CreateBhajanFlow } from './components/CreateBhajanFlow';
import { ResultPage } from './components/ResultPage';
import { LyricsEditorModal } from './components/LyricsEditorModal';
import { InstrumentStudio } from './components/InstrumentStudio';
import { MySongsScreen } from './components/MySongsScreen';
import { LyricsBookScreen } from './components/LyricsBookScreen';
import { GenerationModal } from './components/GenerationModal';
import { DarshanModal } from './components/DarshanModal';
import { MobileFrame } from './components/MobileFrame';
import { BhajanSong, DeityName } from './types/bhajan';
import { BHAJAN_TEMPLATES } from './data/templates';
import { generateDevotionalBhajan, GenerationParams } from './services/bhajanGenerator';
import { indianAudio } from './services/indianAudioEngine';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab | 'result'>('home');
  const [darkMode, setDarkMode] = useState(true);
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Active Bhajan & Library
  const [currentBhajan, setCurrentBhajan] = useState<BhajanSong>(BHAJAN_TEMPLATES[0]);
  const [savedSongs, setSavedSongs] = useState<BhajanSong[]>(() => {
    try {
      const stored = localStorage.getItem('bhajan_ai_saved_songs');
      return stored ? JSON.parse(stored) : BHAJAN_TEMPLATES.slice(0, 3);
    } catch {
      return BHAJAN_TEMPLATES.slice(0, 3);
    }
  });

  // Pre-fill selection
  const [prefilledDeity, setPrefilledDeity] = useState<DeityName>('Maa Durga');

  // Generation Modal State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepTitle, setStepTitle] = useState('');
  const [stepSubtitle, setStepSubtitle] = useState('');

  // Lyrics Editor Modal State
  const [isLyricsEditorOpen, setIsLyricsEditorOpen] = useState(false);

  // Daily Darshan Modal State
  const [isDarshanOpen, setIsDarshanOpen] = useState(false);

  // Persist songs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bhajan_ai_saved_songs', JSON.stringify(savedSongs));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [savedSongs]);

  // Handle generation flow
  const handleGenerate = async (params: GenerationParams) => {
    setIsGenerating(true);
    setCurrentStep(1);

    try {
      const newBhajan = await generateDevotionalBhajan(params, (step, title, subtitle) => {
        setCurrentStep(step);
        setStepTitle(title);
        setStepSubtitle(subtitle);
      });

      setCurrentBhajan(newBhajan);
      // Auto-save to recent
      setSavedSongs((prev) => {
        const filtered = prev.filter((s) => s.id !== newBhajan.id);
        return [newBhajan, ...filtered];
      });

      // Switch to result page after generation
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentTab('result');
      }, 500);
    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
    }
  };

  // Create another version (Variation)
  const handleCreateVariation = () => {
    handleGenerate({
      deity: currentBhajan.deity,
      topic: currentBhajan.topic,
      language: currentBhajan.language,
      songType: currentBhajan.songType,
      mood: currentBhajan.mood,
      singer: currentBhajan.singer,
      duration: currentBhajan.duration,
      customInspiration: currentBhajan.customInspiration,
      variationOf: currentBhajan.title,
    });
  };

  // Regenerate current bhajan
  const handleRegenerate = () => {
    handleGenerate({
      deity: currentBhajan.deity,
      topic: currentBhajan.topic,
      language: currentBhajan.language,
      songType: currentBhajan.songType,
      mood: currentBhajan.mood,
      singer: currentBhajan.singer,
      duration: currentBhajan.duration,
      customInspiration: currentBhajan.customInspiration,
    });
  };

  // Start create with optional pre-filled deity
  const handleStartCreate = (deity?: DeityName) => {
    if (deity) {
      setPrefilledDeity(deity);
    }
    setCurrentTab('create');
  };

  // Select Bhajan from list or template
  const handleSelectBhajan = (bhajan: BhajanSong) => {
    indianAudio.stop();
    setCurrentBhajan(bhajan);
    setCurrentTab('result');
  };

  // Toggle favorite in library
  const handleToggleFavorite = (id: string) => {
    setSavedSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  // Delete song from library
  const handleDeleteSong = (id: string) => {
    setSavedSongs((prev) => prev.filter((s) => s.id !== id));
  };

  // Save to library
  const handleSaveToMySongs = (bhajan: BhajanSong) => {
    setSavedSongs((prev) => {
      const exists = prev.some((s) => s.id === bhajan.id);
      if (exists) {
        return prev.map((s) => (s.id === bhajan.id ? { ...s, isFavorite: true } : s));
      }
      return [{ ...bhajan, isFavorite: true }, ...prev];
    });
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <MobileFrame isMobileFrame={isMobileFrame}>
        {/* Header */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
          onOpenDarshan={() => setIsDarshanOpen(true)}
        />

        {/* Tab Views */}
        <main className="flex-1 p-3">
          {currentTab === 'home' && (
            <HomeScreen
              onStartCreate={handleStartCreate}
              onSelectBhajan={handleSelectBhajan}
              onOpenStudio={() => setCurrentTab('studio')}
              savedSongs={savedSongs}
              onOpenDarshan={() => setIsDarshanOpen(true)}
            />
          )}

          {currentTab === 'create' && (
            <CreateBhajanFlow
              onGenerate={handleGenerate}
              initialDeity={prefilledDeity}
            />
          )}

          {currentTab === 'result' && (
            <ResultPage
              bhajan={currentBhajan}
              onEditLyrics={() => setIsLyricsEditorOpen(true)}
              onRegenerate={handleRegenerate}
              onCreateVariation={handleCreateVariation}
              onSaveToMySongs={handleSaveToMySongs}
              isSaved={savedSongs.some((s) => s.id === currentBhajan.id && s.isFavorite)}
            />
          )}

          {currentTab === 'songs' && (
            <MySongsScreen
              songs={savedSongs}
              onSelectSong={handleSelectBhajan}
              onDeleteSong={handleDeleteSong}
              onToggleFavorite={handleToggleFavorite}
              onStartCreate={() => setCurrentTab('create')}
            />
          )}

          {currentTab === 'lyrics' && (
            <LyricsBookScreen
              songs={savedSongs.length > 0 ? savedSongs : BHAJAN_TEMPLATES}
              onSelectBhajan={handleSelectBhajan}
            />
          )}

          {currentTab === 'studio' && <InstrumentStudio />}
        </main>

        {/* Fixed Mobile Bottom Tab Bar */}
        <Navigation
          currentTab={(currentTab === 'result' ? 'create' : currentTab) as NavTab}
          onChangeTab={(tab) => {
            indianAudio.stop();
            setCurrentTab(tab);
          }}
        />

        {/* 6-Step Generation Progress Modal */}
        <GenerationModal
          isOpen={isGenerating}
          currentStep={currentStep}
          stepTitle={stepTitle}
          stepSubtitle={stepSubtitle}
          deity={currentBhajan?.deity || 'Maa Durga'}
        />

        {/* Interactive Lyrics Editor Modal */}
        <LyricsEditorModal
          isOpen={isLyricsEditorOpen}
          onClose={() => setIsLyricsEditorOpen(false)}
          bhajan={currentBhajan}
          onSave={(updated) => {
            setCurrentBhajan(updated);
            setSavedSongs((prev) =>
              prev.map((s) => (s.id === updated.id ? updated : s))
            );
          }}
          onRegenerateAllLyrics={handleRegenerate}
        />

        {/* Daily Darshan & Blessing Modal */}
        <DarshanModal
          isOpen={isDarshanOpen}
          onClose={() => setIsDarshanOpen(false)}
          onSelectDeity={(deity) => {
            setIsDarshanOpen(false);
            handleStartCreate(deity as DeityName);
          }}
        />
      </MobileFrame>
    </div>
  );
}
