-- SQLite
CREATE TABLE todo (
listName TEXT, 
taskName TEXT, 
status TEXT, 
listId INTEGER PRIMARY KEY AUTOINCREMENT, 
userId INTEGER, 
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE);

SELECT * FROM todoList;
SELECT * FROM tasksList;

DROP TABLE todo;
DROP TABLE todoList;
DROP TABLE tasksList;

CREATE TABLE todoList (
    listName TEXT NOT NULL,
    listID INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasksList (
    taskID INTEGER PRIMARY KEY AUTOINCREMENT,
    taskName TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    listID INTEGER,
    FOREIGN KEY (listID) REFERENCES todoList(listID) ON DELETE CASCADE
);

SELECT tasksList.taskName FROM tasksList JOIN todoList ON tasksList.listID = todoList.listID WHERE todoList.listID = 2;
