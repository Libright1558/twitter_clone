const express = require('express');
const app = express();
const router = express.Router();
const controller = require("../controller");
const bcrypt = require('bcrypt');



app.set("view engine", "pug");
app.set("views", "views");

app.use(express.urlencoded({extended: false}));

router.get("/", (req, res, next) => {
    res.status(200).render("register");
})

router.post("/", async (req, res, next) => {

    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var username = req.body.username.trim();
    var email = req.body.email.trim();
    var password = req.body.password;

    var payload = req.body;

    if(firstName && lastName && username && email && password) {
        try { 
            var user =  await controller.findDup(username, email);
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
                controller.regist(user_data);// Writing user's data into the database.
                req.session.user = {
                    'firstName': firstName,
                    'lastName': lastName,
                    'username': username,
                    'email': email,
                    'profilePic': default_profile,
                };
                return res.redirect("/");
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
})

module.exports = router;