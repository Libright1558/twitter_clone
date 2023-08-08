const redis = require('redis');
const client = redis.createClient();
const controller = require("../controller.js");
const utility = require("./utility.js");
const moment = require('moment');

client.on('error', err => console.log('Redis Client Error', err));

//post ############################################################################
const getPost = async (username) => {
    try {
        await client.connect();

        let postRecords = await client.ZRANGE(username + "_post", 0, -1);
        
        if(postRecords.length) {
            const recordsObj = postRecords.map(str => JSON.parse(str));

            const result = await utility.fetchPostDetail(recordsObj, client, username);

            return result;
        }
    }
    catch(err) {
        console.log("redis fetch error", err);
    }
    finally {
        await client.quit();
    }
}



const getLikePeople = async (username, postId) => {
    try {
        await client.connect();

        await utility.likePeople(username, client, controller);

        const likePeopleArray = await client.hGet(username + "_like_people", postId);

        return likePeopleArray;
    } 
    catch (err) {
        console.log("redis getLikePeople error", err);
    }
    finally {
        await client.quit();
    }
}

const getRetweetPeople = async (username, postId) => {
    try {
        await client.connect();
   
        await utility.retweetPeople(username, client, controller);

        const retweetPeopleArray = await client.hGet(username + "_retweet_people", postId);

        return retweetPeopleArray;
    } 
    catch (err) {
        console.log("redis getRetweetPeople error", err);
    }
    finally {
        await client.quit();
    }
}

// const getPinnedPost = async () => {

// }

//remove expire and set expire
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

const rmExp = async (key) => {
    try {
        await client.connect();
        
        client.persist(key);
    }
    catch(err) {
        console.log("redis rmExp error", err);
    }
    finally {
        await client.quit();
    }
}

const setExpAll = async (key, times) => {
    await setExp(key + "_post", times);
    await setExp(key + "_post_hashTable", times);
}

const rmExpAll = async (key) => {
    await rmExp(key + "_post_hashTable");
    await rmExp(key + "_post");
}

//user_like
const loadUserLike = async (username) => {
    try {
        await client.connect();
        
        let userLike = await client.ZRANGE(username + "_like", 0, -1);
        // if redis cache is empty, load user_like from database
        if(!userLike.length) {
            const like = await controller.fetchUserLike(username);
            await client.DEL(username + "_like_hashTable");

            let count = 0;

            const likeLength = like.rows.length;
            for(let i = 0; i < likeLength; i++) {
                let obj = {score: count++, value: JSON.stringify(like.rows[i])};
                await client.ZADD(username + "_like", obj);
                await client.hSet(username + "_like_hashTable", like.rows[i].post_id, obj.score);
            }
            
            userLike = await client.ZRANGE(username + "_like", 0, -1);
        }
        else {
            await utility.likeHashTable(username, client);
        }

        const result = userLike.map(str => JSON.parse(str));
        return result;
    }
    catch(err) {
        console.log("redis loadUserLike error", err);
    }
    finally {
        await client.quit();
    }
}

//will be deleted later
const addUserLike = async (username, postOwner, postId) => {
    try {
        await client.connect();

        let member = await client.ZRANGE(username + "_like", 0, 0);
        let first = 0;

        if(member.length) {
            let score = await client.zScore(username + "_like", member.toString());
            first = score - 1;
        }
        const targetScore = await client.hGet(postOwner + "_post_hashTable", postId);
        const targetNode = await client.ZRANGE(postOwner + "_post", targetScore, targetScore, 'BYSCORE');
        let post = JSON.parse(targetNode);
        
        let obj = {score: first, value: JSON.stringify(post)}; 
        
        await client.ZADD(username + "_like", obj);
        await client.hSet(username + "_like_hashTable", post.post_id, obj.score);
    }
    catch(err) {
        console.log("redis addUserLike error", err);
    }
    finally {
        await client.quit();
    }
}

//will be deleted later
const delUserLike = async (username, postId) => {
    try {
        await client.connect();

        const targetScore = await client.hGet(username + "_like_hashTable", postId);
        await client.zRemRangeByScore(username + "_like", targetScore, targetScore);
        await client.hDel(username + "_like_hashTable", postId);
    }
    catch(err) {
        console.log("redis delUserLike error", err);
    }
    finally {
        await client.quit();
    }
}


//post_like
const postLike = async (postOwner,like_username, postId) => {
    try {
        await client.connect();

        let rawData = await client.hGet(postOwner + "_like_people", postId);
        let likePeopleArray = JSON.parse(rawData);
        if(likePeopleArray === null) {
            likePeopleArray = JSON.parse(JSON.stringify([like_username]));
        }
        else if(likePeopleArray.includes(like_username) === false) {
            likePeopleArray.push(like_username);
        }
        else {
            const index = likePeopleArray.indexOf(like_username);
            if(index > -1) {
                likePeopleArray.splice(index, 1);
            }
        }

        const like_nums = likePeopleArray.length;
        await client.hDel(postOwner + "_like_people", postId);
        await client.hSet(postOwner + "_like_people", postId, JSON.stringify(likePeopleArray));

        return like_nums;
    }
    catch(err) {
        console.log("redis postLike error", err);
    }
    finally {
        await client.quit();
    }
}

//user_retweet
const loadUserRetweet = async (username) => {
    try {
        await client.connect();
        
        let userRetweet = await client.ZRANGE(username + "_retweet", 0, -1);
        
        if(userRetweet.length) {    
            const recordsObj = userRetweet.map(str => JSON.parse(str));

            const result = await utility.fetchPostDetail(recordsObj, client, username);

            return result;
        }
    }
    catch(err) {
        console.log("redis loadUserRetweet error", err);
    }
    finally {
        await client.quit();
    }
}



//will be deleted later
const addUserRetweet = async (username, postOwner, postId) => {
    try {
        await client.connect();

        let member = await client.ZRANGE(username + "_retweet", 0, 0);
        let first = 0;

        if(member.length) {
            let score = await client.zScore(username + "_retweet", member.toString());
            first = score - 1;
        }
        const targetScore = await client.hGet(postOwner + "_post_hashTable", postId);
        const targetNode = await client.ZRANGE(postOwner + "_post", targetScore, targetScore, 'BYSCORE');
        let post = JSON.parse(targetNode);

        let obj = {score: first, value: JSON.stringify(post)};
        
        await client.ZADD(username + "_retweet", obj);
        await client.hSet(username + "_retweet_hashTable", post.post_id, obj.score);
    }
    catch(err) {
        console.log("redis addUserRetweet error", err);
    }
    finally {
        await client.quit();
    }
}

//will be deleted later
const delUserRetweet = async (username, postId) => {
    try {
        await client.connect();

        const targetScore = await client.hGet(username + "_retweet_hashTable", postId);
        await client.zRemRangeByScore(username + "_retweet", targetScore, targetScore);
        await client.hDel(username + "_retweet_hashTable", postId);
    }
    catch(err) {
        console.log("redis delUserRetweet error", err);
    }
    finally {
        await client.quit();
    }
}


//post_retweet
const postRetweet = async (postOwner, retweet_username, postId) => {
    try {
        await client.connect();

        let rawData = await client.hGet(postOwner + "_retweet_people", postId);
        let retweetPeopleArray = JSON.parse(rawData);
        if(retweetPeopleArray === null) {
            retweetPeopleArray = JSON.parse(JSON.stringify([retweet_username]));
        }
        else if(retweetPeopleArray.includes(retweet_username) === false) {
            retweetPeopleArray.push(retweet_username);
        }
        else {
            const index = retweetPeopleArray.indexOf(retweet_username);
            if(index > -1) {
                retweetPeopleArray.splice(index, 1);
            }
        }

        const retweet_nums = retweetPeopleArray.length;
        await client.hDel(postOwner + "_retweet_people", postId);
        await client.hSet(postOwner + "_retweet_people", postId, JSON.stringify(retweetPeopleArray));

        return retweet_nums;
    }
    catch(err) {
        console.log("redis postRetweet error", err);
    }
    finally {
        await client.quit();
    }
}

//writeBack #############################################################################################
const postWriteBack = async (username, userPosts) => {
    try {
        await client.connect();

        await client.DEL(username + "_likenum");
        await client.DEL(username + "_retweetnum");
        await client.DEL(username + "_isretweeted");
        await client.DEL(username + "_isliked");

        let count = 0;

        let data = {
            "postby": null,
            "content": null,
            "ts": null,
            "post_id": null,
        }
        
        const rowLength = userPosts.rows.length;
        
        for(let i = 0; i < rowLength; i++) {
            
            data.postby = userPosts.rows[i].postby;
            data.content = userPosts.rows[i].content;
            data.ts = moment(userPosts.rows[i].ts).format("YYYY-MM-DD HH:mm:ss");
            data.post_id = userPosts.rows[i].post_id;
                
            let obj = {score: count++, value: JSON.stringify(data)};
            await client.ZADD(username + "_post", obj);
            
            await client.hSet(username + "_likenum", userPosts.rows[i].post_id, JSON.stringify(userPosts.rows[i].likenum));
            await client.hSet(username + "_retweetnum", userPosts.rows[i].post_id, JSON.stringify(userPosts.rows[i].retweetnum));
            await client.hSet(username + "_isretweeted", userPosts.rows[i].post_id, JSON.stringify(userPosts.rows[i].isretweeted));
            await client.hSet(username + "_isliked", userPosts.rows[i].post_id, JSON.stringify(userPosts.rows[i].isliked));
        }
    } 
    catch (err) {
        console.log("redis postWriteBack error", err);
    }
    finally {
        await client.quit();
    }
}

const userRetweetWriteBack = async (username, retweet) => {
    try {
        await client.connect();

        let count = 0;

        const rowLength = retweet.rows.length;
        for(let i = 0; i < rowLength; i++) {
            let obj = {score: count++, value: JSON.stringify(retweet.rows[i])};
            await client.ZADD(username + "_retweet", obj);
        }
    } 
    catch (err) {
        console.log("redis userRetweetWriteBack error", err);
    }
    finally {
        await client.quit();
    }
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
    getLikePeople,
    getRetweetPeople,

    //remove expire and set expire
    setExp,
    rmExp,
    setExpAll,
    rmExpAll,

    
    //user_like
    loadUserLike,
    addUserLike,
    delUserLike,

    //post_like
    postLike,

    //user_retweet
    loadUserRetweet,
    addUserRetweet,
    delUserRetweet,

    //post_retweet
    postRetweet,

    //delete key
    delKey,

    //writeBack
    postWriteBack,
    userRetweetWriteBack,
};