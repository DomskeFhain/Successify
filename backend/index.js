const express = require("express");
const app = express();
const port = 9000;
const cors = require("cors");

// API
app.use(cors());

app.use(express.json());

// Users

const usersRoutes = require("./routes/users");
app.use(usersRoutes);

// Finances
const finacesRoutes = require("./routes/finances");
app.use(finacesRoutes);

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

  console.log(req.params);
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
          res
            .status(500)
            .send(
              "Error in the query request. Please check the error in the console."
            );
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
});

app.put("/shoppinglist/:id", auth, (req, res) => {
  try {
    const { id } = req.params;
    const { item, quantity, price, date } = req.body;

    db.run(
      "UPDATE shoppinglist SET item = ?, quantity = ?, price = ?, date = ? WHERE id = ?",
      [item, quantity, price, date, id],
      (err) => {
        if (err) {
          res
            .status(500)
            .send(
              "Error in the query request. Please check the error in the console."
            );
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
});

app.delete("/shoppinglist/:id", auth, (req, res) => {
  try {
    const { id } = req.params;
    db.run("DELETE FROM shoppinglist WHERE id = ?", [id], (err) => {
      if (err) {
        res
          .status(500)
          .send(
            "Error in the query request. Please check the error in the console."
          );
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
  db.all(
    "SELECT * FROM todoList WHERE userID = ?",
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).send("Error in Query Request");
      } else {
        return res.status(200).json(rows);
      }
    }
  );
});

app.post("/todolist", auth, (req, res) => {
  db.run(
    "INSERT INTO todoList (listName, userId) VALUES (?, ?)",
    [req.body.listName, req.user.id],
    (err) => {
      if (err) {
        return res.status(500).send("ERROR!");
      } else {
        return res.status(200).json([{ message: "List created successfully" }]);
      }
    }
  );
});

app.put("/todolist/:listId", auth, (req, res) => {
  const id = req.params.listId;
  const listName = req.body.listName;
  db.run(
    "UPDATE todoList SET listName = ? WHERE listId = ?",
    [listName, id],
    (err) => {
      if (err) {
        return res.status(500).send("ERROR!");
      } else {
        return res.status(200).json([{ message: "List updated successfully" }]);
      }
    }
  );
});

app.delete("/todolist/:listId", auth, (req, res) => {
  const id = req.params.listId;
  db.run("DELETE FROM todoList WHERE listId = ?", [id], (err) => {
    if (err) {
      return res.status(500).send("ERROR!");
    } else {
      return res.status(200).json([{ message: "List deleted successfully" }]);
    }
  });
});

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
  db.run(
    "INSERT INTO tasksList (taskName, listID) VALUES (?, ?)",
    [taskName, id],
    (err) => {
      if (err) {
        return res.status(500).send("ERROR!");
      } else {
        return res.status(200).json([{ message: "Task created successfully" }]);
      }
    }
  );
});

app.put("/tasks/:taskId", auth, (req, res) => {
  const id = req.params.taskId;
  const taskName = req.body.taskName;
  db.run(
    "UPDATE tasksList SET taskName = ? WHERE listId = ?",
    [taskName, id],
    (err) => {
      if (err) {
        return res.status(500).send("ERROR!");
      } else {
        return res.status(200).json([{ message: "Task updated successfully" }]);
      }
    }
  );
});

app.delete("/tasks/:taskId", auth, (req, res) => {
  const id = req.params.taskId;
  console.log(id);
  db.run("DELETE FROM tasksList WHERE taskId = ?", [id], (err) => {
    if (err) {
      return res.status(500).send("ERROR!");
    } else {
      return res.status(200).json([{ message: "Task deleted successfully" }]);
    }
  });
});

// To-Do End

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
