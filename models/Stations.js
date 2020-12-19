const Sequelize = require("sequelize");
const db = require("../config/dbConfig");

const Stations = db.define("Station", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    adminId: {
        type: Sequelize.STRING,
    },
    stateId: {
        type: Sequelize.STRING,
    },
    stationName: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.BOOLEAN.key,
        defaultValue: true,
    },
});

module.exports = Stations;

module.exports.getStations = (adminId) => {
    return new Promise((resolve, reject) => {
        Stations.findAll()
            .then((data) => {
                if (data.length == 0) {
                    return reject({
                        custom: true,
                        message: "No Stations available",
                    });
                } else {
                    var station,
                        stationsArray = [];
                    data.forEach((el) => {
                        station = el.dataValues;
                        if (station.status) {
                            if (adminId) {
                                if (station.adminId == adminId) {
                                    stationsArray.push(station);
                                }
                            } else {
                                stationsArray.push(station);
                            }
                        }
                    });
                    stationsArray.sort((a, b) => {
                        var nameA = a.stationName.toUpperCase();
                        var nameB = b.stationName.toUpperCase();

                        if (nameA < nameB) {
                            return -1;
                        } else if (nameA > nameB) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    return resolve(stationsArray);
                }
            })
            .catch((e) => {
                e.custom = false;
                return reject(e);
            });
    });
};

module.exports.getStateStations = (stateId) => {
    return new Promise((resolve, reject) => {
        Stations.findAll({
            where: {
                stateId,
            },
        })
            .then((data) => {
                if (data.length == 0) {
                    return reject({
                        custom: true,
                        message: "No stations available",
                    });
                } else {
                    var station,
                        stationsArray = [];
                    data.forEach((el) => {
                        station = el.dataValues;
                        if (station.status) {
                            stationsArray.push(station);
                        }
                    });
                    stationsArray.sort((a, b) => {
                        var nameA = a.stationName.toUpperCase();
                        var nameB = b.stationName.toUpperCase();

                        if (nameA < nameB) {
                            return -1;
                        } else if (nameA > nameB) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    return resolve(stationsArray);
                }
            })
            .catch((e) => {
                e.custom = false;
                return reject(e);
            });
    });
};
