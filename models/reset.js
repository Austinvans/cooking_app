const mongoose = require("mongoose");
const passportLocal = require("passport-local-mongoose"); 

const resetSchema = new mongoose.Schema({
    username: String,
    resetPasswordToken: String,
    resetPasswordExpires: Number
});

resetSchema.plugin(passportLocal);

module.exports =  mongoose.model("Reset", resetSchema);