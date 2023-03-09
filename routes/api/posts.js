const express = require('express');
const app = express();
const router = express.Router();
const controller = require("../../controller");
const moment = require('moment');


app.use(express.urlencoded({extended: false}));


router.get("/", (req, res, next) => {
    
})

router.post("/", express.json(), (req, res, next) => {

    if(!(req.body.content)) {
        console.log("Content param can not send with request");
        return res.sendStatus(400);
    }
    req.body.content = req.body.content.replace(/[\u00A0-\u9999<>\&]/gim, (i) => `&#${i.codePointAt(0)};`);// HTML escape
    const time = moment().local().format('YYYY-MM-DD HH:mm:ss');
    const postData = [req.session.user.username, req.body.content, false, time];
    controller.postData(postData)
    .then(() => {
        const username = req.session.user.username;
        const email = req.session.user.email;
        const profilePic = req.session.user.profilePic;
        const firstName = req.session.user.firstName;
        const lastName = req.session.user.lastName;

        const deliver = {"data": postData, "username": username, 
                        "email": email, "profilePic": profilePic, 
                        "firstName": firstName, "lastName": lastName, "timestamp": time};

        res.status(201).send(JSON.stringify(deliver));
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });
})

module.exports = router;