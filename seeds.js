let mongoose =require("mongoose");
let Campground = require("./models/campground");
let Comment = require("./models/comment");
let data = [
    {
        name:"clouds rest" ,
        image:"https://image.shutterstock.com/image-photo/camping-woods-shenandoah-mountain-bonfire-260nw-1106316416.jpg"
        ,description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    
    {
        name:"clouds rest 2" ,
        image:"https://www.dukenepal.com/wp-content/uploads/2019/11/nature-landscape-mountain-mountains.jpg",
        description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    
     {
        name:"clouds rest 3" ,
        image:"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
        description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    
    {
        name:"camp 4",
        image:"https://koa.com/blog/images/solo-camping-tips.jpg?preset=blogPhoto",
        description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
        
    }
    
    ];

function seedDB(){
    //Remove ALL Campgrounds
    Campground.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed");
    //adding camps
    data.forEach(function(seed){
        Campground.create(seed, function(err,campground){
            if(err){
            console.log(err);
            }
             else{
                console.log("added");
                //comments
                    Comment.create(
                    {
                        text : "good place",
                        author : "homer"
            
                    }, function(err,comment){
                        if(err){
                            console.log(err);
                        }
                        else{
                            campground.comments.push(comment);
                            campground.save();
                            console.log("CREATED NEW CMNT");
                        }
                });
            }
        }); 
    });
});


    
}
module.exports = seedDB;