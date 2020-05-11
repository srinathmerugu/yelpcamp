const express               = require("express");
const router                = express.Router();
const Campground            = require("../models/campground");
const middleware            = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 



const multer = require('multer');
let storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
let imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
let upload = multer({ storage: storage, fileFilter: imageFilter})

let cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'srinathmerugu', 
  api_key:process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_SECRET_KEY,
  
  
});

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey:process.env.MAP_API,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);



//=======================
//INDEX - show all campgrounds
//=======================

router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({$or: [{name: regex}, {location: regex}, {"author.username":regex}]}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                  noMatch = "No campgrounds match that search, please try again.";
              }
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    }
});



//=======================
//CREATE - add new campground to db
//=======================

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    
    geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
   req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
   // let map = {location: location, lat: lat, lng: lng};
    
    
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imageId = result.public_id;
      console.log( result.public_id);
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      
        
      
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
         req.flash("success","Campground Added Successfully");
        res.redirect('/campgrounds/' + campground.id);
       
      });
    });
});
});

//=======================
//NEW -show form to create new campground
//=======================

router.get("/new",middleware.isLoggedIn,function(req,res){
  
    res.render("campgrounds/new");
});

//=======================
//SHOW more info about campground
//=======================

router.get("/:id",function(req,res){
     Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
         if(err || !foundCampground){
            console.log(err);
            req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
        }
        else{
            
            res.render("campgrounds/show",{campground: foundCampground});
        }         
     });
});

//=======================
//EDIT CAMPGROUND
//=======================


router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
    Campground.findById(req.params.id,function(err,foundCampground){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/edit",{campground:req.campground});
        }
  });
});




//=======================
//UPDATE CAMPGROUND
//=======================

router.put("/:id",middleware.checkCampgroundOwnership,upload.single('image'),middleware.isLoggedIn,function(req,res){
     
     geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    
    var lat = req.body.lat = data[0].latitude;
     var lng= req.body.lng = data[0].longitude;
     var loc= req.body.location = data[0].formattedAddress;
      
   Campground.findById(req.params.id,req.body.campground, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.price   = req.body.price;
            campground.lat = lat;
            campground.lng = lng;
            campground.loc = loc;
            campground.location=req.body.location;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});
});

//=======================
//DESTROY CAMPGROUND ROUTE
//=======================

router.delete("/:id",middleware.checkCampgroundOwnership,middleware.isLoggedIn,function(req,res){
   /* Campground.findByIdAndRemove(req.params.id,function(err){
       if(err){
           res.redirect("/campgrounds");
       } 
       else{
           res.redirect("/campgrounds");
       }
    });*/
    Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;
