const express = require('express');
const app = express();
const router = express.Router();
const controller = require("../controller");
const bcrypt = require('bcrypt');

app.set("view engine", "pug");
app.set("views", "views");

app.use(express.urlencoded({extended: false}));

router.get("/", (req, res, next) => {
    res.status(200).render("login");
})

router.post("/", async (req, res, next) => {

    var payload = req.body;

    if(req.body.logUsername && req.body.logPassword) {
        try {
            var user =  await controller.findOne(req.body.logUsername);
        }
        catch(e) {
            console.log(e);
            payload.errorMessage = "Something went worng.";
            return res.status(200).render("login", payload);
        }

        if(user.rows[0] != null) {

            var result = await bcrypt.compare(req.body.logPassword, user.rows[0].password);

            if(result === true) {
                req.session.user = {
                    'firstName': user.rows[0].firstname,
                    'lastName': user.rows[0].lastname,
                    'username': user.rows[0].username,
                    'email': user.rows[0].email,
                    'profilePic': user.rows[0].profilepic,
                    'user_id': user.rows[0].user_id,
                };
                return res.redirect("/");
            }
            payload.errorMessage = "Login credentials incorrect.";
            return res.status(200).render("login", payload);
        }
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(200).render("login", payload);
    }

    res.status(200).render("login");
})

module.exports = router;