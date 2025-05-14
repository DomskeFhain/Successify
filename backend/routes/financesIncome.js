const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Income

router.get("/financesIncomeYears", auth, (req, res) => {
  try {
    const { id } = req.user;

    db.all(
      "SELECT DISTINCT strftime('%Y', date) AS years FROM financesIncome WHERE user_id = ? ORDER BY date DESC",
      [id],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ error: "Database Error, please try again later!" });
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

router.get("/financesIncomeMonths", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { year } = req.query;

    db.all(
      "SELECT DISTINCT CAST(strftime('%m', date) AS INTEGER) AS months FROM financesIncome WHERE strftime('%Y', date) = ? AND user_id = ? ORDER BY date;",
      [year, id],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ error: "Database Error, please try again later!" });
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

router.get("/monthlyFinancesIncome", auth, (req, res) => {
  try {
    const { id, username } = req.user;
    const { startDate, endDate } = req.query;

    db.all(
      "SELECT id, category, note, income, date FROM financesIncome WHERE user_id = ? AND date between ? AND ? ORDER BY date",
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

router.get("/yearlyFinancesIncome", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { year } = req.query;

    db.all(
      "SELECT id, category, note, income, date FROM financesIncome WHERE user_id = ? AND strftime('%Y', date) = ? ORDER BY date",
      [id, year],
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

router.post("/financesIncome", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { category, costs, note, date } = req.body;

    if (!category || !costs || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    db.run(
      `INSERT INTO financesIncome (user_id, category, note, costs, date)
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

router.put("/financesIncome", auth, (req, res) => {
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

    const query = `UPDATE financesIncome
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

router.delete("/financesIncome/:financeId", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { financeId } = req.params;

    db.get(
      "SELECT * FROM financesIncome WHERE id = ? AND user_id = ?",
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
          "DELETE FROM financesIncome WHERE id = ? AND user_id = ?",
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
