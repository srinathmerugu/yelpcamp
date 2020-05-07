const express               = require("express");
const router                = express.Router();
const User                  = require("../models/user");
const passport              = require("passport");
const Campground            = require("../models/campground");
const async                 = require("async");
const nodemailer            = require("nodemailer");
const crypto                = require("crypto");
const middleware            = require("../middleware");
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('../models/fb');
require('dotenv').config();
//===============================================================
//ROUTES
//===============================================================

//=======================
//ROOT ROUTE
//=======================

router.get("/",function(req,res){
   res.render("landing") ;
});

router.get("/about",function(req,res){
   res.render("about") ;
});





//===================================
//AUTH ROTES
//===================================

//=======================
//REGISTER FORM
//=======================

router.get("/register",function(req,res){
    res.render("register");
});

//=======================
//HanDLE SIGNUP FORM
//=======================

router.post("/register",function(req,res){
   
  let newUser = new User(
    { username:req.body.username,
      firstName:req.body.firstName ,
      lastName :req.body.lastName,
      email : req.body.email,
      avatar : req.body.avatar
      
     });
   if (req.body.adminCode === process.env.SECRETCODE){
       newUser.isAdmin = true;
   }
    User.register(newUser, req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);
            return res.redirect('/register');
        }
        passport.authenticate("local")(req,res, function(){
            req.flash("success","Welcome " +user.username);
               res.redirect("/campgrounds"); 
            });
        
    });
    
    var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PWD
    }
});
const mailOptions = {
  from: process.env.GMAIL_ID, // sender address
  to: req.body.email, // list of receivers
  subject: 'Welcome To YelpCamp',
    text:"Hello " + req.body.username+ "," + '\n' + "Welcome To YelpCamp!" + '\n' + 
     "We really appreciate you coming in today. Have a great day :)" + '\n' +
     " YELPCAMP TEAM"
     
};

transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
        return console.log('Error occurs');
    }
    return  console.log('Email sent!!!');
});
    
});

//=======================
//SHOW LOGIN FORM
//=======================

router.get("/login",function(req,res){
    res.render("login");
});

//=======================
//HANDLING LOGIN LOGIC
//=======================

router.post("/login", function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
        if (err) { 
            req.flash("error", err.message);
            return res.redirect("/login"); 
        }
        // User is set to false if auth fails.
        if (!user) { 
            req.flash("error", info.message); 
            return res.redirect("/login"); 
        }
        // Establish a session manually with req.logIn
        req.logIn(user, function(err) {
            if (err) { 
                req.flash("error", err.message);
                res.redirect("/login");
            }
            
            // Login success! Add custom success flash message.
            req.flash("success", "Welcome back " + user.username + "!");
            res.redirect("/campgrounds");
          
        });
    })(req, res, next);
});


//=======================
//LOGOUT
//=======================

router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged Out");
    res.redirect("/campgrounds");
});

//=========================================
//PASSWORD RESET
//=========================================


router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user ||err) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.GMAIL_ID,
          pass: process.env.GMAIL_PWD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'yelpcamp.srinathmerugu@gmail.com',
        subject: 'Yelpcamp Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user || err) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user || err) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
              if(err){
                  res.redirect("back");
              }
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
                 if(err){
                  res.redirect("back");
              }
              req.logIn(user, function(err) {
                   if(err){
                  res.redirect("back");
              }
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.GMAIL_ID,
          pass: process.env.GMAIL_PWD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'yelpcamp.srinathmerugu@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
       if(err){
                  res.redirect("back");
              }
    res.redirect('/campgrounds');
  });
});


//]===================================
//FACEBOOK
//=================


router.get('/auth/facebook',
  passport.authenticate('facebook'));
 
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/register' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/campgrounds');
  });

passport.use(new FacebookStrategy({
	    clientID: configAuth.facebookAuth.clientID,
	    clientSecret: configAuth.facebookAuth.clientSecret,
	    callbackURL: configAuth.facebookAuth.callbackURL
	  },
  	  function(accessToken, refreshToken, profile, done) {
  	    	process.nextTick(function(){
  	    		User.findOne({'facebook.id': profile.id}, function(err, user){
  	    			if(err)
  	    				return done(err);
  	    			if(user)
  	    				return done(null, user);
  	    			else {
  	    				var newUser = new User();
  	    				newUser.facebook.id = profile.id;
  	    				newUser.facebook.token = accessToken;
  	    				newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
  	    				newUser.facebook.email = profile.emails[0].value;
  
  	    				newUser.save(function(err){
  	    					if(err)
  	    						throw err;
  	    					return done(null, newUser);
  	    				})
  	    				console.log(profile);
  	    			}
  	    		});
	    	});
	    }

	));


//ADMIN PROFILE


router.get("/users/:id/admin", middleware.checkAdminOwnership, function(req, res){
  Campground.find(function(err, allCampgrounds) {
    if (err) {
        req.flash("error", err.message);
        res.redirect("back");
    } else {
      User.find(function(err, allUsers){
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
          } else {
          return res.render("users/admin", {campgrounds: allCampgrounds, users: allUsers});
        }
      });
    }
    
  });
});

router.delete("/users/:id",middleware.isLoggedIn,function(req,res){
      User.findByIdAndRemove(req.params.id,function(err){
       if(err){
           res.redirect("back");
       } 
       else{
         req.flash("success", "Removed User" );
        return res.redirect("/campgrounds");
       }
    });
    
    
  
});




//USER PROFILE
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      res.render("users/show", {user: foundUser, campgrounds: campgrounds});
    })
  });
});


 


router.get("/users/:id/edit",  middleware.checkUserOwnership,function(req, res){
        User.findById(req.params.id, function(err,foundUser){
      if (err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("back");
      }
      Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds) {
        if (err) {
          req.flash("error", "Something went Wrong!");
          return res.redirect("back");
        }
        res.render("users/edit", {user: foundUser, campgrounds: campgrounds});
      })
    });
});





// update User Info
router.put("/users/:id", middleware.checkUserOwnership, function(req, res){
  User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
        if(err){
          req.flash("error", err.message);
          res.redirect("back");
        } else {
          req.flash("success", "Successfully Updated!");
          return res.redirect("/users/" + updatedUser._id);
        }
    });
});



module.exports = router;