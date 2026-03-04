const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const db = require('./database');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'intranet-secret',
  resave: false,
  saveUninitialized: false
}));

// 首頁
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.sendFile(path.join(__dirname, 'public/login.html'));
  }
  res.send(`
    <h2>歡迎 ${req.session.user.username}</h2>
    <p>角色：${req.session.user.role}</p>
    <a href="/logout">登出</a>
  `);
});

// 登入
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (!user) {
        return res.send("帳號不存在");
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.send("密碼錯誤");
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role
      };

      res.redirect('/');
    }
  );
});

// 登出
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashedPassword, role],
    function (err) {
      if (err) {
        return res.status(400).send("使用者已存在");
      }
      res.send("使用者建立成功");
    }
  );
});