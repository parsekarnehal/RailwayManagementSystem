const Sequelize = require("sequelize");
const db = require("../config/dbConfig");

const Trains = db.define("Train", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    adminId: {
        type: Sequelize.STRING,
    },
    acSeats: {
        type: Sequelize.INTEGER,
    },
    generalSeats: {
        type: Sequelize.INTEGER,
    },
    trainName: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.BOOLEAN.key,
        defaultValue: true,
    },
});

module.exports = Trains;

module.exports.getTrains = (adminId) => {
    return new Promise((resolve, reject) => {
        Trains.findAll()
            .then((data) => {
                if (data.length == 0) {
                    return reject({
                        custom: true,
                        message: "No Trains available",
                    });
                } else {
                    var train,
                        trainsArray = [];
                    data.forEach((el) => {
                        train = el.dataValues;
                        if (train.status) {
                            if (adminId) {
                                if (train.adminId == adminId) {
                                    trainsArray.push(train);
                                }
                            } else {
                                trainsArray.push(train);
                            }
                        }
                    });
                    trainsArray.sort((a, b) => {
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
                    return resolve(trainsArray);
                }
            })
            .catch((e) => {
                e.custom = false;
                return reject(e);
            });
    });
};
