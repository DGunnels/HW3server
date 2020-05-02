"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
const saltRound = 10;
const connectOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: process.env.dbUser,
    pass: process.env.dbPass,
    dbName: 'HW3'
}

try {
    mongoose.Promise = global.Promise;
}
catch (err) {
    console.error(err);
};

mongoose.connect(process.env.DB, connectOptions, function (error) {
    if (error) return next(error);
});

// user schema
var UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true, select: true }
});

// hash the password before the user is saved
UserSchema.pre('save', function (next) {
    var user = this;

    // hash the password only if the password has been changed or user is new
    if (!user.isModified('password')) return next();

    // say hi to the salt
    bcrypt.genSalt(saltRound, function (err, salt) {
        if (err) return next(err);

        // hashtime with salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            //override clear text with hash
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (passwordEntered, callback) {
    bcrypt.compare(passwordEntered, this.password, function (err, isMatch) {
        if (err) return callback(err);
        callback(isMatch);
    });
};


// return the model
module.exports = mongoose.model('User', UserSchema);