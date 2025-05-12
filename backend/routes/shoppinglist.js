const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

router.get("/shoppinglist", auth, (req, res) => {
  try {
    const { id } = req.user;
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

router.post("/shoppinglist", auth, (req, res) => {
  try {
    const { id } = req.user;
    const { item, quantity, price, date } = req.body;

    db.run(
      "INSERT INTO shoppinglist (user_id, item, quantity, price, date, completed) VALUES (?, ?, ?, ?, ?, ?)",
      [id, item, quantity, price, date, false],
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

router.put("/shoppinglist/:id", auth, (req, res) => {
  try {
    const { id } = req.params;
    const { item, quantity, price, date, completed } = req.body;

    db.run(
      "UPDATE shoppinglist SET item = ?, quantity = ?, price = ?, date = ?, completed = ? WHERE id = ?",
      [item, quantity, price, date, completed, id],
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

router.delete("/shoppinglist/:id", auth, (req, res) => {
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

module.exports = router;
