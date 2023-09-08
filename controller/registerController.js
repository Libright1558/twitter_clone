import express from 'express';
const app = express();
import databaseController from "./databaseController.js";
import bcrypt from 'bcrypt';

app.use(express.urlencoded({extended: false}));

const renderRegister = (req, res, next) => {
    res.status(200).render("register");
}

const registAccount = async (req, res, next) => {

    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var username = req.body.username.trim();
    var email = req.body.email.trim();
    var password = req.body.password;

    var payload = req.body;

    if(firstName && lastName && username && email && password) {
        try { 
            var user =  await databaseController.findDup(username, email);
        }
        catch(e) {
            console.log(e);
            payload.errorMessage = "Something went worng.";
            res.status(200).render("register", payload);
        }
        
        if(user.rows[0] == null) {
            // No user found
            try {
                password = await bcrypt.hash(password, 12); // Hashing the password.
                var default_profile = '/images/UserProfiles/ProfilePic.jpeg';
                var user_data = [firstName, lastName, username, email, password, default_profile];
                await databaseController.regist(user_data);// Writing user's data into the database.
                
                return res.redirect("/login");
            }
            catch(e) {
                console.log(e);
                payload.errorMessage = "Something went worng.";
                res.status(200).render("register", payload);
            }

        }
        else {
            // User found
            if(email == user.rows[0].email) {
                payload.errorMessage = "Email already in use.";
            }
            else {
                payload.errorMessage = "username already in use.";
            }
            res.status(200).render("register", payload);
        }
    }
    else {
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(200).render("register", payload);
    }
}

export default {
    renderRegister,
    registAccount,
}