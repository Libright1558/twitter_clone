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



module.exports = {
    regist,
    findDup,
    findOne,
    postData,
    fetchPost,
    newPostId,
    insertUserLike,
    delUserLike,
    fetchUserLike,
};