// 1. bring in express
const express = require("express");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
var cors = require('cors')

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
server.use(cors());
server.use(express.json())




// 3. define your routes/endpoints

// login 
server.post("/login-user", async (request, response) => {

    let email = request.body.email; 
    let password = request.body.password; 

    // check the database to see if the email and password combo exists
    const feedback = await user.loginUser(email, password);

    response.send({
        message: feedback.message, 
        code: feedback.code, 
        data: feedback.data
    });

})

server.post('/upload_profile', upload.single('upload_profile'), function (request, response, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(request.file)

    // check the type of file we are dealing with 
    const allowed_types = ["image/png", "image/xpng", "image/jpeg", "image/jpg", "image/tiff"];

    let mimetype = request.file.mimetype;

    if(!allowed_types.includes(mimetype)){
        // this is not the allowed type
        response.send({
            message: "This file type is not allowed. Allowed types are: " + String(allowed_types),
            code: "image-error",
            data: null

        })
    }

    // check the size of the file
    let image_size = request.file.size;
    image_size = image_size / (1024);
    image_size = Math.floor(image_size);

    if(image_size > 500){
        // The image is too large
        response.send({
            message: "Image is too large", 
            code: "image-error",
            data: null
        })
    }else{

        response.send({
            message: "Image passed",
            code: "upload-success",
            data: null
        })

    }





  })

// registration
server.post("/register", async (request, response) => {
    let firstname = request.body.firstname; 
    let lastname = request.body.lastname;
    let email = request.body.email;
    let password = request.body.password;

    
    const feedback = user.check_registration_params(firstname, lastname, email, password)
    
    if(feedback.code === "error"){
        // show error
        response.send(feedback);
    }else{
        const feedback = await user.register(firstname, lastname, email, password)

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
