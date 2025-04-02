const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const db = sqlite3('users.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT
  );
`);

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const requireAuth = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/');
  next();
};

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (existing) return res.status(400).send('User exists');
  
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
  res.redirect('/');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).send('Invalid credentials');
  }
  
  req.session.userId = user.id;
  res.redirect('/profile');
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/');
});

app.get('/profile', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/profile.html'));
});

app.get('/data', requireAuth, (req, res) => {
  const cacheFile = 'data.cache';
  
  try {
    const cache = JSON.parse(fs.readFileSync(cacheFile));
    if (Date.now() - cache.timestamp < 60000) {
      return res.json(cache.data);
    }
  } catch (err) {}
  
  const newData = {
    timestamp: Date.now(),
    data: { value: Math.random(), message: "Cached for 1 minute" }
  };
  
  fs.writeFileSync(cacheFile, JSON.stringify(newData));
  res.json(newData.data);
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));