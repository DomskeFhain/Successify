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

// Finances

app.get("/monthlyFinances", auth, (req, res) => {
  try {
    const { id, username } = req.user;
    const { startDate, endDate } = req.query;
    console.log(req.query);

    db.all(
      "SELECT id, category, costs, date FROM finances WHERE user_id = ? AND date between ? AND ?",
      [id, startDate, endDate],
      (err, rows) => {
        if (rows.length === 0) {
          return res.status(400).send("No Data Found");
        }
        res.status(200).json(rows);
      }
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, Please try again later!" });
  }
});

app.post("/finances", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { category, costs, date } = req.body;

    if (!category || !costs || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    db.run(
      `INSERT INTO finances (user_id, category, costs, date)
       VALUES (?, ?, ?, ?)`,
      [id, category, costs, date],
      function (err) {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ error: "Database Error, please try again later!" });
        }

        res.status(201).json({
          message: "Finance entry created successfully",
        });
      }
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, Please try again later!" });
  }
});


app.put("/finances", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { financeId, newCategory, newCosts, newDate } = req.body;

    let changes = [];
    let values = [];

    if (newCategory) {
      changes.push("category = ?");
      values.push(newCategory);
    }

    if (newCosts) {
      changes.push("costs = ?");
      values.push(newCosts);
    }

    if (newDate) {
      changes.push("date = ?");
      values.push(newDate);
    }

    if (changes.length === 0) {
      return res.status(400).json({ message: "No update fields provided." });
    }

    values.push(financeId);

    const query = `UPDATE finances
                  SET ${changes.join(", ")}
                  WHERE id = ?`;

    db.run(query, values, function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Update failed" });
      }

      res.status(200).json({
        message: "Update was Successful",
      });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, Please try again later!" });
  }
});


// Calendar API Routes
// Calender Get

// Route: http://localhost:9000/calendar?month=05&year=2025
app.get("/calendar", auth, (req, res) => {
  const { month, year } = req.query;
  const { id } = req.user;


  db.all(
    "SELECT * FROM calendar_list WHERE user_id = ? AND cal_date BETWEEN ? AND ?",
    [id, `${year}-${month}-01`, `${year}-${month}-31`], // Here i make a date range for the month so i become come the full month 
    (err, rows) => {
      if (err) {
        res.status(500).send("Error in the query request. Please check the error in the console.");
        console.log(err);
      } else if (!rows.length) {
        res.status(404).send("No data found for this user with the id " + id);
      } else {
        res.status(200).json(rows);
      }
    }
  );
  
});

// Calendar Post 

app.post("/calendar", auth, (req, res) => {
  const { cal_date, cal_time ,cal_title, cal_description } = req.body;
  const { id } = req.user;

  db.run(
    "INSERT INTO calendar_list (cal_title, cal_date, cal_time, user_id, cal_description) VALUES (?, ?, ?, ?, ?)",
    [cal_title, cal_date, cal_time, id, cal_description],
    (err) => {
      if (err) {
        res.status(500).send("Error in the query request. Please check the error in the console.");
        console.log(err);
      } else {
        res.status(201).send("Calendar entry created successfully!");
      }
    }
  );
})

// Calendar API Routes End

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
