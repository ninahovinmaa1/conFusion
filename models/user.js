const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose'); 

const User = new Schema({
    /* the username and password are automatically added by passportLocalMongoose
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },*/
    admin: {
        type: Boolean,
        default: false
    }
})

User.plugin(passportLocalMongoose); //adds support for username and hashed storage + salting of pw
module.exports = mongoose.model('User', User);