const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;
const USERS_FILE = path.join(__dirname, '../users.json');
const CACHE_FILE = './cache.json';
const CACHE_TTL = 60 * 1000;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(session({
    secret: 'VIPERR',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 30
    }
}));

function readUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            writeUsers({});
            return {};
        }
        
        const content = fs.readFileSync(USERS_FILE, 'utf-8');
        if (!content.trim()) {
            return {};
        }
        
        return JSON.parse(content);
    } catch (err) {
        console.error('Ошибка при чтении users.json:', err);
        return {};
    }
}

function writeUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Ошибка при записи users.json:', err);
    }
}

app.post('/register', async (req, res) => {
    const { login, pass } = req.body;
    if (!login || !pass) return res.status(400).send('Заполните поля');

    const users = readUsers();
    if (users[login]) return res.status(409).send('Пользователь уже есть');

    const hashed = await bcrypt.hash(pass, 10);
    users[login] = { password: hashed };
    writeUsers(users);

    res.sendStatus(200);
});

app.post('/login', async (req, res) => {
    const { login, pass } = req.body;
    if (!login || !pass) return res.status(400).send('Заполните поля');

    const users = readUsers();
    const user = users[login];

    if (!user) return res.status(401).send('Пользователь не найден');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) return res.status(401).send('Неверный пароль');

    req.session.user = login; 
    res.sendStatus(200);
});

app.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('Не авторизован');
    }

    res.json({ login: user });
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Ошибка при удалении сессии:', err);
            return res.status(500).send('Ошибка при выходе');
        }

        res.clearCookie('connect.sid');
        res.sendStatus(200);
    });
});

app.get('/data', (req, res) => {
    // 1. Проверяем, есть ли кэш
    if (fs.existsSync(CACHE_FILE)) {
        const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        const age = Date.now() - cache.timestamp;

        if (age < CACHE_TTL) {
            // 2. Если кэш свежий — отдаем его
            return res.json({ source: 'cache', data: cache.data });
        }
    }

    // 3. Генерируем новые данные
    const freshData = `Текущее время: ${new Date().toLocaleTimeString()}`;

    // 4. Сохраняем в кэш
    fs.writeFileSync(CACHE_FILE, JSON.stringify({
        timestamp: Date.now(),
        data: freshData
    }, null, 2));

    // 5. Отправляем клиенту
    res.json({ source: 'fresh', data: freshData });
});

app.listen(PORT, () => {
    console.log(`Back: http://localhost:${PORT}`);
})