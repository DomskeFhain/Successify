const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

router.get("/todolist", auth, (req, res) => {
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

router.post("/todolist", auth, (req, res) => {
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

router.put("/todolist/:listId", auth, (req, res) => {
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

router.delete("/todolist/:listId", auth, (req, res) => {
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

router.get("/tasks/:listId", auth, (req, res) => {
  const id = req.params.listId;
  db.all("SELECT * FROM tasksList WHERE listID = ?", [id], (err, rows) => {
    if (err) {
      return res.status(500).send("Error in Query Request");
    } else {
      return res.status(200).json(rows);
    }
  });
});

router.post("/tasks/:listId", auth, (req, res) => {
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

router.put("/tasks/:taskId", auth, (req, res) => {
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

router.delete("/tasks/:taskId", auth, (req, res) => {
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

module.exports = router;
