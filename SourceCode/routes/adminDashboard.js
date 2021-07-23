const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const commonFunctions = require("../functions/common");
const Schedules = require("../models/Schedules");
const States = require("../models/States");
const Stations = require("../models/Stations");
const Trains = require("../models/Trains");
const Routes = require("../models/Routes");
const RouteTrain = require("../models/RouteTrain");
const RouteSchedule = require("../models/RouteSchedule");
const Users = require("../models/Users");
const Bookings = require("../models/Bookings");
const { Op } = require("sequelize");
const userPdfTemplate = require("../pdfTemplates/userpdf");
const bookingPdfTemplate = require("../pdfTemplates/bookingPdf");

const options = {
    layout: "admin",
    data: null,
};

router.get("/", (req, res) => {
    var data = {
        userData: req.user,
        data: null,
        title: "Dashboard",
    };
    options.data = data;

    if (data.userData.userType === "user") {
        res.redirect("/dashboard");
    }

    var statesCount = 0;
    var stationsCount = 0;
    var trainsCount = 0;
    var schedulesCount = 0;
    var routesCount = 0;
    var adminsCount = 0;
    var usersCount = 0;

    var promiseArray = [];

    promiseArray.push(
        States.getAllStates(req.user.id).then((states) => {
            statesCount = states.length;
        })
    );

    promiseArray.push(
        Stations.getStations(req.user.id).then((stations) => {
            stationsCount = stations.length;
        })
    );

    promiseArray.push(
        Trains.getTrains(req.user.id).then((trains) => {
            trainsCount = trains.length;
        })
    );

    promiseArray.push(
        Schedules.getSchedules(req.user.id).then((schedules) => {
            schedulesCount = schedules.length;
        })
    );

    promiseArray.push(
        Routes.getRoutes(req.user.id).then((routes) => {
            routesCount = routes.length;
        })
    );

    promiseArray.push(
        Users.getAllUsers("admin").then((admins) => {
            adminsCount = admins.length;
        })
    );

    promiseArray.push(
        Users.getAllUsers("user").then((users) => {
            usersCount = users.length;
        })
    );

    Promise.all(promiseArray)
        .then(() => {
            options.data.statesCount = statesCount;
            options.data.stationsCount = stationsCount;
            options.data.trainsCount = trainsCount;
            options.data.schedulesCount = schedulesCount;
            options.data.routesCount = routesCount;
            options.data.adminsCount = adminsCount;
            options.data.usersCount = usersCount;
            res.render("adminDashboard", options);
        })
        .catch((e) => {
            options.data.statesCount = statesCount;
            options.data.stationsCount = stationsCount;
            options.data.trainsCount = trainsCount;
            options.data.schedulesCount = schedulesCount;
            options.data.routesCount = routesCount;
            options.data.adminsCount = adminsCount;
            options.data.usersCount = usersCount;
            res.render("adminDashboard", options);
        });
});

router.get("/getChartData", (req, res) => {
    var data = {
        type: "bar",
        defaultFontFamily: "Poppins",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Booke AC Seats",
                    data: [],
                    borderColor: "rgb(0, 12, 247)",
                    borderWidth: "0",
                    backgroundColor: "rgb(50, 55, 199)",
                    fontFamily: "Poppins",
                },
                {
                    label: "Booked General Seats",
                    data: [],
                    borderColor: "rgb(255, 0, 0)",
                    borderWidth: "0",
                    backgroundColor: "rgba(196, 57, 57)",
                    fontFamily: "Poppins",
                },
            ],
        },
        options: {
            legend: {
                position: "top",
                labels: {
                    fontFamily: "Poppins",
                },
            },
            scales: {
                xAxes: [
                    {
                        ticks: {
                            fontFamily: "Poppins",
                        },
                    },
                ],
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            fontFamily: "Poppins",
                        },
                    },
                ],
            },
        },
    };
    Bookings.getBookingsThisMonth(req.user.id)
        .then((trainBookings) => {
            var acSeats = [],
                generalSeats = [];
            var labels = [];
            Object.entries(trainBookings).forEach(([key, value]) => {
                labels.push(key);
                acSeats.push(value.bAcSeats);
                generalSeats.push(value.bGeneralSeats);
            });

            data.data.labels = labels;
            data.data.datasets[0].data = acSeats;
            data.data.datasets[1].data = generalSeats;

            data = res.send(data);
        })
        .catch((e) => {
            res.send(data);
        });
});

router.get("/states", (req, res) => {
    commonFunctions
        .findAllInArray(States, "stateName", null, req.user.id)
        .then((states) => {
            options.data = {
                messages: commonFunctions.flashMessages(req),
                userData: req.user,
                states,
                title: "States",
            };

            var messageArray = [];

            if (states.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No states added.",
                });
            }
            options.data.messageArray = messageArray;
            res.render("states", options);
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("states", options);
        });
});

router.post("/states", (req, res) => {
    var stateName = req.body.stateName;

    commonFunctions.findOneAndCreate(
        States,
        "stateName",
        stateName,
        {
            stateName,
            adminId: req.user.id,
        },
        req,
        res,
        "/admin/dashboard/states",
        {
            success_msg: "State inserted",
            error_msg: "State name already exists",
        }
    );
});

router.get("/states/update/:id", (req, res) => {
    commonFunctions
        .findAllInArray(States, "stateName", null, req.user.id)
        .then((states) => {
            options.data = {
                messages: commonFunctions.flashMessages(req),
                userData: req.user,
                states,
                title: "States",
            };

            var messageArray = [];

            if (states.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No states added.",
                });
            }
            options.data.messageArray = messageArray;
            States.findByPk(req.params.id)
                .then((data) => {
                    var state = data.dataValues;
                    var updateData = {
                        status: true,
                        stateName: state.stateName,
                        id: state.id,
                    };
                    options.data.updateState = updateData;
                    messageArray.push({
                        type: "danger",
                        text: "Please Update here",
                    });
                    options.data.messageArray = messageArray;
                    res.render("states", options);
                })
                .catch((e) => {
                    options.data.messageArray = messageArray;
                    res.render("states", options);
                });
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("states", options);
        });
});

router.post("/states/update", (req, res) => {
    const { stateId, stateName } = req.body;

    States.findByPk(stateId)
        .then((state) => {
            States.findOne({
                where: {
                    stateName,
                },
            })
                .then((stateDup) => {
                    if (stateDup == null || stateId == stateDup.id) {
                        state.stateName = stateName;
                        state
                            .save()
                            .then(() => {
                                req.flash("success_msg", "State Updated");
                                res.redirect("/admin/dashboard/states");
                            })
                            .catch((e) => {
                                res.redirect("/admin/dashboard/states");
                            });
                    } else {
                        req.flash("error_msg", "State name already exists");
                        res.redirect("/admin/dashboard/states");
                    }
                })
                .catch((e) => {
                    res.redirect("/admin/dashboard/states");
                });
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/states");
        });
});

router.get("/states/updateStatus/:id", (req, res) => {
    commonFunctions
        .changeStatus(States, req.params.id)
        .then(() => {
            res.redirect("/admin/dashboard/states");
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/states");
        });
});

router.get("/stations", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Stations",
    };

    var messageArray = [];

    var extras = [
        {
            model: States,
            nameColumn: "stateName",
            idColumn: "stateId",
            dataColumn: "stateName",
        },
    ];

    commonFunctions
        .findAllInArray(States, "stateName", null, req.user.id)
        .then((states) => {
            if (states.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No states added. Please add States to add Stations.",
                });
            }
            options.data.messageArray = messageArray;
            options.data.states = states;

            commonFunctions
                .findAllInArray(Stations, "stationName", extras, req.user.id)
                .then((stations) => {
                    options.data.stations = stations;
                    options.data.messageArray = messageArray;
                    res.render("stations", options);
                })
                .catch((e) => {
                    options.data.messageArray = messageArray;
                    res.render("stations", options);
                });
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("stations", options);
        });
});

router.post("/stations", (req, res) => {
    var { stationName, stateId } = req.body;

    commonFunctions.findOneAndCreate(
        Stations,
        "stationName",
        stationName,
        {
            stationName,
            stateId,
            adminId: req.user.id,
        },
        req,
        res,
        "/admin/dashboard/stations",
        {
            success_msg: "Station data inserted.",
            error_msg: "Station name already exists.",
        }
    );
});

router.get("/stations/update/:id/:stateName", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Stations",
    };

    var messageArray = [];

    var extras = [
        {
            model: States,
            nameColumn: "stateName",
            idColumn: "stateId",
            dataColumn: "stateName",
        },
    ];

    commonFunctions
        .findAllInArray(States, "stateName", null, req.user.id)
        .then((states) => {
            if (states.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No states added. Please add States to add Stations.",
                });
            }
            options.data.messageArray = messageArray;
            options.data.states = states;

            commonFunctions
                .findAllInArray(Stations, "stationName", extras, req.user.id)
                .then((stations) => {
                    options.data.stations = stations;

                    Stations.findByPk(req.params.id)
                        .then((data) => {
                            var station = data.dataValues;
                            var updateData = {
                                status: true,
                                id: station.id,
                                stationName: station.stationName,
                                stateName: req.params.stateName,
                            };
                            messageArray.push({
                                type: "danger",
                                text: "Please Update here",
                            });
                            options.data.messageArray = messageArray;

                            options.data.updateStation = updateData;
                            options.data.messageArray = messageArray;
                            res.render("stations", options);
                        })
                        .catch((e) => {
                            options.data.messageArray = messageArray;
                            res.render("stations", options);
                        });
                })
                .catch((e) => {
                    options.data.messageArray = messageArray;
                    res.render("stations", options);
                });
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("stations", options);
        });
});

router.post("/stations/update", (req, res) => {
    const { stationId, stationName } = req.body;

    Stations.findByPk(stationId)
        .then((station) => {
            Stations.findOne({
                where: {
                    stationName,
                },
            })
                .then((stationDup) => {
                    if (stationDup == null || stationId == stationDup.id) {
                        station.stationName = stationName;
                        station
                            .save()
                            .then(() => {
                                req.flash("success_msg", "Station Updated");
                                res.redirect("/admin/dashboard/stations");
                            })
                            .catch((e) => {
                                res.redirect("/admin/dashboard/stations");
                            });
                    } else {
                        req.flash("error_msg", "Station name exists");
                        res.redirect("/admin/dashboard/stations");
                    }
                })
                .catch((e) => {
                    res.redirect("/admin/dashboard/stations");
                });
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/stations");
        });
});

router.get("/stations/updateStatus/:id", (req, res) => {
    commonFunctions
        .changeStatus(Stations, req.params.id)
        .then(() => {
            res.redirect("/admin/dashboard/stations");
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/stations");
        });
});

router.get("/trains", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Trains",
    };

    var messageArray = [];

    commonFunctions
        .findAllInArray(Trains, "trainName", null, req.user.id)
        .then((trains) => {
            if (trains.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No trains added.",
                });
            }

            options.data.messageArray = messageArray;
            options.data.trains = trains;
            res.render("trains", options);
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("trains", options);
        });
});

router.post("/trains", (req, res) => {
    var { trainName, acSeats, generalSeats } = req.body;

    commonFunctions.findOneAndCreate(
        Trains,
        "trainName",
        trainName,
        {
            trainName,
            acSeats,
            generalSeats,
            adminId: req.user.id,
        },
        req,
        res,
        "/admin/dashboard/trains",
        {
            success_msg: "Train data inserted",
            error_msg: "Train name already exists",
        }
    );
});

router.get("/trains/update/:id", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Trains",
    };

    var messageArray = [];

    commonFunctions
        .findAllInArray(Trains, "trainName", null, req.user.id)
        .then((trains) => {
            if (trains.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No trains added.",
                });
            }

            options.data.messageArray = messageArray;
            options.data.trains = trains;

            Trains.findByPk(req.params.id)
                .then((data) => {
                    var train = data.dataValues;
                    var updateData = {
                        status: true,
                        id: train.id,
                        trainName: train.trainName,
                        gSeats: train.generalSeats,
                        acSeats: train.acSeats,
                    };

                    messageArray.push({
                        type: "danger",
                        text: "Please Update here",
                    });
                    options.data.messageArray = messageArray;
                    options.data.updateTrain = updateData;
                    res.render("trains", options);
                })
                .catch((e) => {
                    options.data.messageArray = messageArray;
                    res.render("trains", options);
                });
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("trains", options);
        });
});

router.post("/trains/update", (req, res) => {
    const { trainId, trainName, generalSeats, acSeats } = req.body;

    Trains.findByPk(trainId)
        .then((train) => {
            Trains.findOne({
                where: {
                    trainName,
                },
            })
                .then((trainDup) => {
                    if (trainDup == null || trainId == trainDup.id) {
                        train.trainName = trainName;
                        train.generalSeats = generalSeats;
                        train.acSeats = acSeats;

                        train
                            .save()
                            .then(() => {
                                req.flash("success_msg", "Train updated");
                                res.redirect("/admin/dashboard/trains");
                            })
                            .catch((e) => {
                                res.redirect("/admin/dashboard/trains");
                            });
                    } else {
                        req.flash("error_msg", "Train name exists");
                        res.redirect("/admin/dashboard/trains");
                    }
                })
                .catch((e) => {
                    res.redirect("/admin/dashboard/trains");
                });
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/trains");
        });
});

router.get("/trains/updateStatus/:id", (req, res) => {
    commonFunctions
        .changeStatus(Trains, req.params.id)
        .then(() => {
            res.redirect("/admin/dashboard/trains");
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/trains");
        });
});

router.get("/schedules", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Schedules",
    };

    var messageArray = [];

    commonFunctions
        .findAllInArray(Schedules, "scheduleName", null, req.user.id)
        .then((schedules) => {
            if (schedules.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No Schedules added.",
                });
            }

            options.data.messageArray = messageArray;
            options.data.schedules = schedules;
            res.render("schedules", options);
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("schedules", options);
        });
});

router.post("/schedules", (req, res) => {
    var { scheduleName, dHour, aHour, dMinute, aMinute } = req.body;
    var arrival = aHour + ":" + aMinute;
    var departure = dHour + ":" + dMinute;

    commonFunctions.findOneAndCreate(
        Schedules,
        "scheduleName",
        scheduleName,
        {
            scheduleName,
            arrival,
            departure,
            adminId: req.user.id,
        },
        req,
        res,
        "/admin/dashboard/schedules",
        {
            success_msg: "Schedule added",
            error_msg: "Schedule name already exists",
        }
    );
});

router.get("/schedules/update/:id", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Schedules",
    };

    var messageArray = [];

    commonFunctions
        .findAllInArray(Schedules, "scheduleName", null, req.user.id)
        .then((schedules) => {
            if (schedules.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No Schedules added.",
                });
            }

            options.data.messageArray = messageArray;
            options.data.schedules = schedules;

            Schedules.findByPk(req.params.id)
                .then((data) => {
                    var schedule = data.dataValues;
                    var timeArray = schedule.departure.split(":");
                    var dHour = timeArray[0];
                    var dMin = timeArray[1];
                    timeArray = schedule.arrival.split(":");
                    var aHour = timeArray[0];
                    var aMin = timeArray[1];

                    var updateData = {
                        status: true,
                        scheduleName: schedule.scheduleName,
                        id: schedule.id,
                        dHour,
                        dMin,
                        aHour,
                        aMin,
                    };

                    messageArray.push({
                        type: "danger",
                        text: "Please Update here",
                    });
                    options.data.messageArray = messageArray;
                    options.data.updateSchedule = updateData;
                    res.render("schedules", options);
                })
                .catch((e) => {
                    options.data.messageArray = messageArray;
                    res.render("schedules", options);
                });
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("schedules", options);
        });
});

router.post("/schedules/update", (req, res) => {
    const {
        scheduleId,
        scheduleName,
        dHour,
        dMinute,
        aHour,
        aMinute,
    } = req.body;
    const arrival = aHour + ":" + aMinute;
    const departure = dHour + ":" + dMinute;

    Schedules.findByPk(scheduleId)
        .then((schedule) => {
            Schedules.findOne({
                where: {
                    scheduleName,
                },
            })
                .then((scheduleDup) => {
                    if (scheduleDup == null || scheduleId == scheduleDup.id) {
                        schedule.scheduleName = scheduleName;
                        schedule.arrival = arrival;
                        schedule.departure = departure;
                        schedule
                            .save()
                            .then(() => {
                                req.flash("success_msg", "Schedule updated");
                                res.redirect("/admin/dashboard/schedules");
                            })
                            .catch((e) => {
                                res.redirect("/admin/dashboard/schedules");
                            });
                    } else {
                        req.flash("error_msg", "Schedule name exists");
                        res.redirect("/admin/dashboard/schedules");
                    }
                })
                .catch((e) => {
                    res.redirect("/admin/dashboard/schedules");
                });
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/schedules");
        });
});

router.get("/schedules/updateStatus/:id", (req, res) => {
    commonFunctions
        .changeStatus(Schedules, req.params.id)
        .then(() => {
            res.redirect("/admin/dashboard/schedules");
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/schedules");
        });
});

router.get("/routes", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Routes",
    };

    var messageArray = [];

    commonFunctions
        .findAllInArray(Stations, "stationName", null, req.user.id)
        .then((stations) => {
            if (stations.length == 0) {
                messageArray.push({
                    type: "danger",
                    text:
                        "No stations added. Please add stations to add a Route.",
                });
            }
            options.data.stations = stations;
            commonFunctions
                .findAllInArray(Schedules, "scheduleName", null, req.user.id)
                .then((schedules) => {
                    if (schedules.length == 0) {
                        messageArray.push({
                            type: "danger",
                            text:
                                "No schedules added. Please add schedules to add a Route.",
                        });
                    }
                    options.data.schedules = schedules;
                    commonFunctions
                        .findAllInArray(Trains, "trainName", null, req.user.id)
                        .then((trains) => {
                            if (trains.length == 0) {
                                messageArray.push({
                                    type: "danger",
                                    text:
                                        "No trains added. Please add trains to add a Route.",
                                });
                            }
                            options.data.trains = trains;

                            var extras = [
                                {
                                    model: Stations,
                                    idColumn: "sStationId",
                                    nameColumn: "stationName",
                                    dataColumn: "sStation",
                                },
                                {
                                    model: Stations,
                                    idColumn: "dStationId",
                                    nameColumn: "stationName",
                                    dataColumn: "dStation",
                                },
                            ];
                            commonFunctions
                                .findAllInArray(
                                    Routes,
                                    "routeName",
                                    extras,
                                    req.user.id
                                )
                                .then((routes) => {
                                    if (routes.length == 0) {
                                        messageArray.push({
                                            type: "danger",
                                            text: "No routes added",
                                        });
                                    }
                                    options.data.messageArray = messageArray;
                                    options.data.routes = routes;
                                    res.render("routes", options);
                                })
                                .catch((e) => {
                                    options.data.messageArray = messageArray;
                                    res.render("routes", options);
                                });
                        })
                        .catch((e) => {
                            options.data.messageArray = messageArray;
                            res.render("routes", options);
                        });
                })
                .catch((e) => {
                    options.data.messageArray = messageArray;
                    res.render("routes", options);
                });
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("routes", options);
        });
});

router.post("/routes", (req, res) => {
    var {
        routeName,
        sStationId,
        dStationId,
        scheduleId,
        trainId,
        routeFare,
    } = req.body;

    if (sStationId == dStationId) {
        req.flash("error_msg", "Source and destination station cannot be same");
        res.redirect("/admin/dashboard/routes");
    } else {
        Routes.findOne({
            where: {
                routeName,
            },
        })
            .then((data) => {
                if (data == null) {
                    Routes.create({
                        routeName,
                        adminId: req.user.id,
                        routeFare,
                        sStationId,
                        dStationId,
                    }).then((route) => {
                        var routeId = route.id;
                        var promiseArray = [];
                        var p;
                        if (Array.isArray(trainId)) {
                            trainId.forEach((element) => {
                                p = RouteTrain.create({
                                    routeId,
                                    trainId: element,
                                });
                                promiseArray.push(p);
                            });
                        } else {
                            p = RouteTrain.create({
                                routeId,
                                trainId,
                            });
                            promiseArray.push(p);
                        }
                        if (Array.isArray(scheduleId)) {
                            scheduleId.forEach((element) => {
                                p = RouteSchedule.create({
                                    routeId,
                                    scheduleId: element,
                                });
                                promiseArray.push(p);
                            });
                        } else {
                            p = RouteSchedule.create({
                                routeId,
                                scheduleId,
                            });
                            promiseArray.push(p);
                        }
                        Promise.all(promiseArray)
                            .then(() => {
                                req.flash("success_msg", "Route data inserted");
                                res.redirect("/admin/dashboard/routes");
                            })
                            .catch((e) => {
                                res.redirect("/admin/dashboard/routes");
                            });
                    });
                } else {
                    req.flash("error_msg", "Route name already exists");
                    res.redirect("/admin/dashboard/routes");
                }
            })
            .catch((e) => {
                res.redirect("/admin/dashboard/routes");
            });
    }
});

router.get("/routes/update/:id/:sStation/:dStation", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Routes",
    };

    var messageArray = [];

    commonFunctions
        .findAllInArray(Stations, "stationName", null, req.user.id)
        .then((stations) => {
            if (stations.length == 0) {
                messageArray.push({
                    type: "danger",
                    text:
                        "No stations added. Please add stations to add a Route.",
                });
            }
            options.data.stations = stations;
            commonFunctions
                .findAllInArray(Schedules, "scheduleName", null, req.user.id)
                .then((schedules) => {
                    if (schedules.length == 0) {
                        messageArray.push({
                            type: "danger",
                            text:
                                "No schedules added. Please add schedules to add a Route.",
                        });
                    }
                    options.data.schedules = schedules;
                    commonFunctions
                        .findAllInArray(Trains, "trainName", null, req.user.id)
                        .then((trains) => {
                            if (trains.length == 0) {
                                messageArray.push({
                                    type: "danger",
                                    text:
                                        "No trains added. Please add trains to add a Route.",
                                });
                            }
                            options.data.trains = trains;

                            var extras = [
                                {
                                    model: Stations,
                                    idColumn: "sStationId",
                                    nameColumn: "stationName",
                                    dataColumn: "sStation",
                                },
                                {
                                    model: Stations,
                                    idColumn: "dStationId",
                                    nameColumn: "stationName",
                                    dataColumn: "dStation",
                                },
                            ];
                            commonFunctions
                                .findAllInArray(
                                    Routes,
                                    "routeName",
                                    extras,
                                    req.user.id
                                )
                                .then((routes) => {
                                    if (routes.length == 0) {
                                        messageArray.push({
                                            type: "danger",
                                            text: "No routes added",
                                        });
                                    }
                                    options.data.messageArray = messageArray;
                                    options.data.routes = routes;

                                    Routes.findByPk(req.params.id)
                                        .then((data) => {
                                            var route = data.dataValues;
                                            var updateData = {
                                                status: true,
                                                id: route.id,
                                                routeName: route.routeName,
                                                sStation: req.params.sStation,
                                                dStation: req.params.dStation,
                                                routeFare: route.routeFare,
                                            };

                                            messageArray.push({
                                                type: "danger",
                                                text: "Please Update here",
                                            });
                                            options.data.messageArray = messageArray;
                                            options.data.updateRoute = updateData;
                                            res.render("routes", options);
                                        })
                                        .catch((e) => {
                                            options.data.messageArray = messageArray;
                                            res.render("routes", options);
                                        });
                                })
                                .catch((e) => {
                                    options.data.messageArray = messageArray;
                                    res.render("routes", options);
                                });
                        })
                        .catch((e) => {
                            options.data.messageArray = messageArray;
                            res.render("routes", options);
                        });
                })
                .catch((e) => {
                    options.data.messageArray = messageArray;
                    res.render("routes", options);
                });
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("routes", options);
        });
});

router.post("/routes/update", (req, res) => {
    const { routeId, routeName, scheduleId, trainId, routeFare } = req.body;

    Routes.findOne({
        where: {
            routeName,
        },
    })
        .then((route) => {
            if (route == null) {
                RouteSchedule.destroy({
                    where: {
                        routeId,
                    },
                })
                    .then(() => {
                        RouteTrain.destroy({
                            where: {
                                routeId,
                            },
                        })
                            .then(() => {
                                var promiseArray = [];
                                var p;

                                if (Array.isArray(trainId)) {
                                    trainId.forEach((element) => {
                                        p = RouteTrain.create({
                                            routeId,
                                            trainId: element,
                                        });
                                        promiseArray.push(p);
                                    });
                                } else {
                                    p = RouteTrain.create({
                                        routeId,
                                        trainId,
                                    });
                                    promiseArray.push(p);
                                }
                                if (Array.isArray(scheduleId)) {
                                    scheduleId.forEach((element) => {
                                        p = RouteSchedule.create({
                                            routeId,
                                            scheduleId: element,
                                        });
                                        promiseArray.push(p);
                                    });
                                } else {
                                    p = RouteSchedule.create({
                                        routeId,
                                        scheduleId,
                                    });
                                    promiseArray.push(p);
                                }
                                Promise.all(promiseArray)
                                    .then(() => {
                                        Routes.findByPk(routeId)
                                            .then((route) => {
                                                route.routeName = routeName;
                                                route.routeFare = routeFare;

                                                route
                                                    .save()
                                                    .then(() => {
                                                        req.flash(
                                                            "success_msg",
                                                            "Route Updated"
                                                        );
                                                        res.redirect(
                                                            "/admin/dashboard/routes"
                                                        );
                                                    })
                                                    .catch((e) => {
                                                        res.redirect(
                                                            "/admin/dashboard/routes"
                                                        );
                                                    });
                                            })
                                            .catch((e) => {
                                                res.redirect(
                                                    "/admin/dashboard/routes"
                                                );
                                            });
                                    })
                                    .catch((e) => {
                                        res.redirect("/admin/dashboard/routes");
                                    });
                            })
                            .catch((e) => {
                                res.redirect("/admin/dashboard/routes");
                            });
                    })
                    .catch((e) => {
                        res.redirect("/admin/dashboard/routes");
                    });
            } else {
                req.flash("error_msg", "Route name exists");
                res.redirect("/admin/dashboard/routes");
            }
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/routes");
        });
});

router.get("/routes/updateStatus/:id", (req, res) => {
    commonFunctions
        .changeStatus(Routes, req.params.id)
        .then(() => {
            res.redirect("/admin/dashboard/routes");
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/routes");
        });
});

router.get("/users", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Users",
    };

    var messageArray = [];

    Users.getAllUsers("user")
        .then((users) => {
            if (users.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No users yet.",
                });
            }
            options.data.users = users;
            commonFunctions
                .convertToPdf(userPdfTemplate, users, req.user.id, false)
                .then((data) => {
                    options.data.messageArray = messageArray;
                    res.render("users", options);
                })
                .catch((e) => {
                    options.data.messageArray = messageArray;
                    res.render("users", options);
                });
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("users", options);
        });
});

router.post("/users/search", (req, res) => {
    const userEmail = req.body.userEmail;
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Users",
    };
    var messageArray = [];
    var users = [];

    Users.getAllUsers("user")
        .then((userDatas) => {
            if (userDatas.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No users yet.",
                });
            }
            options.data.users = userDatas;
            options.data.userData = userDatas;
            if (userEmail) {
                Users.findOne({
                    where: {
                        userEmail,
                        userType: "user",
                    },
                })
                    .then((data) => {
                        if (data == null) {
                            messageArray.push({
                                text: "No users Found",
                                type: "danger",
                            });
                            options.data.users = [];
                            commonFunctions
                                .convertToPdf(
                                    userPdfTemplate,
                                    options.data.users,
                                    req.user.id,
                                    false
                                )
                                .then((data) => {
                                    options.data.messageArray = messageArray;
                                    res.render("users", options);
                                })
                                .catch((e) => {
                                    options.data.messageArray = messageArray;
                                    res.render("users", options);
                                });
                        } else {
                            data.dataValues.userYear =
                                new Date().getFullYear() -
                                data.dataValues.userYear;
                            users.push(data.dataValues);
                            options.data.users = users;
                            commonFunctions
                                .convertToPdf(
                                    userPdfTemplate,
                                    users,
                                    req.user.id,
                                    false
                                )
                                .then((data) => {
                                    options.data.messageArray = messageArray;
                                    res.render("users", options);
                                })
                                .catch((e) => {
                                    options.data.messageArray = messageArray;
                                    res.render("users", options);
                                });
                        }
                    })
                    .catch((e) => {
                        options.data.messageArray = messageArray;
                        res.render("users", options);
                    });
            } else {
                messageArray.push({
                    text: "Please enter Email",
                    type: "danger",
                });
                options.data.messageArray = messageArray;
                res.render("users", options);
            }
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("users", options);
        });
});

router.post("/users/filter", (req, res) => {
    const { minAge, maxAge, gender } = req.body;
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Users",
    };
    var messageArray = [];
    Users.getAllUsers("user")
        .then((userDatas) => {
            if (userDatas.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No users yet.",
                });
            }
            options.data.userData = userDatas;
            options.data.users = userDatas;
            Users.findAll({
                where: {
                    [Op.and]: [
                        {
                            userYear: {
                                [Op.between]: [
                                    parseInt(new Date().getFullYear() - maxAge),
                                    parseInt(new Date().getFullYear() - minAge),
                                ],
                            },
                        },
                        {
                            userGender: gender,
                            userType: "user",
                        },
                    ],
                },
            })
                .then((users) => {
                    if (users.length != 0) {
                        var userArray = [];
                        users.forEach((el, i) => {
                            var element = el.dataValues;
                            element.index = i + 1;
                            element.userYear =
                                new Date().getFullYear() - element.userYear;
                            userArray.push(el.dataValues);
                        });
                        options.data.users = userArray;
                        commonFunctions
                            .convertToPdf(
                                userPdfTemplate,
                                users,
                                req.user.id,
                                false
                            )
                            .then((data) => {
                                options.data.messageArray = messageArray;
                                res.render("users", options);
                            })
                            .catch((e) => {
                                messageArray.push({
                                    text: "No user found",
                                    type: "danger",
                                });
                                options.data.messageArray = messageArray;
                                res.render("users", options);
                            });
                    } else {
                        options.data.users = [];
                        messageArray.push({
                            text: "No user found",
                            type: "danger",
                        });
                        options.data.messageArray = messageArray;
                        commonFunctions
                            .convertToPdf(
                                userPdfTemplate,
                                options.data.users,
                                req.user.id,
                                false
                            )
                            .then((data) => {
                                options.data.messageArray = messageArray;
                                res.render("users", options);
                            })
                            .catch((e) => {
                                options.data.messageArray = messageArray;
                                res.render("users", options);
                            });
                    }
                })
                .catch((e) => {
                    options.data.messageArray = messageArray;
                    res.render("users", options);
                });
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("users", options);
        });
});

router.get("/users/pdf", (req, res) => {
    commonFunctions.sendPdf(req, res);
});

router.get("/admins", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Admins",
    };

    var messageArray = [];

    Users.getAllUsers("admin")
        .then((users) => {
            if (users.length == 0) {
                messageArray.push({
                    type: "danger",
                    text: "No admins yet.",
                });
            }
            options.data.users = users;
            options.data.messageArray = messageArray;
            res.render("admins", options);
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("admins", options);
        });
});

router.post("/admins", (req, res) => {
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

    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Admins",
    };

    Users.count({ where: { userEmail: email, userType: "admin" } })
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

            options.data.messageArray = messages;

            if (messages.length > 0) {
                res.render("admins", options);
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
                                userType: "admin",
                            })
                                .then(() => {
                                    req.flash(
                                        "success_msg",
                                        "Admin registered."
                                    );
                                    res.redirect("/admin/dashboard/admins");
                                })
                                .catch((err) => {
                                    req.flash("error_msg", err.message);
                                    res.redirect("/admin/dashboard/admins");
                                });
                        } else {
                            req.flash("error_msg", err.message);
                            res.redirect("/admin/dashboard/admins");
                        }
                    });
                });
            }
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/admins");
        });
});

router.get("/profile", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Profile",
    };

    res.render("adminProfile", options);
});

router.post("/updateProfile", (req, res) => {
    const { name, address, year, contact } = req.body;

    Users.updateUser(req.user.id, name, address, year, contact)
        .then(() => {
            req.flash("success_msg", "Profile updated");
            res.redirect("/admin/dashboard/profile");
        })
        .catch((e) => {
            res.redirect("/admin/dashboard/profile");
        });
});

router.post("/updatePassword", (req, res) => {
    const { currentP, password, cPassword } = req.body;

    if (password != cPassword) {
        req.flash("error_msg", "New Passwords do not match.");
        res.redirect("/admin/dashboard/profile");
    } else {
        Users.updatePassword(req.user.id, currentP, password)
            .then(() => {
                req.flash("success_msg", "Passwords Changed");
                res.redirect("/admin/dashboard/profile");
            })
            .catch((e) => {
                if (e.custom) {
                    req.flash("error_msg", e.message);
                } else {
                }
                res.redirect("/admin/dashboard/profile");
            });
    }
});

router.get("/bookings", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Bookings",
    };

    var messageArray = [];

    Trains.findAll({
        Where: {
            adminId: req.user.id,
        },
    })
        .then((data) => {
            if (data.length == 0) {
                messageArray.push({
                    text: "No trains added yet",
                    type: "danger",
                });
                options.data.messageArray = messageArray;
                res.render("bookings", options);
            } else {
                var trainArray = [];
                data.forEach((el) => {
                    trainArray.push(el.dataValues);
                });
                options.data.trainArray = trainArray;
                RouteTrain.getRoutes(trainArray[0].id)
                    .then((routeArray) => {
                        options.data.routeArray = routeArray;
                        RouteSchedule.getSchedules(routeArray[0].id, true)
                            .then((scheduleArray) => {
                                options.data.scheduleArray = scheduleArray;
                                options.data.messageArray = messageArray;
                                res.render("bookings", options);
                            })
                            .catch((e) => {
                                if (e.custom) {
                                    messageArray.push({
                                        text: e.message,
                                        type: "danger",
                                    });
                                } else {
                                }
                                options.data.messageArray = messageArray;
                                res.render("bookings", options);
                            });
                    })
                    .catch((e) => {
                        if (e.custom) {
                            messageArray.push({
                                text: e.message,
                                type: "danger",
                            });
                        } else {
                        }
                        options.data.messageArray = messageArray;
                        res.render("bookings", options);
                    });
            }
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("bookings", options);
        });
});

router.get("/bookings/getSchedules/:routeId", (req, res) => {
    var sendData = {
        error: false,
        message: null,
        scheduleArray: null,
    };
    RouteSchedule.getSchedules(req.params.routeId, true)
        .then((scheduleArray) => {
            sendData.scheduleArray = scheduleArray;
            res.send(sendData);
        })
        .catch((e) => {
            sendData.error = true;
            if (e.custom) {
                sendData.message = e.message;
            } else {
            }
            res.send(sendData);
        });
});

router.post("/bookings", (req, res) => {
    options.data = {
        messages: commonFunctions.flashMessages(req),
        userData: req.user,
        title: "Bookings",
    };

    var messageArray = [];

    Trains.findAll({
        Where: {
            adminId: req.user.id,
        },
    })
        .then((data) => {
            if (data.length == 0) {
                messageArray.push({
                    text: "No trains added yet",
                    type: "danger",
                });
                options.data.messageArray = messageArray;
                res.render("bookings", options);
            } else {
                var trainArray = [];
                data.forEach((el) => {
                    trainArray.push(el.dataValues);
                });
                options.data.trainArray = trainArray;
                RouteTrain.getRoutes(trainArray[0].id)
                    .then((routeArray) => {
                        options.data.routeArray = routeArray;
                        RouteSchedule.getSchedules(routeArray[0].id, true)
                            .then((scheduleArray) => {
                                options.data.scheduleArray = scheduleArray;
                                const {
                                    bTrain,
                                    bRoute,
                                    bSchedule,
                                    bDate,
                                } = req.body;
                                var query = {
                                    where: {
                                        trainId: bTrain,
                                        routeId: bRoute,
                                        scheduleId: bSchedule,
                                    },
                                };
                                if (bDate != "") {
                                    query.where.bookingDate = bDate;
                                }

                                Bookings.findAll(query)
                                    .then((data) => {
                                        if (data.length == 0) {
                                            messageArray.push({
                                                text: "No Bookings available",
                                                type: "danger",
                                            });
                                            options.data.messageArray = messageArray;
                                            res.render("bookings", options);
                                        } else {
                                            var bookingsArray = [];
                                            data.forEach((el, i) => {
                                                el.dataValues.index = i + 1;
                                                bookingsArray.push(
                                                    el.dataValues
                                                );
                                            });
                                            options.data.bookingsArray = bookingsArray;
                                            var pdfData = {
                                                bookingsArray,
                                                data: {},
                                            };

                                            promiseArray = [];
                                            promiseArray.push(
                                                Trains.findByPk(bTrain).then(
                                                    (data) => {
                                                        pdfData.data.trainName = data.get().trainName;
                                                    }
                                                )
                                            );
                                            promiseArray.push(
                                                Routes.findByPk(bRoute).then(
                                                    (data) => {
                                                        pdfData.data.routeName = data.get().routeName;
                                                    }
                                                )
                                            );
                                            promiseArray.push(
                                                Schedules.findByPk(
                                                    bSchedule
                                                ).then((data) => {
                                                    pdfData.data.scheduleName = data.get().scheduleName;
                                                })
                                            );

                                            Promise.all(promiseArray)
                                                .then(() => {
                                                    commonFunctions
                                                        .convertToPdf(
                                                            bookingPdfTemplate,
                                                            pdfData,
                                                            req.user.id,
                                                            false
                                                        )
                                                        .then((data) => {
                                                            options.data.showPdf = true;
                                                            options.data.messageArray = messageArray;
                                                            res.render(
                                                                "bookings",
                                                                options
                                                            );
                                                        })
                                                        .catch((e) => {
                                                            options.data.messageArray = messageArray;
                                                            res.render(
                                                                "bookings",
                                                                options
                                                            );
                                                        });
                                                })
                                                .catch((e) => {
                                                    res.redirect(
                                                        "/admin/dashboard/bookings"
                                                    );
                                                });
                                        }
                                    })
                                    .catch((e) => {
                                        res.redirect(
                                            "/admin/dashboard/bookings"
                                        );
                                    });
                            })
                            .catch((e) => {
                                if (e.custom) {
                                    messageArray.push({
                                        text: e.message,
                                        type: "danger",
                                    });
                                } else {
                                }
                                options.data.messageArray = messageArray;
                                res.render("bookings", options);
                            });
                    })
                    .catch((e) => {
                        if (e.custom) {
                            messageArray.push({
                                text: e.message,
                                type: "danger",
                            });
                        } else {
                        }
                        options.data.messageArray = messageArray;
                        res.render("bookings", options);
                    });
            }
        })
        .catch((e) => {
            options.data.messageArray = messageArray;
            res.render("bookings", options);
        });
});

router.get("/bookings/pdf", (req, res) => {
    commonFunctions.sendPdf(req, res);
});

router.get("/bookings/getRoutes/:trainId", (req, res) => {
    const trainId = req.params.trainId;
    var sendData = {
        error: false,
        message: null,
        routeArray: null,
        scheduleArray: null,
    };

    RouteTrain.getRoutes(trainId)
        .then((routeArray) => {
            RouteSchedule.getSchedules(routeArray[0].id, true)
                .then((scheduleArray) => {
                    sendData.scheduleArray = scheduleArray;
                    sendData.routeArray = routeArray;
                    res.send(sendData);
                })
                .catch((e) => {
                    sendData.error = true;
                    if (e.custom) {
                        sendData.message = e.message;
                    } else {
                    }
                    res.send(sendData);
                });
        })
        .catch((e) => {
            sendData.error = true;
            if (e.custom) {
                sendData.message = e.message;
            } else {
            }
            res.send(sendData);
        });
});

module.exports = router;
