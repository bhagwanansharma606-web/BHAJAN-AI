import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = Number(process.env.PORT) || 3000;

// Initialize Google GenAI client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Deity specific default chants & mantras
const deityChants: Record<string, string> = {
  'Maa Durga': 'जय माता दी! बोलो सांचे दरबार की जय! ॐ दुं दुर्गायै नमः',
  'Shiv Ji': 'हर हर महादेव! ॐ नमः शिवाय! जय भोले भंडारी!',
  'Krishna': 'राधे राधे! जय श्री कृष्णा! हरे कृष्णा हरे रामा!',
  'Ram': 'जय श्री राम! सिया वर रामचंद्र की जय! जय जय श्री राम!',
  'Hanuman': 'जय बजरंगबली! पवनपुत्र हनुमान की जय! संकट मोचन कृपा निधान!',
  'Ganesh': 'गणपति बप्पा मोरया! ॐ गं गणपतये नमः! मंगल मूर्ति मोरया!',
  'Saraswati': 'ॐ ऐं सरस्वत्यै नमः! जय माँ शारदे! वीणा वादिनी नमोस्तुते!',
  'Lakshmi': 'ॐ महालक्ष्म्यै नमः! जय माँ लक्ष्मी! धन धान्य दायिनी!',
  'Kali': 'जय माँ काली! ॐ क्रीं कालिकायै नमः! जय महाकाली!',
  'Navratri Mata': 'या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता! जय माता दी!'
};

// API: Generate Devotional Bhajan
app.post('/api/generate-bhajan', async (req, res) => {
  try {
    const {
      deity = 'Maa Durga',
      topic = 'Bhakti & Krupa',
      language = 'Hindi',
      songType = 'Traditional Bhajan',
      mood = 'Peaceful',
      singer = 'Male',
      duration = '3 minutes',
      customInspiration = '',
      variationOf = null
    } = req.body;

    const openingChantSample = deityChants[deity] || `जय ${deity}!`;

    const systemPrompt = `You are a renowned Indian devotional lyricist, musicologist, and classical composer.
Create a COMPLETELY ORIGINAL Indian devotional song (Bhajan / Aarti / Kirtan / Devotional Geet).
NEVER copy copyrighted lyrics from existing commercial songs. Generate fresh, profound, devotional poetry full of Bhakti rasa.

USER SPECIFICATIONS:
- Deity: ${deity}
- Topic: ${topic}
- Language: ${language}
- Song Type: ${songType}
- Mood: ${mood}
- Singer: ${singer}
- Target Duration: ${duration}
${customInspiration ? `- Custom Line / Inspiration provided by user: "${customInspiration}". Incorporate or weave this sacred thought naturally into the mukhda or opening without copying any existing song.` : ''}
${variationOf ? `- Create a distinct musical and poetic VARIATION of: "${variationOf}". Use a fresh melodic raga, fresh phrasing, while maintaining the devotional adoration of ${deity}.` : ''}

MUSICOLOGY GUIDELINES:
1. Select a genuine Indian classical Raga suitable for ${mood} and ${deity} (e.g. Bhairavi, Shivranjani, Yaman, Bhairav, Durga, Kafi, Khamaj, Desh, Charukeshi).
2. Select a suitable Indian Taal (e.g. Keherwa 8 beats, Dadra 6 beats, Bhajani Theka 8 beats, Teentaal 16 beats, Garba 6/8, Rupak 7 beats).
3. Set appropriate BPM tempo (Peaceful: 68-76 BPM, Fast/Joshila/Jagran: 110-130 BPM, Aarti: 84-96 BPM, Kirtan: 90-112 BPM).
4. Select 4-6 appropriate Indian instruments (Harmonium, Tabla, Dholak, Tanpura, Bansuri, Manjira, Temple Bells, Shehnai, Pakhawaj, Dhol) with specific accompaniment roles.

LYRIC STRUCTURE GUIDELINES:
- Title (Devotional, uplifting)
- Opening Devotional Chant / Dhun (e.g. "${openingChantSample}")
- Mukhda / Chorus (The core catchy melodic hook, 2 to 4 rhyming lines)
- Antara 1 (First narrative devotional stanza, 4 lines)
- Chorus Repeat (Mukhda reaffirmation)
- Antara 2 (Deep spiritual surrender and blessings, 4 lines)
- Optional Antara 3 or Instrumental Interlude guidance
- Final Powerful Ending / Jai Jaikar (High energy crescendo and sacred closure)

For each section provide:
1. Native script lines (in ${language}, preferably Devanagari for Hindi/Bhojpuri/Maithili/Sanskrit/Marathi)
2. Roman transliterated lines (for non-native readers to chant along)
3. English translation/devotional meaning
4. Musical singing guidance (swara dynamic, emotion, ornamental meend/murki cues)

OUTPUT FORMAT: Return strictly valid JSON with no markdown wrapping or extra text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: systemPrompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textOutput = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(textOutput);
    } catch {
      // Clean possible fences if any
      const cleaned = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    // Ensure fallback fields exist
    const bhajanData = {
      id: 'bhajan_' + Date.now(),
      createdAt: new Date().toISOString(),
      deity,
      topic,
      language,
      songType,
      mood,
      singer,
      duration,
      customInspiration,
      ...parsedData,
    };

    return res.json({ success: true, bhajan: bhajanData });
  } catch (error: any) {
    console.error('Error generating bhajan:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate devotional bhajan',
    });
  }
});

// API: Regenerate single line or section
app.post('/api/regenerate-line', async (req, res) => {
  try {
    const { deity, language, mood, currentLine, context } = req.body;
    const prompt = `You are an Indian devotional lyricist. Provide 3 alternative, original devotional lines in ${language} to replace this line in a bhajan dedicated to ${deity}:
Current line: "${currentLine}"
Context: ${context || 'Devotional verse'}
Mood: ${mood}

Return valid JSON array of objects:
[
  { "native": "Line in native script", "roman": "Roman transliteration", "meaning": "English meaning" }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const variations = JSON.parse(response.text || '[]');
    return res.json({ success: true, variations });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// API: Generate Devotional Vocals via Gemini TTS
app.post('/api/generate-vocals', async (req, res) => {
  try {
    const { text, singerGender = 'male', deity = 'Bhagwan', mood = 'Devotional' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ success: false, fallback: true, message: 'No API key provided' });
    }

    const voiceName = singerGender === 'female' ? 'Kore' : 'Fenrir';
    const devotionalSpeechPrompt = `Sing or chant with deep Indian bhakti, devotion, and soulful feeling for ${deity}. Mood: ${mood}.\nLyrics to vocalize:\n${text}`;

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: devotionalSpeechPrompt,
              speechMetadata: {
                style: `Indian classical devotional bhajan singer, melodious, reverent, expressive ${mood} bhava`,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return res.json({
        success: true,
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    }

    return res.json({ success: false, fallback: true });
  } catch (error: any) {
    console.warn('TTS generation fallback to client synth:', error?.message);
    return res.json({ success: false, fallback: true, error: error.message });
  }
});

// Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🌸 Bhajan AI Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
