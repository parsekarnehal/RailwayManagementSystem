const pdf = require("html-pdf");
const path = require("path");

module.exports.flashMessages = (req) => {
    return {
        success_msg: req.flash("success_msg"),
        error_msg: req.flash("error_msg"),
        error: req.flash("error"),
    };
};

module.exports.findAllInArray = (model, nameColumn, extras, adminId) => {
    return new Promise((resolve, reject) => {
        var dataArray = [];
        var adminArray = [];
        model
            .findAll()
            .then((data) => {
                data.forEach((element) => {
                    var entry = element.dataValues;
                    if (entry.adminId == adminId) {
                        entry.canUpdate = true;
                        adminArray.push(entry);
                    } else {
                        entry.canUpdate = false;
                        if (entry.status) {
                            dataArray.push(entry);
                        }
                    }
                });

                adminArray.sort((a, b) => {
                    var nameA = a[nameColumn].toUpperCase();
                    var nameB = b[nameColumn].toUpperCase();

                    if (nameA < nameB) {
                        return -1;
                    } else if (nameA > nameB) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                dataArray.sort((a, b) => {
                    var nameA = a[nameColumn].toUpperCase();
                    var nameB = b[nameColumn].toUpperCase();

                    if (nameA < nameB) {
                        return -1;
                    } else if (nameA > nameB) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                if (dataArray.length > 0) {
                    dataArray.forEach((el) => {
                        adminArray.push(el);
                    });
                }

                var index = 1;
                adminArray.forEach((element) => {
                    element.index = index;

                    if (extras != null) {
                        extras.forEach((ex) => {
                            var model = ex.model;
                            var idColumn = ex.idColumn;
                            var nameColumn = ex.nameColumn;
                            var dataColumn = ex.dataColumn;

                            model.findByPk(element[idColumn]).then((data) => {
                                element[dataColumn] = data.get()[nameColumn];
                            });
                        });
                    }

                    index++;
                });

                resolve(adminArray);
            })
            .catch((e) => {
                reject(e);
            });
    });
};

module.exports.findOneAndCreate = (
    model,
    columnName,
    name,
    object,
    req,
    res,
    redirect,
    messages
) => {
    var query = {
        where: {},
    };
    query.where[columnName] = name;
    model
        .findOne(query)
        .then((data) => {
            if (data == null) {
                model.create(object).then(() => {
                    req.flash("success_msg", messages.success_mgs);
                    res.redirect(redirect);
                });
            } else {
                req.flash("error_msg", messages.error_msg);
                res.redirect(redirect);
            }
        })
        .catch((e) => {
            req.flash("error_msg", e.message);
            res.redirect(redirect);
        });
};

module.exports.changeStatus = (model, id) => {
    return new Promise((resolve, reject) => {
        model
            .findByPk(id)
            .then((entry) => {
                entry.status = !entry.get().status;
                entry
                    .save()
                    .then(() => {
                        resolve();
                    })
                    .catch((e) => {
                        reject(e);
                    });
            })
            .catch((e) => {
                reject(e);
            });
    });
};

module.exports.convertToPdf = (pdfTemplate, array, userId, landscape) => {
    return new Promise((resolve, reject) => {
        pdf.create(pdfTemplate(array), {
            format: "A4",
            orientation: landscape ? "landscape" : "portrait",
        }).toFile("./static/pdfs/" + userId + ".pdf", (err, result) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
};

module.exports.sendPdf = (req, res) => {
    res.sendFile(
        path.join(__dirname, "../static/pdfs/" + req.user.id + ".pdf")
    );
};
