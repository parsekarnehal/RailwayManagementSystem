const express = require("express");
const Users = require("../models/Users");
const router = express.Router();
const commonFunctions = require("../functions/common");
const States = require("../models/States");
const Stations = require("../models/Stations");
const Routes = require("../models/Routes");
const RouteTrains = require("../models/RouteTrain");
const RouteSchedules = require("../models/RouteSchedule");
const Tickets = require("../models/Tickets");
const transactionPdfTemplate = require("../pdfTemplates/transactionPdf");
const path = require("path");
const fs = require("fs");
const Members = require("../models/Members");

const options = {
    layout: "user",
    data: null,
};

router.get("/", (req, res) => {
    var data = {
        userData: req.user,
        data: null,
        title: "Dashboard",
    };
    options.data = data;
    var messageArray = [];

    if (data.userData.userType === "admin") {
        res.redirect("/admin/dashboard");
    }

    var monthData = {
        month: false,
        year: false,
    };

    var tActive = 0;
    var tCancelled = 0;
    var tCost = 0;
    var tMembersCount = 0;

    Tickets.getTickets(req.user.id, true, false, monthData)
        .then((data) => {
            options.data.monthTransactions = data.monthTransactions;
            if (data.monthTransactions.length == 0) {
                messageArray.push({
                    text: "No transactions in this month",
                    type: "danger",
                });
            }
            data.ticketsArray.forEach((el) => {
                if (el.status) {
                    tActive++;
                    tCost += el.ticketFare;
                } else {
                    tCancelled++;
                }
            });
            options.data.tActive = tActive;
            options.data.tCancelled = tCancelled;
            options.data.tCost = tCost;
            Members.getMembers(req.user.id)
                .then((memberArray) => {
                    tMembersCount = memberArray.length;
                    options.data.memberCount = tMembersCount;
                    res.render("userDashboard", options);
                })
                .catch((e) => {
                    options.data.tActive = tActive;
                    options.data.tCancelled = tCancelled;
                    options.data.tCost = tCost;
                    options.data.memberCount = tMembersCount;
                    res.render("userDashboard", options);
                });
        })
        .catch((e) => {
            options.data.tActive = tActive;
            options.data.tCancelled = tCancelled;
            options.data.tCost = tCost;
            options.data.memberCount = tMembersCount;
            res.render("userDashboard", options);
        });
});

router.get("/profile", (req, res) => {
    options.data = {
        userData: req.user,
        messages: commonFunctions.flashMessages(req),
        title: "Profile",
    };
    res.render("userProfile", options);
});

router.get("/tickets", (req, res) => {
    var messageArray = [];
    options.data.userData = req.user;
    options.data.title = "Tickets";
    options.data.messages = commonFunctions.flashMessages(req);
    Members.getMembers(req.user.id)
        .then((members) => {
            members.unshift(req.user);
            members[0].userName = "Myself";
            options.data.members = members;

            States.getAllStates(false)
                .then((statesArray) => {
                    options.data.states = statesArray;
                    Tickets.getTickets(req.user.id, false, false, false)
                        .then((data) => {
                            options.data.tickets = data.ticketsArray;
                            options.data.messageArray = messageArray;
                            res.render("tickets", options);
                        })
                        .catch((e) => {
                            if (e.custom) {
                                messageArray.push({
                                    type: "danger",
                                    text: e.message,
                                });
                            } else {
                                console.log(e.message);
                            }
                            options.data.messageArray = messageArray;
                            res.render("tickets", options);
                        });
                })
                .catch((e) => {
                    if (e.custom) {
                        messageArray.push({
                            type: "danger",
                            text: e.message,
                        });
                    } else {
                        console.log(e.message);
                    }
                    res.render("tickets", options);
                });
        })
        .catch((e) => {
            console.log(e.message);
            res.render("tickets", options);
        });
});

router.get("/sourceStation/:id", (req, res) => {
    var data;
    Stations.getStateStations(req.params.id)
        .then((stationsArray) => {
            data = {
                error: false,
                stationsArray,
            };
            res.send(data);
        })
        .catch((e) => {
            data = {
                error: true,
                message: null,
            };
            if (e.custom) {
                data.message = e.message;
            } else {
                console.log(e.message);
                data.message = "Error getting Stations";
            }
            res.send(data);
        });
});

router.get("/getRoutes/:sStationId/:dStationId", (req, res) => {
    const { sStationId, dStationId } = req.params;
    var p,
        promiseArray = [];
    var sendData = {
        error: false,
    };
    var scheduleArray = [],
        routeArray = [];

    Routes.getRoutesBetweenStations(sStationId, dStationId)
        .then((data) => {
            routeArray = data;
            data.forEach((route) => {
                p = RouteSchedules.getSchedules(route.id, false).then(
                    (data) => {
                        scheduleArray = data;
                    }
                );
                promiseArray.push(p);
            });

            Promise.all(promiseArray)
                .then(() => {
                    sendData.error = false;
                    sendData.routesArray = routeArray;
                    sendData.schedulesArray = scheduleArray;
                    res.send(sendData);
                })
                .catch((e) => {
                    sendData.error = true;
                    if (e.custom) {
                        sendData.message = e.message;
                    } else {
                        console.log(e.message);
                        sendData.message = "Error at getting Routes";
                    }
                    res.send(sendData);
                });
        })
        .catch((e) => {
            sendData.error = true;
            if (e.custom) {
                sendData.message = e.message;
            } else {
                console.log(e.message);
                sendData.message = "Error at getting Routes";
            }
            res.send(sendData);
        });
});

router.get(
    "/getTrains/:count/:isAcInt/:routeId/:scheduleId/:date",
    (req, res) => {
        const { count, routeId, isAcInt, scheduleId, date } = req.params;
        var isAc = true ? parseInt(isAcInt) : false;

        var sendData = {
            error: true,
            message: "Error at getting trains",
        };

        RouteTrains.getTrains(routeId, scheduleId, date, count, isAc)
            .then((trainArray) => {
                sendData.error = false;
                sendData.data = trainArray;
                res.send(sendData);
            })
            .catch((e) => {
                if (e.custom) {
                    sendData.message = e.message;
                } else {
                    console.log(e);
                }
                res.send(sendData);
            });
    }
);

router.post("/tickets/book", (req, res) => {
    const {
        sStateId,
        sStationId,
        dStateId,
        dStationId,
        routeId,
        scheduleId,
        members,
        ticketDate,
        trainId,
        ticketFare,
    } = req.body;

    var ticketCoach = true ? parseInt(req.body.ticketCoach) : false;

    if (Array.isArray(members)) {
        var tickets = [];
        members.forEach((el) => {
            var ticket = {
                userId: el,
                adminId: req.user.id,
                trainId,
                routeId,
                scheduleId,
                sStateId,
                dStateId,
                sStationId,
                dStationId,
                ticketDate,
                ticketCoach,
                ticketFare,
            };
            tickets.push(ticket);
        });
        Tickets.bookTickets(tickets)
            .then(() => {
                req.flash("success_msg", "Ticket Booked");
                res.redirect("/dashboard/tickets");
            })
            .catch((e) => {
                if (e.custom) {
                    req.flash("error_msg", e.message);
                } else {
                    console.log(e);
                }
                res.redirect("/dashboard/tickets");
            });
    } else {
        var ticket = {
            userId: members,
            adminId: req.user.id,
            trainId,
            routeId,
            scheduleId,
            sStateId,
            dStateId,
            sStationId,
            dStationId,
            ticketDate,
            ticketCoach,
            ticketFare,
        };
        Tickets.bookTickets(ticket)
            .then(() => {
                req.flash("success_msg", "Ticket Booked");
                res.redirect("/dashboard/tickets");
            })
            .catch((e) => {
                if (e.custom) {
                    req.flash("error_msg", e.message);
                } else {
                    console.log(e);
                }
                res.redirect("/dashboard/tickets");
            });
    }
});

router.get("/tickets/cancel/:id", (req, res) => {
    Tickets.cancelTicket(req.params.id)
        .then(() => {
            req.flash("success_msg", "Ticket cancelled");
            res.redirect("/dashboard/tickets");
        })
        .catch((e) => {
            req.flash("error_msg", "Error at cancelling ticket.");
            res.redirect("/dashboard/tickets");
        });
});

router.get("/transactions", (req, res) => {
    var messageArray = [];
    options.data.userData = req.user;
    options.data.title = "Transactions";
    Tickets.getTickets(req.user.id, true, false, false)
        .then((data) => {
            options.data.transactions = data.ticketsArray;
            options.data.yearArray = data.yearArray;
            commonFunctions
                .convertToPdf(
                    transactionPdfTemplate,
                    data.ticketsArray,
                    req.user.id,
                    true
                )
                .then((data) => {
                    options.data.messageArray = messageArray;
                    res.render("transactions", options);
                })
                .catch((e) => {
                    console.log(e.message);
                    res.render("transactions", options);
                });
        })
        .catch((e) => {
            if (e.custom) {
                messageArray.push({
                    type: "danger",
                    text: "No transactions yet",
                });
                options.data.messageArray = messageArray;
            } else {
                console.log(e.message);
            }
            res.render("transactions", options);
        });
});

router.post("/transactions", (req, res) => {
    const { tMonth, tYear } = req.body;
    const month = tMonth.split("-")[1];
    options.data.userData = req.user;

    var messageArray = [];

    var monthData = {
        month: parseInt(month),
        year: parseInt(tYear),
    };

    Tickets.getTickets(req.user.id, true, false, monthData)
        .then((data) => {
            if (data.monthTransactions.length == 0) {
                messageArray.push({
                    text: "No transactions in given period",
                    type: "danger",
                });
                options.data.messageArray = messageArray;
                options.data.transactions = [];
                commonFunctions
                    .convertToPdf(
                        transactionPdfTemplate,
                        data.monthTransactions,
                        req.user.id,
                        true
                    )
                    .then((data) => {
                        res.render("transactions", options);
                    })
                    .catch((e) => {
                        console.log(e.message);
                        res.render("transactions", options);
                    });
            } else {
                options.data.messageArray = [];
                options.data.transactions = data.monthTransactions;
                commonFunctions
                    .convertToPdf(
                        transactionPdfTemplate,
                        data.monthTransactions,
                        req.user.id,
                        true
                    )
                    .then((data) => {
                        res.render("transactions", options);
                    })
                    .catch((e) => {
                        console.log(e.message);
                        res.render("transactions", options);
                    });
            }
        })
        .catch((e) => {
            if (e.custom) {
                messageArray.push({
                    text: e.message,
                    type: "danger",
                });
            } else {
                console.log(e.message);
            }
            options.data.messageArray = messageArray;
            res.render("transactions", options);
        });
});

router.get("/transactions/pdf", (req, res) => {
    commonFunctions.sendPdf(req, res);
});

router.get("/transactions/pdf/:id", (req, res) => {
    const ticketId = req.params.id;
    Tickets.getTickets(req.user.id, false, ticketId, false)
        .then((data) => {
            var ticketTemplate = require("../pdfTemplates/ticketPdf");
            commonFunctions
                .convertToPdf(
                    ticketTemplate,
                    data.ticketsArray[0],
                    req.user.id,
                    false
                )
                .then((data) => {
                    res.sendFile(
                        path.join(
                            __dirname,
                            "../static/pdfs/" + req.user.id + ".pdf"
                        ),
                        (err) => {
                            var filePath = path.join(
                                __dirname,
                                "../static/pdfs/" + req.user.id + ".pdf"
                            );
                            try {
                                fs.unlinkSync(filePath);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    );
                })
                .catch((e) => {
                    console.log(e.message);
                    res.redirect("/dashboard/tickets");
                });
        })
        .catch((e) => {
            console.log(e.message);
            res.redirect("/dashboard/tickets");
        });
});

router.get("/members", (req, res) => {
    var messageArray = [];
    options.data.userData = req.user;
    options.data.title = "Members";
    options.data.messages = commonFunctions.flashMessages(req);
    Members.getMembers(req.user.id)
        .then((userArray) => {
            options.data.users = userArray;
            options.data.messageArray = messageArray;
            res.render("members", options);
        })
        .catch((e) => {
            if (e.custom) {
                messageArray.push({
                    type: "danger",
                    text: e.message,
                });
                options.data.messageArray = messageArray;
            } else {
                console.log(e.message);
            }
            res.render("members", options);
        });
});

router.post("/members", (req, res) => {
    const { name, address, year, gender, contact, email } = req.body;
    options.data.messages = commonFunctions.flashMessages(req);
    options.data.userData = req.user;
    var messageArray = [];

    Members.saveMember(
        {
            userName: name,
            userAddress: address,
            userYear: year,
            userGender: gender,
            userContact: contact,
            userEmail: email,
            userType: "user",
        },
        req.user.id
    )
        .then(() => {
            req.flash("success_msg", "Member added");
            res.redirect("/dashboard/members");
        })
        .catch((e) => {
            if (e.custom) {
                messageArray.push({
                    type: "danger",
                    text: e.message,
                });
                options.data.messageArray = messageArray;
                options.data.messages = commonFunctions.flashMessages(req);
                res.render("members", options);
            } else {
                console.log(e.message);
                res.redirect("/dashboard/members");
            }
        });
});

router.get("/members/update/:id", (req, res) => {
    options.data.userData = req.user;
    options.data.title = "Members";
    var messageArray = [];

    Users.findByPk(req.params.id)
        .then((data) => {
            var member = data.get();
            member.status = true;

            messageArray.push({
                type: "danger",
                text: "Please Update here",
            });

            options.data.messageArray = messageArray;
            options.data.updateMember = member;
            options.data.messages = commonFunctions.flashMessages(req);
            res.render("members", options);
        })
        .catch((e) => {
            console.log(e.message);
            res.render("members", options);
        });
});

router.post("/members/update", (req, res) => {
    const { userId, name, address, year, contact } = req.body;

    Users.findByPk(userId)
        .then((user) => {
            user.userName = name;
            user.userAddress = address;
            user.userYear = year;
            user.userContact = contact;
            user.save()
                .then(() => {
                    req.flash("success_msg", "Member updated.");
                    res.redirect("/dashboard/members");
                })
                .catch((e) => {
                    console.log(e.message);
                    res.redirect("/dashboard/members");
                });
        })
        .catch((e) => {
            console.log(e.message);
            res.redirect("/dashboard/members");
        });
});

router.post("/updateProfile", (req, res) => {
    const { name, address, year, contact } = req.body;

    Users.updateUser(req.user.id, name, address, year, contact)
        .then(() => {
            req.flash("success_msg", "Profile updated");
            res.redirect("/dashboard/profile");
        })
        .catch((e) => {
            console.log(e.message);
            res.redirect("/dashboard/profile");
        });
});

router.post("/updatePassword", (req, res) => {
    const { currentP, password, cPassword } = req.body;

    if (password != cPassword) {
        req.flash("error_msg", "New Passwords do not match.");
        res.redirect("/dashboard/profile");
    } else {
        Users.updatePassword(req.user.id, currentP, password)
            .then(() => {
                req.flash("success_msg", "Passwords Changed");
                res.redirect("/dashboard/profile");
            })
            .catch((e) => {
                if (e.custom) {
                    req.flash("error_msg", e.message);
                } else {
                    console.log(e.message);
                }
                res.redirect("/dashboard/profile");
            });
    }
});

module.exports = router;
