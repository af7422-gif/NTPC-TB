const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 模擬資料庫
const users = [
  { id: 1, username: "admin", password: "123456", role: "admin" },
  { id: 2, username: "manager", password: "123456", role: "manager" },
  { id: 3, username: "viewer", password: "123456", role: "viewer" }
];

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

  const user = users.find(u =>
    u.username === username && u.password === password
  );

  if (!user) {
    return res.send("帳號或密碼錯誤");
  }

  req.session.user = user;
  res.redirect('/');
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