const homeRoute = (req, res) => {
  res.render("home", { title: "Home page" });
};
const registerRoute = (req, res) => {
  res.render("register", { title: "Register Page", errors: [] });
};
const loginRoute = (req, res) => {
  res.render("login", { title: "Login Page", errors: null });
};
const profileRoute = (req, res) => {
  res.render("profile", { title: "Profile Page", user: req.user });
};
const logoutRoute = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed", error: err });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed", error: err });
      }
      res.redirect("/login"); // Redirect to login page after logout
    });
  });
};

module.exports = {
  homeRoute,
  registerRoute,
  loginRoute,
  profileRoute,
  logoutRoute,
};
