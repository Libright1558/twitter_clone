const pool = require("./database");
const queries = require("./queries");

//regist
const regist = async (param) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.regist, param);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller regist error", err);
    }
}

const findDup = async (username, email) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.findDup, [username, email]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller findDup error", err);
    }
}

const findOne = async (username_or_email) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.findOne, [username_or_email]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller findOne error", err);
    }
}


//post
const postData = async (postData) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.postData, postData);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller postData error", err);
    }
}

const fetchPost = async (username) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.fetchPost, [username]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller fetchPost error", err);
    }
}


const fetchPinned = async (username) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.fetchPinned, [username]);
        client.release();
        return result;
    } 
    catch (err) {
        console.log("controller fetchPinned error", err);
    }
}

const fetchLikePeople = async (username) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.fetchLikePeople, [username]);
        client.release();
        return result;
    } 
    catch (err) {
        console.log("controller fetchLikePeople error", err);
    }
}

const fetchRetweetPeople = async (username) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.fetchRetweetPeople, [username]);
        client.release();
        return result;
    } 
    catch (err) {
        console.log("controller fetchRetweetPeople error", err);
    }
}


const newPostId = async (username) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.newPostId, [username]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller newPostId error", err);
    }
}

const insertLikePeople = async (username, post_id) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.insertLikePeople, [username, post_id]);
        client.release();
    }
    catch(err) {
        console.log("controller insertLikePeople error", err);
    }
}

const removeLikePeople = async (username, post_id) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.removeLikePeople, [username, post_id]);
        client.release();
    }
    catch(err) {
        console.log("controller removeLikePeople error", err);
    }
}

const insertRetweetPeople = async (username, post_id) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.insertRetweetPeople, [username, post_id]);
        client.release();
    }
    catch(err) {
        console.log("controller insertRetweetPeople error", err);
    }
}

const removeRetweetPeople = async (username, post_id) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.removeRetweetPeople, [username, post_id]);
        client.release();
    }
    catch(err) {
        console.log("controller removeRetweetPeople error", err);
    }
}

//user_like
const insertUserLike = async (username, post_id) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.userLike, [username, post_id]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller insertUserLike error", err);
    }
}

const delUserLike = async (username, post_id) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.delUserLike, [username, post_id]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller delUserLike error", err);
    }
}

const fetchUserLike = async (username) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.fetchUserLike, [username]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller fetchUserLike error", err);
    }
}

//user_retweet
const insertUserRetweet = async (username, post_id) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.userRetweet, [username, post_id]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller insertUserRetweet error", err);
    }
}

const delUserRetweet = async (username, post_id) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.delUserRetweet, [username, post_id]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller delUserRetweet error", err);
    }
}

const fetchUserRetweet = async (username) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.fetchUserRetweet, [username]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("controller fetchUserRetweet error", err);
    }
}


module.exports = {
    //regist
    regist,
    findDup,
    findOne,

    //post
    postData,

    fetchPost,
    fetchPinned,
    fetchLikePeople,
    fetchRetweetPeople,

    newPostId,

    insertLikePeople,
    removeLikePeople,

    insertRetweetPeople,
    removeRetweetPeople,

    //user_like
    insertUserLike,
    delUserLike,
    fetchUserLike,
    
    //user_retweet
    insertUserRetweet,
    delUserRetweet,
    fetchUserRetweet,
};