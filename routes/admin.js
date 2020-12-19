const express = require("express");
const router = express.Router();
const passport = require("passport");
const passportInit = require("../config/passport");
const commonFunctions = require("../functions/common");

const options = {
    layout: "in",
    data: null,
};

router.get("/", (req, res) => {
    res.redirect("/admin/dashboard");
});

router.get("/login", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
    };
    res.render("adminLogin", options);
});

router.post("/login", (req, res, next) => {
    passportInit(passport, "admin");
    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/admin/login",
        failureFlash: true,
    })(req, res, next);
});

router.get("/logout", (req, res) => {
    req.logOut();
    req.flash("success_msg", "You are logged out.");
    res.redirect("/admin/login");
});

module.exports = router;
