const redis = require('redis');
const client = redis.createClient();
const controller = require("../controller.js");

client.on('error', err => console.log('Redis Client Error', err));

const getPost = async (username) => {
    try {
        await client.connect();
        console.log("redis connected");

        let postRecords = await client.LRANGE(username, 0, -1);
        if(!postRecords.length) {
            const userPosts = await controller.fetchPost(username);
            userPosts.rows.forEach(async (row) => {
                await client.rPush(username, JSON.stringify(row));
            });
            postRecords = await client.LRANGE(username, 0, -1);

            //set list expire time
            client.expire(username, 300);
        }// if redis cache is empty, load data from database
        
        const recordsObj = postRecords.map(str => JSON.parse(str));
        await client.quit();
        return recordsObj;
    }
    catch(err) {
        console.log("redis fetch error", err);
    }
}

module.exports = {
    getPost,
};