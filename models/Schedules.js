const Sequelize = require("sequelize");
const db = require("../config/dbConfig");

const Schedules = db.define("Schedule", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    scheduleName: {
        type: Sequelize.STRING,
    },
    adminId: {
        type: Sequelize.STRING,
    },
    arrival: {
        type: Sequelize.TIME,
    },
    departure: {
        type: Sequelize.TIME,
    },
    status: {
        type: Sequelize.BOOLEAN.key,
        defaultValue: true,
    },
});

module.exports = Schedules;

module.exports.getSchedules = (adminId) => {
    return new Promise((resolve, reject) => {
        Schedules.findAll()
            .then((data) => {
                if (data.length == 0) {
                    return reject({
                        custom: true,
                        message: "No Schedules available",
                    });
                } else {
                    var schedule,
                        schedulesArray = [];
                    data.forEach((el) => {
                        schedule = el.dataValues;
                        if (schedule.status) {
                            if (adminId) {
                                if (schedule.adminId == adminId) {
                                    schedulesArray.push(schedule);
                                }
                            } else {
                                schedulesArray.push(schedule);
                            }
                        }
                    });
                    schedulesArray.sort((a, b) => {
                        var nameA = a.scheduleName.toUpperCase();
                        var nameB = b.scheduleName.toUpperCase();

                        if (nameA < nameB) {
                            return -1;
                        } else if (nameA > nameB) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    return resolve(schedulesArray);
                }
            })
            .catch((e) => {
                e.custom = false;
                return reject(e);
            });
    });
};
