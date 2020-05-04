var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./movies');
var Review = require('./Reviews');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var app = express();

module.exports = app; // for testing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(cors());
var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            console.log("Content-Type: " + req.get('Content-Type'));
            res = res.type(req.get('Content-Type'));
        }
        res.send(req.body);
    }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function (err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });
router.route('/movie/:movieId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieId;
        Movie.findById(id, function (err, movie) {
            if (err) res.send(err);

            var movieJson = JSON.stringify(movie);
            // return that user
            res.json(movie);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });
router.route('/movie')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movies) {
            if (err) res.send(err);
            // return the movies
            res.json(movies);
        });
    });

router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, message: 'Please pass username and password.' });
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function (err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. ' });
                else
                    return res.send(err);
            }

            res.json({ success: true, message: 'User created!' });
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function (err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function (isMatch) {
            if (isMatch) {
                var userToken = { id: user._id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({ success: true, token: 'JWT ' + token , usernameToken: userToken.username });
            }
            else {
                res.status(401).send({ success: false, message: 'Authentication failed.' });
            }
        });


    });
});

router.route('/movie')
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.Title || !req.body.Genre || !req.body.Year || !req.body.Actors && req.body.Actors.length) {
            res.json({ success: false, msg: 'Please include the movie Title, Year, Genre, and an array of at least three Actors or Actresses with Name and Character for each.' });
        }
        else {
            if (req.body.Actors.length < 3) {
                res.json({ success: false, message: 'Please include at least Three Actors/Actresses.' });
            }
            else {
                var movie = new Movie(req, res);
                movie.Title = req.body.Title;
                movie.Year = req.body.Year;
                movie.Genre = req.body.Genre;
                movie.Actors = req.body.Actors;

                movie.save(function (err) {
                    if (err) {
                        if (err.code == 11000)
                            // Not actually checked, duplicates are fine. Movies have similar/identical titles.
                            return res.json({ success: false, message: 'A Movie with that Title already exists!' });
                        else
                            return res.send(err);
                    }

                    res.json({ message: 'Movie Successfully created.' });
                });
            }
        }
    })

    .put(authJwtController.isAuthenticated, function (req, res) {
        var id = req.headers.id;
        Movie.findOne({ _id: id },
            function (err, movie) {
                if (err) res.send(err);
                if (movie == null) return res.send("NaN NaN NaN NaN NaN watman. Movie is nonexistent.");

                movie.Title = req.body.Title;
                movie.Year = req.body.Year;
                movie.Genre = req.body.Genre;
                movie.Actors = req.body.Actors;

                movie.save(function (err) {
                    if (err) {
                        if (err.code == 11000)
                            //checks for duplicate title if this wasn't a put
                            return res.json({ success: false, message: 'That movie already exists.' });
                        else
                            return res.send(err);
                    }

                    res.json({ message: 'The movie was updated.' });
                });
            });
    })

    .get(authJwtController.isAuthenticated, function (req, res) {
        if (true) {
            Movie.find({}, function (err, movies) {
                if (err) { res.send(err); }
                res.json({ Movie: movies });
            })
        }
    })

    .delete(authJwtController.isAuthenticated, function (req, res) {
        var id = req.headers.id;
        Movie.findOneAndRemove({
            _id: id
        }, function (err, movies) {
            if (err) return res.send(err);
            if (movies == null) return res.send("Movie does not exist.");

            res.json({ message: "Sucessfully deleted the movie." });
        });
    })
    .all(function (req, res) {
        res.status(405);
        res.send('Error: 405 \n Unsupported HTTP Method');
    });

router.route('/reviews/:title')
    .get(authJwtController.isAuthenticated, function (req, res) {
        if (req.query.reviews === 'true') {
            var title = req.params.title;
            Movie.aggregate([
                {
                    $match: {
                        Title: title
                    }
                },
                {
                    $lookup:
                    {
                        from: 'reviews',
                        localField: 'Title',
                        foreignField: 'MovieTitle',
                        as: 'Reviews'
                    }
                }
            ]).exec((err, movie) => {
                if (err) res.json({ message: 'Failed to get the review.' });
                res.json(movie);
            });
        }
        else {
            res.json({ message: 'Please ensure your reviews parameter is true.' });
        }

        Movie.findOne({ Title: req.params.title }).exec(function (err, movieA) {
            console.trace(err.stack);
            if (err) return res.send(err);
            if (movieA !== null) {
                res.json(movieA);
            }
            else {
                
                res.json({ message: 'The movie could not be found.' });
                return;
            } 
        });
    });


router.route('/reviews')
    .post(authJwtController.isAuthenticated, function (req, res) {
        Movie.findOne({ Title: req.body.MovieTitle }).exec(function (err, movie) {
            if (err) res.send(err);
            //If the movie exists, add new reviews
            if (movie !== null) {
                var newReview = new Review();
                newReview.MovieTitle = req.body.MovieTitle;
                newReview.ReviewerName = req.body.ReviewerName;
                newReview.smallQuote = req.body.smallQuote;
                newReview.rating = req.body.rating;
                
                newReview.save(function (err) {
                    if (err) {
                        return res.send({ success: false, message: "Review was not posted." });
                    }
                    res.json({ message: 'Review posted.' });
                });
            }
            else {
                res.json({ message: 'Movie does not exist in the database.' });
            }
        });
    })
    .get(authJwtController.isAuthenticated, function (req, res) {
        if (req.query.reviews === 'true') {
            Movie.aggregate([
                {
                    $lookup:
                    {
                        from: 'reviews',
                        localField: 'Title',
                        foreignField: 'MovieTitle',
                        as: 'Reviews'
                    }
                }
            ]).exec((err, movie) => {
                if (err) res.json({
                    message: 'Failed to get the review.'
                });
                res.json(movie);
            });

        }
        else {
            res.json({ message: 'Please ensure your reviews parameter is true.' });
        }
    });



app.use('/', router);
app.listen(process.env.PORT || 8080);
