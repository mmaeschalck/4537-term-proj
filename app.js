const express = require("express");
const mysql = require("mysql");
const app = express();
const endPointRoot = "/API/v1/";
const PORT = 80;
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "termproj",
  port: "3306",
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  next();
});

app.get("/API/v1/stats/", (req, res) => {
  console.log("GET received.");
  console.log(req.query);
  connection.query("SELECT * FROM stats", (err, result) => {
    if (err) throw err;
    res.send(JSON.stringify(result, null, "\t"));
  });
});

console.log("STARTING PROJ SERVER");
app.listen(PORT, (err) => {
  if (err) throw err;
  console.log("LISTENING ON PORT", PORT);
});
