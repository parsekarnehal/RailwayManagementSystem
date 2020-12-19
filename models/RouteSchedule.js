const Sequelize = require("sequelize");
const db = require("../config/dbConfig");
const Schedule = require("./Schedules");

const RouteSchedule = db.define("RouteSchedule", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    routeId: {
        type: Sequelize.STRING,
    },
    scheduleId: {
        type: Sequelize.STRING,
    },
});

module.exports = RouteSchedule;

module.exports.getSchedules = (routeId, all) => {
    return new Promise((resolve, reject) => {
        RouteSchedule.findAll({
            where: {
                routeId,
            },
        })
            .then((data) => {
                if (data.length == 0) {
                    return reject({
                        custom: true,
                        message: "No Schedules available",
                    });
                } else {
                    var schedule,
                        scheduleArray = [];
                    var p,
                        promiseArray = [];
                    data.forEach((el) => {
                        routeSchedule = el.dataValues;
                        scheduleId = routeSchedule.scheduleId;
                        p = Schedule.findByPk(scheduleId).then((data) => {
                            schedule = data.get();
                            schedule.text =
                                "Departure : " +
                                schedule.departure +
                                ", Arrival : " +
                                schedule.arrival;
                            if (schedule.status || all) {
                                scheduleArray.push(schedule);
                            }
                        });
                        promiseArray.push(p);
                    });

                    Promise.all(promiseArray)
                        .then(() => {
                            scheduleArray.sort((a, b) => {
                                var departureA = parseInt(
                                    a.departure.split(":")[0]
                                );
                                var departureB = parseInt(
                                    b.departure.split(":")[0]
                                );

                                if (departureA < departureB) {
                                    return -1;
                                } else if (departureA > departureB) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            });

                            return resolve(scheduleArray);
                        })
                        .catch((e) => {
                            e.custome = false;
                            return reject(e);
                        });
                }
            })
            .catch((e) => {
                e.custome = false;
                return reject(e);
            });
    });
};
