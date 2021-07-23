const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const Users = require("../models/Users");

module.exports = (passport, userType) => {
    passport.use(
        new LocalStrategy(
            { usernameField: "email" },
            (email, password, done) => {
                Users.findOne({
                    where: { userEmail: email, userType: userType },
                })
                    .then((user) => {
                        if (!user) {
                            return done(null, false, {
                                message: "That email is not registered",
                            });
                        }

                        bcrypt.compare(
                            password,
                            user.userPassword,
                            (err, isMatch) => {
                                if (err) {
                                    console.log(err);
                                }

                                if (isMatch) {
                                    return done(null, user);
                                } else {
                                    return done(null, false, {
                                        message: "Password incorrect",
                                    });
                                }
                            }
                        );
                    })
                    .catch((err) => console.log(err.message));
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        Users.findByPk(id).then((user) => {
            if (user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            }
        });
    });
};
