module.exports = (array) => {
    var options = "";
    array.forEach((el, i) => {
        var cData = el.status
            ? "<td><span class='booked'>Booked</span></td>"
            : "<td><span class='cancelled'>Cancelled</span></td>";
        options +=
            "<tr><td>" +
            (i + 1) +
            "</td><td>" +
            el.userName +
            "</td><td>" +
            el.trainName +
            "</td><td>" +
            el.arrival +
            "</td><td>" +
            el.departure +
            "</td><td>" +
            el.ticketDate +
            "</td><td>" +
            el.ticketCoach +
            "</td><td>" +
            el.sStateName +
            "</td><td>" +
            el.sStationName +
            "</td><td>" +
            el.sStateName +
            "</td><td>" +
            el.dStationName +
            "</td><td>" +
            el.ticketFare +
            "</td>" +
            cData +
            "</tr>";
    });
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="preconnect" href="https://fonts.gstatic.com">
			<link href="https://fonts.googleapis.comcss2?family=Poppins:wght@300;40&display=swap" rel="stylesheet">
            <style type="text/css">
                html{
                    zoom: 0.5;
                }

                body{
            		font-family: 'Poppins', sans-serif;
            	}

            	.page-wrapper {
					background: #e5e5e5;
            	}

            	.section__content{
            		padding: 2.5rem;
            	}

            	.card{
            		background: white;
            		text-align: center;
            		border-radius: 10px;
            	}

            	.copyright{
            		text-align: center;
            	}

                h1{
                    padding-bottom: 1rem;
                }

            	.table table{
            		width: 100%;
            	}

            	.table-data3 thead {
            		background: #333;
				}

				.table-data3 thead tr th {
				  color: #fff;
				  padding: 1rem 0rem;
				}

				.table-data3 tbody{
				  	background: #fff;
				}

				.table-data3 td {
				  color: #808080;
				  padding: 1rem 0rem;
				  text-align: center;
				}

                .booked{
                    color: green;
                }

                .cancelled{
                    color: red;
                }
            </style>
            <title>PDF</title>
        </head>
        <body>
            <div class="page-wrapper">
                <div class="section__content">
                    <div class="row">
                            <div class="col iconCol">
                                <div class="card">
                                    <br/>
                                    <img src="http://localhost:3000/images/icon/logo.png"
                                        alt="John Doe"
                                        height="150"
                                        width="500"
                                    />
                                	<h1>Transaction Data</h1>
                                </div>
                            </div>
                            <div class="col">
                                <div class="table">
                                    <table cellspacing="0" class="table-data3">
                                        <thead>
                                            <tr>
                                                <th>S No.</th>
                                                <th>User Name</th>
                                                <th>Train</th>
                                                <th>Arrival</th>
                                                <th>Departure</th>
                                                <th>Date(YYYY-MM-DD)</th>
                                                <th>Coach</th>
                                                <th>Source State</th>
                                                <th>Source Station</th>
                                                <th>Destination State</th>
                                                <th>Destination Station</th>
                                                <th>Fare</th>
                                                <th>Cancel</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${options}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="col">
                                <div class="copyright">
                                    <p>
                                        Copyright © 2020 Nehal Parsekar. All rights
                                        reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </body>
    </html>
    `;
};
