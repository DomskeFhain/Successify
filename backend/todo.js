app.get("/todo", auth, (req, res) => {
    db.all("SELECT * FROM todoList WHERE userID = ?", [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).send("Fehler in deiner Query Anfrage");
        } else {
            return res.status(200).json(rows);
        }
    });
});

app.post("/todo", auth, (req, res) => {
    db.run("INSERT INTO todoList (listName, userId) VALUES (?, ?)", [req.body.listName, req.user.id], (err) => {
        
    }
    );
    if (err) {
        return res.status(500).send("ERROR!");
    } else {
        return res.status(200).json([{message: "Liste erfolgreich erstellt",}]);
    }
})

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
        return res.status(200).json([{message: "Task erfolgreich erstellt",}]);
    }}
)})