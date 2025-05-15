// 1. bring in express
const express = require("express");

//require dotenv
require("dotenv").config();

const nodemailer = require("nodemailer");

APP_HOST = process.env.HOST;
APP_PORT = process.env.PORT;

// 2. create the server 
const server = express();

// Middleware
server.use(express.json())

// setup the email transport
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });


// 3. define your routes/endpoints

// registration
server.post("/register", async(request, response) => {
    // do registration 
    console.log(request.body)
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
        
        try{
            // once registered, send an email
            const email_object = await transporter.sendMail({
                from: '"PayGo" <no-reply@paygo.com>',
                to: `${email}`,
                subject: `Thank you for Registering ${firstname}!`,
                html: `<h3>Hey ${firstname} ${lastname}</h3>
                        <hr>
                        <p>Welcome to PayGo!</p>
                        <p>Please verify your email by clicking the link below: </p>
                        <p>http://localhost:1233/validate_registration</p>

                        <hr> 
                        <p>Regards,</p>
                        Paygo Support
                        `, 
            });

            if(email_object){
                response.send({
                    message: "User registered. Please check inbox for validation email", 
                    code: "success", 
                    data: null
                });
            }else{

                response.send({
                    message: "Could not register this user at this time.",
                    code: "error",
                    data: null
                })

            }

        }catch(error){
            response.send({
                message: "An internal error ocurred: ",
                error: error,
                data: null
            })

   }
    }


    





});



// validate user registration code 
server.get("/validate_registration", (request, response) => {
    //do validations 


});


// set the server to listen
server.listen(APP_PORT, () => console.log(`Server is running on http://${APP_HOST}:${APP_PORT}`));
