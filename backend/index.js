const express = require('express');
const app = express();
const port = 9000;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/successify.db');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cors = require('cors');

app.use(cors());

app.use(express.json());

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)');
    process.on("exit", function () {
        db.close();
    });
});



app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});