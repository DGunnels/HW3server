"using strict";
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient } = require('mongodb');

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

function database() {
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://Admin:" + process.env.dbpass + "@webapi2020cuden-65lgl.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("test").collection("devices");
        // perform actions on the collection object
        client.close();
    });

}

function getJSONObject(req) {
    var json = {
        headers: "No Headers",
        key: process.env.UNIQUE_KEY,
        body: "No Body"
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
    }
    );

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

router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, msg: 'Please pass username and password.' });
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };
        // save the user
        db.save(newUser); //no duplicate checking
        res.json({ success: true, msg: 'Successful created new user.' });
    }
});

router.post('/signin', function (req, res) {

    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    }
    else {
        // check if password matches
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.UNIQUE_KEY);
            res.json({ success: true, token: 'JWT ' + token });
        }
        else {
            res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
        }
    };
});

router.route('/movies')
    .get(function (req, res) {
        var queryToken;
        if (Object.keys(req.query).length == 0) {
            queryToken = 'No Query Parameters'
        } else {
            queryToken = req.query;
        };
        var headerToken;
        if (Object.keys(req.headers).length == 0) {
            headertoken = 'No Headers'
        } else {
            headerToken = req.headers;
        };
        res.json({
            status: 200,
            message: 'GET movies',
            headers: headerToken,
            query: queryToken,
            env: process.env.UNIQUE_KEY
        })
    })
    .put(authJwtController.isAuthenticated, function (req, res) {

        var queryToken;

        if (Object.keys(req.query).length == 0) {
            queryToken = 'No Query Parameters'
        } else {
            queryToken = req.query;
        };

        var headerToken;

        if (Object.keys(req.headers).length == 0) {
            headertoken = 'No Headers'
        } else {
            headerToken = req.headers;
        };

        if (!req.body.movID) {
            res.json({ sucess: false, message: 'Cannot process, please include id of movie' })
        } else {
            var movieToUpdate = {}
            if (req.body.name) {
                movieToUpdate.name = req.body.name
            }
            if (req.body.actor) {
                movieToUpdate.actor = req.body.actor
            }
            db.update(req.body.movID, movieToUpdate);

            res.json({
                status: 200,
                message: 'Movie updated',
                headers: headerToken,
                query: queryToken,
                env: process.env.UNIQUE_KEY
            })
        }
    })
    .post(function (req, res) {
        var queryToken;

        if (Object.keys(req.query).length == 0) {
            queryToken = 'No Query Parameters'
        } else {
            queryToken = req.query;
        };

        var headerToken;

        if (Object.keys(req.headers).length == 0) {
            headertoken = 'No Headers'
        } else {
            headerToken = req.headers;
        };


        if (!req.body.movID || !req.body.name || !req.body.actor) {
            res.json({ sucess: false, message: 'Please enter a valid id, name, and actor/actress' })
        } else {
            var newMovie = {
                movID: req.body.movID,
                name: req.body.name,
                actor: req.body.actor
            }
            db.save(newMovie); // Don't check for dupes

            res.json({
                status: 200,
                message: 'Movie saved',
                headers: headerToken,
                query: queryToken,
                env: process.env.UNIQUE_KEY
            })
        }


    })
    .delete(authController.isAuthenticated, function (req, res) {
        var queryToken;

        if (Object.keys(req.query).length == 0) {
            queryToken = 'No Query Parameters'
        } else {
            queryToken = req.query;
        };

        var headerToken;

        if (Object.keys(req.headers).length == 0) {
            headertoken = 'No Headers'
        } else {
            headerToken = req.headers;
        };

        if (!req.body.movID) {
            res.json({ sucess: false, message: 'Cannot process, please include id of movie' })
        } else {
            db.remove(req.body.movID);

            res.json({
                status: 200,
                message: 'Movie deleted',
                headers: headerToken,
                query: queryToken,
                env: process.env.UNIQUE_KEY
            })
        }

    })
    .all(function (req, res) {
        res.status(405);
        res.send('Error: 405 \n Unsupported HTTP Method');
    });


app.use('/', router);
app.listen(process.env.PORT || 8080);

module.exports = app; // for testing