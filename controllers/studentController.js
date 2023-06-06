const util = require("util");
const { connection } = require("../utils/db");

const getEventsStudent = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection);
  var allEvents = [];
  try {
    var result = await query("SELECT * FROM student WHERE email=?", [
      req.user.email,
    ]);
    var result1 = await query(
      "SELECT ID, ename, poster, DAY(edate) day, DATE_FORMAT(edate,'%b') month FROM events WHERE DATE(edate) >= DATE(NOW()) ORDER BY edate"
    );
    for (let event of result1) {
      var result2 = await query("SELECT * FROM year WHERE ID=?", [event.ID]);
      for (let year1 of result2) {
        if (year1.years === result[0].syear) {
          var result3 = await query("SELECT * FROM branch WHERE ID=?", [
            event.ID,
          ]);
          for (let branch1 of result3) {
            if (branch1.branches === result[0].sbranch) {
              let temp = {
                ID: event.ID,
                ename: event.ename,
                poster: event.poster,
                day: event.day,
                month: event.month,
              };
              allEvents.push(temp);
            }
          }
        }
      }
    }
    res.render("student-index", { foundEvents: allEvents });
  } catch (error) {
    console.log(error);
  }
};

const getSingleEvent = (req, res) => {
  const eventid = req.query.eventid;

  connection.query(
    "SELECT ID,ename, venue, DATE_FORMAT(edate, '%Y-%m-%d') dat, max_no_of_participant, remarks, cname, poster FROM events WHERE ID = ? ORDER BY edate",
    [eventid],
    (err, events) => {
      if (!err) {
        connection.query(
          "SELECT regno FROM student WHERE email=?",
          [req.user.email],
          (err, student) => {
            if (!err) {
              connection.query(
                "SELECT cname,email,phno FROM club WHERE cname=?",
                [events[0].cname],
                (err, club) => {
                  res.render("student-event-view", {
                    specEvent: events,
                    specStudent: student,
                    club: club,
                    failure: false,
                    msg: "",
                  });
                }
              );
            } else {
              console.log(err);
            }
          }
        );
      } else {
        console.log(err);
      }
    }
  );
};

const getRegisteredEvent = (req, res) => {
  const eventid = req.query.eventid;

  connection.query(
    "SELECT ID,ename, venue, DATE_FORMAT(edate, '%Y-%m-%d') dat, max_no_of_participant, remarks, cname, poster FROM events WHERE ID = ? ORDER BY edate",
    [eventid],
    (err, events) => {
      if (!err) {
        connection.query(
          "SELECT regno FROM student WHERE email=?",
          [req.user.email],
          (err, student) => {
            if (!err) {
              connection.query(
                "SELECT cname,email,phno FROM club WHERE cname=?",
                [events[0].cname],
                (err, club) => {
                  res.render("student-registered-view", {
                    specEvent: events,
                    specStudent: student,
                    club: club,
                  });
                }
              );
            } else {
              console.log(err);
            }
          }
        );
      } else {
        console.log(err);
      }
    }
  );
};

const getProfile = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection);

  var allEvents = [];
  try {
    var result = await query("SELECT * FROM student WHERE email=?", [
      req.user.email,
    ]);
    var result1 = await query("SELECT ID FROM participates WHERE regno=?", [
      result[0].regno,
    ]);
    var result3 = await query("SELECT * FROM member_of WHERE regno=?", [
      result[0].regno,
    ]);
    for (let event of result1) {
      var result2 = await query(
        "SELECT ID, ename, poster, DAY(edate) day, DATE_FORMAT(edate,'%b') month FROM events WHERE ID=? ORDER BY edate",
        [event.ID]
      );
      let temp = {
        ID: result2[0].ID,
        ename: result2[0].ename,
        poster: result2[0].poster,
        day: result2[0].day,
        month: result2[0].month,
      };
      allEvents.push(temp);
    }
    res.render("student-profile", {
      foundStudent: result,
      foundEvents: allEvents,
      foundClub: result3,
    });
  } catch (error) {
    console.log(error);
  }
};

const getEditProfile = (req, res) => {
  connection.query(
    "SELECT * FROM student WHERE email = ? ",
    [req.user.email],
    (err, student) => {
      if (!err) {
        res.render("edit-student-profile", {
          foundStudent: student,
          failure: false,
          msg: "",
        });
      } else {
        console.log(err);
      }
    }
  );
};

const updateProfile = (req, res) => {
  const oldemail = req.user.email;
  let photos = "";
  let fname = req.body.fname;
  let mname = req.body.mname;
  let lname = req.body.lname;
  let email = req.body.email;
  let password = req.body.password;
  let phno = req.body.phno;
  let cname = req.body.cname;

  connection.query(
    "SELECT * FROM student where email=?",
    [oldemail],
    (err, results) => {
      if (!err) {
        if (email === "") {
          email = results[0].email;
        }
        if (password === "") {
          password = results[0].password;
        }
        if (phno === "") {
          phno = results[0].phno;
        }
        if (!req.files || Object.keys(req.files).length === 0) {
          photos = results[0].photo;
        } else {
          let file = req.files.photo;
          photos = file.name;
          file.mv("public/images/student_photo/" + photos, function (err) {});
        }
        const phnoRegex = /^[0-9]{10}$/;
        if (phnoRegex.test(phno)) {
          if (!cname) {
            connection.query(
              "UPDATE student SET fname=?, mname=?, lname=?, email=?, phno=?, password=?, photo=? WHERE email=?",
              [fname, mname, lname, email, phno, password, photos, oldemail],
              (err, result) => {
                if (!err) {
                  res.redirect("student-profile");
                } else {
                  console.log(err);
                }
              }
            );
          } else {
            connection.query(
              "UPDATE student SET fname=?, mname=?, lname=?, email=?, phno=?, password=?, cname=?, photo=? WHERE email=?",
              [
                fname,
                mname,
                lname,
                email,
                phno,
                password,
                cname,
                photos,
                oldemail,
              ],
              (err, result) => {
                if (!err) {
                  res.redirect("student-profile");
                } else {
                  res.render("edit-student-profile", {
                    foundStudent: results,
                    failure: true,
                    msg: "Club Name Invalid",
                  });
                }
              }
            );
          }
        } else {
          res.render("/edit-student-profile", {
            foundStudent: results,
            failure: true,
            msg: "Phone number Invalid",
          });
        }
      } else {
        console.log(err);
      }
    }
  );
};

const registerEvent = (req, res) => {
  const regno = req.body.regno;
  const ID = req.body.ID;
  connection.query(
    "SELECT total_participant, max_no_of_participant FROM events WHERE ID=?",
    [ID],
    (err, resul) => {
      if (!err) {
        if (resul[0].total_participant < resul[0].max_no_of_participant) {
          connection.query(
            "INSERT INTO participates(regno,ID) VALUES(?)",
            [[regno, ID]],
            (erro, result) => {
              if (!erro) {
                connection.query(
                  "UPDATE events SET total_participant = total_participant+1 WHERE ID=?",
                  [ID],
                  (err, results) => {
                    res.redirect("student-index");
                  }
                );
              } else {
                res.redirect("student-event-view", {
                  failure: true,
                  msg: "Already Registered",
                });
              }
            }
          );
        } else {
          res.redirect("student-event-view", {
            failure: true,
            msg: "Cannot Register Event Full",
          });
        }
      } else {
        console.log(err);
      }
    }
  );
};

module.exports = {
  getEventsStudent,
  getSingleEvent,
  getRegisteredEvent,
  getProfile,
  getEditProfile,
  updateProfile,
  registerEvent,
};
