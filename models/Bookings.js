const Sequelize = require("sequelize");
const db = require("../config/dbConfig");
const Trains = require("./Trains");

const Bookings = db.define("Booking", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    bookingDate: {
        type: Sequelize.DATEONLY,
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
    aGeneralSeats: {
        type: Sequelize.INTEGER,
    },
    aAcSeats: {
        type: Sequelize.INTEGER,
    },
    bGeneralSeats: {
        type: Sequelize.INTEGER,
    },
    bAcSeats: {
        type: Sequelize.INTEGER,
    },
});

module.exports = Bookings;

module.exports.getBookings = (routeId, scheduleId, trainId, bookingDate) => {
    return new Promise((resolve, reject) => {
        var sendData = {
            exists: false,
        };
        Bookings.findOne({
            where: {
                routeId,
                scheduleId,
                trainId,
                bookingDate,
            },
        })
            .then((data) => {
                if (data == null) {
                    return resolve(sendData);
                } else {
                    var booking = data.dataValues;
                    sendData.exists = true;
                    sendData.data = booking;
                    return resolve(sendData);
                }
            })
            .catch((e) => {
                return reject(e);
            });
    });
};

module.exports.getBookingsThisMonth = (adminId) => {
    return new Promise((resolve, reject) => {
        var thisDate = new Date();
        var thisMonth = thisDate.getMonth() + 1;
        var thisYear = thisDate.getFullYear();

        Trains.findAll({
            where: {
                adminId,
            },
        })
            .then((data) => {
                if (data.length == 0) {
                    return reject({});
                } else {
                    var p,
                        promiseArray = [];
                    var trainBooking = {};
                    data.forEach((el) => {
                        var trainId = el.dataValues.id;
                        var trainName = el.dataValues.trainName;
                        trainBooking[trainName] = {
                            bAcSeats: 0,
                            bGeneralSeats: 0,
                        };
                        p = Bookings.findAll({
                            where: {
                                trainId,
                            },
                        }).then((data) => {
                            if (data.length != 0) {
                                data.forEach((el) => {
                                    var element = el.dataValues;
                                    var arrayMonth = parseInt(
                                        element.bookingDate.split("-")[1]
                                    );
                                    var arrayYear = parseInt(
                                        element.bookingDate.split("-")[0]
                                    );

                                    if (
                                        thisMonth == arrayMonth &&
                                        thisYear == arrayYear
                                    ) {
                                        trainBooking[trainName].bAcSeats +=
                                            element.bAcSeats;
                                        trainBooking[trainName].bGeneralSeats +=
                                            element.bGeneralSeats;
                                    }
                                });
                            }
                        });
                        promiseArray.push(p);
                    });
                    Promise.all(promiseArray)
                        .then(() => {
                            return resolve(trainBooking);
                        })
                        .catch((e) => {
                            return reject({});
                        });
                }
            })
            .catch((e) => {
                return reject({});
            });
    });
};
