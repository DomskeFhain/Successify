const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

router.get("/monthlyFinances", auth, (req, res) => {
  try {
    const { id, username } = req.user;
    const { startDate, endDate } = req.query;

    db.all(
      "SELECT id, category, note, costs, date FROM finances WHERE user_id = ? AND date between ? AND ?",
      [id, startDate, endDate],
      (err, rows) => {
        if (rows.length === 0) {
          return res.status(404).send("No Data Found");
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

router.post("/finances", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { category, costs, note, date } = req.body;

    if (!category || !costs || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    db.run(
      `INSERT INTO finances (user_id, category, note, costs, date)
         VALUES (?, ?, ?, ?, ?)`,
      [id, category, note, costs, date],
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

router.put("/finances", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { financeId, newCategory, newNote, newCosts, newDate } = req.body;

    let changes = [];
    let values = [];

    if (newCategory) {
      changes.push("category = ?");
      values.push(newCategory);
    }

    if (newNote !== undefined) {
      changes.push("note = ?");
      values.push(newNote);
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

router.delete("/finances/:financeId", auth, (req, res) => {
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

module.exports = router;
