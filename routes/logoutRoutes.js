const express = require('express');
const app = express();
const router = express.Router();
const redis_cache = require("../redis/cache");
require('dotenv').config();

router.get("/", (req, res, next) => {
    if(req.session) {
        const username = req.session.user.username;
        req.session.destroy(() => {
            res.redirect("/login");
            redis_cache.setExp(username, process.env.exp_time);
        })
    }
})

module.exports = router;