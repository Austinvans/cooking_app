const express = require("express");
const app = express();
const dotenv = require("dotenv").config();

const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
const randToken = require("rand-token");
const nodemailer = require("nodemailer");

const session = require("express-session");
const passport = require("passport");
const passportLocal = require("passport-local-mongoose");

const methodOverride = require("method-override");
const flash = require("connect-flash");


// initialiser flash et methodOverride
app.use(methodOverride('_method'));
app.use(flash());



//MODELS
const User = require("./models/user");
const Reset = require("./models/reset");
const Receipe = require("./models/receipe");
const Favorite = require("./models/favorite");
const Ingredient = require("./models/ingredient");
const Schedule = require("./models/schedule");
const ingredient = require("./models/ingredient");
const schedule = require("./models/schedule");


//INITIALIZATION SESSION
app.use(session({
    secret: "mySecret",
    resave: false,
    saveUninitialized: false
}));
//PASSPORT
app.use(passport.initialize());

app.use(passport.session());
// END INIT

// gestion des erreurs
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

mongoose.connect("mongodb+srv://yvanngk:6G2nMxFc0BBbsC8I@cluster0.pkpomb3.mongodb.net/cooking?retryWrites=true&w=majority")

//PASEPORT LOCAL MONGOOSE
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set("view engine", "ejs");

//PUBLIC FOLDER
app.use(express.static("public"));

//BODY PARSER
app.use(bodyParser.urlencoded({extended : false}));


// START FUNCTIONS

// search user
async function getOneUser(username){
    const user = await User.findOne({username : username});
    return user;
}

//Search user for reset 
async function getReset(tok){
    const reset = await Reset.findOne({
        resetPasswordToken : tok,
        resetPasswordExpires : {$gt: Date.now()}
    });
    return reset;
}

//get a receipe by user_id
async function getReceipe(id){
    const receipe = await Receipe.find({
        user : id
    });
    return receipe;
}

//create a new receipe
async function createReceipe(receipe_name, logo, id){
    const receipe = await Receipe.create({
        name: receipe_name,
        image: logo,
        user: id
    });
    return receipe;
}

// Find one receipe by user_id and receipe_id
async function getOneReceipe(user, id){
    const receipe = await Receipe.findOne({
        user: user,
        _id : id
    });
    return receipe;
}

// Find receipe by _id
async function getReceipeById(id){
    const receipe = await Receipe.findById({
        _id : id
    });
    return receipe;
}

// Delete reciepe by ID
async function delReceipe(receipe_id, user_id){
    const receipe = await Receipe.deleteOne({
        _id : receipe_id,
        user: user_id
    });
    return ingredient;
}

//create a new ingredient
async function createIngredient(name, dish, user, qty, receipe){
    const ingredient = await Ingredient.create({
        name: name,
        bestDish: dish,
        user: user,
        quantity: qty,
        receipe: receipe
    });
    return ingredient;
}

// Find one ingredients by id and receipe_id 
async function getOneIngredient(id, receipe_id){
    const ingredient = await Ingredient.findOne({
        _id : id,
        receipe : receipe_id
    });
    return ingredient;
}

// Find ingredients with user id and receipe
async function getIngredients(user_id, receipe_id){
    const ingredient = await Ingredient.find({
        user: user_id,
        receipe : receipe_id
    });
    return ingredient;
}

// edit or update one ingredient with receipe_id and ingredient_id
async function updateIngredient(ingredient_id, user_id, receipe_id, name, dish, quantity){
    const ingredient = await Ingredient.findByIdAndUpdate({
        _id: ingredient_id
    },{
        name: name,
        bestDish: dish,
        user: user_id,
        quantity: quantity,
        receipe : receipe_id
    });
    return ingredient;
}

// Delet an ingredients with receipe id and ingredient id
async function delIngredients(receipe_id, ingredient_id){
    const ingredient = await Ingredient.deleteOne({
        receipe: receipe_id,
        _id : ingredient_id
    });
    return ingredient;
}

// Get all favourites
async function getFavourites(id){
    const favorite = await Favorite.find({
        user : id
    });
    return favorite;
}

// add favourite
async function createFavourite(logo, title, description, user_id){
    const favorite = await Favorite.create({
        image: logo,
        title: title,
        description: description,
        user: user_id
    });
    return favorite;
}

// Delete a favourite by id
async function delFavorite(id){
    const favorite = await Favorite.deleteOne({
        _id : id
    });
    return favorite;
}

// Find all schedules with user id
async function getSchedules(user_id){
    const schedule = await Schedule.find({
        user: user_id
    });
    return schedule;
}

// add a Schedule
async function createSchedule(receipename, scheduleDate, user_id, time){
    const schedule = await Schedule.create({
        ReceipeName: receipename,
        scheduleDate: scheduleDate,
        user: user_id,
        time: time
    });  
    return schedule;
}

// delete a schedule
async function delSchedule(id){
    const schedule = await Schedule.deleteOne({
        _id: id
    });
    return schedule;
}

/***** END FUNCTIONS *****/

/***** START ROUTES *****/ 

app.get("/", function(req,res){
    res.render("index");
});

app.get("/signup", function(req,res){
    res.render("signup");
});

app.get("/login", function(req,res){
    res.render("login");
});

app.post("/signup", function(req,res){
    // const saltRounds = 10;
    // bcrypt.hash(req.body.password, saltRounds, function(err,hash){

    //     const user = new User({
    //         username: req.body.username,
    //         password: hash
    //     })
    
    //     user.save().then((result)=>{
    //         res.render("index");
    //     }).catch((error)=>{
    //         console.log(error);
    //     });
    // });

    const newUser = new User({
        username: req.body.username 
    });
    User.register(newUser,req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.render("signup");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("signup");
            });
        }
    });

});

app.post("/login", function(req,res){

    // ****** Using Bycrypt

    // getOneUser(req.body.username).then((result)=>{
    //     if(result){
    //         bcrypt.compare(req.body.password, result.password, function(err,resultp){

    //             if(resultp==true){
    //                 console.log("Logged in !");
    //                 res.render("index");
    //             }else{
    //                 console.log(err);
    //                 res.send("<center><h1> Sorry credentials incorrect ! </h1></center>")
    //             }
    //         });
    //     }else{
    //         res.send("<center><h1> Sorry credentials incorrect ! </h1></center>")
    //     }
    // }).catch((error)=>{
    //     console.log(error);
    // });

    // ***** Using passport_js

    const user = new User({
        username: req.body.username,
        passport: req.body.password 
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                req.flash("success","Congrats "+req.user.username+", logged in successfully !");
                res.redirect("dashboard");
            });
        }
    })

});

app.get("/dashboard", isLoggedIn, function(req, res){
    console.log(req.user);
    res.render("dashboard");
});

app.get("/logout", function(req, res){
    req.logOut(function(err){
        if(err){
            console.log(err);
        }else{   
            req.flash("success", "Thank you, you are now logged out !");
            res.redirect("login");   
        }
    })
});

app.get("/forgot", function(req, res){
    res.render("forgot");
});

app.post("/forgot", function(req, res){
    getOneUser(req.body.username).then((result)=>{
        if(result){
            const token = randToken.generate(16);
            Reset.create({
               username : result.username,
               resetPasswordToken : token,
               resetPasswordExpires: Date.now() + 3600000
            });
            const transporter = nodemailer.createTransport({
                service : 'gmail',
                auth : {
                    user: 'yvanngk@gmail.com',
                    pass: process.env.PWD
                }
            });
            const mailOptions = {
                from : 'yvanngk@gmail.com',
                to : req.body.username,
                subject : 'Link to reset your password',
                text : 'Click on this link to reset your password : http://localhost:3000/reset'+token
            }
            console.log("User token created : "+ token);

            console.log("Mail ready to be send");
            transporter.sendMail(mailOptions, function(err, response){
                if(err){
                    console.log(err);
                }else{
                    res.redirect("login");
                }
            });
        }else{
            console.log("an error occured. xxxxxxxx");
            res.redirect("login");
        }
    });
});

app.get("/reset/:token", function(req, res){
    //render si le token est valide
    getReset(req.params.token).then((result)=>{
        if(result){
            res.render("/reset", {token: req.params.token})
        }else{
            console.log("token expired.");
            res.redirect("/login");
        }
    }).catch((error)=>{
        console.log(error);
    });
});

app.post("/reset/:token", function(req,res){
    getReset(req.params.token).then((result)=>{
        if(result){
            if(req.body.password==req.body.password1){
                getOneUser(result.username).then((resu)=>{
                    if (resu) {
                        resu.setPassword(req.body.password, function(err){
                            if (err){
                                console.log(err);
                            }else{
                                resu.save();
                                const updatedReset ={
                                    resetPasswordToken: null,
                                    resetPasswordExpires: null
                                }
                                Reset.findOneAndUpdate(
                                    {resetPasswordToken: req.params.token},
                                    updatedReset, function(err){
                                        if(err){
                                            console.log(err);
                                        }else{
                                            res.redirect("/login");
                                        }
                                    }
                                );
                            }
                        });

                    }else{
                        console.log("an error occured");
                    }
                })
            }
        }else{
            console.log("token expired.");
            res.redirect("/login");
        }
    })
});

// Route for receipe
app.get("/dashboard/myreceipes", isLoggedIn, function(req, res){
    getReceipe(req.user.id).then((result)=>{    
        res.render("receipe", {receipe: result});
        console.log(result);
    }).catch((error)=>{
        console.log(error);
    })
});
app.get("/dashboard/newreceipe", isLoggedIn, function(req, res){
    res.render("newreceipe");
});

app.post("/dashboard/newreceipe", isLoggedIn, function(req, res){
    
    createReceipe(req.body.receipe, req.body.logo, req.user.id).then((result)=>{
            req.flash("success","Receipe added successfully !");
            res.redirect("/dashboard/myreceipes");
    }).catch((error)=>{
        console.log(error);
    });  
});

app.get("/dashboard/myreceipes/:id", function(req, res){
    getOneReceipe(req.user.id, req.params.id).then((receipeFound)=>{
        getIngredients(req.user.id, req.params.id).then((ingredientFound)=>{
            res.render("ingredients", {
                ingredient: ingredientFound,
                receipe: receipeFound
            });
            console.log(ingredientFound);
        }).catch((error)=>{
            console.log(error);
        });
    }).catch((error)=>{
        console.log(error);
    });
});

app.get("/dashboard/myreceipes/:id/newingredient", function(req, res){
    getReceipeById(req.params.id).then((receipeFound)=>{
        res.render("newingredient", {receipe: receipeFound});
        console.log(receipeFound.name);
    }).catch((error)=>{
        console.log(error);
    });
})

app.post("/dashboard/myreceipes/:id", function(req, res){
    createIngredient(
        req.body.name, req.body.dish, req.user.id, 
        req.body.quantity, req.params.id
        ).then((result)=>{
            req.flash("success","Receipe added successfully !");
            res.redirect("/dashboard/myreceipes/"+req.params.id);
        })
});

app.delete("/dashboard/myreceipes/:id", isLoggedIn, function(req, res){
    delReceipe(req.params.id, req.user.id).then((result)=>{
        req.flash("success","Resceipe sucessfully deleted.")
        res.redirect("/dashboard/myreceipes/");
    }).catch((error)=>{
        console.log(error);
    });
});

// End route for receipe

// start route for ingredient

// redirect to edit ingredient page with infos
app.post("/dashboard/myreceipes/:receipe_id/:ing_id/edit", isLoggedIn, function(req, res){
    getOneReceipe(req.user.id, req.params.receipe_id).then((receipeFound)=>{
        getOneIngredient(req.params.ing_id, req.params.receipe_id).then((ingredientFound)=>{
            res.render("edit", {
                ingredient: ingredientFound,
                receipe: receipeFound
            });
        }).catch((error)=>{
            console.log(error);
        });
    }).catch((error)=>{
        console.log(error);
    });
});

//update an ingredient
app.put("/dashboard/myreceipes/:receipe_id/:ing_id", isLoggedIn, function(req, res){
    console.log(req.params.ing_id);
    updateIngredient(
        req.params.ing_id, req.user.id, req.params.receipe_id,
        req.body.name, req.body.dish, req.body.quantity
    ).then((result)=>{
        req.flash("success","Ingredient Modified succesfully !");
        res.redirect("/dashboard/myreceipes/"+req.params.receipe_id);
    }).catch((error)=>{
        console.log(error);
    });
});

//Delete an ingredient
app.delete("/dashboard/myreceipes/:receipe_id/:ing_id", isLoggedIn, function(req, res){   
    delIngredients(req.params.receipe_id, req.params.ing_id).then((result)=>{
        req.flash("success","Ingredient sucessfully deleted.")
        res.redirect("/dashboard/myreceipes/"+req.params.receipe_id);
    }).catch((error)=>{
        console.log(error);
    });
}); 

// End route for Ingredeint

/** Start route for favorite */

app.get("/dashboard/favourites", function(req, res){
    getFavourites(req.user.id).then((favs)=>{

        res.render("favourites", {favourite: favs});
    }).catch((error)=>{
        console.log(error);
        // res.render("favourites");
    });
});

app.get("/dashboard/favourites", isLoggedIn, function(req, res){
    res.render("favorites");
});

// form to add favorite
app.get("/dashboard/favourites/newfavourite", isLoggedIn, function(req, res){
    res.render("newfavourite");
});

// add a favourite
app.post("/dashboard/favourites", isLoggedIn, function(req, res){
    createFavourite(
        req.body.image, req.body.title, 
        req.body.description, req.user.id
    ).then((result)=>{
        req.flash("success", "Favourite added successfully !");
        res.redirect("/dashboard/favourites");
    }).catch((error)=>{
        console.log(error);
    });
});

// Delete a favourite
app.delete("/dashboard/favourites/:id", isLoggedIn, function(req, res){
    delFavorite(req.params.id).then(()=>{
        req.flash("success", "Deleted successfully");
        res.redirect("/dashboard/favourites");
    }).catch((error)=>{
        console.log(error);
    });

});

/** end route for favorite */


/** start route for Schedule */
app.get("/dashboard/schedule", isLoggedIn, function(req, res){
    getSchedules(req.user.id).then((schedules)=>{
        res.render("schedule", {schedule: schedules});
    }).catch((error)=>{
        console.log(error);
    })
});

app.get("/dashboard/schedule/newschedule", isLoggedIn, function(req, res){
    res.render("newSchedule");
});

app.post("/dashboard/schedule", isLoggedIn, function(req, res){
    createSchedule(
        req.body.receipename, req.body.scheduleDate, 
        req.user.id, req.body.time
    ).then((result)=>{
        req.flash("success", "Schedule addes Successfuly");
        res.redirect("/dashboard/schedule");
    }).catch((error)=>{
        console.log(error);
    })
});

app.delete("/dashboard/schedule/:id", function(req, res){
    delSchedule(req.params.id).then((result)=>{
        req.flash("success", "Schedule Deleted Successfuly");
        res.redirect("/dashboard/schedule");
    }).catch((error)=>{
        console.log(error);
    });
});

/** end route for Schedule */


/***** END ROUTES *****/ 

// Funtion de connexion
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error", "Please Login first.")
        res.redirect("/login")
    }
}

app.listen(3000, function(){
    console.log("Well Done Austin Evanzzzzzzz !!!");
});