const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf-8'));
}

// ✅ Trivia API Endpoints
app.get('/api/nfl', (req, res) => {
  try {
    const nfl1 = readJSON('nfl1.json');
    const nfl2 = readJSON('nfl2.json').map(q => ({
      question: q.question,
      options: q.options || q.choices || [],
      answer: q.answer || q.correct_answer || ""
    }));
    res.json([...nfl1, ...nfl2]);
  } catch (err) {
    console.error('❌ NFL load error:', err);
    res.status(500).send('Error loading NFL questions');
  }
});

app.get('/api/mlb', (req, res) => {
  try {
    res.json(readJSON('mlb.json'));
  } catch {
    res.status(500).send('Error loading MLB questions');
  }
});

app.get('/api/epl', (req, res) => {
  try {
    res.json(readJSON('epl.json'));
  } catch {
    res.status(500).send('Error loading EPL questions');
  }
});

app.get('/api/draft', (req, res) => {
  try {
    res.json(readJSON('draft.json'));
  } catch {
    res.status(500).send('Error loading Draft questions');
  }
});

app.get('/api/this-or-that', (req, res) => {
  try {
    res.json(readJSON('this-or-that.json'));
  } catch {
    res.status(500).send('Error loading This or That questions');
  }
});

app.get('/api/calls', (req, res) => {
  try {
    res.json(readJSON('calls.json'));
  } catch {
    res.status(500).send('Error loading Calls questions');
  }
});

// ✅ Remove NBA from mixed
app.get('/api/mixed', (req, res) => {
  try {
    const nfl1 = readJSON('nfl1.json');
    const nfl2 = readJSON('nfl2.json');
    const mlb = readJSON('mlb.json');
    const epl = readJSON('epl.json');
    const draft = readJSON('draft.json');
    const tot = readJSON('this-or-that.json');
    const mixed = [...nfl1, ...nfl2, ...mlb, ...epl, ...draft, ...tot];
    res.json(mixed);
  } catch (err) {
    console.error('❌ Mixed error:', err);
    res.status(500).send('Error loading mixed mode');
  }
});

// ✅ Daily Challenge (no NBA, no Calls, no This/That)
const cachePath = path.join(__dirname, 'daily-challenge-cache.json');
app.get('/api/daily-challenge', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (fs.existsSync(cachePath)) {
      const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      if (cache.date === today) return res.json(cache.questions);
    }

    const nfl = [...readJSON('nfl1.json'), ...readJSON('nfl2.json')];
    const mlb = readJSON('mlb.json');
    const epl = readJSON('epl.json');
    const draft = readJSON('draft.json');

    const all = [...nfl, ...mlb, ...epl, ...draft];
    const shuffled = all.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    fs.writeFileSync(cachePath, JSON.stringify({ date: today, questions: selected }, null, 2));
    res.json(selected);
  } catch (err) {
    console.error('❌ Daily Challenge error:', err);
    res.status(500).send('Error loading daily challenge');
  }
});

// ✅ Leaderboard
const leaderboardPath = path.join(__dirname, 'leaderboard.json');

app.post('/api/save-score', (req, res) => {
  const { username, mode, score } = req.body;
  if (!username || !mode || typeof score !== 'number') {
    return res.status(400).send('Invalid score payload');
  }

  const data = fs.existsSync(leaderboardPath)
    ? JSON.parse(fs.readFileSync(leaderboardPath, 'utf-8'))
    : {};

  if (!data[mode]) data[mode] = [];
  data[mode].push({ username, score, date: new Date().toISOString().split('T')[0] });
  data[mode].sort((a, b) => b.score - a.score);
  data[mode] = data[mode].slice(0, 5);

  fs.writeFileSync(leaderboardPath, JSON.stringify(data, null, 2));
  res.sendStatus(200);
});

app.get('/api/leaderboard', (req, res) => {
  try {
    if (!fs.existsSync(leaderboardPath)) return res.json({});
    const data = JSON.parse(fs.readFileSync(leaderboardPath, 'utf-8'));
    res.json(data);
  } catch {
    res.status(500).send('Error loading leaderboard');
  }
});
app.get('/api/check-username/:name', (req, res) => {
  const name = req.params.name;
  const leaderboardPath = path.join(__dirname, 'leaderboard.json');

  if (!fs.existsSync(leaderboardPath)) {
    return res.json({ exists: false });
  }

  const data = JSON.parse(fs.readFileSync(leaderboardPath, 'utf-8'));
  const usernames = Object.keys(data);
  res.json({ exists: usernames.includes(name) });
});
app.listen(PORT, () => {
  console.log(`✅ Ball Knowledge 3.0 running at http://localhost:${PORT}`);
});

