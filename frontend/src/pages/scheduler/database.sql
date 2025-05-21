-- SQLite

-- {
--       id: "event-3",✅
--       label: "Medical consultation",✅
--       groupLabel: "Dr Menlendez Hary",
--       color: "#263686",
--       startHour: "13 PM",
--       endHour: "14 PM",
--       date: "2025-05-13",
--       createdAt: new Date(),
--       createdBy: "Kristina Mayer"
--     },

CREATE TABLE scheduler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label VARCHAR(255) NOT NULL,
  groupLabel VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  startHour TIME,
  endHour TIME,
  date DATE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdBy INTEGER,

  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO scheduler (label, groupLabel, color, startHour, endHour, date, createdBy)
VALUES 
  ('Frühstück mit Kunde', 'Geschäftlich', '#FFAA00', '08:30:00', '09:30:00', '2025-05-13', 3),
  ('Fitnessstudio', 'Privat', '#00CC99', '18:00:00', '19:00:00', '2025-05-14', 3),
  ('Online-Seminar', 'Weiterbildung', '#3366FF', '10:00:00', '12:00:00', '2025-05-15', 3);
