const Sequelize = require("sequelize");
const sequelize = new Sequelize("railway", "root", "nehalnehal", {
    host: "localhost",
    dialect: "mysql",
    operatorsAliases: 0,
    logging: false,
    pol: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

sequelize
    .authenticate()
    .then()
    .catch((err) => console.log(err.message));

module.exports = sequelize;
