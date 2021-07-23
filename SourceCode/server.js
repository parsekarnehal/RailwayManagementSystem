const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const { ensureAuthenticated } = require("./config/auth");
const cors = require("cors");

const app = express();

app.use(cors());

app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", exphbs({ defaultLayout: "in" }));
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        secret: "nehalnehal",
        resave: true,
        saveUninitialized: true,
    })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("static"));

app.use("/", require("./routes/user"));
app.use("/dashboard", ensureAuthenticated, require("./routes/userDashboard"));
app.use("/admin", require("./routes/admin"));
app.use(
    "/admin/dashboard",
    ensureAuthenticated,
    require("./routes/adminDashboard")
);

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

app.set("port", process.env.PORT || 3000);
const port = app.get("port");
app.listen(port, () => console.log(`server started at port: ${port}`));
