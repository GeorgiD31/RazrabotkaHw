const mysql = require('mysql');

module.exports = async function (context, myTimer) {
    if (myTimer.isPastDue) {
        context.log('Timer function is running late!');
    }

    context.log('Calculating average ratings...');

    const connection = mysql.createConnection({
        host: process.env.MySqlHost,
        user: process.env.MySqlUser,
        password: process.env.MySqlPassword,
        database: process.env.MySqlDatabase
    });

    connection.connect();

    // Query to calculate average ratings
    const query = `
        UPDATE Movies m
        JOIN (
            SELECT Title, AVG(rating) AS AverageRating
            FROM Ratings
            GROUP BY Title
        ) AS r ON m.Title = r.Title
        SET m.AverageRating = r.AverageRating
    `;

    connection.query(query, (error, results, fields) => {
        if (error) {
            context.log.error(error);
        } else {
            context.log('Average ratings calculated successfully.');
        }
        connection.end();
        context.done();
    });
};
