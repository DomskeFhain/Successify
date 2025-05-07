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
      .json({ error: "Internal Server Error, please try again later!" });
  }
});

app.delete("/finances/:financeId", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { financeId } = req.params;

    db.get(
      "SELECT * FROM finances WHERE id = ? AND user_id = ?",
      [parseInt(financeId), id],
      (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Delete failed" });
        }
        if (!row) {
          return res.status(404).json({ message: "No Data found!" });
        }

        db.run(
          "DELETE FROM finances WHERE id = ? AND user_id = ?",
          [parseInt(financeId), id],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Delete failed" });
            }

            res.status(200).json({
              message: "Delete was Successful",
            });
          }
        );
      }
    );
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
        res
          .status(500)
          .send(
            "Error in the query request. Please check the error in the console."
          );
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
  const { cal_date, cal_time, cal_title, cal_description } = req.body;
  const { id } = req.user;

  db.run(
    "INSERT INTO calendar_list (cal_title, cal_date, cal_time, user_id, cal_description) VALUES (?, ?, ?, ?, ?)",
    [cal_title, cal_date, cal_time, id, cal_description],
    (err) => {
      if (err) {
        res
          .status(500)
          .send(
            "Error in the query request. Please check the error in the console."
          );
        console.log(err);
      } else {
        res.status(201).send("Calendar entry created successfully!");
      }
    }
  );
});

// Calendar Put

app.put("/calendar/:cal_id", auth, (req, res) => {
  const { cal_id } = req.params;
  const { cal_date, cal_time, cal_title, cal_description } = req.body;
  const { id } = req.user;

  console.log(req.params)
  db.run(
    "UPDATE calendar_list SET cal_title = ?, cal_date = ?, cal_time = ?, cal_description = ? WHERE cal_id = ? AND user_id = ?",
    [cal_title, cal_date, cal_time, cal_description, cal_id, id],
    (err) => {
      if (err) {
        res
          .status(500)
          .send(
            "Error in the query request. Please check the error in the console."
          );
        console.log(err);
      } else {
        res.status(200).send("Calendar entry updated successfully!");
      }
    }
  );
});


// Calendar Delete

app.delete("/calendar/:cal_id", auth, (req, res) => {
  const { cal_id } = req.params;
  const { id } = req.user;

  db.run(
    "DELETE FROM calendar_list WHERE cal_id = ? AND user_id = ?",
    [cal_id, id],
    (err) => {
      if (err) {
        res
          .status(500)
          .send(
            "Error in the query request. Please check the error in the console."
          );
        console.log(err);
      } else {
        res.status(200).send("Calendar entry deleted successfully!");
      }
    }
  );
});

// Calendar API Routes End

// Shopping-List

app.get("/shoppinglist", auth, (req, res) => {
  try {
    const { id } = req.user;
    console.log(id);
    db.all(
      "SELECT * FROM shoppinglist WHERE user_id = ?",
      [id],
      (err, rows) => {
        if (!rows) {
          return res.status(400).send("no data found");
        }
        res.status(200).json(rows);
      }
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, please try again later!" });
  }
});

app.post("/shoppinglist", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { item, quantity, price, date } = req.body;

    db.run(
      "INSERT INTO shoppinglist (user_id, item, quantity, price, date) VALUES (?, ?, ?, ?, ?)",
      [id, item, quantity, price, date],
      (err) => {
        if (err) {
          res.status(500).send("Error in the query request. Please check the error in the console.");
          console.log(err);
        } else {
          res.status(201).send("Shopping List entry created successfully!");
        }
      }
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, please try again later!" });
  }
})

app.put("/shoppinglist/:id", auth, (req, res) => {
  try {
    const { id } = req.params;
    const { item, quantity, price, date } = req.body;

    db.run(
      "UPDATE shoppinglist SET item = ?, quantity = ?, price = ?, date = ? WHERE id = ?",
      [item, quantity, price, date, id],
      (err) => {
        if (err) {
          res.status(500).send("Error in the query request. Please check the error in the console.");
          console.log(err);
        } else {
          res.status(200).send("Shopping List entry updated successfully!");
        }
      }
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, please try again later!" });
  }
})

app.delete("/shoppinglist/:id", auth, (req, res) => {
  try {
    const { id } = req.params;
    db.run("DELETE FROM shoppinglist WHERE id = ?", [id], (err) => {
      if (err) {
        res.status(500).send("Error in the query request. Please check the error in the console.");
        console.log(err);
      } else {
        res.status(200).send("Shopping List entry deleted successfully!");
      }
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, please try again later!" });
  }
});

// Shoppinglist End

// To-Do

//LIST ROUTE

app.get("/todolist", auth, (req, res) => {
  db.all("SELECT * FROM todoList WHERE userID = ?", [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).send("Error in Query Request");
    } else {
      return res.status(200).json(rows);
    }
  });
});

app.post("/todolist", auth, (req, res) => {
  db.run("INSERT INTO todoList (listName, userId) VALUES (?, ?)", [req.body.listName, req.user.id], (err) => {



    if (err) {
      return res.status(500).send("ERROR!");
    } else {
      return res.status(200).json([{ message: "List created successfully", }]);
    }
  })
});

app.put("/todolist/:listId", auth, (req, res) => {
  const id = req.params.listId;
  const listName = req.body.listName;
  db.run("UPDATE todoList SET listName = ? WHERE listId = ?", [listName, id], (err) => {
    if (err) {
      return res.status(500).send("ERROR!");
    } else {
      return res.status(200).json([{ message: "List updated successfully", }]);
    }
  })
})

app.delete("/todolist/:listId", auth, (req, res) => {
  const id = req.params.listId;
  db.run("DELETE FROM todoList WHERE listId = ?", [id], (err) => {
    if (err) {
      return res.status(500).send("ERROR!");
    } else {
      return res.status(200).json([{ message: "List deleted successfully", }]);
    }
  })
})

// TASK ROUTE

app.get("/tasks/:listId", auth, (req, res) => {
  const id = req.params.listId;
  db.all("SELECT * FROM tasksList WHERE listID = ?", [id], (err, rows) => {
    if (err) {
      return res.status(500).send("Error in Query Request");
    } else {
      return res.status(200).json(rows);
    }
  });
});

app.post("/tasks/:listId", auth, (req, res) => {
  const id = req.params.listId;
  const taskName = req.body.taskName;
  db.run("INSERT INTO tasksList (taskName, listID) VALUES (?, ?)", [taskName, id
  ], (err) => {


    if (err) {
      return res.status(500).send("ERROR!");
    } else {
      return res.status(200).json([{ message: "Task created successfully", }]);
    }
  }
  )
});

app.put("/tasks/:taskId", auth, (req, res) => {
  const id = req.params.taskId;
  const taskName = req.body.taskName;
  db.run("UPDATE tasksList SET taskName = ? WHERE listId = ?", [taskName, id], (err) => {
    if (err) {
      return res.status(500).send("ERROR!");
    } else {
      return res.status(200).json([{ message: "Task updated successfully", }]);
    }
  });
})

app.delete("/tasks/:taskId", auth, (req, res) => {
  const id = req.params.taskId;
  console.log(id);
  db.run("DELETE FROM tasksList WHERE taskId = ?", [id], (err) => {
    if (err) {
      return res.status(500).send("ERROR!");
    } else {
      return res.status(200).json([{ message: "Task deleted successfully", }]);
    }

  });
})

// To-Do End

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
