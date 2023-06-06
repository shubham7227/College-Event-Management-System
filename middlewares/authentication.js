const isAuth = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

const isNotAuth = async (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req?.user?.regno) {
      res.redirect("/student-index");
      return;
    }
    res.redirect("/club-profile");
    return;
  }
  return next();
};

module.exports = { isAuth, isNotAuth };
