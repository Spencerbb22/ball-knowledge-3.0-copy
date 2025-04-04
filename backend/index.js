const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

app.get('/api/this-or-that', (req, res) => {
  const filePath = path.join(__dirname, 'this-or-that.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Error loading This or That questions');
    res.json(JSON.parse(data));
  });
});

app.get('/api/nfl', (req, res) => {
  const file1 = path.join(__dirname, 'nfl1.json');
  const file2 = path.join(__dirname, 'nfl2.json');
  try {
    const data1 = JSON.parse(fs.readFileSync(file1, 'utf-8'));
    const data2 = JSON.parse(fs.readFileSync(file2, 'utf-8')).map(q => ({
      question: q.question,
      options: q.options || q.choices || [],
      answer: q.answer || q.correct_answer || ""
    }));
    const combined = [...data1, ...data2];
    res.json(combined);
  } catch (err) {
    console.error('❌ Error loading NFL files:', err);
    res.status(500).send('Error loading NFL questions');
  }
});

app.get('/api/epl', (req, res) => {
  const filePath = path.join(__dirname, 'epl.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Error loading EPL questions');
    res.json(JSON.parse(data));
  });
});

app.get('/api/mlb', (req, res) => {
  const filePath = path.join(__dirname, 'mlb.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Error loading MLB questions');
    res.json(JSON.parse(data));
  });
});

app.get('/api/calls', (req, res) => {
  const filePath = path.join(__dirname, 'calls.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Error loading Famous Calls questions');
    res.json(JSON.parse(data));
  });
});

app.get('/api/nba', (req, res) => {
  const filePath = path.join(__dirname, 'nba.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Error loading NBA questions');
    res.json(JSON.parse(data));
  });
});

app.get('/api/draft', (req, res) => {
  const filePath = path.join(__dirname, 'draft.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Error loading Draft questions');
    res.json(JSON.parse(data));
  });
});

app.get('/api/mixed', (req, res) => {
  try {
    const nfl1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'nfl1.json'), 'utf-8'));
    const nfl2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'nfl2.json'), 'utf-8')).map(q => ({
      question: q.question,
      options: q.options || q.choices || [],
      answer: q.answer || q.correct_answer || ""
    }));
    const mlb = JSON.parse(fs.readFileSync(path.join(__dirname, 'mlb.json'), 'utf-8'));
    const epl = JSON.parse(fs.readFileSync(path.join(__dirname, 'epl.json'), 'utf-8'));
    const draft = JSON.parse(fs.readFileSync(path.join(__dirname, 'draft.json'), 'utf-8'));
    const mixed = [...nfl1, ...nfl2, ...mlb, ...epl, ...draft];
    res.json(mixed);
  } catch (err) {
    console.error('❌ Error loading mixed mode questions:', err);
    res.status(500).send('Error loading mixed questions');
  }
});

app.get('/api/daily-challenge', (req, res) => {
  const cacheFile = path.join(__dirname, 'daily-challenge-cache.json');
  const now = new Date();

  if (fs.existsSync(cacheFile)) {
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    if (cache.date === now.toISOString().slice(0, 10)) {
      return res.json(cache.questions);
    }
  }

  try {
    const nfl1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'nfl1.json'), 'utf-8'));
    const nfl2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'nfl2.json'), 'utf-8'));
    const mlb = JSON.parse(fs.readFileSync(path.join(__dirname, 'mlb.json'), 'utf-8'));
    const epl = JSON.parse(fs.readFileSync(path.join(__dirname, 'epl.json'), 'utf-8'));
    const draft = JSON.parse(fs.readFileSync(path.join(__dirname, 'draft.json'), 'utf-8'));
    const all = [...nfl1, ...nfl2, ...mlb, ...epl, ...draft];
    const shuffled = all.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    fs.writeFileSync(cacheFile, JSON.stringify({ date: now.toISOString().slice(0, 10), questions: selected }, null, 2));
    res.json(selected);
  } catch (err) {
    console.error('❌ Error generating Daily Challenge:', err);
    res.status(500).send('Error generating daily challenge');
  }
});

app.post('/api/save-score', (req, res) => {
  const { username, mode, score } = req.body;
  if (!username || !mode || typeof score !== 'number') {
    return res.status(400).send('Missing required fields');
  }
  const filePath = path.join(__dirname, 'leaderboard.json');
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  if (!data[mode]) data[mode] = [];
  data[mode].push({ username, score, date: new Date().toISOString().slice(0, 10) });
  data[mode] = data[mode].sort((a, b) => b.score - a.score).slice(0, 5);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.sendStatus(200);
});

app.get('/api/leaderboard', (req, res) => {
  const filePath = path.join(__dirname, 'leaderboard.json');
  if (!fs.existsSync(filePath)) return res.json({});
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`✅ Ball Knowledge 3.0 running at http://localhost:${PORT}`);
});

