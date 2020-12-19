$("#tSourceState").on("change", function () {
    $("#tSourceStation").empty();
    $(".tMessage").hide();
    $("#tSchedule").empty();
    $("#tRoute").empty();
    $("#tAc").text("AC");
    $("#tGeneral").text("General");
    $("#tDate").val("");

    var stateId = this.value;
    if (stateId != "0") {
        var url = "sourceStation/" + stateId;
        $.get(url, function (data) {
            if (data.error) {
                $(".tMessage").show();
                $(".tMessageText").text(data.message);
            } else {
                var options = "";
                data.stationsArray.forEach((el) => {
                    options +=
                        "<option value='" +
                        el.id +
                        "'>" +
                        el.stationName +
                        "</option>";
                });
                $("#tSourceStation").append(options);
            }
        });
    }
});

$("#tSourceStation").on("change", function () {
    $("#tDestinationStation").empty();
});

function getRoutes(routeId) {
    var dId = $("#tDestinationStation option:selected").val();
    var sId = $("#tSourceStation option:selected").val();
    var url = "getRoutes/" + sId + "/" + dId;
    $.get(url, function (data) {
        var { schedulesArray, routesArray } = data;
        if (routesArray.length == 0) {
            $(".tMessage").show();
            $(".tMessageText").text("No Routes available");
            $("#tSchedule").empty();
            $("#tRoute").empty();
        } else {
            var options = "";
            schedulesArray.forEach((el) => {
                options +=
                    "<option value='" +
                    el.id +
                    "'>" +
                    el.scheduleName +
                    " - " +
                    el.text +
                    "</option>";
            });
            $("#tSchedule").append(options);

            options = "";
            var fare = routesArray[0].routeFare;
            routesArray.forEach((el) => {
                if (el.id == routeId) {
                    fare = el.routeFare;
                    options +=
                        "<option value='" +
                        el.id +
                        "' selected>" +
                        el.routeName +
                        "</option>";
                } else {
                    options +=
                        "<option value='" +
                        el.id +
                        "'>" +
                        el.routeName +
                        "</option>";
                }
            });
            $("#tFare").val(fare + fare / 2);
            $("#tAc").text("AC - " + (fare + fare / 2) + " Rupees");
            $("#tGeneral").text("General - " + fare + " Rupees");
            $("#tRoute").append(options);
        }
    });
}

$("#tDestinationState").on("change", function () {
    $("#tDestinationStation").empty();
    $(".tMessage").hide();
    $("#tDate").val("");

    var stateId = this.value;
    if (stateId != "0") {
        var url = "sourceStation/" + stateId;
        $.get(url, function (data) {
            if (data.error) {
                $(".tMessage").show();
                $(".tMessageText").text(data.message);
            } else {
                var options = "";
                var sId = $("#tSourceStation option:selected").val();
                data.stationsArray.forEach((el) => {
                    if (el.id != sId) {
                        options +=
                            "<option value='" +
                            el.id +
                            "'>" +
                            el.stationName +
                            "</option>";
                    }
                });
                $("#tDestinationStation").append(options);
                if (options != "") {
                    getRoutes(null);
                }
            }
        });
    }
});

$("#tDestinationStation").on("change", function () {
    $(".tMessage").hide();
    getRoutes(null);
});

$("#tRoute").on("change", function () {
    var routeId = this.value;
    $("#tRoute").empty();
    $("#tSchedule").empty();
    getRoutes(routeId);
});

$("#tMembers").on("change", function () {
    $("#tDate").val("");
    $("#tTrain").empty();
});

$("#tDate").on("change", function () {
    var memberIds = [];
    $("#tTrain").empty();
    $("#tMembers :selected").each(function (i, el) {
        memberIds.push(el.value);
    });
    if (memberIds.length == 0) {
        $(".tMessage").show();
        $(".tMessageText").text("Select Members first.");
    } else {
        var routeId = $("#tRoute").val();
        var memberCount = memberIds.length;
        var scheduleId = $("#tSchedule").val();
        var isAc = $("#tCoach").val();
        var date = this.value;

        var url =
            "getTrains/" +
            memberCount +
            "/" +
            isAc +
            "/" +
            routeId +
            "/" +
            scheduleId +
            "/" +
            date;

        $.get(url, function (data) {
            if (data.error) {
                $(".tMessage").show();
                $(".tMessageText").text(data.message);
            } else {
                var options = "";
                var trainArray = data.data;

                trainArray.forEach((el) => {
                    options +=
                        "<option value='" +
                        el.id +
                        "'>" +
                        el.trainName +
                        "</option>";
                });

                $("#tTrain").append(options);
            }
        });
    }
});

$("#tCoach").on("change", function () {
    var fare = parseInt($("#tFare").val());
    $("#tFare").empty();
    if (this.value == "0") {
        $("#tFare").val(fare * (100 / 150));
    } else {
        $("#tFare").val(fare + fare / 2);
    }
});

$(".tCancel").on("click", function () {
    var id = this.value;
    $("#aCancel").attr("href", "/dashboard/tickets/cancel/" + id);
});

$("#minAge").on("change", function () {
    $("#maxAge").attr("min", this.value);
});

function getSchedules(routeId) {
    $("#bSchedule").empty();
    var url = "bookings/getSchedules/" + routeId;
    $.get(url, function (data) {
        if (data.error) {
            $(".tMessage").show();
            $(".tMessageText").text(data.message);
        } else {
            var scheduleArray = data.scheduleArray;
            var scheduleOptions = "";
            scheduleArray.forEach((el) => {
                scheduleOptions +=
                    "<option value='" +
                    el.id +
                    "'>" +
                    el.scheduleName +
                    "</option>";
            });
            $("#bSchedule").empty();
            $("#bSchedule").append(scheduleOptions);
        }
    });
}

$("#bTrain").on("change", function () {
    $(".alert").hide();
    var trainId = this.value;
    var url = "bookings/getRoutes/" + trainId;
    $.get(url, (data) => {
        if (data.error) {
            $(".tMessage").show();
            $(".tMessageText").text(data.message);
            $("#bRoute").empty();
        } else {
            var routeArray = data.routeArray;
            var routeOptions = "";
            routeArray.forEach((el) => {
                routeOptions +=
                    "<option value='" +
                    el.id +
                    "'>" +
                    el.routeName +
                    "</option>";
            });
            $("#bRoute").empty();
            $("#bRoute").append(routeOptions);
            getSchedules(routeArray[0].id);
        }
    });
});

$("#bRoute").on("change", function () {
    getSchedules(this.value);
});

if ($("#dashMain").length) {
    var url = "/admin/dashboard/getChartData";
    $.get(url, function (data) {
        var chartElement = document.getElementById("trainBarChart");
        new Chart(chartElement, data);
    });
}

if ($(".alert").length) {
    setTimeout(() => {
        $("#mDiv").empty();
    }, 5000);
}
