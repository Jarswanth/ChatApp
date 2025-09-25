const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodoverride=require("method-override");
const ExpressError=require("./ExpressError.js");
require("dotenv").config();







let allChats=[
    {
        from:"mohit",
        to:"rohith",
        msg:"send me notes",
        created_at:new Date(),

    },
    {
        from:"suresh",
        to:"ramesh",
        msg:"come to clg",
        created_at:new Date(),

    },
    {
        from:"Rohini",
        to:"Keerthi",
        msg:"where r u",
        created_at:new Date(),
        


    },
    {
        from:"vishal",
        to:"rakshit",
        msg:"happy birthday",
        created_at:new Date(),

    },
];


const port = process.env.PORT || 8080;

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodoverride("_method"));

main()
    .then(()=>{
        console.log("connection successful");
    })
    .catch((err)=>{
        console.log(err);
    });


app.get("/",(req,res)=>{
    res.redirect("/chats");
})

async function main(){
    await mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, 
    });
};



app.listen(port,()=>{
    console.log(`listening on port ${port}`);
});


const Chat=require("./models/chat.js");

function asyncWrap(fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=>next(err));
    };
};



//Index Route
app.get("/chats",asyncWrap(async (req,res,next)=>{
    
        let chats= await Chat.find();
        res.render("index.ejs",{chats});

    
    
    
}));

app.get("/chats/new", (req,res)=>{
    res.render("form.ejs");
});

app.post("/chats",asyncWrap(async (req,res,next)=>{
    
        let {from,to,msg}=req.body;

        console.log("Form submission:", req.body);

        if (!from || !to || !msg) {
        throw new ExpressError(400, "Missing required fields");
    }

        let newChat=new Chat({
            from:from,
            to:to,
            msg:msg,
            created_at:new Date(),
        });
            await newChat.save();
            res.redirect("/chats");

    
    
    
}));

app.get("/chats/:id/edit",asyncWrap(async (req,res,next)=>{
    
        let {id}=req.params;
        let chat=await Chat.findById(id);
        // if(!chat){
        //     throw new ExpressError(404,"chat not found or deleted");
   
        // }    
        res.render("edit.ejs",{chat});

    
    
    
    


}));

app.put("/chats/:id",asyncWrap(async (req,res,next)=>{
    
        let {id}=req.params;
        let {msg:newMsg} =req.body;
        await Chat.findByIdAndUpdate(id,{msg:newMsg},{runValidators:true});
        res.redirect("/chats");

    
    
    
    
    
}));

app.delete("/chats/:id",asyncWrap(async (req,res,next)=>{
    
        let {id} =req.params;
        await Chat.findByIdAndDelete(id);
        res.redirect("/chats");

    
    
    
}));

const handleValidationErr=(err)=>{
    console.log("Validation occured occured");
    return err;
}

app.use((err,req,res,next)=>{
    console.log(err.name);
    if(err.name === "ValidationError"){
        err=handleValidationErr(err);
        console.log(err.message);
        
    }
    next(err);
});


app.use((err,req,res,next)=>{
    let {status=500,message="some error occured"}=err;
    res.status(status).send(message);
});


