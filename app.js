require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
const async = require("async");
const app = express();
const fileUpload = require("express-fileupload");
const { json } = require("express");
const util = require("util");
const e = require("express");
const { fail } = require("assert");
const opn = require("opn");

opn("http://localhost:3000/", { app: "chrome" });

app.use(fileUpload());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "9866",
    database: "club_event_manager",
});

let password = "";
let email = "";
let cname = "";
let failure = false;
let msg = "";
let studentloggedIn = false;
let clubloggedIn = false;
let eventValues = [];

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    if (studentloggedIn === true) {
        res.redirect("student-index");
    } else if (clubloggedIn === true) {
        res.redirect("club-profile");
    } else {
        studentloggedIn = false;
        clubloggedIn = false;
        res.render("login");
    }
});

app.get("/logout", (req, res) => {
    studentloggedIn = false;
    clubloggedIn = false;
    res.render("login");
});

app.get("/student-login", (req, res) => {
    if (studentloggedIn === true) {
        res.render("student-index");
    } else {
        studentloggedIn = false;
        res.render("student-login", { failure: failure, msg: msg });
        failure = false;
        msg = "";
    }
});

app.post("/student-login", (req, res) => {
    email = req.body.email;
    password = req.body.password;

    connection.query(
        "SELECT * FROM student WHERE email = ?",
        [email],
        (err, foundUsers) => {
            if (!err) {
                if (foundUsers.length > 0) {
                    if (password === foundUsers[0].password) {
                        studentloggedIn = true;
                        res.redirect("/student-index");
                    } else {
                        failure = true;
                        msg = "Incorrect credentials";
                        res.redirect("/student-login");
                    }
                } else {
                    failure = true;
                    msg = "Account doesn't exist";
                    res.redirect("/student-login");
                }
            } else {
                console.log(err);
            }
        }
    );
});

app.get("/club-login", (req, res) => {
    if (clubloggedIn === true) {
        res.redirect("club-profile");
    } else {
        clubloggedIn = false;
        res.render("club-login", { failure: failure, msg: msg });
        failure = false;
        msg = "";
    }
});

app.post("/club-login", (req, res) => {
    cname = req.body.cname;
    password = req.body.password;

    connection.query(
        "SELECT * FROM club WHERE cname = ?",
        [cname],
        (err, foundUsers) => {
            if (!err) {
                if (foundUsers.length > 0) {
                    if (password === foundUsers[0].password) {
                        clubloggedIn = true;
                        res.redirect("/club-profile");
                    } else {
                        failure = true;
                        msg = "Incorrect credentials";
                        res.redirect("/club-login");
                    }
                } else {
                    failure = true;
                    msg = "Account doesn't exist";
                    res.redirect("/club-login");
                }
            } else {
                console.log(err);
            }
        }
    );
});

app.get("/student-signup", (req, res) => {
    if (clubloggedIn === true) {
        res.render("student-index");
    } else {
        clubloggedIn = false;
        res.render("student-signup", { failure: failure, msg: msg });
        failure = false;
        msg = "";
    }
});

app.post("/student-signup", (req, res) => {
    let photo = "noimage.png";
    fname = req.body.fname;
    mname = req.body.mname;
    lname = req.body.lname;
    email = req.body.email;
    regno = req.body.regno;
    password = req.body.password;
    phno = req.body.phno;

    connection.query(
        "SELECT * FROM student WHERE email = ? OR regno = ?",
        [email, regno],
        (err, foundUsers) => {
            if (!err) {
                if (foundUsers.length === 0) {
                    if (
                        email !== "" &&
                        regno != "" &&
                        password != "" &&
                        isValid(regno) &&
                        isValids(phno)
                    ) {
                        connection.query(
                            "INSERT INTO student(fname,mname,lname,email,regno,password,phno,photo) VALUES(?)",
                            [[fname, mname, lname, email, regno, password, phno, photo]],
                            (error, result) => {
                                if (!error) {
                                    res.redirect("/student-login");
                                } else {
                                    console.log(error);
                                }
                            }
                        );
                    } else {
                        failure = true;
                        if (
                            fname === "" ||
                            lname === "" ||
                            phno === "" ||
                            email === "" ||
                            regno === "" ||
                            password === ""
                        ) {
                            msg = "Empty fields are not allowed";
                        } else if (!isValids(phno)) {
                            msg = "Phone Number Invalid";
                        } else {
                            msg = "Registration Number invalid";
                        }
                        res.redirect("/student-signup");
                    }
                } else {
                    failure = true;
                    msg = "Account already exists";
                    res.redirect("/student-login");
                }
            } else {
                console.log(err);
            }
        }
    );
});

app.get("/club-signup", (req, res) => {
    if (clubloggedIn === true) {
        res.render("student-index");
    } else {
        clubloggedIn = false;
        res.render("club-signup", { failure: failure, msg: msg });
        failure = false;
        msg = "";
    }
});

app.post("/club-signup", (req, res) => {
    cname = req.body.cname;
    email = req.body.email;
    password = req.body.password;
    phno = req.body.phno;

    if (!req.files || Object.keys(req.files).length === 0) {
        failure = true;
        msg = "No files were uploaded";
        res.redirect("/club-signup");
        return;
    }
    let file = req.files.logo;

    file.mv("public/images/logos/" + file.name, function (err) {
        connection.query(
            "SELECT * FROM club WHERE email = ? OR cname = ?",
            [email, cname],
            (err, foundUsers) => {
                if (!err) {
                    if (foundUsers.length === 0) {
                        if (
                            email !== "" &&
                            cname != "" &&
                            password != "" &&
                            isValids(phno)
                        ) {
                            connection.query(
                                "INSERT INTO club(cname,email,password,phno,logo) VALUES(?)",
                                [[cname, email, password, phno, file.name]],
                                (error, result) => {
                                    if (!error) {
                                        res.redirect("/club-login");
                                    } else {
                                        console.log(error);
                                    }
                                }
                            );
                        } else {
                            failure = true;
                            if (
                                cname === "" ||
                                phno === "" ||
                                email === "" ||
                                password === ""
                            ) {
                                msg = "Empty fields are not allowed";
                            } else if (!isValids(phno)) {
                                msg = "Phone Number Invalid";
                            }
                            res.redirect("/club-signup");
                        }
                    } else {
                        failure = true;
                        msg = "Account already exists";
                        res.redirect("/club-login");
                    }
                } else {
                    console.log(err);
                }
            }
        );
    });
});

function isValid(regno) {
    const allowedChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    for (let i = 0; i < 2; i++) {
        let ch = regno.charAt(i);
        if (!allowedChars.includes(ch)) {
            return false;
        }
    }

    for (let i = 2; i < 5; i++) {
        let ch = regno.charAt(i);
        if (!(ch >= "a" && ch <= "z") && !(ch >= "A" && ch <= "Z")) {
            return false;
        }
    }

    for (let i = 5; i < 9; i++) {
        let ch = regno.charAt(i);
        if (!allowedChars.includes(ch)) {
            return false;
        }
    }
    return true;
}

function isValids(phno) {
    const allowedChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    if (phno.length != 10) {
        return false;
    }

    for (let i = 0; i < 10; i++) {
        let ch = phno.charAt(i);
        if (!allowedChars.includes(ch)) {
            return false;
        }
    }

    return true;
}

app.get("/student-index", async (req, res) => {
    const query = util.promisify(connection.query).bind(connection);
    if (studentloggedIn) {
        var allEvents = [];
        try {
            var result = await query("SELECT * FROM student WHERE email=?", [email]);
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
    } else {
        res.render("login");
    }
});

app.post("/student-index", (req, res) => {
    eventid = req.body.clicked;
    res.redirect("student-event-view");
});

app.get("/student-event-view", (req, res) => {
    if (studentloggedIn) {
        connection.query(
            "SELECT ID,ename, venue, DATE_FORMAT(edate, '%Y-%m-%d') dat, max_no_of_participant, remarks, cname, poster FROM events WHERE ID = ? ORDER BY edate",
            [eventid],
            (err, events) => {
                if (!err) {
                    connection.query(
                        "SELECT regno FROM student WHERE email=?",
                        [email],
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
                                            failure: failure,
                                            msg: msg,
                                        });
                                        failure = false;
                                        msg = "";
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
    } else {
        res.render("login");
    }
});

app.post("/student-event-reg", (req, res) => {
    eventid = req.body.clicked;
    res.redirect("student-registered-view");
});

app.get("/student-registered-view", (req, res) => {
    if (studentloggedIn) {
        connection.query(
            "SELECT ID,ename, venue, DATE_FORMAT(edate, '%Y-%m-%d') dat, max_no_of_participant, remarks, cname, poster FROM events WHERE ID = ? ORDER BY edate",
            [eventid],
            (err, events) => {
                if (!err) {
                    connection.query(
                        "SELECT regno FROM student WHERE email=?",
                        [email],
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
    } else {
        res.render("login");
    }
});

app.get("/student-profile", async (req, res) => {
    const query = util.promisify(connection.query).bind(connection);
    if (studentloggedIn) {
        var allEvents = [];
        try {
            var result = await query("SELECT * FROM student WHERE email=?", [email]);
            var result1 = await query("SELECT ID FROM participates WHERE regno=?", [
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
            });
        } catch (error) {
            console.log(error);
        }
    } else {
        res.render("login");
    }
});

app.get("/edit-student-profile", (req, res) => {
    if (studentloggedIn) {
        connection.query(
            "SELECT * FROM student WHERE email = ? ",
            [email],
            (err, student) => {
                if (!err) {
                    res.render("edit-student-profile", {
                        foundStudent: student,
                        failure: failure,
                        msg: msg,
                    });
                    failure = false;
                    msg = "";
                } else {
                    console.log(err);
                }
            }
        );
    } else {
        res.render("login");
    }
});

app.post("/edit-student-profile", (req, res) => {
    let oldemail = email;
    let photos = "";
    fname = req.body.fname;
    mname = req.body.mname;
    lname = req.body.lname;
    email = req.body.email;
    password = req.body.password;
    phno = req.body.phno;
    cname = req.body.cname;
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
                    file.mv("public/images/student_photo/" + photos, function (err) { });
                }
                if (isValids(phno)) {
                    if (cname === "") {
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
                                    failure = true;
                                    msg = "Club Name Invalid";
                                    res.redirect("/edit-student-profile");
                                }
                            }
                        );
                    }
                } else {
                    failure = true;
                    msg = "Phone number Invalid";
                    res.redirect("/edit-student-profile");
                }
            } else {
                console.log(error);
            }
        }
    );
});

app.post("/student-event-register", (req, res) => {
    if (studentloggedIn) {
        regno = req.body.regno;
        ID = req.body.ID;
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
                                    failure = true;
                                    msg = "Already Registered";
                                    res.redirect("student-event-view");
                                }
                            }
                        );
                    } else {
                        failure = true;
                        msg = "Cannot Register Event Full";
                        res.redirect("student-event-view");
                    }
                } else {
                    console.log(err);
                }
            }
        );
    } else {
        res.render("login");
    }
});

// CLUB SIDE PAGES ALL
app.get("/club-profile", (req, res) => {
    if (clubloggedIn) {
        connection.query(
            "SELECT * FROM club WHERE cname = ? ",
            [cname],
            (err, club) => {
                if (!err) {
                    res.render("club-profile", { foundClub: club });
                } else {
                    console.log(err);
                }
            }
        );
    } else {
        res.render("login");
    }
});

app.get("/register-event", (req, res) => {
    if (clubloggedIn) {
        res.render("register-event", { failure: failure, msg: msg });
        failure = false;
    } else {
        res.render("login");
    }
});

app.post("/register-event", (req, res) => {
    const { ename, venue, edate, max_no_of_participant, remarks } = req.body;
    years = req.body.year;
    branches = req.body.branch;
    total = 0;

    if (!req.files || Object.keys(req.files).length === 0) {
        failure = true;
        msg = "No files were uploaded";
        res.redirect("/register-event");
        return;
    }

    if (ename === "" || venue === "" || edate === "" || remarks === "") {
        failure = true;
        msg = "Please fill all the required fields";
        res.redirect("/register-event");
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
                    async.forEachOf(years, (push_year, i, callback) => {
                        connection.query(
                            sql,
                            [[[results.insertId, push_year]]],
                            (err, resul) => {
                                if (err) {
                                    throw err;
                                }
                                callback(null);
                            }
                        );
                    });

                    sql = "INSERT INTO branch(ID,branches) VALUES ?";
                    async.forEachOf(branches, (push_branch, i, callback) => {
                        connection.query(
                            sql,
                            [[[results.insertId, branches[i]]]],
                            (err, resul) => {
                                if (err) {
                                    throw err;
                                }
                                callback(null);
                            }
                        );
                    });
                    res.redirect("/club-profile");
                } else {
                    console.log(err);
                }
            }
        );
    });
});

app.get("/registered-event", (req, res) => {
    if (clubloggedIn) {
        connection.query(
            "SELECT ID,ename,poster, DAY(edate) day, DATE_FORMAT(edate,'%b') month FROM events WHERE cname = ? AND DATE(edate) >= DATE(NOW()) ORDER BY edate",
            [cname],
            (err, events) => {
                if (!err) {
                    res.render("registered-event", { foundEvents: events });
                } else {
                    console.log(err);
                }
            }
        );
    } else {
        res.render("login");
    }
});

let eventid;

app.post("/registered-event", (req, res) => {
    eventid = req.body.clicked;
    res.redirect("specific-event");
});

app.get("/specific-event", (req, res) => {
    if (clubloggedIn) {
        connection.query(
            "SELECT ename, venue, DATE_FORMAT(edate, '%Y-%m-%d') dat, max_no_of_participant, remarks, cname, poster FROM events WHERE ID = ?",
            [eventid],
            (err, events) => {
                if (!err) {
                    res.render("specific-event", {
                        specEvent: events,
                        failure: failure,
                        msg: msg,
                    });
                    failure = false;
                    msg = "";
                } else {
                    console.log(err);
                }
            }
        );
    } else {
        res.render("login");
    }
});

app.post("/specific-event", (req, res) => {
    const { ename, venue, edate, max_no_of_participant, remarks } = req.body;

    if (ename === "" || venue === "" || edate === "" || remarks === "") {
        failure = true;
        msg = "Please fill all the required fields";
        res.redirect("/specific-event");
        return;
    }
    if (!req.files || Object.keys(req.files).length === 0) {
        connection.query(
            "UPDATE events SET ename=?, venue=?, edate=?, max_no_of_participant=?, remarks=? WHERE ID=?",
            [ename, venue, edate, max_no_of_participant, remarks, eventid],
            (err, results) => {
                if (!err) {
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
                        res.redirect("/registered-event");
                    } else {
                        console.log(err);
                    }
                }
            );
        });
    }
});

app.get("/past-events", (req, res) => {
    if (clubloggedIn) {
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
    } else {
        res.render("login");
    }
});

app.post("/past-events", (req, res) => {
    eventid = req.body.clicked;
    res.redirect("specific-event-view");
});

app.get("/specific-event-view", (req, res) => {
    if (clubloggedIn) {
        connection.query(
            "SELECT ename, venue,total_participant, DATE_FORMAT(edate, '%Y-%m-%d') dat, max_no_of_participant, remarks, cname, poster FROM events WHERE ID = ? ORDER BY edate",
            [eventid],
            (err, events) => {
                if (!err) {
                    res.render("specific-event-view", {
                        specEvent: events,
                        failure: failure,
                        msg: msg,
                    });
                    failure = false;
                    msg = "";
                } else {
                    console.log(err);
                }
            }
        );
    } else {
        res.render("login");
    }
});

app.get("/edit-club-profile", (req, res) => {
    if (clubloggedIn) {
        connection.query(
            "SELECT * FROM club WHERE cname = ? ",
            [cname],
            (err, club) => {
                if (!err) {
                    res.render("edit-club-profile", {
                        foundClub: club,
                        failure: failure,
                        msg: msg,
                    });
                    failure = false;
                    msg = "";
                } else {
                    console.log(err);
                }
            }
        );
    } else {
        res.render("login");
    }
});

app.post("/edit-club-profile", (req, res) => {
    let logos = "";
    email = req.body.email;
    password = req.body.password;
    phno = req.body.phno;
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
                    file.mv("public/images/logos/" + logos, function (err) { });
                }
                if (isValids(phno)) {
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
                    failure = true;
                    msg = "Phone number Invalid";
                    res.redirect("/edit-club-profile");
                }
            } else {
                console.log(error);
            }
        }
    );
});

app.get("/view-event-participant", async (req, res) => {
    const query = util.promisify(connection.query).bind(connection);
    if (clubloggedIn) {
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
    } else {
        res.render("login");
    }
});

app.listen(3000, () => console.log("Server started on port 3000"));
