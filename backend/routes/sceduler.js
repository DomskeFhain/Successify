const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Sceduler API START

// =====================
// GET: Alle Einträge eines Monats
// Route: GET /sceduler?month=05&year=2025
// =====================
router.get("/sceduler", auth, (req, res) => {
  const { month, year } = req.query;
  const { id } = req.user;

  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`;

  db.all(
    "SELECT * FROM sceduler WHERE user_id = ? AND sced_date BETWEEN ? AND ?",
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

// =====================
// POST: Neuen Eintrag erstellen
// Route: POST /sceduler
// =====================
router.post("/sceduler", auth, (req, res) => {
  const {
    sced_date,
    sced_start_time,
    sced_end_time,
    sced_title,
    sced_description,
    sced_event,
  } = req.body;
  const { id } = req.user;

  db.run(
    `INSERT INTO sceduler (
        sced_date, sced_start_time, sced_end_time, 
        sced_title, sced_description, sced_event, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      sced_date,
      sced_start_time,
      sced_end_time,
      sced_title,
      sced_description,
      sced_event,
      id,
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error creating sceduler entry.");
      }
      res.status(201).send("sceduler entry created successfully!");
    }
  );
});

// =====================
// PUT: Bestehenden Eintrag aktualisieren
// Route: PUT /sceduler/:sced_id
// =====================
router.put("/sceduler/:sced_id", auth, (req, res) => {
  const { sced_id } = req.params;
  const {
    sced_date,
    sced_start_time,
    sced_end_time,
    sced_title,
    sced_description,
    sced_event,
  } = req.body;
  const { id } = req.user;

  db.run(
    `UPDATE sceduler 
       SET sced_date = ?, sced_start_time = ?, sced_end_time = ?, 
           sced_title = ?, sced_description = ?, sced_event = ?
       WHERE sced_id = ? AND user_id = ?`,
    [
      sced_date,
      sced_start_time,
      sced_end_time,
      sced_title,
      sced_description,
      sced_event,
      sced_id,
      id,
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error updating sceduler entry.");
      }
      res.status(200).send("sceduler entry updated successfully!");
    }
  );
});

// =====================
// DELETE: Eintrag löschen
// Route: DELETE /sceduler/:sced_id
// =====================
router.delete("/sceduler/:sced_id", auth, (req, res) => {
  const { sced_id } = req.params;
  const { id } = req.user;

  db.run(
    "DELETE FROM sceduler WHERE sced_id = ? AND user_id = ?",
    [sced_id, id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error deleting sceduler entry.");
      }
      res.status(200).send("sceduler entry deleted successfully!");
    }
  );
});
// Sceduler API END

module.exports = router;
