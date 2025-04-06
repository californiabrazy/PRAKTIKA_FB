const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../front')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/index.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/index2.html'));
});

app.listen(PORT, () => {
    console.log(`Front: http://localhost:${PORT}`);
});