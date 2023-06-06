const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { connection } = require("./db");

passport.use(
  "student",
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    //match user
    connection.query(
      "SELECT * FROM student WHERE email = ?",
      [email],
      (err, foundUsers) => {
        if (!err) {
          if (foundUsers.length > 0) {
            if (password === foundUsers[0].password) {
              return done(null, foundUsers[0]);
            } else {
              return done(null, false, { message: "pass incorrect" });
            }
          } else {
            return done(null, false, {
              message: "that email is not registered",
            });
          }
        } else {
          console.log(err);
        }
      }
    );
  })
);

passport.use(
  "club",
  new LocalStrategy({ usernameField: "cname" }, (cname, password, done) => {
    connection.query(
      "SELECT * FROM club WHERE cname = ?",
      [cname],
      (err, foundUsers) => {
        if (!err) {
          if (foundUsers.length > 0) {
            if (password === foundUsers[0].password) {
              return done(null, foundUsers[0]);
            } else {
              return done(null, false, { message: "pass incorrect" });
            }
          } else {
            return done(null, false, {
              message: "that email is not registered",
            });
          }
        } else {
          console.log(err);
        }
      }
    );
  })
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
