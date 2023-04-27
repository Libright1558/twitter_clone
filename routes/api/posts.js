const express = require('express');
const app = express();
const router = express.Router();
const controller = require("../../controller");
const moment = require('moment');
const redis_cache = require("../../redis/cache.js");


app.use(express.urlencoded({extended: false}));


router.get("/", async (req, res, next) => {
    try {
        const username = req.session.user.username;
        const userPosts = await redis_cache.getPost(username);
        res.status(200).send(JSON.stringify(userPosts));
    }
    catch(err) {
        console.log("posts.js router.get error", err);
        return;
    }
})

router.post("/", express.json(), (req, res, next) => {
    try {
        if(!(req.body.content)) {
            console.log("Content param can not send with request");
            return res.sendStatus(400);
        }
        req.body.content = req.body.content.replace(/[\u00A0-\u9999<>\&]/gim, (i) => `&#${i.codePointAt(0)};`);// HTML escape
        const time = moment().local().format('YYYY-MM-DD HH:mm:ss');
        const postData = [req.session.user.username, req.body.content, false, time];
        controller.postData(postData)
        .then(async () => {
            const username = req.session.user.username;
            const content = req.body.content;
    
            const postId = await controller.newPostId(username);
    
            const newPost = {
                "content": content,
                "pinned": false,
                "postby": username,
                "ts": time,
                "post_id": postId.rows[0].post_id,
                "like_people": [],
                "retweet_people": [],
            }
    
            await redis_cache.addPost(username, newPost);
    
            const deliver = {
                "postData": content, 
                "timestamp": time,
                "post_id": postId,
                "like_people": [],
                "retweet_people": [],
            };
    
            res.status(201).send(JSON.stringify(deliver));
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });
    }
    catch(err) {
        console.log("posts.js router.post error", err);
        return;
    }
})

router.put("/:id/like", express.json(), async (req, res, next) => {
    try {
        const postId = req.body.postId;
        const username = req.session.user.username;
        const owner = req.body.postOwner;

        const isUserLikeKeyExist = await redis_cache.isKeyExist(username + "_like");
        if(isUserLikeKeyExist === false) {
            await redis_cache.loadUserLike(username);
        }
        
        const isAlreadyLike = await redis_cache.isAlreadyLike(username, postId);
        if(isAlreadyLike === false) {
            controller.insertUserLike(username, postId)
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
            
            await redis_cache.addUserLike(username, owner, postId);
            await controller.insertLikePeople(username, postId);     
        }
        else if(isAlreadyLike === true) {
            controller.delUserLike(username, postId)
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
            
            await redis_cache.delUserLike(username, postId);
            await controller.removeLikePeople(username, postId);
        }
        const like_nums = await redis_cache.postLike(owner, username, postId);

        const obj = {
            "isAlreadyLike": isAlreadyLike,
            "like_nums": like_nums,
        }

        res.status(200).send(JSON.stringify(obj));
    }
    catch(err) {
        console.log("posts.js router.put_like error", err);
        return;
    }
})

router.put("/:id/retweet", express.json(), async (req, res, next) => {
    try {
        const postId = req.body.postId;
        const username = req.session.user.username;
        const owner = req.body.postOwner;

        const isUserRetweetKeyExist = await redis_cache.isKeyExist(username + "_retweet");
        if(isUserRetweetKeyExist === false) {
            await redis_cache.loadUserRetweet(username);
        }
        
        const isAlreadyRetweet = await redis_cache.isAlreadyRetweet(username, postId);
        if(isAlreadyRetweet === false) {
            controller.insertUserRetweet(username, postId)
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
            
            await redis_cache.addUserRetweet(username, owner, postId);
            await controller.insertRetweetPeople(username, postId);     
        }
        else if(isAlreadyRetweet === true) {
            controller.delUserRetweet(username, postId)
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
            
            await redis_cache.delUserRetweet(username, postId);
            await controller.removeRetweetPeople(username, postId);
        }
        const retweet_nums = await redis_cache.postRetweet(owner, username, postId);

        const obj = {
            "isAlreadyRetweet": isAlreadyRetweet,
            "retweet_nums": retweet_nums,
        }

        res.status(200).send(JSON.stringify(obj));
    }
    catch(err) {
        console.log("posts.js router.put_retweet error", err);
        return;
    }
})

module.exports = router;