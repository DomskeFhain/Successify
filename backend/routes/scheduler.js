const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

router.get("/scheduler", auth, (req, res) => {
  const { month, year } = req.query;
  const { id } = req.user;

  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`;

  db.all(
    "SELECT * FROM scheduler WHERE createdBy = ? AND date BETWEEN ? AND ?",
    [id, startDate, endDate],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error in the query request.");
      }
      if (!rows.length) {
        return res.status(404).send("No data found for this user.");
      }
      res.status(200).json(rows);
    }
  );
});

router.post("/scheduler", auth, (req, res) => {
  const {
    date,
    startHour,
    endHour,
    label,
    groupLabel,
    color,
  } = req.body;
  const { id } = req.user;

  db.run(
    `INSERT INTO scheduler (
        date, startHour, endHour, label, groupLabel, color, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      date,
      startHour,
      endHour,
      label,
      groupLabel,
      color,
      id,
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error creating scheduler entry.");
      }
      res.status(201).send("Scheduler entry created successfully!");
    }
  );
});

router.put("/scheduler/:sced_id", auth, (req, res) => {
  const { sced_id } = req.params;
  const {
    date,
    startHour,
    endHour,
    label,
    groupLabel,
    color,
  } = req.body;
  const { id } = req.user;

  db.run(
    `UPDATE scheduler 
       SET date = ?, startHour = ?, endHour = ?, label = ?, groupLabel = ?, color = ?
       WHERE id = ? AND createdBy = ?`,
    [
      date,
      startHour,
      endHour,
      label,
      groupLabel,
      color,
      sced_id,
      id,
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error updating scheduler entry.");
      }
      res.status(200).send("Scheduler entry updated successfully!");
    }
  );
});

router.delete("/scheduler/:sced_id", auth, (req, res) => {
  const { sced_id } = req.params;
  const { id } = req.user;

  db.run(
    "DELETE FROM scheduler WHERE id = ? AND createdBy = ?",
    [sced_id, id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error deleting scheduler entry.");
      }
      res.status(200).send("Scheduler entry deleted successfully!");
    }
  );
});

module.exports = router;
