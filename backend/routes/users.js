const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const auth = require("../middleware/auth");

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

router.post("/users", (req, res) => {
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

router.post("/login", (req, res) => {
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

module.exports = router;
