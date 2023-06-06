const express = require("express");
const router = express.Router();

const {
  getEventsStudent,
  getSingleEvent,
  getRegisteredEvent,
  getProfile,
  getEditProfile,
  updateProfile,
  registerEvent,
} = require("../controllers/studentController");
const { isAuth } = require("../middlewares/authentication");

router.get("/student-index", isAuth, getEventsStudent);

router.post("/student-index", (req, res) => {
  eventid = req.body.clicked;
  res.redirect(`student-event-view?eventid=${eventid}`);
});

router.get("/student-event-view", isAuth, getSingleEvent);

router.post("/student-event-reg", (req, res) => {
  eventid = req.body.clicked;
  res.redirect(`student-registered-view?eventid=${eventid}`);
});

router.get("/student-registered-view", isAuth, getRegisteredEvent);

router.get("/student-profile", isAuth, getProfile);

router.get("/edit-student-profile", isAuth, getEditProfile);

router.post("/edit-student-profile", isAuth, updateProfile);

router.post("/student-event-register", isAuth, registerEvent);

module.exports = router;
