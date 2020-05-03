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

// user schema
var UserSchema = new Schema({
    name: String,
    username: { type: String, required: true, index: { unique: true }},
    password: { type: String, required: true, select: false }
});

// hash the password before the user is saved
UserSchema.pre('save', function(next) {
    var user = this;
    console.log(user.username);
    console.log(user.password);
    // hash the password only if the password has been changed or user is new
    if (!user.isModified('password')) return next();

    // generate the hash
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err);

        // change the password to the hashed version
        user.password = hash;
        next();
    });
});



UserSchema.methods.comparePassword = function (passwordEntered, callback) {
    bcrypt.compare(passwordEntered, this.password, function (err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

// return the model
module.exports = mongoose.model('User', UserSchema);