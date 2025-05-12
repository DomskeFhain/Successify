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

// Profile

router.get("/profile", auth, (req, res) => {
  const { id } = req.user;

  try {
    db.get("SELECT id, username from users WHERE id = ?", [id], (err, user) => {
      if (err) {
        return res.json({ error: "Database error, " + err });
      }
      res.status(200).json(user);
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error, please try again later!" });
  }
});

// Change User

router.put("/user", auth, (req, res) => {
  const { id } = req.user;
  const { newUsername, password, newPassword } = req.body;

  try {
    if (newUsername) {
      db.get(
        "SELECT * from users WHERE username = ?",
        [newUsername],
        (err, user) => {
          if (err) {
            return res.json({ error: "Database error, " + err });
          }
          if (user) {
            return res
              .status(400)
              .json({ message: "Username already exists!" });
          }

          db.run(
            "UPDATE users SET username = ? WHERE id = ?",
            [newUsername, id],
            (err) => {
              if (err) {
                return res.json({ error: "Database error, " + err });
              }
              return res.status(200).json({
                message: `Successfully changed Username to ${newUsername}`,
              });
            }
          );
        }
      );
    }

    if (password && newPassword) {
      db.get("SELECT * from users WHERE id = ?", [id], async (err, user) => {
        if (err) {
          return res.json({ error: "Database error, " + err });
        }
        if (user) {
          const match = await verifyPassword(password, user.password);

          if (!match) {
            return res
              .status(400)
              .json({ message: "Your password is not correct" });
          }
          const hashedPassword = await hashPassword(newPassword);
          db.run(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, id],
            (err) => {
              if (err) {
                return res.json({ error: "Database error, " + err });
              }
              return res
                .status(200)
                .json({ message: "Successfully changed password!" });
            }
          );
        }
      });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error, please try again later!" });
  }
});

// Delete User

router.delete("/user", auth, (req, res) => {
  const { id } = req.user;
  try {
    db.run("DELETE FROM users WHERE id = ?", [id], (err) => {
      if (err) {
        return res.json({ error: "Database error, " + err });
      }
      res.status(200).json({ message: `Successfully deleted User!` });
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error, please try again later!" });
  }
});

module.exports = router;
