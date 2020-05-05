//ALL THE MIDDLEWARE GOES HERE
const middlewareObj = {}; 
const Campground     = require("../models/campground");
const Comment        = require("../models/comment");
const User                  = require("../models/user");

middlewareObj.checkCampgroundOwnership = function(req,res,next){
     if(req.isAuthenticated()){
         Campground.findById(req.params.id,function(err,foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground Not Found");
            res.redirect("back");
        }
        else{
            
                
            // does user owns the campground?
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
               req.campground = foundCampground;
               next();
            }
            else{
                req.flash("error", "You Dont Have Permission To Do That");
                 res.redirect("/campgrounds/" + req.params.id);
            }
           
        }
    });
    } else{
         req.flash("error", "You need to be logged in to do that");
         res.redirect("/login");
    }
   
}
    
middlewareObj.checkCommentOwnership = function (req,res,next){
     if(req.isAuthenticated()){
         Comment.findById(req.params.comment_id,function(err,foundComment){
        if(err || !foundComment){
            req.flash('error', 'Sorry, that comment does not exist!');
            res.redirect("back");
        }
        else{
            // does user owns the comment?
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                req.comment = foundComment;
               next();
            }
            else{
                req.flash("error", "You Dont Have Access To Do It");
                 res.redirect("back");
            }
           
        }
    });
    } else{
        req.flash("error", "Please Login First");
         res.redirect("/login");
    }
   
}
    
    
    middlewareObj.checkUserOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        User.findById(req.params.id, function(err, foundUser){
          if(err || !foundUser){
            req.flash("error", err.message);
            res.redirect("back");
          }else {
            if(foundUser._id.equals(req.user._id) || req.user.isAdmin ){
              next();
            } else {
              req.flash("error", "You don't have permission to do that!");
              res.redirect("/users/" + foundUser._id);
              }
            }
          });
        }
    else {
      req.flash("error", "You need to be logged in to do this!");
      res.redirect("/campgrounds");
    }
}
    
    

//=======================
//logout middleware
//=======================

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
     return next();   
    }
    res.redirect("/login");
}


//=======================
//logout middleware
//=======================


middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
     return next();   
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

middlewareObj.checkAdminOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        User.findById(req.params.id, function(err, foundUser){
          if(err || !foundUser){
            req.flash("error", "What Happen?");
            res.redirect("back");
          }else {
            if(foundUser.isAdmin){
              next();
            } else {
              req.flash("error", "You don't have permission to do that!");
              res.redirect("/campgrounds");
              }
            }
          });
        }
    else {
      req.flash("error", "You need to logIn first!");
      res.redirect("/campgrounds");
    }
}



module.exports = middlewareObj;