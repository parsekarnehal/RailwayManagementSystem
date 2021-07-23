const Sequelize = require("sequelize");
const db = require("../config/dbConfig");
const Trains = require("./Trains");
const Schedules = require("./Schedules");
const States = require("./States");
const Stations = require("./Stations");
const Users = require("./Users");
const Bookings = require("./Bookings");

const Tickets = db.define("Ticket", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.STRING,
    },
    adminId: {
        type: Sequelize.STRING,
    },
    routeId: {
        type: Sequelize.STRING,
    },
    trainId: {
        type: Sequelize.STRING,
    },
    scheduleId: {
        type: Sequelize.STRING,
    },
    dStateId: {
        type: Sequelize.STRING,
    },
    sStateId: {
        type: Sequelize.STRING,
    },
    sStationId: {
        type: Sequelize.STRING,
    },
    dStationId: {
        type: Sequelize.STRING,
    },
    ticketDate: {
        type: Sequelize.DATEONLY,
    },
    ticketCoach: {
        type: Sequelize.BOOLEAN,
    },
    status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
    ticketFare: {
        type: Sequelize.FLOAT,
    },
});

module.exports = Tickets;

module.exports.bookTickets = (tickets) => {
    return new Promise((resolve, reject) => {
        if (Array.isArray(tickets)) {
            Bookings.findOne({
                where: {
                    bookingDate: tickets[0].ticketDate,
                    routeId: tickets[0].routeId,
                    scheduleId: tickets[0].scheduleId,
                    trainId: tickets[0].trainId,
                },
            })
                .then((booking) => {
                    if (booking == null) {
                        Trains.findByPk(tickets[0].trainId)
                            .then((train) => {
                                var acSeats = train.acSeats;
                                var gSeats = train.generalSeats;

                                Bookings.create({
                                    bookingDate: tickets[0].ticketDate,
                                    routeId: tickets[0].routeId,
                                    scheduleId: tickets[0].scheduleId,
                                    trainId: tickets[0].trainId,
                                    bAcSeats: tickets[0].ticketCoach
                                        ? tickets.length
                                        : 0,
                                    bGeneralSeats: tickets[0].ticketCoach
                                        ? 0
                                        : tickets.length,
                                    aAcSeats: tickets[0].ticketCoach
                                        ? acSeats - tickets.length
                                        : acSeats,
                                    aGeneralSeats: tickets[0].ticketCoach
                                        ? gSeats
                                        : gSeats - tickets.length,
                                })
                                    .then(() => {
                                        var p,
                                            promiseArray = [];
                                        tickets.forEach((el) => {
                                            p = Tickets.create(el);
                                            promiseArray.push(p);
                                        });
                                        Promise.all(promiseArray)
                                            .then(() => {
                                                return resolve();
                                            })
                                            .catch((e) => {
                                                e.custom = false;
                                                return resolve(e);
                                            });
                                    })
                                    .catch((e) => {
                                        return reject(e);
                                    });
                            })
                            .catch((e) => {
                                return reject(e);
                            });
                    } else {
                        if (tickets[0].ticketCoach) {
                            if (booking.aAcSeats < tickets.length) {
                                return reject({
                                    custom: true,
                                    message: "AC Seats are full",
                                });
                            } else {
                                booking.bAcSeats =
                                    booking.bAcSeats + tickets.length;
                                booking.aAcSeats =
                                    booking.aAcSeats - tickets.length;
                                booking
                                    .save()
                                    .then(() => {
                                        return resolve();
                                    })
                                    .catch((e) => {
                                        e.custom = false;
                                        return resolve(e);
                                    });
                            }
                        } else {
                            if (booking.aGeneralSeats < tickets.length) {
                                return reject({
                                    custom: true,
                                    message: "General Seats are full",
                                });
                            } else {
                                booking.bGeneralSeats =
                                    booking.bGeneralSeats + tickets.length;
                                booking.aGeneralSeats =
                                    booking.aGeneralSeats - tickets.length;
                                booking
                                    .save()
                                    .then(() => {
                                        return resolve();
                                    })
                                    .catch((e) => {
                                        e.custom = false;
                                        return resolve(e);
                                    });
                            }
                        }
                    }
                })
                .catch((e) => {
                    e.custom = false;
                    return resolve(e);
                });
        } else {
            Bookings.findOne({
                where: {
                    bookingDate: tickets.ticketDate,
                    routeId: tickets.routeId,
                    scheduleId: tickets.scheduleId,
                    trainId: tickets.trainId,
                },
            })
                .then((booking) => {
                    if (booking == null) {
                        Trains.findByPk(tickets.trainId)
                            .then((train) => {
                                var acSeats = train.acSeats;
                                var gSeats = train.generalSeats;
                                Bookings.create({
                                    bookingDate: tickets.ticketDate,
                                    routeId: tickets.routeId,
                                    scheduleId: tickets.scheduleId,
                                    trainId: tickets.trainId,
                                    bAcSeats: tickets.ticketCoach ? 1 : 0,
                                    bGeneralSeats: tickets.ticketCoach ? 0 : 1,
                                    aAcSeats: tickets.ticketCoach
                                        ? acSeats - 1
                                        : acSeats,
                                    aGeneralSeats: tickets.ticketCoach
                                        ? gSeats
                                        : gSeats - 1,
                                })
                                    .then((data) => {
                                        Tickets.create(tickets)
                                            .then(() => {
                                                return resolve();
                                            })
                                            .catch((e) => {
                                                e.custom = false;
                                                return resolve(e);
                                            });
                                    })
                                    .catch((e) => {
                                        e.custom = false;
                                        return resolve(e);
                                    });
                            })
                            .catch((e) => {
                                e.custom = false;
                                return resolve(e);
                            });
                    } else {
                        if (tickets.ticketCoach) {
                            if (booking.aAcSeats < 1) {
                                return reject({
                                    custom: true,
                                    message: "AC Seats are full",
                                });
                            } else {
                                booking.bAcSeats = booking.bAcSeats + 1;
                                booking.aAcSeats = booking.aAcSeats - 1;
                                booking
                                    .save()
                                    .then(() => {
                                        return resolve();
                                    })
                                    .catch((e) => {
                                        e.custom = false;
                                        return resolve(e);
                                    });
                            }
                        } else {
                            if (booking.aGeneralSeats < 1) {
                                return reject({
                                    custom: true,
                                    message: "General Seats are full",
                                });
                            } else {
                                booking.bGeneralSeats =
                                    booking.bGeneralSeats + 1;
                                booking.aGeneralSeats =
                                    booking.aGeneralSeats - 1;
                                booking
                                    .save()
                                    .then(() => {
                                        return resolve();
                                    })
                                    .catch((e) => {
                                        e.custom = false;
                                        return resolve(e);
                                    });
                            }
                        }
                    }
                })
                .catch((e) => {
                    e.custom = false;
                    return resolve(e);
                });
        }
    });
};

module.exports.getTickets = (adminId, all, id, month) => {
    return new Promise((resolve, reject) => {
        var query = {
            where: {
                adminId,
            },
        };

        if (id) {
            query.where.id = id;
        }

        Tickets.findAll(query)
            .then((data) => {
                if (data.length == 0) {
                    return reject({
                        custom: true,
                        message: "No Tickets Booked yet",
                    });
                } else {
                    var ticket,
                        ticketsArray = [];
                    var promiseArray = [],
                        promises = [];
                    var yearArray = [];
                    data.forEach((el) => {
                        ticket = el.dataValues;
                        if (ticket.status || all) {
                            yearArray.push(ticket.ticketDate.split("-")[0]);
                            var ticketData = {
                                id: null,
                                index: null,
                                userName: null,
                                trainName: null,
                                arrival: null,
                                departure: null,
                                ticketDate: null,
                                ticketCoach: null,
                                sStateName: null,
                                sStationName: null,
                                dStateName: null,
                                dStationName: null,
                                ticketFare: null,
                                status: null,
                            };
                            ticketData.id = ticket.id;
                            ticketData.status = ticket.status;
                            ticketData.ticketFare = ticket.ticketFare;
                            ticketData.ticketDate = ticket.ticketDate;
                            ticketData.ticketCoach = ticket.ticketCoach
                                ? "AC"
                                : "General";
                            promiseArray.push(
                                Users.findByPk(ticket.userId).then((data) => {
                                    ticketData.userName = data.get().userName;
                                })
                            );
                            promiseArray.push(
                                Trains.findByPk(ticket.trainId).then((data) => {
                                    ticketData.trainName = data.get().trainName;
                                })
                            );
                            promiseArray.push(
                                Schedules.findByPk(ticket.scheduleId).then(
                                    (data) => {
                                        ticketData.arrival = data.get().arrival;
                                        ticketData.departure = data.get().departure;
                                    }
                                )
                            );
                            promiseArray.push(
                                States.findByPk(ticket.sStateId).then(
                                    (data) => {
                                        ticketData.sStateName = data.get().stateName;
                                    }
                                )
                            );
                            promiseArray.push(
                                States.findByPk(ticket.dStateId).then(
                                    (data) => {
                                        ticketData.dStateName = data.get().stateName;
                                    }
                                )
                            );
                            promiseArray.push(
                                Stations.findByPk(ticket.sStationId).then(
                                    (data) => {
                                        ticketData.sStationName = data.get().stationName;
                                    }
                                )
                            );
                            promiseArray.push(
                                Stations.findByPk(ticket.dStationId).then(
                                    (data) => {
                                        ticketData.dStationName = data.get().stationName;
                                    }
                                )
                            );
                            promises.push(
                                Promise.all(promiseArray).then(() => {
                                    ticketsArray.push(ticketData);
                                })
                            );
                        }
                    });
                    Promise.all(promises)
                        .then(() => {
                            ticketsArray.sort((a, b) => {
                                var dateA = new Date(a.ticketDate);
                                var dateB = new Date(b.ticketDate);

                                return dateA.valueOf() - dateB.valueOf();
                            });
                            ticketsArray.forEach((el, i) => {
                                el.index = i + 1;
                            });

                            var monthTransactions = [];
                            var thisDate = new Date();
                            var thisMonth = month.month
                                ? month.month
                                : thisDate.getMonth() + 1;
                            var thisYear = month.year
                                ? month.year
                                : thisDate.getFullYear();
                            if (month) {
                                ticketsArray.forEach((el) => {
                                    var arrayMonth = parseInt(
                                        el.ticketDate.split("-")[1]
                                    );
                                    var arrayYear = parseInt(
                                        el.ticketDate.split("-")[0]
                                    );

                                    if (
                                        thisMonth == arrayMonth &&
                                        thisYear == arrayYear
                                    ) {
                                        monthTransactions.push(el);
                                    }
                                });
                            }

                            yearArray = Array.from(new Set(yearArray));
                            yearArray.sort((a, b) => {
                                return a - b;
                            });

                            var sendData = {
                                yearArray,
                                ticketsArray,
                                monthTransactions,
                            };

                            return resolve(sendData);
                        })
                        .catch((e) => {
                            e.custom = false;
                            return reject(e);
                        });
                }
            })
            .catch((e) => {
                e.custom = false;
                return reject(e);
            });
    });
};

module.exports.cancelTicket = (ticketId) => {
    return new Promise((resolve, reject) => {
        Tickets.findByPk(ticketId)
            .then((ticket) => {
                ticket.status = false;
                ticket
                    .save()
                    .then(() => {
                        Bookings.findOne({
                            where: {
                                bookingDate: ticket.ticketDate,
                                routeId: ticket.routeId,
                                scheduleId: ticket.scheduleId,
                                trainId: ticket.trainId,
                            },
                        })
                            .then((booking) => {
                                if (ticket.ticketCoach) {
                                    booking.aAcSeats += 1;
                                    booking.bAcSeats -= 1;
                                } else {
                                    booking.aGeneralSeats += 1;
                                    booking.bGeneralSeats -= 1;
                                }
                                booking
                                    .save()
                                    .then(() => {
                                        return resolve();
                                    })
                                    .catch((e) => {
                                        return reject(e);
                                    });
                            })
                            .catch((e) => {
                                return reject(e);
                            });
                    })
                    .catch((e) => {
                        return reject(e);
                    });
            })
            .catch((e) => {
                return reject(e);
            });
    });
};
