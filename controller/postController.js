import express from 'express';
const app = express();
import databaseController from "./databaseController.js";
import moment from 'moment';
import redis_cache from "../redis/cache.js";
import utility from "../redis/utility.js";

app.use(express.urlencoded({extended: false}));
app.use(express.json());

const getPost = async (req, res, next) => {
    try {
        const username = req.username;
        let post = await redis_cache.getPost(username);
        // let retweet = await redis_cache.loadUserRetweet(username);

        const obj = {
            "userPosts": post,
            "userRetweets": null,
        }

        if(post === undefined || post === null) {
            
            let userPosts = await databaseController.fetchPost(username);
            
            let userPostsLen = userPosts.rows ? userPosts.rows.length : 0;
            
            for(let i = 0; i < userPostsLen; i++) {
                userPosts.rows[i].ts = moment(userPosts.rows[i].ts).format('YYYY-MM-DD HH:mm:ss');
            }

            if(userPostsLen !== 0) {
                userPosts.rows.sort(function(a, b) {
                    if(a.ts > b.ts) {
                        return -1;
                    }

                    if(a.ts < b.ts) {
                        return 1;
                    }
                    return 0;
                });
                obj.userPosts = userPosts.rows;

                await redis_cache.postWriteBack(username, userPosts);
                
                await redis_cache.setExpNX(username + "_postid", process.env.exp_time);
                await redis_cache.setExpNX("community_posts", process.env.exp_time);
            }
        }

        // if(retweet === null || retweet === undefined) {

        //     let userRetweets = await databaseController.fetchUserRetweet(username);

        //     let userRetweetsLen = userRetweets.rows ? userRetweets.rows.length : 0;

        //     for(let i = 0; i < userRetweetsLen; i++) {
        //         userRetweets.rows[i].ts = moment(userRetweets.rows[i].ts).format('YYYY-MM-DD HH:mm:ss');
        //     }

        //     if(userRetweetsLen !== 0) {
        //         obj.userRetweets = userRetweets.rows;

        //         await redis_cache.userRetweetWriteBack(username, userRetweets);
        //         await redis_cache.setExp(username + "_retweet", process.env.exp_time);
        //     }
        // }
        
        await utility.setCacheExp(username, redis_cache);

        res.status(200).send(JSON.stringify(obj));
    }
    catch(err) {
        console.log("posts.js router.get error", err);
        return;
    }
}

const postThePost = async (req, res, next) => {
    try {
        if(!(req.body.content)) {
            console.log("Content param can not send with request");
            return res.sendStatus(400);
        }
        const username = req.username;
        const content = req.body.content;
        const time = moment().local().format('YYYY-MM-DD HH:mm:ss');
        const postData = [username, content, time];
    
        await redis_cache.delKey(username + "_postid");

        const result = await databaseController.postData(postData);
        
        setTimeout(async () => {
            await redis_cache.delKey(username + "_postid");
        }, 5000);
    
        const deliver = {
            "postData": content, 
            "timestamp": time,
            "post_id": result.rows[0].post_id,
            "likenum": 0,
            "isliked": false,
            "retweetnum": 0,
            "isretweeted": false,
            "postby": username,
            "firstName": req.session.user.firstName,
            "lastName": req.session.user.lastName,
            "profilePic": req.session.user.profilePic,
        };

        res.status(201).send(JSON.stringify(deliver));
    }
    catch(err) {
        console.log("posts.js router.post error", err);
        return;
    }
}

const likePost = async (req, res, next) => {
    try {
        const postId = req.body.postId;
        const username = req.username;

        await redis_cache.delField("likenum", postId);
        await redis_cache.delField(username + "_isliked", postId);

        const response = await databaseController.like_or_dislike(postId, username);
        
        const obj = {
            "isAlreadyLike": response.rows[0].isliked,
            "like_nums": response.rows[0].likenum
        }

        setTimeout(async () => {
            await redis_cache.delField("likenum", postId);
            await redis_cache.delField(username + "_isliked", postId);
        }, 5000);

        res.status(200).send(JSON.stringify(obj));
    }
    catch(err) {
        console.log("posts.js router.put_like error", err);
        return;
    }
}

const retweetPost = async (req, res, next) => {
    try {
        const postId = req.body.postId;
        const username = req.username;

        await redis_cache.delField("retweetnum", postId);
        await redis_cache.delField(username + "_isretweeted", postId);

        const response = await databaseController.retweet_or_disretweet(postId, username);

        const obj = {
            "isAlreadyRetweet": response.rows[0].isretweeted,
            "retweet_nums": response.rows[0].retweetnum,
        }

        setTimeout(async () => {
            await redis_cache.delField("retweetnum", postId);
            await redis_cache.delField(username + "_isretweeted", postId);
        }, 5000);

        res.status(200).send(JSON.stringify(obj));
    }
    catch(err) {
        console.log("posts.js router.put_retweet error", err);
        return;
    }
}

const deletePost = async (req, res, next) => {
    try {
        const postId = req.body.postId;

        await redis_cache.delField("community_posts", postId);

        await databaseController.deletePost(postId);

        setTimeout(async () => {
            await redis_cache.delField("community_posts", postId);
        }, 5000);

        return;
    } 
    catch(err) {
        console.log("posts.js router.delete error", err);
        return;
    }
}

export default {
    getPost,
    postThePost,
    likePost,
    retweetPost,
    deletePost,
}