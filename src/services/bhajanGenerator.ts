import { BhajanSong, DeityName, DurationOption, MoodType, SingerType, SongType, SupportedLanguage } from '../types/bhajan';
import { BHAJAN_TEMPLATES } from '../data/templates';
import { DEITIES } from '../data/deities';

export interface GenerationParams {
  deity: DeityName;
  topic: string;
  language: SupportedLanguage;
  songType: SongType;
  mood: MoodType;
  singer: SingerType;
  duration: DurationOption;
  customInspiration?: string;
  variationOf?: string;
}

export type StepCallback = (step: number, title: string, subtitle: string) => void;

export async function generateDevotionalBhajan(
  params: GenerationParams,
  onStepProgress: StepCallback
): Promise<BhajanSong> {
  // Step 1: Generating Lyrics
  onStepProgress(1, 'Generating Sacred Lyrics', 'Crafting original devotional verses, Mukhda, and Antaras in ' + params.language);
  await new Promise((r) => setTimeout(r, 650));

  let generatedBhajan: BhajanSong | null = null;

  try {
    const res = await fetch('/api/generate-bhajan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.bhajan) {
        generatedBhajan = data.bhajan;
      }
    }
  } catch (err) {
    console.warn('Backend bhajan generation failed, utilizing local spiritual composition engine:', err);
  }

  // Step 2: Creating Melody & Raga
  onStepProgress(2, 'Creating Devotional Melody', 'Selecting traditional Raga & establishing Swara aesthetics for ' + params.deity);
  await new Promise((r) => setTimeout(r, 600));

  // Step 3: Arranging Indian Instruments
  onStepProgress(3, 'Arranging Indian Instruments', 'Harmonium, Tabla, Dholak, Tanpura drone & Temple Ghanti alignment');
  await new Promise((r) => setTimeout(r, 650));

  // Step 4: Generating Vocals
  onStepProgress(4, 'Generating Devotional Vocals', `Infusing ${params.singer} singing style, emotional bhava, and ornamentation`);
  await new Promise((r) => setTimeout(r, 700));

  // If backend didn't return or network had issue, fallback to high-quality local generation
  if (!generatedBhajan) {
    generatedBhajan = createFallbackDevotionalBhajan(params);
  }

  // Step 5: Mixing Song
  onStepProgress(5, 'Mixing & Sacred Reverb', 'Balancing vocal presence, instrumental spatial imaging, and temple acoustics');
  await new Promise((r) => setTimeout(r, 600));

  // Attempt vocal generation via backend TTS if possible
  try {
    const sampleLyrics = generatedBhajan.lyrics
      .map((sec) => sec.linesHindi.join('। '))
      .slice(0, 2)
      .join('\n');

    const vRes = await fetch('/api/generate-vocals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: sampleLyrics,
        singerGender: params.singer === 'Female' ? 'female' : 'male',
        deity: params.deity,
        mood: params.mood,
      }),
    });
    if (vRes.ok) {
      const vData = await vRes.json();
      if (vData.success && vData.audioBase64) {
        generatedBhajan.audioBase64 = vData.audioBase64;
      }
    }
  } catch {
    // Vocal synthesis will be handled seamlessly by the Web Audio Engine
  }

  // Step 6: Final Bhajan Ready
  onStepProgress(6, 'Final Bhajan Ready!', 'Blessings manifest — your devotional song is ready to play and share');
  await new Promise((r) => setTimeout(r, 450));

  return generatedBhajan;
}

// Highly articulated fallback engine that crafts deep devotional poetry
function createFallbackDevotionalBhajan(params: GenerationParams): BhajanSong {
  const deityInfo = DEITIES.find((d) => d.id === params.deity) || DEITIES[0];
  const templateMatch = BHAJAN_TEMPLATES.find((t) => t.deity === params.deity) || BHAJAN_TEMPLATES[0];

  const uniqueId = 'bhajan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const raga = deityInfo.associatedRagas[0] || 'Raga Bhairavi';

  let customLine = params.customInspiration?.trim() || '';
  if (!customLine) {
    customLine = deityInfo.customLineExamples[0] || `जय ${params.deity} दया निधान`;
  }

  const title = `${params.deity} Mahima – ${customLine.slice(0, 28)}`;
  const titleHindi = `${deityInfo.hindiName} महिमा – ${customLine.slice(0, 28)}`;

  return {
    id: uniqueId,
    title,
    titleHindi,
    deity: params.deity,
    topic: params.topic,
    language: params.language,
    songType: params.songType,
    mood: params.mood,
    singer: params.singer,
    duration: params.duration,
    customInspiration: params.customInspiration,
    openingChant: deityInfo.mantra,
    ragaInspiration: raga,
    taal: params.songType.includes('Fast') || params.songType.includes('Jagran')
      ? 'Keherwa Drut (8 Beats)'
      : 'Bhajani Theka (8 Beats)',
    tempoBpm: params.songType.includes('Fast') || params.songType.includes('Jagran') ? 122 : 82,
    singingStyle: `Soulful ${params.singer} devotional singing infused with ${params.mood.toLowerCase()} bhava and traditional ornamentation`,
    instruments: templateMatch.instruments,
    lyrics: [
      {
        sectionType: 'Opening Devotional Dhun',
        linesHindi: [
          deityInfo.mantra.split('!')[0] + '!',
          'चरणों में तेरे शीश नवाएं, दया करो भगवान!',
        ],
        linesRoman: [
          'Charanon mein tere sheesh navaayein, daya karo bhagwan!',
          'Bhakti bhaav se aarti utaarein, sun lo prabhu dhyaan!',
        ],
        meaningEnglish: 'Bowing at your holy lotus feet, bestow your boundless grace and accept our prayers.',
        musicalNote: 'Tanpura drone + ringing bell resonance on opening phrase',
      },
      {
        sectionType: 'Mukhda / Chorus',
        linesHindi: [
          customLine + ',',
          'मन मंदिर में ज्योत जगाई, हुआ उजाला आज!',
          'तेरी दया से बिगड़ी बनेगी, राखो सबकी लाज!',
          'जय हो तेरी कृपानिधान, जय हो महाराज!',
        ],
        linesRoman: [
          customLine + ',',
          'Mann mandir mein jyot jagaayi, hua ujaala aaj!',
          'Teri daya se bigdi banegi, raakho sabki laaj!',
          'Jai ho teri kripanidhaan, jai ho maharaaj!',
        ],
        meaningEnglish: 'Lighting the lamp of devotion within our hearts, darkness flees. Through your grace all tribulations turn auspicious.',
        musicalNote: 'Full tabla and harmonium rhythm enters with devotional warmth',
      },
      {
        sectionType: 'Antara 1',
        linesHindi: [
          'फूलों की माला, धूप दीप संग, भोग सजाया प्यारा,',
          'तेरी एक झलक पाने को व्याकुल, यह संसार हमारा।',
          'दीन दुखी के तुम रखवारे, संकट मोचन स्वामी,',
          'घट-घट के तुम ज्ञाता हो प्रभु, अंतर्यामी नामी!',
        ],
        linesRoman: [
          'Phoolon ki maala, dhoop deep sang, bhog sajaaya pyaara,',
          'Teri ek jhalak paane ko vyaakul, yeh sansaar hamaara.',
          'Deen dukhi ke tum rakhwaare, sankat mochan swaami,',
          'Ghat ghat ke tum gyaata ho prabhu, antaryaami naami!',
        ],
        meaningEnglish: 'Adorned with fragrant blooms and burning incense, we yearn for a single glance of your divine form. Protector of the meek, knower of all hearts.',
        musicalNote: 'Harmonium ascends to higher swaras with gentle vocal meend',
      },
      {
        sectionType: 'Chorus Repeat',
        linesHindi: [
          customLine + ',',
          'तेरी दया से बिगड़ी बनेगी, राखो सबकी लाज!',
        ],
        linesRoman: [
          customLine + ',',
          'Teri daya se bigdi banegi, raakho sabki laaj!',
        ],
        meaningEnglish: 'Chorus repeat affirming divine refuge.',
        musicalNote: 'Congregational chorus echo with manjira accompaniment',
      },
      {
        sectionType: 'Antara 2',
        linesHindi: [
          'जन्म मरण के इस सागर से, नैया पार लगा दो,',
          'अंधकार को दूर भगाकर, प्रेम का दीप जला दो।',
          'जो भी आया शरण तिहारी, कभी न खाली मोड़ा,',
          'तेरे नाम से ही इस मन ने, सच्चा नाता जोड़ा!',
        ],
        linesRoman: [
          'Janam maran ke iss saagar se, naiya paar laga do,',
          'Andhkaar ko door bhagaakar, prem ka deep jala do.',
          'Jo bhi aaya sharan tihaari, kabhi na khaali moda,',
          'Tere naam se hi iss mann ne, sachha naata joda!',
        ],
        meaningEnglish: 'Ferry our boat across the turbulent ocean of existence. Whoever seeks refuge at your feet is never turned away empty-handed.',
        musicalNote: 'Soulful crescendo with rhythmic clapping and dholak variations',
      },
      {
        sectionType: 'Final Powerful Ending',
        linesHindi: [
          deityInfo.mantra,
          'बोलो सांचे दरबार की जय!',
        ],
        linesRoman: [
          'Bolo Saanche Darbaar Ki Jai!',
          'Har Har Mahadev / Jai Mata Di!',
        ],
        meaningEnglish: 'Triumphant proclamation of divine victory and eternal surrender.',
        musicalNote: 'Final accelerating tihai leading into resonant temple bell decay',
      },
    ],
    createdAt: new Date().toISOString(),
  };
}
