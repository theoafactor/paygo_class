// 1. bring in express
const express = require("express");

//require dotenv
require("dotenv").config();

APP_HOST = process.env.HOST;
APP_PORT = process.env.PORT;

// 2. create the server 
const server = express();

// import the User class
const UserClass = require("./Classes/User");
const user = new UserClass();


// Middleware
server.use(express.json())




// 3. define your routes/endpoints

// registration
server.post("/register", (request, response) => {
    let firstname = request.body.firstname; 
    let lastname = request.body.lastname;
    let email = request.body.email;
    let password = request.body.password;

    
    const feedback = user.check_registration_params(firstname, lastname, email, password)
    
    if(feedback.code === "error"){
        // show error
        response.send(feedback);
    }else{
        const feedback = user.register(firstname, lastname, email, password)

        response.send(feedback);
    }
   

    


})


// validate user registration code 
server.get("/verify_registration_email", async (request, response) => {
    //do validations 
    let query = request.query;
    let user_email = query.email; 

    if(user_email.trim().length != 0){
        
        const feedback = await user.verify_email(user_email);

        response.send(feedback);

    }



});


// set the server to listen
server.listen(APP_PORT, () => console.log(`Server is running on http://${APP_HOST}:${APP_PORT}`));
