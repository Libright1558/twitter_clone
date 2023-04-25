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
        const email = req.session.user.email;
        const profilePic = req.session.user.profilePic;
        const firstName = req.session.user.firstName;
        const lastName = req.session.user.lastName;

        const userInfo = {
            "username": username, 
            "email": email, "profilePic": profilePic, 
            "firstName": firstName, "lastName": lastName,
        }

        const userPosts = await redis_cache.getPost(username);
        userPosts.push(userInfo);
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
            const email = req.session.user.email;
            const profilePic = req.session.user.profilePic;
            const firstName = req.session.user.firstName;
            const lastName = req.session.user.lastName;
            const content = req.body.content;
    
            const postId = await controller.newPostId(username);
    
            const newPost = {
                "content": content,
                "pinned": false,
                "postby": username,
                "ts": time,
                "post_id": postId.rows[0].post_id,
            }
    
            await redis_cache.addPost(username, newPost);
    
            const deliver = {
                "postData": content, 
                "username": username, 
                "email": email, 
                "profilePic": profilePic, 
                "firstName": firstName, 
                "lastName": lastName, 
                "timestamp": time,
                "post_id": postId,
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
            .then(async () => {
                await redis_cache.addUserLike(username, owner, postId);
            })
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
        }
        else if(isAlreadyLike === true) {
            controller.delUserLike(username, postId)
            .then(async () => {
                await redis_cache.delUserLike(username, postId);
            })
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
        }
        const total_likes = await redis_cache.postLike(owner, postId, isAlreadyLike);

        res.status(200).send(JSON.stringify(total_likes));
    }
    catch(err) {
        console.log("posts.js router.put error", err);
        return;
    }
})

module.exports = router;