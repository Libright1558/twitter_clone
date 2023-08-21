const express = require('express');
const app = express();
const router = express.Router();
require('dotenv').config();

router.get("/", (req, res, next) => {
    if(req.session) {
        const username = req.session.user.username;
        req.session.destroy(() => {
            res.redirect("/login");
        })
    }
})

module.exports = router;