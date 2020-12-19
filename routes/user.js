const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const commonFunctions = require("../functions/common");
const passportInit = require("../config/passport");
const Users = require("../models/Users");

router.get("/", (req, res) => {
    res.redirect("/dashboard");
});

router.get("/login", (req, res) => {
    var options = {
        data: {
            messages: commonFunctions.flashMessages(req),
        },
    };
    res.render("userLogin", options);
});

router.post("/login", (req, res, next) => {
    passportInit(passport, "user");
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
        failureFlash: true,
    })(req, res, next);
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    const {
        name,
        address,
        year,
        gender,
        contact,
        email,
        password,
        cPassword,
    } = req.body;
    let messages = [];

    Users.count({ where: { userEmail: email, userType: "user" } })
        .then((count) => {
            if (count > 0) {
                messages.push({
                    type: "danger",
                    text: "Email already registered",
                });
            }

            if (password != cPassword) {
                messages.push({
                    type: "danger",
                    text: "Passwords do not match",
                });
            }

            if (messages.length > 0) {
                res.render("register", { data: { messageArray: messages } });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (!err) {
                            Users.create({
                                userName: name,
                                userAddress: address,
                                userYear: year,
                                userGender: gender,
                                userContact: contact,
                                userEmail: email,
                                userPassword: hash,
                                userType: "user",
                            })
                                .then(() => {
                                    req.flash(
                                        "success_msg",
                                        "You are registered. Please Login."
                                    );
                                    res.redirect("/login");
                                })
                                .catch((err) => {
                                    messages.push({
                                        type: "danger",
                                        text: err.message,
                                    });
                                    res.render("register", {
                                        data: { messageArray: messages },
                                    });
                                });
                        } else {
                            messages.push({
                                type: "danger",
                                text: err.message,
                            });
                            res.render("register", {
                                data: { messageArray: messages },
                            });
                        }
                    });
                });
            }
        })
        .catch((err) => {
            messages.push({
                type: "danger",
                text: err.message,
            });
            res.render("register", { data: { messageArray: messages } });
        });
});

router.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/login");
});

module.exports = router;
