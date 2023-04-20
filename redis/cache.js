const redis = require('redis');
const client = redis.createClient();
const controller = require("../controller.js");
const moment = require('moment');

client.on('error', err => console.log('Redis Client Error', err));

//post
const getPost = async (username) => {
    try {
        await client.connect();

        let postRecords = await client.ZRANGE(username + "_post", 0, -1);
        if(!postRecords.length) {
            const userPosts = await controller.fetchPost(username);
            await client.DEL(username + "_post_hashTable");

            let count = 0;
            userPosts.rows.forEach(async (row) => {
                row.ts = moment(row.ts).format("YYYY-MM-DD HH:mm:ss");
                let obj = {score: count++, value: JSON.stringify(row)};
                await client.ZADD(username + "_post", obj);
                await client.hSet(username + "_post_hashTable", row.post_id, obj.score);
            });
            postRecords = await client.ZRANGE(username + "_post", 0, -1);
        }// if redis cache is empty, load data from database
        
        const recordsObj = postRecords.map(str => JSON.parse(str));
        await client.quit();
        return recordsObj;
    }
    catch(err) {
        await client.quit();
        console.log("redis fetch error", err);
        return;
    }
}

const addPost = async (username, post) => {
    try {
        await client.connect();
        
        let member = await client.ZRANGE(username + "_post", 0, 0);
        let first = 0;

        if(member.length) {
            let score = await client.zScore(username + "_post", member.toString());
            first = score - 1;
        }
        
        let obj = {score: first, value: JSON.stringify(post)};

        await client.ZADD(username + "_post", obj);
        await client.hSet(username + "_post_hashTable", post.post_id, obj.score);

        await client.quit();
    }
    catch(err) {
        await client.quit();
        console.log("redis addPost error", err);
        return;
    }
}


//remove expire and set expire
const setExp = async (key, times) => {
    try {
        await client.connect();

        client.expire(key, times);

        await client.quit();
    }
    catch(err) {
        await client.quit();
        console.log("redis setExp error", err);
        return;
    }
}

const rmExp = async (key) => {
    try {
        await client.connect();
        
        client.persist(key);

        await client.quit();
    }
    catch(err) {
        await client.quit();
        console.log("redis rmExp error", err);
        return;
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
        
        let userLike = client.ZRANGE(username + "_like", 0, -1);
        if(!userLike.length) {
            const like = await controller.fetchUserLike(username);

            let count = 0;
            like.rows.forEach(async (row) => {
                let obj = {score: count++, value: JSON.stringify(row)};
                await client.ZADD(username + "_like", obj);
                await client.hSet(username + "_like_hashTable", row.post_id, obj.score);
            });
            userLike = client.ZRANGE(username + "_like", 0, -1);
        }// if redis cache is empty, load user_like from database

        const result = userLike.map(str => JSON.parse(str));
        await client.quit();
        return result;
    }
    catch(err) {
        await client.quit();
        console.log("redis loadUserLike error", err);
        return;
    }
}


const addUserLike = async (username, post) => {
    try {
        await client.connect();

        let member = await client.ZRANGE(username + "_like", 0, 0);
        let first = 0;

        if(member.length) {
            let score = await client.zScore(username + "_post", member.toString());
            first = score - 1;
        }

        let obj = {score: first, value: JSON.stringify(post)}; 
        
        await client.ZADD(username + "_like", obj);
        await client.hSet(username + "_like_hashTable", post.post_id, obj.score);

        await client.quit();
    }
    catch(err) {
        await client.quit();
        console.log("redis addUserLike error", err);
        return;
    }
}

//post_like


module.exports = {
    getPost,
    addPost,
    setExp,
    rmExp,
    setExpAll,
    rmExpAll,
    loadUserLike,
    addUserLike,
};