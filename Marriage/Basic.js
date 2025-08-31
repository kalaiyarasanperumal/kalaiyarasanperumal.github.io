// app.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3001;

// Setup DB
const db = new sqlite3.Database("matrimony.db");
db.run("CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, mobile TEXT, photo TEXT)");

// File Upload Setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => {
  res.send(`
    <h2>Matrimony Website</h2>
    <a href="/add">Add Profile (Admin)</a> | <a href="/profiles">View Profiles</a>
  `);
});

// Add Profile Form
app.get("/add", (req, res) => {
  res.send(`
    <h2>Add New Profile</h2>
    <form method="POST" action="/add" enctype="multipart/form-data">
      Name: <input type="text" name="name" required><br>
      Age: <input type="number" name="age" required><br>
      Mobile: <input type="text" name="mobile" required><br>
      Photo: <input type="file" name="photo" accept="image/*" required><br>
      <button type="submit">Save</button>
    </form>
  `);
});

// Handle Profile Save
app.post("/add", upload.single("photo"), (req, res) => {
  const { name, age, mobile } = req.body;
  const photo = "/uploads/" + req.file.filename;
  db.run("INSERT INTO profiles (name, age, mobile, photo) VALUES (?, ?, ?, ?)", [name, age, mobile, photo], () => {
    res.redirect("/profiles");
  });
});

// List Profiles
app.get("/profiles", (req, res) => {
  db.all("SELECT * FROM profiles", (err, rows) => {
    let html = "<h2>Profiles</h2>";
    rows.forEach(p => {
      html += `<div style='margin:10px; padding:10px; border:1px solid #ccc;'>
        <img src="${p.photo}" width="100"><br>
        <b>${p.name}</b> (${p.age} yrs)<br>
        Mobile: ${p.mobile}
      </div>`;
    });
    res.send(html + '<br><a href="/">Back</a>');
  });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Matrimony Website running at http://localhost:${PORT}`));
