module.exports = (data) => {
    var dateHead = "";
    var dateBlock = "";
    var sNoBlock = "";
    var options = "";
    if (data.bookingsArray.length == 1) {
        dateBlock = `
        <div class="col">
            <div class="inCard">
                <strong>Booking Date: </strong> ${data.bookingsArray[0].bookingDate}
            </div>
        </div>
        `;
        data.bookingsArray.forEach((el, i) => {
            options += `
            <tr>
                <td>${el.bAcSeats}</td>
                <td>${el.aAcSeats}</td>
                <td>${el.bGeneralSeats}</td>
                <td>${el.aGeneralSeats}</td>
            </tr>
            `;
        });
    } else {
        dateHead = "<th>Date (YYYY-MM-DD)</th>";
        sNoBlock = "<th>S No.</th>";
        data.bookingsArray.forEach((el, i) => {
            options += `
            <tr>
                <td>${i + 1}</td>
                <td>${el.bookingDate}</td>
                <td>${el.bAcSeats}</td>
                <td>${el.aAcSeats}</td>
                <td>${el.bGeneralSeats}</td>
                <td>${el.aGeneralSeats}</td>
            </tr>
            `;
        });
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link
                href="https://fonts.googleapis.comcss2?family=Poppins:wght@300;40&display=swap"
                rel="stylesheet"
            />
            <style type="text/css">
                html {
                    zoom: 0.6;
                }
    
                body {
                    font-family: "Poppins", sans-serif;
                }
    
                .page-wrapper {
                    background: #e5e5e5;
                }
    
                .section__content {
                    padding: 2.5rem;
                }
    
                .card {
                    background: white;
                    text-align: center;
                    border-radius: 10px;
                    padding: 1rem;
                    margin-bottom: 2rem;
                }
    
                .inCard {
                    background: #e5e5e5;
                    padding: 1rem;
                    text-align: left;
                    border-radius: 10px;
                    margin: 1rem;
                }
    
                .copyright {
                    text-align: center;
                }
    
                .row {
                    display: table;
                    direction: ltr;
                    width: 100%;
                }
    
                .col {
                    display: inline-block;
                    width: 50%;
                }
    
                .table table {
                    width: 100%;
                }
    
                .table-data3 thead {
                    background: #333;
                }
    
                .table-data3 thead tr th {
                    color: #fff;
                    padding: 1rem 0rem;
                }
    
                .table-data3 tbody {
                    background: #fff;
                }
    
                .table-data3 td {
                    color: #808080;
                    padding: 1rem 0rem;
                    text-align: center;
                }
            </style>
            <title>PDF</title>
        </head>
        <body>
            <div class="page-wrapper">
                <div class="section__content">
                    <div class="card">
                        <img
                            src="http://localhost:3000/images/icon/logo.png"
                            alt="John Doe"
                            height="150"
                            width="500"
                        />
                        <h1>Booking Detail</h1>
                    </div>
                    <div class="card">
                        <div class="row">
                            <div class="col">
                                <div class="inCard">
                                    <strong>Train Name: </strong> ${data.data.trainName}
                                </div>
                            </div>
                            <div class="col">
                                <div class="inCard">
                                    <strong>Route Name: </strong> ${data.data.routeName}
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="inCard">
                                    <strong>Schedule Name: </strong> ${data.data.scheduleName}
                                </div>
                            </div>
                            ${dateBlock}
                        </div>
                    </div>
                    <div class="table">
                        <table cellspacing="0" class="table-data3">
                            <thead>
                                <tr>
                                    ${sNoBlock}
                                    ${dateHead}
                                    <th>Booked AC Seats</th>
                                    <th>Available AC Seats</th>
                                    <th>Booked General Seats</th>
                                    <th>Available General Seats</th>
                                </tr>
                            </thead>
                            <tbody>${options}</tbody>
                        </table>
                    </div>
                    <div class="copyright">
                        <p>Copyright © 2020 Nehal Parsekar. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
    </html>    
    `;
};
