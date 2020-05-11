
const express               = require("express"),
      app                   = express(),
      bodyParser            = require("body-parser"),
      mongoose              = require("mongoose"),
      flash                 = require("connect-flash"),
      passport              = require("passport"),
      LocalStrategy         = require("passport-local"),
      methodOverride        = require("method-override"),
      passportLocalMongoose = require("passport-local-mongoose"),
      Campground            = require("./models/campground"),
      Comment               = require("./models/comment"),
      User                  = require("./models/user"),
      seedDB                = require("./seeds");
      var moment            = require('moment');
      require('dotenv').config();
//=======================
//REQUIRING ROUTES
//=======================

const commentRoutes         = require("./routes/comments"),
      campgroundsRoutes     = require("./routes/campgrounds"),
      indexRoutes           = require("./routes/index");

let url =  process.env.DATABASEURL || "mongodb://localhost/yelpcamp_v12";
mongoose.connect(url, 
{   useNewUrlParser: true,
    useUnifiedTopology: true ,
    useFindAndModify : false ,
    useCreateIndex: true
}).then(() => {
    console.log("db connected");
}).catch(err =>{
    console.log("error",err.message);
});


app.use(express.static(__dirname+ "/public"));

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');

//
//seedDB();

//=======================
//PASSPORT CONFIGURATION
//=======================

app.use(require("express-session")({
    secret              : "im good guy",
    resave              : false,
    saveUninitialized     : false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error     = req.flash("error");
    res.locals.success    = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/campgrounds",campgroundsRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

moment.fn.fromNowOrNow = function (a) {
    if (Math.abs(moment().diff(this)) < 1000) { // 1000 milliseconds
        return 'just now';
    }
    return this.fromNow(a);
}

//=======================
//SERVER
//=======================

app.listen(process.env.PORT , process.env.IP,function(){
    console.log("YelpCamp Server Started");
});
