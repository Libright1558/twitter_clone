const express = require('express');
const app = express();
const router = express.Router();
const controller = require("../../controller");


app.use(express.urlencoded({extended: false}));


router.get("/", (req, res, next) => {
    
})

router.post("/", express.json(), (req, res, next) => {

    if(!(req.body.content)) {
        console.log("Content param can not send with request");
        return res.sendStatus(400);
    }
    req.body.content = req.body.content.replace(/[\u00A0-\u9999<>\&]/gim, (i) => `&#${i.charCodeAt(0)};`);// HTML escape
    //var postData = [req.session.user.username, req.body.content, false];
    //controller.postData(postData);

    res.status(200).send(JSON.stringify(req.body.content));
})

module.exports = router;