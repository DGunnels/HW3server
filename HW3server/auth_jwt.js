// Load required packages
var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

/*
var dotenv = require('dotenv');
dotenv.config();
*/

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
opts.secretOrKey = process.env.SECRET_KEY;

// console.debug('Here' + opts.secretOrKey);
passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    var user = db.find(jwt_payload.id);

    if (user) {
        done(null, user);
    } else {
        done(null, false);
    }
}));

exports.isAuthenticated = passport.authenticate('jwt', { session: false });
exports.secret = opts.secretOrKey;