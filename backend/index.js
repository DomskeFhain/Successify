const express = require("express");
const app = express();
const port = 9000;
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/successify.db");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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

// JWT Middlewear zur überprüfung des JWT Tokens

function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Kein Token vorhanden" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token ungültig" });

    req.user = user;
    next();
  });
}

// Datenbank

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");
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

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, rows) => {
      if (err) {
        res.status(500).send("Fehler in deiner Query Anfrage");
      } else if (rows) {
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

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, rows) => {
      if (err) {
        return res.status(500).send("Fehler in deiner Query Anfrage");
      } else if (!rows) {
        return res.status(400).send("User not found!");
      } else {
        const match = await verifyPassword(password, rows.password);
        if (!match) {
          return res
            .status(400)
            .send(
              "Error during login attempt, please check your entries and try again!"
            );
        }
        const token = jwt.sign(
          { id: rows.id, username: rows.username },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        return res.status(200).json({
          message: "Login erfolgreich",
          token: token,
        });
      }
    }
  );
});

// Testroute mit der Token Überprüfung

app.get("/protected", auth, (req, res) => {
  console.log(req.user);
  const { id, username } = req.user;
  console.log(id);
  res.send("Du bist eingeloggt!");
});


app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});


