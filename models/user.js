const mongoose = require("mongoose");
const passportLocal = require("passport-local-mongoose");


const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocal);

module.exports = mongoose.model("User", userSchema)