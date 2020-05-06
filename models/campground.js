let mongoose =require("mongoose"); 
//SCHEMA SETUP

let campgroundSchema =new mongoose.Schema({
    name:String,
    price:String,
    image:String,
    imageId: String,
   location: String,
   lat: Number,
   lng: Number,
    description:String,
    createdAt: { type: Date, default: Date.now },
    author :{
        id:{
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        username : String
    } ,
     comments: [
      {
         type : mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Campground", campgroundSchema);


