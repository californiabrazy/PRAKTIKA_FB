const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'VIPERR';

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/index.html'))
});

const users = [];

app.post('/register', (req, res) => {
    const { username, userpassword } = req.body;

    const exitingUser = users.find(user => user.username == username);
    if(exitingUser) {
        return res.status(400).json({ message: 'Чел с таким именем уже есть' })
    }

    const newUser = { id: users.length + 1, username, userpassword };
    users.push(newUser);

    res.status(201).json({ message: 'Регистрация успешно пройдена' });
});

app.post('/login', (req, res) => {
    const { username, userpassword } = req.body;

    const user = users.find(user => user.username === username && user.userpassword === userpassword);
    if(!user){
        return res.status(400).json({ message: 'Такого пользователя нет' });
    }

    const token = jwt.sign( {id: user.id, username: user.username}, SECRET_KEY, { expiresIn: '1h' } );
    res.status(200).json({ token, message: 'Авторизация успешно пройдена' });
});

const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Доступ запрещен'});
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: 'Неавторизован, токен не выдан' });
    }
};

app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'Защищенный маршрут', user: req.user });
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
});