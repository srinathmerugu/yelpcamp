const mongoose              = require("mongoose"), 
      passportLocalMongoose = require("passport-local-mongoose");

let UserSchema = new mongoose.Schema({
    local:{
    username : {type : String, unique: true, required: true},
    password : String,
    avatar    : String,
    image:String,
    imageId: String,
    firstName : String,
    lastName  : String,
    email     : {type : String, unique: true, required: true},
    intro     : String,
    resetPasswordToken :String,
    resetPasswordExpires :Date,
    isAdmin  : {type:Boolean,default : false}
    },
      facebook         : {
        id           : String,
        token        : String,
        email        : String,
        username     : String
    }
});

var options = {
 errorMessages: {
  IncorrectPasswordError: 'Password is incorrect',
  IncorrectUsernameError: 'Username is incorrect'
 }
};


UserSchema.plugin(passportLocalMongoose,options);
module.exports = mongoose.model("User",UserSchema);