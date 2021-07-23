const Sequelize = require("sequelize");
const db = require("../config/dbConfig");

const States = db.define("State", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    adminId: {
        type: Sequelize.STRING,
    },
    stateName: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.BOOLEAN.key,
        defaultValue: true,
    },
});

module.exports = States;

module.exports.getAllStates = (adminId) => {
    return new Promise((resolve, reject) => {
        States.findAll()
            .then((data) => {
                if (data.length == 0) {
                    return reject({
                        custom: true,
                        message: "No States available",
                    });
                } else {
                    var state,
                        statesArray = [];
                    data.forEach((el) => {
                        state = el.dataValues;
                        if (state.status) {
                            if (adminId) {
                                if (state.adminId == adminId) {
                                    statesArray.push(state);
                                }
                            } else {
                                statesArray.push(state);
                            }
                        }
                    });
                    statesArray.sort((a, b) => {
                        var nameA = a.stateName.toUpperCase();
                        var nameB = b.stateName.toUpperCase();

                        if (nameA < nameB) {
                            return -1;
                        } else if (nameA > nameB) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    return resolve(statesArray);
                }
            })
            .catch((e) => {
                e.custom = false;
                return reject(e);
            });
    });
};
