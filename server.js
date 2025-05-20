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

    let errors = [];

    if(!firstname || firstname.length === 0){
        // no firstname was provided 
        errors.push("Please provide your firstname")
    }

    if(!lastname || lastname.length === 0){
        errors.push("Provide your lastname");
    }

    if(!email || email.length === 0){
        errors.push("Provide your email")
    }

    if(!password || password.length === 0){
        errors.push("'Provide your password")
    }
    
    if(errors.length > 0){

        response.send({
            message: "An error ocurred. Please provide all form details",
            error: errors, 
            data: null
        })

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

    //check the database to find the state of the user's registration 
    let findresult = await client.db(process.env.DB_NAME).collection("users").findOne({email: user_email})


    let is_email_verified = findresult.is_email_verified;

    if(!is_email_verified){
        // vefify the email
        // Make the is_email_verified to be true
       await client.db(process.env.DB_NAME).collection("users").updateOne({email: user_email}, { $set: { is_email_verified: true }})
        
       response.send({
        message: "Email verified successfully", 
        code: 'success',
        data: null
       })
    }else{
        response.send({
            message: "Email verified already. No action needed", 
            code: "email-verified-already",
            data: null
        })
        

    }


});


// set the server to listen
server.listen(APP_PORT, () => console.log(`Server is running on http://${APP_HOST}:${APP_PORT}`));
