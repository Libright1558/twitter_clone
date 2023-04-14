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
        console.log("database error", err);
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
        console.log("database error", err);
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
        console.log("database error", err);
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
        console.log("database error", err);
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
        console.log("database error", err);
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
        console.log("database error", err);
    }
}

//post_like
const userLike = async (userlike) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.userLike, [userlike]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("database error", err);
    }
}

const postLike = async (postlike) => {
    try {
        const client = await pool.connect();
        const result = await client.query(queries.postLike, [postlike]);
        client.release();
        return result;
    }
    catch(err) {
        console.log("database error", err);
    }
}

module.exports = {
    regist,
    findDup,
    findOne,
    postData,
    fetchPost,
    newPostId,
    userLike,
    postLike,
};