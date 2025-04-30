const express = require("express");
const app = express();
const port = 9000;
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/successify.db");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const cors = require("cors");

// Hilfsfunktionen

// Passwort Hashen

async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

// gehashtes Passwort vergleichen

async function verifyPassword(inputPassword, storedHash) {
  const match = await bcrypt.compare(inputPassword, storedHash);
  return match;
}

// Datenbank

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
  );
  process.on("exit", function () {
    db.close();
  });
});

// db.run("INSERT INTO users (username, password) VALUES (?, ?)", [
//   "test",
//   "qwertz",
// ]);

// API
app.use(cors());

app.use(express.json());

// Users

// Neuen Nutzer hinzufügen

app.post("/users", (req, res) => {
  const { username, password } = req.body;

  db.all(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, rows) => {
      if (err) {
        res.status(500).send("Fehler in deiner Query Anfrage");
      } else if (rows.length > 0) {
        res.status(400).send("Benutzername existiert bereits");
      } else {
        const hashedPassword = await hashPassword(password);
        db.run(
          "INSERT INTO users (username, password) VALUES (?, ?)",
          [username, hashedPassword],
          (err) => {
            if (err) {
              res.status(500).send("Fehler beim Erstellen des Benutzers");
            } else {
              res.status(201).send("Benutzer erfolgreich erstellt");
            }
          }
        );
      }
    }
  );
});

// Login

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
