const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDB,
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.message);
    return;
  }

  console.log("Database connected");
});

module.exports = { connection };
