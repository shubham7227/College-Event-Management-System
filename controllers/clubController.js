const util = require("util");
const { connection } = require("../utils/db");

const getClubProfile = async (req, res) => {
  connection.query(
    "SELECT * FROM club WHERE cname = ? ",
    [req.user.cname],
    (err, club) => {
      if (!err) {
        res.render("club-profile", { foundClub: club });
      } else {
        console.log(err);
      }
    }
  );
};

const createEvent = async (req, res) => {
  const cname = req.user.cname;

  const { ename, venue, edate, max_no_of_participant, remarks } = req.body;
  let years = req.body.year;
  let branches = req.body.branch;

  if (!years) {
    years = ["20", "19", "18", "17"];
  }
  if (!branches) {
    branches = ["BCE", "BME", "BCL", "BEE"];
  }
  total = 0;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.render("/register-event", {
      failure: true,
      msg: "No files were uploaded",
    });
    return;
  }

  if (ename === "" || venue === "" || edate === "" || remarks === "") {
    res.render("/register-event", {
      failure: true,
      msg: "Please fill all the required fields",
    });
    return;
  }
  let file = req.files.poster;

  file.mv("public/images/uploaded_image/" + file.name, function (err) {
    connection.query(
      "INSERT INTO events(ename, venue, edate, max_no_of_participant,total_participant, remarks, cname, poster) VALUES(?)",
      [
        [
          ename,
          venue,
          edate,
          max_no_of_participant,
          total,
          remarks,
          cname,
          file.name,
        ],
      ],
      (err, results) => {
        if (!err) {
          let sql = "INSERT INTO year(ID,years) VALUES ?";

          for (const push_year of years) {
            connection.query(
              sql,
              [[[results.insertId, push_year]]],
              (err, resul) => {
                if (err) {
                  console.log(err);
                  return;
                }
              }
            );
          }

          sql = "INSERT INTO branch(ID,branches) VALUES ?";

          for (const push_branch of branches) {
            connection.query(
              sql,
              [[[results.insertId, [push_branch]]]],
              (err, resul) => {
                if (err) {
                  console.log(err);
                }
              }
            );
          }
          res.redirect("/club-profile");
        } else {
          console.log(err);
        }
      }
    );
  });
};

const getAllEvents = (req, res) => {
  connection.query(
    "SELECT ID,ename,poster, DAY(edate) day, DATE_FORMAT(edate,'%b') month FROM events WHERE cname = ? AND DATE(edate) >= DATE(NOW()) ORDER BY edate",
    [req.user.cname],
    (err, events) => {
      if (!err) {
        res.render("registered-event", { foundEvents: events });
      } else {
        console.log(err);
      }
    }
  );
};

const getAEvent = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection);
  const eventid = req.query.eventid;

  try {
    let BCE = (BCL = BEE = BME = false);
    let first = (second = third = fourth = false);
    let events = await query(
      "SELECT ID, ename, venue, DATE_FORMAT(edate, '%Y-%m-%d') dat, max_no_of_participant, remarks, cname, poster FROM events WHERE ID = ?",
      [eventid]
    );
    let branch = await query("SELECT branches FROM branch WHERE ID=?", [
      eventid,
    ]);
    let year = await query("SELECT years FROM year WHERE ID=?", [eventid]);
    for (let i of branch) {
      if (i.branches === "BCE") {
        BCE = true;
      }
      if (i.branches === "BCL") {
        BCL = true;
      }
      if (i.branches === "BME") {
        BME = true;
      }
      if (i.branches === "BEE") {
        BEE = true;
      }
    }
    for (let i of year) {
      if (i.years === "20") {
        first = true;
      }
      if (i.years === "19") {
        second = true;
      }
      if (i.years === "18") {
        third = true;
      }
      if (i.years === "17") {
        fourth = true;
      }
    }

    res.render("specific-event", {
      specEvent: events,
      failure: false,
      msg: "",
      BCE: BCE,
      BCL: BCL,
      BME: BME,
      BEE: BEE,
      first: first,
      second: second,
      third: third,
      fourth: fourth,
    });
  } catch (err) {
    console.log(err);
  }
};

const updateEvent = async (req, res) => {
  const eventid = req.query.eventid;

  const { ename, venue, edate, max_no_of_participant, remarks } = req.body;
  years = req.body.year;
  branches = req.body.branch;

  if (
    ename === "" ||
    venue === "" ||
    edate === "" ||
    remarks === "" ||
    max_no_of_participant === ""
  ) {
    res.redirect("/specific-event");
    return;
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    connection.query(
      "UPDATE events SET ename=?, venue=?, edate=?, max_no_of_participant=?, remarks=? WHERE ID=?",
      [ename, venue, edate, max_no_of_participant, remarks, eventid],
      (err, results) => {
        if (!err) {
          connection.query("DELETE FROM year WHERE ID=?", eventid);
          connection.query("DELETE FROM branch WHERE ID=?", eventid);

          let sql = "INSERT INTO year(years,ID) VALUES(?)";
          for (const push_year of years) {
            connection.query(sql, [[push_year, eventid]], (err, resul) => {
              if (err) {
                console.log(err);
              }
            });
          }

          sql = "INSERT INTO branch(branches,ID) VALUES(?)";

          for (const push_branch of branches) {
            connection.query(sql, [[push_branch, eventid]], (err, resul) => {
              if (err) {
                console.log(err);
              }
            });
          }
          res.redirect("/registered-event");
        } else {
          console.log(err);
        }
      }
    );
  } else {
    let file = req.files.poster;
    file.mv("public/images/uploaded_image/" + file.name, function (err) {
      connection.query(
        "UPDATE events SET ename=?, venue=?, edate=?, max_no_of_participant=?, remarks=?, poster=? WHERE ID=?",
        [
          ename,
          venue,
          edate,
          max_no_of_participant,
          remarks,
          file.name,
          eventid,
        ],
        (err, results) => {
          if (!err) {
            connection.query("DELETE FROM year WHERE ID=?", eventid);
            connection.query("DELETE FROM branch WHERE ID=?", eventid);

            let sql = "INSERT INTO year(years,ID) VALUES(?)";
            for (const push_year of years) {
              connection.query(sql, [[push_year, eventid]], (err, resul) => {
                if (err) {
                  console.log(err);
                }
              });
            }

            sql = "INSERT INTO branch(branches,ID) VALUES(?)";

            for (const push_branch of branches) {
              connection.query(sql, [[push_branch, eventid]], (err, resul) => {
                if (err) {
                  console.log(err);
                }
              });
            }
            res.redirect("/registered-event");
          } else {
            console.log(err);
          }
        }
      );
    });
  }
};

const deleteEvent = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection);
  try {
    const eventid = req.query.eventid;

    await query("DELETE FROM participates WHERE ID=?", [eventid]);
    await query("DELETE FROM branch WHERE ID=?", [eventid]);
    await query("DELETE FROM year WHERE ID=?", [eventid]);
    await query("DELETE FROM events WHERE ID=?", [eventid]);

    res.redirect("registered-event");
  } catch (err) {
    console.log(err);
  }
};

const getPastEvents = (req, res) => {
  const cname = req.user.cname;

  connection.query(
    "SELECT ID,ename,poster, DAY(edate) day, DATE_FORMAT(edate,'%b') month FROM events WHERE cname = ? AND DATE(edate) < DATE(NOW()) ORDER BY edate",
    [cname],
    (err, events) => {
      if (!err) {
        res.render("past-events", { foundEvents: events });
      } else {
        console.log(err);
      }
    }
  );
};

const getPastEvent = (req, res) => {
  const eventid = req.query.eventid;

  connection.query(
    "SELECT ename, venue,total_participant, DATE_FORMAT(edate, '%Y-%m-%d') dat, max_no_of_participant, remarks, cname, poster FROM events WHERE ID = ? ORDER BY edate",
    [eventid],
    (err, events) => {
      if (!err) {
        res.render("specific-event-view", {
          specEvent: events,
          failure: false,
          msg: "",
        });
      } else {
        console.log(err);
      }
    }
  );
};

const getProfileData = (req, res) => {
  const cname = req.user.cname;

  connection.query(
    "SELECT * FROM club WHERE cname = ? ",
    [cname],
    (err, club) => {
      if (!err) {
        res.render("edit-club-profile", {
          foundClub: club,
          failure: false,
          msg: "",
        });
      } else {
        console.log(err);
      }
    }
  );
};

const updateClubProfile = (req, res) => {
  const cname = req.user.cname;

  let logos = "";
  let email = req.body.email;
  let password = req.body.password;
  let phno = req.body.phno;
  connection.query(
    "SELECT * FROM club where cname=?",
    [cname],
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
          logos = results[0].logo;
        } else {
          let file = req.files.logo;
          logos = file.name;
          file.mv("public/images/logos/" + logos, function (err) {});
        }
        const phnoRegex = /^[0-9]{10}$/;
        if (phnoRegex.test(phno)) {
          connection.query(
            "UPDATE club SET email=?, phno=?, password=?, logo=? WHERE cname=?",
            [email, phno, password, logos, cname],
            (err, result) => {
              if (!err) {
                res.redirect("club-profile");
              } else {
                console.log(err);
              }
            }
          );
        } else {
          res.redirect("/edit-club-profile");
        }
      } else {
        console.log(error);
      }
    }
  );
};

const getEventParticipant = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection);
  const eventid = req.query.eventid;

  var participant_list = [];
  try {
    var result = await query("SELECT * FROM participates WHERE ID=? ", [
      eventid,
    ]);
    for (let event of result) {
      var result1 = await query(
        "SELECT fname,mname,lname,email,phno,regno FROM student WHERE regno=?",
        [event.regno]
      );
      let temp = {
        fname: result1[0].fname,
        mname: result1[0].mname,
        lname: result1[0].lname,
        email: result1[0].email,
        phno: result1[0].phno,
        regno: result1[0].regno,
      };
      participant_list.push(temp);
    }
    res.render("view-event-participant", {
      participant_lists: participant_list,
    });
  } catch (error) {
    console.log(error);
  }
};

const getClubMembers = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection);
  const cname = req.user.cname;

  let foundMembers = [];
  try {
    let foundClub = await query("SELECT * FROM club WHERE cname = ? ", [cname]);
    let members = await query("SELECT * FROM has_member WHERE cname = ?", [
      cname,
    ]);
    for (let mem of members) {
      let result = await query("SELECT * FROM student WHERE regno=? ", [
        mem.regno,
      ]);
      let temp = {
        fname: result[0].fname,
        mname: result[0].mname,
        lname: result[0].lname,
        phno: result[0].phno,
        email: result[0].email,
        designation: mem.designation,
        domain: mem.domain,
        regno: mem.regno,
        cname: mem.cname,
      };
      foundMembers.push(temp);
    }
    res.render("club-members", {
      foundClub: foundClub,
      foundMembers: foundMembers,
    });
  } catch (err) {
    console.log(err);
  }
};

const addClubMember = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection);
  const cname = req.user.cname;
  const { regno, designation, domain } = req.body;

  try {
    await query(
      "INSERT INTO has_member(regno,cname,designation,domain) VALUES(?)",
      [[regno, cname, designation, domain]]
    );
    await query("INSERT INTO member_of(regno,cname) VALUES(?)", [
      [regno, cname],
    ]);
    res.redirect("club-members");
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.render("add-club-member", { failure: true, msg: "Already A member" });
    } else {
      res.render("add-club-member", {
        failure: true,
        msg: "Cannot Find Student With Provided Registration Number",
      });
    }
  }
};

const deleteClubMember = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection);
  const { regno, cname } = req.body;

  try {
    await query("DELETE FROM has_member WHERE regno=? AND cname=?", [
      regno,
      cname,
    ]);
    await query("DELETE FROM member_of WHERE regno=? AND cname=?", [
      regno,
      cname,
    ]);
    res.redirect("club-members");
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
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
};
