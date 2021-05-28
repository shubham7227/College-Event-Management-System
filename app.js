require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
const async = require("async");
const app = express();
const fileUpload = require('express-fileupload');

app.use(fileUpload());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "9866",
    database: "club_event_manager"
});

let password = "";
let email = "";
let cname = "";
let failure = false;
let msg = "";
let loggedIn = false;
let eventValues = [];

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login",(req,res) =>{
    loggedIn=false;
    res.render("login");
});

app.get("/student-login", (req, res) => {
    if(loggedIn===true){
        res.render("student-index");
    }
    else{
        loggedIn=false;
        res.render("student-login", {failure: failure, msg: msg});
        failure = false;
        msg = "";
    }
});

app.post("/student-login", (req, res) => {
    email = req.body.email;
    password = req.body.password;

    connection.query("SELECT * FROM student WHERE email = ?", [email], (err, foundUsers) => {
        if(!err) {
            if(foundUsers.length > 0) {
                if(password === foundUsers[0].password) {
                    loggedIn = true;
                    res.redirect("/index");
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
    });
});

app.get("/club-login", (req, res) => {
    if(loggedIn===true){
        res.render("club-profile");
    }
    else{
        loggedIn=false;
        res.render("club-login", {failure: failure, msg: msg});
        failure = false;
        msg = "";
    }
});

app.post("/club-login", (req, res) => {
    cname = req.body.cname;
    password = req.body.password;

    connection.query("SELECT * FROM club WHERE cname = ?", [cname], (err, foundUsers) => {
        if(!err) {
            if(foundUsers.length > 0) {
                if(password === foundUsers[0].password) {
                    loggedIn = true;
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
    });
});

app.get("/student-signup", (req, res) => {
    if(loggedIn===true){
        res.render("student-index");
    }
    else{
        loggedIn = false;
        res.render("student-signup", {failure: failure, msg: msg});
        failure = false;
        msg = "";
    }
});

app.post("/student-signup", (req, res) => {
    fname = req.body.fname;
    mname = req.body.mname;
    lname = req.body.lname;
    email = req.body.email;
    regno = req.body.regno;
    password = req.body.password;
    phno = req.body.phno;
    club = req.body.club;

    connection.query("SELECT * FROM student WHERE email = ? OR regno = ?", [email, regno], (err, foundUsers) => {
        if(!err) {
            if(foundUsers.length === 0) {
                if(email!=="" && regno!="" && password!="" && isValid(regno) && isValids(phno)) {
                    connection.query("INSERT INTO student(fname,mname,lname,email,regno,password,phno) VALUES(?)", [[fname,mname,lname,email,regno,password,phno]], (error, result) => {
                        if(!error) {
                            res.redirect("/student-login");
                        } else {
                            console.log(error);
                        }
                    });
                } else {
                    failure = true;
                    if(fname==="" || lname==="" || phno==="" || email==="" || regno==="" || password==="") {
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
    });
});


app.get("/club-signup", (req, res) => {
    if(loggedIn===true){
        res.render("student-index");
    }
    else{
        loggedIn = false;
        res.render("club-signup", {failure: failure, msg: msg});
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
        failure=true;
        msg = "No files were uploaded";
        res.redirect("/club-signup");
        return ;
    }
    let file = req.files.logo;

    file.mv('public/images/logos/'+file.name, function(err){
        connection.query("SELECT * FROM club WHERE email = ? OR cname = ?", [email, cname], (err, foundUsers) => {
            if(!err) {
                if(foundUsers.length === 0) {
                    if(email!=="" && cname!="" && password!="" && isValids(phno)) {
                        connection.query("INSERT INTO club(cname,email,password,phno,logo) VALUES(?)", [[cname,email,password,phno,file.name]], (error, result) => {
                            if(!error) {
                                res.redirect("/club-login");
                            } else {
                                console.log(error);
                            }
                        });
                    } else {
                        failure = true;
                        if(cname==="" || phno==="" || email==="" || password==="") {
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
        });
    });
});


function isValid(regno) {
    const allowedChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for(let i = 0; i<2; i++) {
        let ch = regno.charAt(i);
        if(!allowedChars.includes(ch)) {
            return false;
        }
    }

    for(let i = 2; i<5; i++) {
        let ch = regno.charAt(i);
        if(!(ch>='a' && ch<='z') && !(ch>='A' && ch<='Z')) {
            return false;
        }
    }

    for(let i = 5; i<9; i++) {
        let ch = regno.charAt(i);
        if(!allowedChars.includes(ch)) {
            return false;
        }
    }
    return true;
}

function isValids(phno) {
    const allowedChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    if(phno.length!=10){
        return false;
    }

    for(let i = 0; i<10; i++) {
        let ch = phno.charAt(i);
        if(!allowedChars.includes(ch)) {
            return false;
        }
    }

    return true;
}

app.get("/register-event", (req, res) => {
    if(loggedIn) {
        res.render("register-event", {failure: failure, msg: msg});
        failure=false;
    } else {
        res.render("login");
    }
});

app.post("/register-event", (req, res) => {
    let key,i=0;
    for(key in req.body){
        eventValues[i++]=req.body[key];
    }
    let ename= eventValues[0];
    let venue = eventValues[1];
    let edate = eventValues[2];
    let max_no_of_participant = eventValues[3];
    let branches = eventValues[4];
    let years = eventValues[5];
    let remarks = eventValues[6];
    
    if (!req.files || Object.keys(req.files).length === 0) {
        failure=true;
        msg = "No files were uploaded";
        res.redirect("/register-event");
        return ;
    }

    if(ename==="" || venue==="" || edate==="" || remarks===""){
        failure=true;
        msg = "Please fill all the required fields";
        res.redirect("/register-event");
        return ;
    }
    let file = req.files.poster;

    file.mv('public/images/uploaded_image/'+file.name, function(err){
        connection.query("INSERT INTO events(ename, venue, edate, max_no_of_participant, remarks, cname, poster) VALUES(?)", [[ename, venue, edate, max_no_of_participant, remarks,cname, file.name]], (err, results) => {
            if(!err) {
                    let sql = "INSERT INTO year(ID,years) VALUES ?";
                    for(i=0;i<years.length;i++){
                        connection.query(sql,[[[results.insertId,years[i]]]],(err,resul)=>{
                            if(err){
                                throw err;
                            }
                        });
                    }
                    sql = "INSERT INTO branch(ID,branches) VALUES ?";
                    for(i=0;i<years.length;i++){
                        connection.query(sql,[[[results.insertId,branches[i]]]],(err,resul)=>{
                            if(err){
                                throw err;
                            }
                        });
                    }
                res.redirect("/club-profile");
            } else {
                console.log(err);
            }
        });
    });
});

app.get("/registered-event", (req, res) => {
    if(loggedIn) {
        connection.query("SELECT * FROM events WHERE cname = ? ",[cname], (err, events) => {
            if(!err) {
                res.render("registered-events", {foundEvents: events});
            } else {
                console.log(err);
            }
        });
    } else {
        res.render("login");
    }
});

app.get("/club-profile", (req, res) => {
    if(loggedIn) {
        connection.query("SELECT * FROM club WHERE cname = ? ",[cname], (err, club) => {
            if(!err) {
                res.render("club-profile", {foundClub: club});
            } else {
                console.log(err);
            }
        });
    } else {
        res.render("login");
    }
});


app.get("/edit-club-profile", (req, res) => {
    if(loggedIn) {
        connection.query("SELECT * FROM club WHERE cname = ? ",[cname], (err, club) => {
            if(!err) {
                res.render("edit-club-profile", {foundClub: club, failure: failure, msg: msg});
                failure = false;
                msg = "";
            } else {
                console.log(err);
            }
        });
    } else {
        res.render("login");
    }
});


app.post("/edit-club-profile", (req, res) => {
    let logos="";
    email = req.body.email;
    password = req.body.password;
    phno = req.body.phno;
    connection.query("SELECT * FROM club where cname=?",[cname],(err,results)=>{
        if(!err){
            if(email===""){
                email=results[0].email;
            }
            if(password===""){
                password=results[0].password;
            }
            if(phno===""){
                phno=results[0].phno;
            }
            if (!req.files || Object.keys(req.files).length === 0) {
                logos = results[0].logo;
            }else{
                let file = req.files.logo;
                logos = file.name;
                file.mv('public/images/logos/'+logos, function(err){});
            }
                    if(isValids(phno)){
                        connection.query("UPDATE club SET email=?, phno=?, password=?, logo=? WHERE cname=?", [email, phno, password, logos, cname], (err, result) => {
                            if(!err){
                                res.redirect("club-profile");
                            }
                            else{
                                console.log(err);
                            }
                        });
                    }else{
                        failure = true;
                        msg="Phone number Invalid";
                        res.redirect("/edit-club-profile");
                    }
        }else{
            console.log(error);
        }
    });      
});

app.listen(3000, () => console.log("Server started on port 3000"));