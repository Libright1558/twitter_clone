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

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(queries.LikeAndRetweet);
        await client.query(queries.postRecords);

        await client.query(queries.preFetchPost, [username]);
        await client.query(queries.getPostDetail);
        const result = await client.query(queries.fetchPost);

        await client.query('COMMIT');

        return result;
    }
    catch(err) {
        await client.query('ROLLBACK');
        console.log("controller fetchPost error", err);
    }
    finally {
        client.release();
    }
}

// return post_id
// const fetchPinned = async (username) => {
//     try {
//         const client = await pool.connect();
//         const result = await client.query(queries.fetchPinned, [username]);
//         client.release();
//         return result;
//     } 
//     catch (err) {
//         console.log("controller fetchPinned error", err);
//     }
// }


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
    newPostId,
    
    //user_like
    insertUserLike,
    delUserLike,
    fetchUserLike,
    
    //user_retweet
    insertUserRetweet,
    delUserRetweet,
    fetchUserRetweet,
};