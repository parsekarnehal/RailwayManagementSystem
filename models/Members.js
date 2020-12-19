const Sequelize = require("sequelize");
const db = require("../config/dbConfig");
const Users = require("./Users");

const Members = db.define("Member", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    adminId: {
        type: Sequelize.STRING,
    },
    userId: {
        type: Sequelize.STRING,
    },
});

module.exports = Members;

module.exports.getMembers = (adminId) => {
    return new Promise((resolve, reject) => {
        Members.findAll({
            where: {
                adminId,
            },
        })
            .then((data) => {
                if (data.length == 0) {
                    return reject({
                        custom: true,
                        message: "No members added.",
                    });
                } else {
                    var promiseArray = [];
                    var memberArray = [];
                    var p;
                    data.forEach((member) => {
                        p = Users.findByPk(member.dataValues.userId).then(
                            (data) => {
                                memberArray.push(data.get());
                            }
                        );
                        promiseArray.push(p);
                    });
                    Promise.all(promiseArray)
                        .then(() => {
                            var index = 1;
                            memberArray.forEach((el) => {
                                el.index = index;
                                el.userYear =
                                    new Date().getFullYear() - el.userYear;
                                index++;
                            });
                            return resolve(memberArray);
                        })
                        .catch((e) => {
                            return reject(e);
                        });
                }
            })
            .catch((e) => {
                return reject(e);
            });
    });
};

module.exports.saveMember = (member, adminId) => {
    return new Promise((resolve, reject) => {
        Users.findOne({
            where: {
                userEmail: member.userEmail,
            },
        })
            .then((user) => {
                if (user == null) {
                    Users.create(member)
                        .then((user) => {
                            Members.create({
                                adminId,
                                userId: user.id,
                            })
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
                } else {
                    return reject({
                        custom: true,
                        message: "User Email already exists",
                    });
                }
            })
            .catch((e) => {
                return reject(e);
            });
    });
};
