const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Expanses

router.get("/financesYears", auth, (req, res) => {
  try {
    const { id } = req.user;

    db.all(
      `SELECT DISTINCT years FROM (
      SELECT strftime('%Y', date) AS years FROM finances WHERE user_id = ?
      UNION
      SELECT strftime('%Y', date) AS years FROM financesIncome WHERE user_id = ?)
      ORDER BY years DESC;`,
      [id, id],
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

router.get("/financesMonths", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { year } = req.query;

    db.all(
      `SELECT DISTINCT months FROM (
        SELECT CAST(strftime('%m', date) AS INTEGER) AS months
        FROM finances
        WHERE strftime('%Y', date) = ? AND user_id = ?
        UNION
        SELECT CAST(strftime('%m', date) AS INTEGER) AS months
        FROM financesIncome
        WHERE strftime('%Y', date) = ? AND user_id = ?
      )
      ORDER BY months;`,
      [year, id, year, id],
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

router.get("/financesFilteredMonths", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { year } = req.query;

    db.all(
      `SELECT CAST(strftime('%m', date) AS INTEGER) AS months
        FROM finances
        WHERE strftime('%Y', date) = ? AND user_id = ?
      ORDER BY months;`,
      [year, id, year, id],
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

router.get("/allFinancesMonths", auth, (req, res) => {
  try {
    const { id } = req.user;

    db.all(
      `SELECT DISTINCT months FROM (
        SELECT CAST(strftime('%m', date) AS INTEGER) AS months
        FROM finances
        WHERE user_id = ?
        UNION
        SELECT CAST(strftime('%m', date) AS INTEGER) AS months
        FROM financesIncome
        WHERE user_id = ?
      )
      ORDER BY months;`,
      [id, id],
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

router.get("/financesCategorys", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { year, month, startDate, endDate } = req.query;

    let query = `SELECT DISTINCT category FROM finances
      WHERE user_id = ?`;

    const values = [id];

    if (year) {
      query += ` AND strftime('%Y', date) = ?`;
      values.push(year);
    }

    if (month) {
      query += ` AND strftime('%m', date) = ?`;
      values.push(month);
    }

    if (startDate && endDate) {
      query += ` AND date BETWEEN ? AND ?`;
      values.push(startDate, endDate);
    }

    query += ` ORDER BY category;`;

    db.all(query, values, (err, rows) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Database Error, please try again later!" });
      }
      res.status(200).json(rows);
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, Please try again later!" });
  }
});

router.get("/monthlyFinances", auth, (req, res) => {
  try {
    const { id, username } = req.user;
    const { startDate, endDate, category } = req.query;

    let query = `
                SELECT id, category, note, costs, date
                FROM finances
                WHERE user_id = ?
                AND date BETWEEN ? AND ?
                `;

    const values = [id, startDate, endDate];

    if (category) {
      query += ` AND category = ?`;
      values.push(category);
    }

    query += ` ORDER BY date`;

    db.all(query, values, (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }

      if (rows.length === 0) {
        return res.status(404).send("No Data Found");
      }

      res.status(200).json(rows);
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, Please try again later!" });
  }
});

router.get("/yearlyFinances", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { year, category } = req.query;

    let query = `
                SELECT id, category, note, costs, date
                FROM finances
                WHERE user_id = ?
                AND strftime('%Y', date) = ?
                `;

    const values = [id, year];

    if (category) {
      query += ` AND category = ?`;
      values.push(category);
    }

    query += ` ORDER BY date`;

    db.all(query, values, (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }
      if (rows.length === 0) {
        return res.status(404).send("No Data Found");
      }
      res.status(200).json(rows);
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, Please try again later!" });
  }
});

router.get("/allFinances", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { month, category } = req.query;

    let query = `
                SELECT id, category, note, costs, date
                FROM finances
                WHERE user_id = ?`;

    const values = [id];

    if (month) {
      query += ` AND strftime('%m', date) = ?`;
      values.push(month);
    }

    if (category) {
      query += ` AND category = ?`;
      values.push(category);
    }

    query += ` ORDER BY date`;

    db.all(query, values, (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }

      if (rows.length === 0) {
        return res.status(404).send("No Data Found");
      }

      res.status(200).json(rows);
    });
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
