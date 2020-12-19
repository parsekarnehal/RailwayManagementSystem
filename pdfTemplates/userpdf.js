module.exports = (array) => {
    var options = "";
    array.forEach((el, i) => {
        options +=
            "<tr><td>" +
            (i + 1) +
            "</td><td>" +
            el.userName +
            "</td><td>" +
            el.userAddress +
            "</td><td>" +
            el.userYear +
            "</td><td>" +
            el.userGender +
            "</td><td>" +
            el.userContact +
            "</td><td>" +
            el.userEmail +
            "</td></tr>";
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
                    zoom: 0.6;
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
                                <h1>Users Data</h1>
                            </div>
                        </div>
                        <div class="col">
                            <div class="table">
                                <table cellspacing="0" class="table-data3">
                                    <thead>
                                        <tr>
                                            <th>S No.</th>
                                            <th>Name</th>
                                            <th>Address</th>
                                            <th>Age</th>
                                            <th>Gender</th>
                                            <th>Contact</th>
                                            <th>Email</th>
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
