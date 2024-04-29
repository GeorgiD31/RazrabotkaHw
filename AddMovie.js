const mysql = require('mysql');

module.exports = async function (context, req) {
    context.log('Adding a movie...');

    const data = req.body;
    const { title, year, genre, description, director, actors } = data;

    if (!title || !year || !genre || !description || !director || !actors) {
        context.res = {
            status: 400,
            body: "Please provide all movie details."
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

    const movie = {
        title,
        year,
        genre,
        description,
        director,
        actors
    };

    connection.query('INSERT INTO Movies SET ?', movie, (error, results, fields) => {
        if (error) {
            context.log.error(error);
            context.res = {
                status: 500,
                body: "An error occurred while adding the movie."
            };
        } else {
            context.res = {
                status: 200,
                body: `Movie ${title} added successfully.`
            };
        }
        connection.end();
        context.done();
    });
};
