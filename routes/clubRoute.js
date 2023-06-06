const express = require("express");
const router = express.Router();

const { isAuth } = require("../middlewares/authentication");
const {
  getClubProfile,
  createEvent,
  getAllEvents,
  getAEvent,
  updateEvent,
  deleteEvent,
  getPastEvents,
  getPastEvent,
  getProfileData,
  updateClubProfile,
  getEventParticipant,
  getClubMembers,
  addClubMember,
  deleteClubMember,
} = require("../controllers/clubController");

router.get("/club-profile", isAuth, getClubProfile);

router.get("/register-event", isAuth, (req, res) => {
  res.render("register-event", { failure: false, msg: "" });
});

router.post("/register-event", isAuth, createEvent);

router.get("/registered-event", isAuth, getAllEvents);

router.post("/registered-event", isAuth, (req, res) => {
  eventid = req.body.clicked;
  res.redirect(`specific-event?eventid=${eventid}`);
});

router.get("/specific-event", isAuth, getAEvent);

router.post("/specific-event", isAuth, updateEvent);

router.get("/delete-event", isAuth, deleteEvent);

router.get("/past-events", isAuth, getPastEvents);

router.get("/specific-event-view", isAuth, getPastEvent);

router.get("/edit-club-profile", isAuth, getProfileData);

router.post("/edit-club-profile", isAuth, updateClubProfile);

router.get("/view-event-participant", isAuth, getEventParticipant);

router.get("/club-members", isAuth, getClubMembers);

router.get("/add-club-member", isAuth, (req, res) => {
  res.render("add-club-member", { failure: false, msg: "" });
});

router.post("/add-club-member", isAuth, addClubMember);

router.post("/delete-member", isAuth, deleteClubMember);

module.exports = router;
