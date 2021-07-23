const Sequelize = require("sequelize");
const db = require("../config/dbConfig");
const bcrypt = require("bcryptjs");

const Users = db.define("User", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    userName: {
        type: Sequelize.STRING,
    },
    userAddress: {
        type: Sequelize.STRING,
    },
    userYear: {
        type: Sequelize.INTEGER,
    },
    userGender: {
        type: Sequelize.STRING,
    },
    userContact: {
        type: Sequelize.STRING,
    },
    userEmail: {
        type: Sequelize.STRING,
    },
    userPassword: {
        type: Sequelize.STRING,
    },
    userType: {
        type: Sequelize.STRING,
    },
});

module.exports = Users;

module.exports.getAllUsers = (type) => {
    return new Promise((resolve, reject) => {
        Users.findAll()
            .then((users) => {
                var userArray = [];
                users.forEach((element) => {
                    var entry = element.dataValues;
                    if (entry.userType == type) {
                        userArray.push(entry);
                    }
                });
                userArray.sort((a, b) => {
                    var nameA = a.userName.toUpperCase();
                    var nameB = b.userName.toUpperCase();

                    if (nameA < nameB) {
                        return -1;
                    } else if (nameA > nameB) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                var index = 1;
                userArray.forEach((el) => {
                    el.index = index;
                    el.userYear = new Date().getFullYear() - el.userYear;
                    index++;
                });
                resolve(userArray);
            })
            .catch((e) => {
                return reject(e);
            });
    });
};

module.exports.updateUser = (
    id,
    userName,
    userAddress,
    userYear,
    userContact
) => {
    return new Promise((resolve, reject) => {
        Users.findByPk(id)
            .then((user) => {
                user.userName = userName;
                user.userAddress = userAddress;
                user.userYear = userYear;
                user.userContact = userContact;
                user.save()
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
    });
};

module.exports.updatePassword = (id, oldPassword, newPassword) => {
    return new Promise((resolve, reject) => {
        Users.findByPk(id)
            .then((user) => {
                bcrypt.compare(
                    oldPassword,
                    user.get().userPassword,
                    (e, isMatch) => {
                        if (e) {
                            return reject(e);
                        } else if (isMatch) {
                            bcrypt.genSalt(10, (e, salt) => {
                                bcrypt.hash(newPassword, salt, (e, hash) => {
                                    if (!e) {
                                        user.userPassword = hash;
                                        user.save()
                                            .then(() => {
                                                return resolve();
                                            })
                                            .catch((e) => {
                                                return reject(e);
                                            });
                                    } else {
                                        return reject(e);
                                    }
                                });
                            });
                        } else {
                            return reject({
                                custom: true,
                                message: "Old password invalid.",
                            });
                        }
                    }
                );
            })
            .catch((e) => {
                return reject(e);
            });
    });
};
