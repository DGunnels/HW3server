"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise 


mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB, { userNewUrlParser: true });
mongoose.set('useCreateIndex', true);

var MovieSchema = new Schema({
    "Title": { type: String, required: true },
    "Year Released": { type: Number, required: true },
    "Genre": { type: String, required: true },
    "ActorNameA": { type: String, required: true },
    "ActorCharA": { type: String, required: true },
    "ActorNameB": { type: String, required: true },
    "ActorCharB": { type: String, required: true },
    "ActorNameC": { type: String, required: true },
    "ActorCharC": { type: String, required: true }
});

module.exports = mongoose.model('Movie', MovieSchema);