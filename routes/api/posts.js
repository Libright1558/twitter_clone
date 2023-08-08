const express = require('express');
const app = express();
const router = express.Router();
const controller = require("../../controller");
const moment = require('moment');
const redis_cache = require("../../redis/cache.js");
const utility = require("../../redis/utility");


app.use(express.urlencoded({extended: false}));


router.get("/", async (req, res, next) => {
    try {
        const username = req.session.user.username;
        let post = await redis_cache.getPost(username);
        let retweet = await redis_cache.loadUserRetweet(username);

        const obj = {
            "userPosts": post,
            "userRetweets": retweet,
        }

        if(post === null || post === undefined) {
            
            let userPosts = await controller.fetchPost(username);
            
            let userPostsLen = userPosts.rows ? userPosts.rows.length : 0;
            
            for(let i = 0; i < userPostsLen; i++) {
                userPosts.rows[i].ts = moment(userPosts.rows[i].ts).format('YYYY-MM-DD HH:mm:ss');
            }

            if(userPostsLen !== 0) {
                obj.userPosts = userPosts.rows;

                await redis_cache.postWriteBack(username, userPosts);
                await redis_cache.setExp(username + "_post", process.env.exp_time - 20);    
            }
        }

        if(retweet === null || retweet === undefined) {

            let userRetweets = await controller.fetchUserRetweet(username);

            let userRetweetsLen = userRetweets.rows ? userRetweets.rows.length : 0;

            for(let i = 0; i < userRetweetsLen; i++) {
                userRetweets.rows[i].ts = moment(userRetweets.rows[i].ts).format('YYYY-MM-DD HH:mm:ss');
            }

            if(userRetweetsLen !== 0) {
                obj.userRetweets = userRetweets.rows;

                await redis_cache.userRetweetWriteBack(username, userRetweets);
                await redis_cache.setExp(username + "_retweet", process.env.exp_time - 20);
            }
        }

        await utility.setCacheExp(username, redis_cache);

        res.status(200).send(JSON.stringify(obj));
    }
    catch(err) {
        console.log("posts.js router.get error", err);
        return;
    }
})



router.get("/:id", (req, res, next) => {
    const postId = req.params.id;
    
})

router.post("/", express.json(), async (req, res, next) => {
    try {
        if(!(req.body.content)) {
            console.log("Content param can not send with request");
            return res.sendStatus(400);
        }
        req.body.content = req.body.content.replace(/[\u00A0-\u9999<>\&]/gim, (i) => `&#${i.codePointAt(0)};`);// HTML escape
        const time = moment().local().format('YYYY-MM-DD HH:mm:ss');
        const postData = [req.session.user.username, req.body.content, time];

        const username = req.session.user.username;

        const deleteKeys = async () => {
            await redis_cache.delKey(username + "_post");
            await redis_cache.delKey(username + "_post_hashTable");
            await redis_cache.delKey(username + "_pinned");
            await redis_cache.delKey(username + "_like_people");
            await redis_cache.delKey(username + "_retweet_people");
        }
        
        await deleteKeys();
        await controller.postData(postData);
        setTimeout(async () => await deleteKeys(), process.env.timeout);
       
        const content = req.body.content;
    
        const postId = await controller.newPostId(username);

        const deliver = {
            "postData": content, 
            "timestamp": time,
            "post_id": postId,
            "like_people": [],
            "retweet_people": [],
        };

        res.status(201).send(JSON.stringify(deliver));
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

        let likePeopleArray = await redis_cache.getLikePeople(username, postId);
        likePeopleArray = JSON.parse(likePeopleArray);
        
        let isAlreadyLike = true;
        if(likePeopleArray === null || likePeopleArray.includes(username) === false) {
            isAlreadyLike = false;
        }


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


        let retweetPeopleArray = await redis_cache.getRetweetPeople(username, postId);
        retweetPeopleArray = JSON.parse(retweetPeopleArray);
        
        let isAlreadyRetweet = true;
        if(retweetPeopleArray === null || retweetPeopleArray.includes(username) === false) {
            isAlreadyRetweet = false;
        }
        

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