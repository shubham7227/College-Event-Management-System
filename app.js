require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const session = require("express-session");
const passport = require("passport");
const fileUpload = require("express-fileupload");

const { connection } = require("./utils/db");
require("./utils/passport");

app.use(fileUpload());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const authRouter = require("./routes/authRoute");
const studentRouter = require("./routes/studentRoute");
const clubRouter = require("./routes/clubRoute");

app.use("/", authRouter);
app.use("/", studentRouter);
app.use("/", clubRouter);

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Applcation is running on port:-`, process.env.PORT || 3000);
});
