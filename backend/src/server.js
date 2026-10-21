import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const catalog = [
  { id: 'moonlight-pizza', title: 'Moonlight Pizza Club', year: 2024, genre: 'Comedy', runtime: 98, rating: 'PG', mood: ['funny', 'light', 'feel-good'], family: true, description: 'A small-town pizza team enters a wildly chaotic night competition.', colors: ['#f59e0b', '#ef4444'], emoji: '🍕' },
  { id: 'wild-planet', title: 'Wild Planet', year: 2025, genre: 'Adventure', runtime: 112, rating: 'PG', mood: ['adventure', 'wonder', 'uplifting'], family: true, description: 'Two siblings discover a hidden valley where nature has its own surprises.', colors: ['#10b981', '#0f766e'], emoji: '🌿' },
  { id: 'last-signal', title: 'The Last Signal', year: 2023, genre: 'Sci-Fi', runtime: 116, rating: 'PG-13', mood: ['thoughtful', 'suspense', 'sci-fi'], family: false, description: 'An engineer decodes a message that may change humanity’s future.', colors: ['#6366f1', '#0f172a'], emoji: '🪐' },
  { id: 'tiny-chefs', title: 'Tiny Chefs, Big Dreams', year: 2024, genre: 'Family', runtime: 91, rating: 'G', mood: ['family', 'funny', 'feel-good'], family: true, description: 'Young cooks team up to save their neighborhood café.', colors: ['#fb7185', '#7c3aed'], emoji: '🧁' },
  { id: 'blue-hour', title: 'Blue Hour', year: 2022, genre: 'Drama', runtime: 104, rating: 'PG-13', mood: ['calm', 'emotional', 'thoughtful'], family: false, description: 'A photographer reconnects with a childhood friend on a quiet coastal trip.', colors: ['#38bdf8', '#1e3a8a'], emoji: '🌊' },
  { id: 'goal-line', title: 'Goal Line Heroes', year: 2025, genre: 'Sports', runtime: 102, rating: 'PG', mood: ['sports', 'inspiring', 'uplifting'], family: true, description: 'An underdog football team learns what winning together really means.', colors: ['#84cc16', '#166534'], emoji: '⚽' },
  { id: 'midnight-mystery', title: 'Midnight Mystery', year: 2024, genre: 'Mystery', runtime: 107, rating: 'PG-13', mood: ['mystery', 'clever', 'suspense'], family: false, description: 'A clever librarian investigates a puzzling disappearance in a mountain hotel.', colors: ['#a78bfa', '#312e81'], emoji: '🔎' },
  { id: 'robot-next-door', title: 'The Robot Next Door', year: 2025, genre: 'Comedy', runtime: 95, rating: 'PG', mood: ['funny', 'family', 'heartwarming'], family: true, description: 'A very literal home robot accidentally becomes the star of the street.', colors: ['#22d3ee', '#1d4ed8'], emoji: '🤖' }
];

function localRecommend(prompt) {
  const p = String(prompt || '').toLowerCase();
  const wantsFamily = /family|parents|kids|children|everyone|safe|clean/.test(p);
  const wantsFunny = /funny|comedy|laugh|light|cheer|happy/.test(p);
  const wantsAdventure = /adventure|exciting|explore|wonder/.test(p);
  const wantsSciFi = /sci.?fi|space|future|robot|technology/.test(p);
  const wantsMystery = /mystery|detective|puzzle|suspense|thriller/.test(p);
  const wantsCalm = /calm|relax|tired|quiet|peaceful/.test(p);
  const maxMatch = p.match(/(?:under|less than|max(?:imum)?|within)\s*(\d{2,3})\s*(?:minutes|min|mins)?/);
  const maxRuntime = maxMatch ? Number(maxMatch[1]) : (/short/.test(p) ? 100 : 180);
  const scored = catalog.map(item => {
    let score = 0;
    if (wantsFamily && item.family) score += 5;
    if (wantsFunny && item.mood.some(x => ['funny','light','feel-good','heartwarming'].includes(x))) score += 4;
    if (wantsAdventure && item.mood.some(x => ['adventure','wonder','uplifting'].includes(x))) score += 4;
    if (wantsSciFi && (item.genre === 'Sci-Fi' || /robot/i.test(item.title))) score += 4;
    if (wantsMystery && item.mood.some(x => ['mystery','clever','suspense'].includes(x))) score += 4;
    if (wantsCalm && item.mood.some(x => ['calm','thoughtful'].includes(x))) score += 3;
    if (item.runtime <= maxRuntime) score += 2;
    if (wantsFamily && !item.family) score -= 10;
    return { ...item, score };
  }).sort((a,b) => b.score - a.score || a.runtime - b.runtime).slice(0, 4);

  return scored.map((item, index) => {
    let reason = 'A versatile pick with a distinctive story and an easy-to-follow premise.';
    if (wantsFamily && item.family) reason = 'Family-friendly rating and an upbeat story make this a comfortable group pick.';
    else if (wantsFunny && item.mood.some(x => ['funny','light','feel-good','heartwarming'].includes(x))) reason = 'A light, humorous story fits your request for something fun.';
    else if (wantsAdventure && item.genre === 'Adventure') reason = 'A sense of discovery and an uplifting story match your adventure mood.';
    else if (wantsSciFi && (item.genre === 'Sci-Fi' || /robot/i.test(item.title))) reason = 'A playful or futuristic concept fits your sci-fi interest.';
    else if (wantsMystery && item.mood.includes('mystery')) reason = 'A puzzle-driven plot gives you something intriguing to follow.';
    else if (wantsCalm && item.mood.includes('calm')) reason = 'A gentler pace is a good fit for a quieter evening.';
    if (item.runtime > maxRuntime) reason = 'A strong thematic match; it runs a little longer than your preferred limit.';
    return { ...item, reason, match: Math.max(78, Math.min(98, 94 - index * 4 + Math.min(item.score, 5))) };
  });
}

async function aiRecommend(prompt) {
  const base = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: `You are CineMind, a helpful TV movie-night recommender. Recommend only IDs from this catalog. Return valid JSON only in shape {"recommendations":[{"id":"catalog-id","reason":"one short sentence","match":90}]}. Catalog: ${JSON.stringify(catalog.map(({id,title,genre,runtime,rating,family,mood,description}) => ({id,title,genre,runtime,rating,family,mood,description})))}. Respect family-friendly requests and runtime limits. Never claim a title is available on a streaming service.` },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const data = await response.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
  const byId = new Map(catalog.map(item => [item.id, item]));
  return (parsed.recommendations || []).slice(0, 4).map((r, i) => {
    const item = byId.get(r.id);
    return item ? { ...item, reason: String(r.reason || 'Suggested for your movie-night mood.'), match: Math.max(50, Math.min(99, Number(r.match) || 85)) } : null;
  }).filter(Boolean);
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'CineMind API', aiEnabled: Boolean(process.env.AI_API_KEY) }));
app.get('/api/catalog', (_req, res) => res.json({ items: catalog }));
app.post('/api/recommend', async (req, res) => {
  const prompt = String(req.body?.prompt || '').trim();
  if (!prompt) return res.status(400).json({ error: 'Tell CineMind what kind of movie night you want.' });
  if (prompt.length > 500) return res.status(400).json({ error: 'Please keep your request under 500 characters.' });
  try {
    let recommendations;
    let mode = 'demo';
    if (process.env.AI_API_KEY) {
      try { recommendations = await aiRecommend(prompt); mode = 'ai'; }
      catch (err) { console.error('AI request failed; using demo recommendations:', err.message); }
    }
    if (!recommendations?.length) recommendations = localRecommend(prompt);
    res.json({ prompt, mode, recommendations, note: mode === 'ai' ? 'Personalized with live AI.' : 'Demo mode: recommendations are generated locally. Add an AI API key to enable live AI.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'CineMind could not make recommendations right now.' });
  }
});

app.listen(port, () => console.log(`CineMind API listening on http://localhost:${port}`));
