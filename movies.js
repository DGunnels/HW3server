
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

const connectOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: process.env.DBuser,
    pass: process.env.DBpass,
    dbName: 'HW3'
}

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, connectOptions);
mongoose.set('useCreateIndex', true);

// Movie schema
var movieSchema = new Schema({
    Title: { type: String, required: true, index: { unique: true }},
    Year: { type: String },
    Genre: { type: String, required: true, enum:['Action','Adventure','Comedy','Fantasy','Horror','Mystery','Thriller','Drama','Western']},
    Actors : { type : Array,Name:{type:String},Character:{type:String} },
});


// return the model
module.exports = mongoose.model('Movie', movieSchema);
