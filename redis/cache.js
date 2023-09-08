import redis from 'redis';
const client = redis.createClient();
import utility from "./utility.js";

client.on('error', err => console.log('Redis Client Error', err));

//personal data ###################################################################
const fetchPersonalData = async (username) => {
    await client.connect();

    try {
        const result = await client.HGET("personalData", username);

        return result;
    }
    catch(err) {
        console.log("redis fetchPersonalData error", err);
    }
    finally {
        await client.quit();
    }

}

const writePersonalData = async (username, personalData) => {
    await client.connect();

    try {
        await client.HSET("personalData", username, JSON.stringify(personalData));
    }
    catch(err) {
        console.log("redis writePersonalData error", err);
    }
    finally {
        await client.quit();
    } 
}

//post ############################################################################
const getPost = async (username) => {

    await client.connect();

    try {
        const idArray = await client.SMEMBERS(username + "_postid");

        const result = await utility.fetchPostHelper(idArray, client, username);

        return result;
    }
    catch(err) {
        console.log("redis fetch error", err);
    }
    finally {
        await client.quit();
    }
}

//set expire
const setExpNX = async (key, times) => {

    await client.connect();

    try {
        client.expire(key, times, 'NX');
    }
    catch(err) {
        console.log("redis setExpNX error", err);
    }
    finally {
        await client.quit();
    }
}

//writeBack #############################################################################################
const postWriteBack = async (username, userPosts) => {

    await client.connect();

    try {
        await utility.postWriteBackHelper(userPosts, username, client);
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



//delete key
const delKey = async (key) => {

    await client.connect();

    try {
        await client.DEL(key);
    } 
    catch (err) {
        console.log("redis delKey error", err);
    }
    finally {
        await client.quit();
    }
}

const delField = async (key, field) => {

    await client.connect();

    try {
        await client.HDEL(key, field);
    } 
    catch (err) {
        console.log("redis delField error", err);
    }
    finally {
        await client.quit();
    }
}
//user comment



export default {
    //personalData
    fetchPersonalData,
    writePersonalData,

    //post
    getPost,
    
    //remove expire and set expire
    setExpNX,
    
    //delete key
    delKey,
    delField,

    //writeBack
    postWriteBack,
    // userRetweetWriteBack,
};