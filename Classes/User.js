//require dotenv
require("dotenv").config();

const { MongoClient } = require("mongodb");
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qcoqo.mongodb.net/?retryWrites=true`
const client = new MongoClient(url);
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");


class User{

    constructor(){
        // setup the email transport
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
            },
        });
    }

    async register(firstname, lastname, email, password){

        // build an object for the user 
        const user = {
            firstname: firstname, 
            lastname: lastname, 
            email: email, 
            password: await bcrypt.hash(password, 5),
            is_email_verified: false, 
            user_role: 0
        }


        try{
            // check to see if user exists already
            const findresult = await client.db(process.env.DB_NAME).collection("users").findOne({email: email})
            
            if(findresult){
                return {
                    message: "User with this email exists already!", 
                    code: "error",
                    data: null
                }
            }else{
                await client.db(process.env.DB_NAME).collection("users").insertOne(user)
                // once registered, send an email
                
                const email_object = this.transporter.sendMail({
                    from: '"PayGo" <no-reply@paygo.com>',
                    to: `${email}`,
                    subject: `Thank you for Registering ${firstname}!`,
                    html: `<h3>Hey ${firstname} ${lastname}</h3>
                            <hr>
                            <p>Welcome to PayGo!</p>
                            <p>Please verify your email by clicking the link below: </p>
                            <p><a href="http://${APP_HOST}:${APP_PORT}/verify_registration_email?email=${email}" target="_blank">http://localhost:1233/verify_registration_email</p>
    
                            <hr> 
                            <p>Regards,</p>
                            Paygo Support
                            `, 
                });
    
                if(email_object){
                    return {
                        message: "User registered. Please check inbox for validation email", 
                        code: "success", 
                        data: null
                    };
    
                }else{
                    return {
                        message: "Could not register this user at this time.",
                        code: "error",
                        data: null
                    }
                }

            }

         

          

         

        }catch(error){
            return {
                message: "An internal error ocurred: ",
                error: `Here is the error details: ${error.message}`,
                data: null
            }

   }



    }

    logout(){

    }

    check_registration_params(firstname, lastname, email, password){
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

        if(errors.length > 0 ){
            return {
                message: "An error ocurred. Please provide all form details",
                error: errors, 
                code: "error",
                data: null
            }
        }else{
            return {
                message: "All fields provided", 
                code: "success", 
                data: null,
                error: null
            }
        }

    }

    async verify_email(email){


    //check the database to find the state of the user's registration 
    let findresult = await client.db(process.env.DB_NAME).collection("users").findOne({email: user_email})


    let is_email_verified = findresult.is_email_verified;

    if(!is_email_verified){
        // vefify the email
        // Make the is_email_verified to be true
       await client.db(process.env.DB_NAME).collection("users").updateOne({email: user_email}, { $set: { is_email_verified: true }})
        
       return {
        message: "Email verified successfully", 
        code: 'success',
        data: null
       }

    }else{
        return {
            message: "Email verified already. No action needed", 
            code: "email-verified-already",
            data: null
        }
        

    }
        

    }



    async loginUser(email, password){

       const result = await client.db(process.env.DB_NAME).collection("users").findOne({email: email, password: password});

       if(result){
            // the user exists
            return {
                message: "User exists", 
                code: 'success', 
                data: result
            }
       }

       return {
            message: "User does not exist", 
            code: "account-not-exist", 
            data: null
       }
    }


}


module.exports = User;