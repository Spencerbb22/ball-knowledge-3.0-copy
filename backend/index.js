const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Serve frontend files (now located inside backend/frontend)
app.use(express.static(path.join(__dirname, 'frontend')));

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
    if (err) {
      console.error('❌ Error loading EPL questions:', err);
      return res.status(500).send('Error loading EPL questions');
    }
    res.json(JSON.parse(data));
  });
});

app.get('/api/mlb', (req, res) => {
  const filePath = path.join(__dirname, 'mlb.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('❌ Error loading MLB questions:', err);
      return res.status(500).send('Error loading MLB questions');
    }
    res.json(JSON.parse(data));
  });
});

app.get('/api/calls', (req, res) => {
  const filePath = path.join(__dirname, 'calls.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('❌ Error loading Famous Calls questions:', err);
      return res.status(500).send('Error loading Famous Calls questions');
    }
    res.json(JSON.parse(data));
  });
});

app.get('/api/nba', (req, res) => {
  res.status(501).send('NBA mode coming soon!');
});

app.get('/api/draft', (req, res) => {
  const filePath = path.join(__dirname, 'draft.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('❌ Error loading Draft Trivia questions:', err);
      return res.status(500).send('Error loading Draft Trivia questions');
    }
    res.json(JSON.parse(data));
  });
});

// ✅ NEW: Mixed mode (pulls from all except "calls")
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
    const thisOrThat = JSON.parse(fs.readFileSync(path.join(__dirname, 'this-or-that.json'), 'utf-8'));

    const mixed = [...nfl1, ...nfl2, ...mlb, ...epl, ...draft, ...thisOrThat];
    res.json(mixed);
  } catch (err) {
    console.error('❌ Error loading mixed mode questions:', err);
    res.status(500).send('Error loading mixed questions');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Ball Knowledge 3.0 running at http://localhost:${PORT}`);
});

