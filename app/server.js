"use strict";
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var mongoose = require('mongoose'),
    User = require('./Users');
var Movie = require('./Movies');
var jwt = require('jsonwebtoken');
const cors = require('cors');
/*
var dotenv = require('dotenv');
dotenv.config();
*/

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObject(req) {
    var json = {
        status: status,
        headers: "No Headers",
        key: process.env.SECRET_KEY,
        body: "No Body",
        message: message
    };

    if (req.body != null) {
        json.body = req.body;
    }
    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.route('/')
    .all(function (req, res) {
        res.status(405);
        res.send('Error: 405 \n Unsupported HTTP Method');
    });


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

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.route('/post')
    .post(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            console.log("Content-Type: " + req.get('Content-Type'));
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObject(req);
        res.json(o);
    });

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            console.log("Content-Type: " + req.get('Content-Type'));
            res = res.type(req.get('Content-Type'));
        }
        res.send(req.body);
    });

router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, msg: 'Please pass username and password.' });
    } else {
        var user = new User();
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;

        // save the user
        user.save(function (err) {
            if (err) {
                // check dupes
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists!' });
                else
                    return res.send(err);
            } //no duplicate checking
            res.json({ success: true, msg: 'Successfully created new user.' });
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }, function (err, user) {
        if (err) throw err;

        user.comparePassword(userNew.password, function (isMatch) {
            if (isMatch) {
                var userToken = { id: user._id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({ success: true, token: 'JWT ' + token });
            } else {
                res.status(401).send({ success: false, message: 'Authentication Failed.' });
            }
        });
    });
});

//res.send(Object.getOwnPropertyNames(user.comparePassword));
//res.send(typeof (user.comparePassword));
//res.send(user.username);
//res.send(user.comparePassword(userNew.password));
//user.comparePassword(userNew.password, function (err, isMatch) {
//    if (err) throw err;
//    console.log(user.password, isMatch); // Determine if true
//});



router.route('/movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movies) {
            if (err) res.send(err);
            res.json(movies);
        })
    })

    .put(authJwtController.isAuthenticated, function (req, res) {

        Movie.findById(req.body.movie_id, function (err, movie) {

            if (err) res.send(err);

            //update the movie info only if it is new
            if (req.body.movietitle) movie.Title = req.body.movietitle;
            if (req.body.releaseyear) movie.ReleaseYear = req.body.releaseyear;
            if (req.body.genre) movie.Genre = req.body.genre;
            if (req.body.actornamea) movie.ActorNameA = req.body.actornamea;
            if (req.body.actorchara) movie.ActorCharA = req.body.actorchara;
            if (req.body.actornameb) movie.ActorNameB = req.body.actornameb;
            if (req.body.actorcharb) movie.ActorCharB = req.body.actorcharb;
            if (req.body.actornamec) movie.ActorNameC = req.body.actornamec;
            if (req.body.actorcharc) movie.ActorCharC = req.body.actorcharc;

            //save the movie
            movie.save(function (err) {
                if (err) res.send(err);

                res.json({ message: 'Movie has been updated!' });
            });


        });
    })
    .post(authJwtController.isAuthenticated, function (req, res) {
        var queryToken;

        //Create a Movie
        var movie = new Movie();

        movie.Title = req.body.movietitle;
        movie.ReleaseYear = req.body.releaseyear;
        movie.Genre = req.body.genre;
        movie.ActorNameA = req.body.actornamea;
        movie.ActorCharA = req.body.actorchara;
        movie.ActorNameB = req.body.actornameb;
        movie.ActorCharB = req.body.actorcharb;
        movie.ActorNameC = req.body.actornamec;
        movie.ActorCharC = req.body.actorcharc;

        movie.save(function (err) {
            if (err) {
                //duplicate entry
                if (err.code == 11000)
                    return res.json({ sucess: false, message: 'This already exists!' });
                else
                    return res.send(err);
            }
            res.json({ message: 'Movie has been created!' });
        })
    })
    .delete(authJwtController.isAuthenticated, function (req, res) {
        Movie.remove({
            _id: req.body.movie_id
        }, function (err, movies) {
            if (err) return res.send(err);

            res.json({ message: "Sucessfully deleted the movie." });
        });
    })
    .all(function (req, res) {
        res.status(405);
        res.send('Error: 405 \n Unsupported HTTP Method');
    });


app.use('/', router);
app.listen(process.env.PORT || 8080);