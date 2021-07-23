module.exports = (ticket) => {
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
                    zoom: 0.74;
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
                    padding: 1rem;
                    margin-bottom: 2rem;
            	}

                .inCard{
                    background: #e5e5e5;
                    padding: 1rem;
                    text-align: left;
                    border-radius: 10px;
                    margin: 1rem;
                }

            	.copyright{
            		text-align: center;
            	}

                .row{
                    display: table;
                    direction: ltr;
                    width: 100%;
                }

                .col{
                    display: inline-block;
                    width: 50%;
                }
            </style>
            <title>PDF</title>
        </head>
        <body>
            <div class="page-wrapper">
                <div class="section__content">
                    <div class="card">
                        <img src="http://localhost:3000/images/icon/logo.png"
                            alt="John Doe"
                            height="150"
                            width="500"
                        />
                        <h1>Ticket</h1>
                    </div>
                    <div class="card">
                        <div class="row">
                            <div>
                                <div class="card-body inCard"><strong>Ticket ID: </strong> ${ticket.id}</div>
                            </div> 
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="inCard"><strong>Passenger Name: </strong> ${ticket.userName}</div> 
                            </div>
                            <div class="col">
                                <div class="inCard"><strong>Train Name: </strong> ${ticket.trainName}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="inCard"><strong>Train Arrival: </strong> ${ticket.arrival}</div>
                            </div>
                            <div class="col">
                                <div class="inCard"><strong>Train Departure: </strong> ${ticket.departure}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="inCard"><strong>Travel Date: </strong> ${ticket.ticketDate}</div>
                            </div>
                            <div class="col">
                                <div class="inCard"><strong>Train Coach: </strong> ${ticket.ticketCoach}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="inCard"><strong>Source State: </strong> ${ticket.sStateName}</div>
                            </div>
                            <div class="col">
                                <div class="inCard"><strong>Destination State: </strong> ${ticket.dStateName}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="inCard"><strong>Source Station: </strong> ${ticket.sStationName}</div>
                            </div>
                            <div class="col">
                                <div class="inCard"><strong>Destination Station: </strong> ${ticket.dStationName}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div>
                                <div class="inCard"><strong>Ticket Price: </strong> ${ticket.ticketFare}</div>
                            </div>
                        </div>
                    </div>
                    <div class="copyright">
                        <p>
                            Copyright © 2020 Nehal Parsekar. All rights
                            reserved.
                        </p>
                    </div>
                </div>
            </div>
        </body>
    </html>
    `;
};
