const express               = require("express");
const router                = express.Router({mergeParams: true});
const Comment               = require("../models/comment");
const Campground            = require("../models/campground");
const middleware            = require("../middleware");


//=======================
// COMMENTS ROUTES
//=======================

//=======================
//NEW COMMENTS
//=======================


router.get("/new",middleware.isLoggedIn,function(req, res) {
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }
        else{
          res.render("comments/new", {campground:campground}); 
        }
    });
   
});

//=======================
//CREATE NEW COMMENTS
//=======================

router.post("/",middleware.isLoggedIn,function(req,res){
   Campground.findById(req.params.id,function(err,campground){ 
       if(err){
            req.flash("error", "Something Went Wrong");
            console.log(err);
             res.redirect("/campgrounds");
        }
        else{
           Comment.create(req.body.comment,function(err,comment){
              if(err){
            console.log(err);
              }
              else{
                  //add username and id to comment
                 comment.author.id =req.user._id;
                 comment.author.username =req.user.username;
                 //save comment
                 comment.save();
                  campground.comments.push(comment);
                  campground.save();
                  req.flash("success", "Comment Added Successfully");
                  res.redirect("/campgrounds/"+campground._id);
              }
           });
        }
   });
});

//=======================
//COMMENT EDIT ROUTE
//=======================

router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground) {
         if(err || !foundCampground){
            req.flash("error","Campground Not Found");
            res.redirect("back");
    }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error","Comment Not Found");
                res.redirect("back");
            }
            else{
                res.render("comments/edit",{campground_id :req.params.id , comment:req.comment }); 
            }
        });
    });
});

//=================
//COMMENT UPDATE
//=================

router.put("/:comment_id",middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err, updatedComment){
        if(err){
            res.redirect("back");
        }
        else{
            res.redirect("/campgrounds/" +req.params.id);
        }
    });
});


//=======================
//COMMENT DESTROY
//=======================

router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("success","Comment Deleted");
             res.redirect("/campgrounds/" +req.params.id);
        }
    });
});






module.exports = router;