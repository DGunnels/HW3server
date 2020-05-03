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
try {
    mongoose.Promise = global.Promise;
}
catch (err) {
    console.error(err);
};



mongoose.connect(process.env.DB, connectOptions, function (error) {
    if (error) return next(error);
});
mongoose.set('useCreateIndex', true);

var reviewerSchema = Schema({
    MovieTitle:{type: String, required: true},
    ReviewerName: {type:String,required: true},
    smallQuote: {type: String, required: true},
    rating:{type:Number, max:5, min:1, required: true}
});


reviewerSchema.pre('save',function (next) {
    if(this.length == 0){
        return next(new Error('Only one Reviewer allowed'));
    }
    next()
});

module.exports = mongoose.model('Review', reviewerSchema);