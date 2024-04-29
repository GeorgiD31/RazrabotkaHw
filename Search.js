const mysql = require('mysql');

module.exports = async function (context, req) {
    context.log('Searching for movies...');

    const searchQuery = req.query.searchQuery || '';

    const connection = mysql.createConnection({
        host: process.env.MySqlHost,
        user: process.env.MySqlUser,
        password: process.env.MySqlPassword,
        database: process.env.MySqlDatabase
    });

    connection.connect();

    // Query to get movies and their ratings
    const query = `
        SELECT m.*, r.opinion, r.rating, r.date AS ratingDate, r.author
        FROM Movies m
        LEFT JOIN Ratings r ON m.Title = r.Title
        WHERE m.Title LIKE '%${searchQuery}%'
    `;

    connection.query(query, (error, results, fields) => {
        if (error) {
            context.log.error(error);
            context.res = {
                status: 500,
                body: "An error occurred while searching for movies."
            };
        } else {
            const moviesMap = new Map();

            results.forEach(row => {
                const title = row.Title;
                if (!moviesMap.has(title)) {
                    moviesMap.set(title, {
                        Title: title,
                        Year: row.Year,
                        Genre: row.Genre,
                        Description: row.Description,
                        Director: row.Director,
                        Actors: row.Actors,
                        AverageRating: row.AverageRating,
                        Ratings: []
                    });
                }

                if (row.opinion) {
                    const rating = {
                        Opinion: row.opinion,
                        Rating: row.rating,
                        Date: row.ratingDate,
                        Author: row.author
                    };
                    moviesMap.get(title).Ratings.push(rating);
                }
            });

            const movies = Array.from(moviesMap.values());

            context.res = {
                status: 200,
                body: movies
            };
        }
        connection.end();
        context.done();
    });
};
