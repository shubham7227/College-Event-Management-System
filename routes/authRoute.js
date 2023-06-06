const express = require("express");
const router = express.Router();
const passport = require("passport");

const { studentSignup, clubSignup } = require("../controllers/authController");
const { isNotAuth } = require("../middlewares/authentication");

router.get("/login", isNotAuth, async (req, res) => {
  res.render("login");
});

router.get("/student-login", isNotAuth, (req, res) => {
  res.render("student-login", { failure: false, msg: "" });
});

router.post("/student-login", async (req, res, next) => {
  passport.authenticate("student", {
    successRedirect: "/student-index",
    failureRedirect: "/student-login",
  })(req, res, next);
});

router.get("/student-signup", isNotAuth, (req, res) => {
  res.render("student-signup", { failure: false, msg: "" });
});

router.post("/student-signup", studentSignup);

router.get("/club-login", isNotAuth, (req, res) => {
  res.render("club-login", { failure: false, msg: "" });
});

router.post("/club-login", async (req, res, next) => {
  passport.authenticate("club", {
    successRedirect: "/club-profile",
    failureRedirect: "/club-login",
  })(req, res, next);
});

router.get("/club-signup", isNotAuth, (req, res) => {
  res.render("club-signup", { failure: false, msg: "" });
});

router.post("/club-signup", clubSignup);

router.get("/logout", async (req, res) => {
  req.logout((err) => {
    if (err) {
      return err;
    }
    res.redirect("/login");
  });
});

module.exports = router;
