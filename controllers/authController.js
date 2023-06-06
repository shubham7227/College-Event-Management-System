const { connection } = require("../utils/db");

const studentSignup = async (req, res) => {
  try {
    let photo = "noimage.png";
    const { fname, mname, lname, email, regno, password, phno } = req.body;

    connection.query(
      "SELECT * FROM student WHERE email = ? OR regno = ?",
      [email, regno],
      (err, foundUsers) => {
        if (!err) {
          if (foundUsers.length === 0) {
            const regnoRegex = /^[0-9]{2}[a-zA-Z]{3}[0-9]{4}$/;
            const phnoRegex = /^[0-9]{10}$/;
            if (
              email !== "" &&
              regno != "" &&
              password != "" &&
              regnoRegex.test(regno) &&
              phnoRegex.test(phno)
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
  } catch (error) {
    console.log(error);
  }
};

const clubSignup = async (req, res) => {
  const { cname, email, password, phno } = req.body;

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
            const phnoRegex = /^[0-9]{10}$/;
            if (
              email !== "" &&
              cname != "" &&
              password != "" &&
              phnoRegex.test(phno)
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
};

module.exports = { studentSignup, clubSignup };
