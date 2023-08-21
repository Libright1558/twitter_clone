const redis = require('redis');
const client = redis.createClient();
const utility = require("./utility.js");
const moment = require('moment');

client.on('error', err => console.log('Redis Client Error', err));

//post ############################################################################
const getPost = async (username) => {

    await client.connect();

    try {
        const idArray = await client.SMEMBERS(username + "_postid");

        if(idArray.length) {
            const posts = await client.HMGET("community_posts", idArray);
         
            if(posts.length) {
                const recordsObj = posts.map(str => JSON.parse(str));
                recordsObj.sort(function(a, b) {
                    if(a.ts > b.ts) {
                        return -1;
                    }
    
                    if(a.ts < b.ts) {
                        return 1;
                    }
                    return 0;
                }); // descendent sorting
    
                const recordsObjLength = recordsObj.length;
                const recordsObjIdArray = [];
                for(let i = 0; i < recordsObjLength; i++) {
                    recordsObjIdArray.push(recordsObj[i].post_id);
                }
    
                const result = await utility.fetchPostDetail(recordsObj, recordsObjIdArray, client, username);
    
                return result;
            }    
        }
    }
    catch(err) {
        console.log("redis fetch error", err);
    }
    finally {
        await client.quit();
    }
}

//set expire
const setExp = async (key, times) => {
    try {
        await client.connect();

        client.expire(key, times);
    }
    catch(err) {
        console.log("redis setExp error", err);
    }
    finally {
        await client.quit();
    }
}

const setExpNX = async (key, times) => {
    try {
        await client.connect();

        client.expire(key, times, 'NX');
    }
    catch(err) {
        console.log("redis setExpNX error", err);
    }
    finally {
        await client.quit();
    }
}

//user_retweet
// const loadUserRetweet = async (username) => {
//     try {
//         await client.connect();
        
//         let userRetweet = await client.ZRANGE(username + "_retweet", 0, -1);
        
//         if(userRetweet.length) {    
//             const recordsObj = userRetweet.map(str => JSON.parse(str));

//             const result = await utility.fetchPostDetail(recordsObj, client, username);

//             return result;
//         }
//     }
//     catch(err) {
//         console.log("redis loadUserRetweet error", err);
//     }
//     finally {
//         await client.quit();
//     }
// }



//writeBack #############################################################################################
const postWriteBack = async (username, userPosts) => {
    try {
        await client.connect();

        const data = {
            "postby": null,
            "content": null,
            "ts": null,
            "post_id": null,
        }
        
        const rowLength = userPosts.rows.length;
        const postFieldValueObj = {};
        const postIdArray = [];
        const likeNumObj = {};
        const retweetNumObj = {};
        const isLikeObj = {};
        const isRetweetObj = {};


        for(let i = 0; i < rowLength; i++) {
            data.postby = userPosts.rows[i].postby;
            data.content = userPosts.rows[i].content;
            data.ts = moment(userPosts.rows[i].ts).format("YYYY-MM-DD HH:mm:ss");
            data.post_id = userPosts.rows[i].post_id;

            
            postFieldValueObj[userPosts.rows[i].post_id] = JSON.stringify(data);

            postIdArray.push(userPosts.rows[i].post_id);
            likeNumObj[userPosts.rows[i].post_id] = JSON.stringify(userPosts.rows[i].likenum);
            retweetNumObj[userPosts.rows[i].post_id] = JSON.stringify(userPosts.rows[i].retweetnum);
            isLikeObj[userPosts.rows[i].post_id] = JSON.stringify(userPosts.rows[i].isliked);
            isRetweetObj[userPosts.rows[i].post_id] = JSON.stringify(userPosts.rows[i].isretweeted);
        }
        await client.HSET("community_posts", postFieldValueObj);
        await client.SADD(username + "_postid", postIdArray);
        await postDetailWriteBack(likeNumObj, retweetNumObj);
        await isUserLikeAndRetweetWriteBack(username, isLikeObj, isRetweetObj);
    } 
    catch (err) {
        console.log("redis postWriteBack error", err);
    }
    finally {
        await client.quit();
    }
}

// const userRetweetWriteBack = async (username, retweet) => {
//     try {
//         await client.connect();

//         let count = 0;

//         const rowLength = retweet.rows.length;
//         for(let i = 0; i < rowLength; i++) {
//             let obj = {score: count++, value: JSON.stringify(retweet.rows[i])};
//             await client.ZADD(username + "_retweet", obj);

//             await postDetailWriteBack(retweet.rows[i]);
//             await isUserLikeAndRetweetWriteBack(username, retweet.rows[i]);
//         }
//     } 
//     catch (err) {
//         console.log("redis userRetweetWriteBack error", err);
//     }
//     finally {
//         await client.quit();
//     }
// }

const postDetailWriteBack = async (objLike, objRetweet) => {
    await client.HSET("likenum", objLike);
    await client.HSET("retweetnum", objRetweet);
}

const isUserLikeAndRetweetWriteBack = async (username, objLike, objRetweet) => {
    await client.HSET(username + "_isliked", objLike);
    await client.HSET(username + "_isretweeted", objRetweet);
}


//delete key
const delKey = async (key) => {
    try {
        await client.connect();

        await client.DEL(key);
    } 
    catch (err) {
        console.log("redis delKey error", err);
    }
    finally {
        await client.quit();
    }
}

//user comment



module.exports = {
    //post
    getPost,
    
    //remove expire and set expire
    setExp,
    setExpNX,
    
    //delete key
    delKey,

    //writeBack
    postWriteBack,
    // userRetweetWriteBack,
    postDetailWriteBack,
    isUserLikeAndRetweetWriteBack,
};