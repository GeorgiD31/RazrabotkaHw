const mysql = require('mysql');

module.exports = async function (context, req) {
    context.log('Adding a rating for a movie...');

    const data = req.body;
    const { title, opinion, rating, author } = data;

    if (!title || !opinion || !rating || !author) {
        context.res = {
            status: 400,
            body: "Please provide all rating details."
        };
        return;
    }

    const connection = mysql.createConnection({
        host: process.env.MySqlHost,
        user: process.env.MySqlUser,
        password: process.env.MySqlPassword,
        database: process.env.MySqlDatabase
    });

    connection.connect();

    const newRating = {
        title,
        opinion,
        rating,
        date: new Date(),
        author
    };

    connection.query('INSERT INTO Ratings SET ?', newRating, (error, results, fields) => {
        if (error) {
            context.log.error(error);
            context.res = {
                status: 500,
                body: "An error occurred while adding the rating."
            };
        } else {
            context.res = {
                status: 200,
                body: `Rating added successfully for ${title}.`
            };
        }
        connection.end();
        context.done();
    });
};
