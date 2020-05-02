"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
try {
    mongoose.Promise = global.Promise;

} catch (err) {
    console.error(err);
}

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

var MovieSchema = new Schema({
    "Title": { type: String, required: true },
    "ReleaseYear": { type: Number, required: true },
    "Genre": { type: String, required: true },
    "ActorNameA": { type: String, required: true },
    "ActorCharA": { type: String, required: true },
    "ActorNameB": { type: String, required: true },
    "ActorCharB": { type: String, required: true },
    "ActorNameC": { type: String, required: true },
    "ActorCharC": { type: String, required: true }
});

module.exports = mongoose.model('Movie', MovieSchema);