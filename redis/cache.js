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
        if(client.isOpen) {
            await client.quit();
        }
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
        if(client.isOpen) {
            await client.quit();
        }
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
        if(client.isOpen) {
            await client.quit();
        }
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
        if(client.isOpen) {
            await client.quit();
        }
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


//ket exist
const isKeyExist = async (key) => {
    try {
        await client.connect();

        const isExist = await client.KEYS(key);

        await client.quit();
        return !isExist.length ? false : true;
    }
    catch(err) {
        if(client.isOpen) {
            await client.quit();
        }
        console.log("redis isKeyExist error", err);
        return;
    }
}

//user_like
const loadUserLike = async (username) => {
    try {
        await client.connect();
        
        let userLike = await client.ZRANGE(username + "_like", 0, -1);
        if(!userLike.length) {
            const like = await controller.fetchUserLike(username);
            await client.DEL(username + "_like_hashTable");

            let count = 0;
            like.rows.forEach(async (row) => {
                let obj = {score: count++, value: JSON.stringify(row)};
                await client.ZADD(username + "_like", obj);
                await client.hSet(username + "_like_hashTable", row.post_id, obj.score);
            });
            userLike = await client.ZRANGE(username + "_like", 0, -1);
        }// if redis cache is empty, load user_like from database

        const result = userLike.map(str => JSON.parse(str));
        await client.quit();
        return result;
    }
    catch(err) {
        if(client.isOpen) {
            await client.quit();
        }
        console.log("redis loadUserLike error", err);
        return;
    }
}


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

        await client.quit();
    }
    catch(err) {
        if(client.isOpen) {
            await client.quit();
        }
        console.log("redis addUserLike error", err);
        return;
    }
}

const delUserLike = async (username, postId) => {
    try {
        await client.connect();

        const targetScore = await client.hGet(username + "_like_hashTable", postId);
        await client.zRemRangeByScore(username + "_like", targetScore, targetScore);
        await client.hDel(username + "_like_hashTable", postId);

        await client.quit();
    }
    catch(err) {
        if(client.isOpen) {
            await client.quit();
        }
        console.log("redis delUserLike error", err);
        return;
    }
}

//AlreadyLike
const isAlreadyLike = async (username, postId) => {
    try {
        await client.connect();

        const targetScore = await client.hGet(username + "_like_hashTable", postId);
        let result;
        if(targetScore === undefined || targetScore === null) {
            result = false;
        }
        else {
            result = true;
        }

        await client.quit();
        return result;
    }
    catch(err) {
        if(client.isOpen) {
            await client.quit();
        }
        console.log("redis isAlreadyLike error", err);
        return;
    }
}

//post_like
const postLike = async (postOwner, like_username, postId) => {
    try {
        await client.connect();

        const targetScore = await client.hGet(postOwner + "_post_hashTable", postId);
        const targetNode = await client.ZRANGE(postOwner + "_post", targetScore, targetScore, 'BYSCORE');
        let result = JSON.parse(targetNode);
        
        if(result.like_people === null) {
            result.like_people = JSON.parse(JSON.stringify([like_username]));
        }
        else {
            if(result.like_people.includes(like_username) === false) {
                result.like_people.push(like_username);
            }
            else {
                const index = result.like_people.indexOf(like_username);
                if(index > -1) {
                    result.like_people.splice(index, 1);
                }
            }
        }
        
        const like_nums = result.like_people.length;
        const SCore = Number(targetScore);
        const obj = {score: SCore, value: JSON.stringify(result)};

        await client.zRemRangeByScore(postOwner + "_post", targetScore, targetScore);
        await client.ZADD(postOwner + "_post", obj);

        await client.quit();
        return like_nums;
    }
    catch(err) {
        if(client.isOpen) {
            await client.quit();
        }
        console.log("redis postLike error", err);
        return;
    }
}

module.exports = {
    getPost,
    addPost,
    setExp,
    rmExp,
    setExpAll,
    rmExpAll,
    isKeyExist,
    loadUserLike,
    addUserLike,
    delUserLike,
    isAlreadyLike,
    postLike,
};