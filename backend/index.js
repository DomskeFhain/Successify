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

// Sceduler
const scedulerRoutes = require("./routes/sceduler");
app.use(scedulerRoutes);

// Shopping-List
const shoppinglistRoutes = require("./routes/shoppinglist");
app.use(shoppinglistRoutes);

// To-Do
const todolistRoutes = require("./routes/todolist");
app.use(todolistRoutes);

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
