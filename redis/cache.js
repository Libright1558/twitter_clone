const redis = require('redis');
const client = redis.createClient();
const controller = require("../controller.js");
const moment = require('moment');

client.on('error', err => console.log('Redis Client Error', err));

const getPost = async (username) => {
    try {
        await client.connect();

        let postRecords = await client.LRANGE(username, 0, -1);
        if(!postRecords.length) {
            const userPosts = await controller.fetchPost(username);
            userPosts.rows.forEach(async (row) => {
                row.ts = moment(row.ts).format("YYYY-MM-DD HH:mm:ss");
                await client.rPush(username, JSON.stringify(row));
            });
            postRecords = await client.LRANGE(username, 0, -1);
        }// if redis cache is empty, load data from database
        
        const recordsObj = postRecords.map(str => JSON.parse(str));
        await client.quit();
        return recordsObj;
    }
    catch(err) {
        console.log("redis fetch error", err);
    }
}

const setExp = async (key, times) => {
    try {
        await client.connect();

        client.expire(key, times);

        await client.quit();
    }
    catch(err) {
        console.log("redis setExp error", err);
    }
}

const rmExp = async (key) => {
    try {
        await client.connect();
        
        client.persist(key);

        await client.quit();
    }
    catch(err) {
        console.log("redis rmExp error", err);
    }
}

const addPost = async (username, post) => {
    try {
        await client.connect();

        await client.lPush(username, JSON.stringify(post));

        await client.quit();
    }
    catch(err) {
        console.log("redis addPost error", err);
    }
}

module.exports = {
    getPost,
    setExp,
    rmExp,
    addPost,
};