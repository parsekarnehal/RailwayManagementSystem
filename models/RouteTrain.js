const Sequelize = require("sequelize");
const db = require("../config/dbConfig");
const Trains = require("./Trains");
const Bookings = require("./Bookings");
const Routes = require("./Routes");

const RouteTrain = db.define("RouteTrain", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    routeId: {
        type: Sequelize.STRING,
    },
    trainId: {
        type: Sequelize.STRING,
    },
});

module.exports = RouteTrain;

module.exports.getTrains = (routeId, scheduleId, date, count, isAc) => {
    return new Promise((resolve, reject) => {
        RouteTrain.findAll({
            where: {
                routeId,
            },
        })
            .then((data) => {
                if (data.length == 0) {
                    return reject({
                        custom: true,
                        message: "No Train available",
                    });
                } else {
                    var train,
                        trainArray = [];
                    var p,
                        promiseArray = [];
                    data.forEach((el) => {
                        p = Trains.findByPk(el.trainId).then((data) => {
                            train = data.get();
                            if (train.status) {
                                trainArray.push(train);
                            }
                        });
                        promiseArray.push(p);
                    });

                    Promise.all(promiseArray)
                        .then(() => {
                            trainArray.sort((a, b) => {
                                var nameA = a.trainName.toUpperCase();
                                var nameB = b.trainName.toUpperCase();

                                if (nameA < nameB) {
                                    return -1;
                                } else if (nameA > nameB) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            });

                            if (trainArray.length == 0) {
                                return reject({
                                    custom: true,
                                    message: "No Train available",
                                });
                            } else {
                                var bookingArray = [];
                                trainArray.forEach((el) => {
                                    var trainId = el.id;
                                    Bookings.getBookings(
                                        routeId,
                                        scheduleId,
                                        trainId,
                                        date
                                    )
                                        .then((data) => {
                                            if (data.exists) {
                                                var booking = data.data;
                                                if (isAc) {
                                                    if (
                                                        booking.aScSeats >=
                                                        count
                                                    ) {
                                                        bookingArray.push(el);
                                                    }
                                                } else {
                                                    if (
                                                        booking.aGeneralSeats >=
                                                        count
                                                    ) {
                                                        bookingArray.push(el);
                                                    }
                                                }
                                            } else {
                                                bookingArray.push(el);
                                            }
                                            return resolve(bookingArray);
                                        })
                                        .catch((e) => {
                                            e.custom = false;
                                            return reject(e);
                                        });
                                });
                            }
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

module.exports.getRoutes = (trainId) => {
    return new Promise((resolve, reject) => {
        RouteTrain.findAll({
            where: {
                trainId,
            },
        })
            .then((data) => {
                if (data.length == 0) {
                    return reject({
                        custom: true,
                        message: "No Routes for the train",
                    });
                } else {
                    var routeArray = [];
                    var promiseArray = [];
                    var p;
                    data.forEach((el) => {
                        p = Routes.findByPk(el.dataValues.routeId).then(
                            (data) => {
                                routeArray.push(data.dataValues);
                            }
                        );
                        promiseArray.push(p);
                    });
                    Promise.all(promiseArray)
                        .then(() => {
                            return resolve(routeArray);
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
