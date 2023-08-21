const pool = require("./database");
const queries = require("./queries");

//regist
const regist = async (param) => {
    const client = await pool.connect();
    try {
        const result = await client.query(queries.regist, param);
        return result;
    }
    catch(err) {
        console.log("controller regist error", err);
    }
    finally {
        client.release();
    }
}

const findDup = async (username, email) => {
    const client = await pool.connect();
    try {
        const result = await client.query(queries.findDup, [username, email]);
        return result;
    }
    catch(err) {
        console.log("controller findDup error", err);
    }
    finally {
        client.release();
    }
}

const findOne = async (username_or_email) => {
    const client = await pool.connect();
    try {
        const result = await client.query(queries.findOne, [username_or_email]);
        return result;
    }
    catch(err) {
        console.log("controller findOne error", err);
    }
    finally {
        client.release();
    }
}


//post
const postData = async (postData) => {
    const client = await pool.connect();
    try {
        const result = await client.query(queries.postData, postData);
        return result;
    }
    catch(err) {
        console.log("controller postData error", err);
    }
    finally {
        client.release();
    }
}

const fetchPost = async (username) => {

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(queries.LikeAndRetweet);
        await client.query(queries.postRecords);
        await client.query(queries.isUserRetweetAndLike);

        await client.query(queries.preFetchPost, [username]);
        await client.query(queries.getPostDetail);
        await client.query(queries.getUserRetweetAndLike, [username]);
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


const newPostId = async (username) => {
    const client = await pool.connect();
    try {
        const result = await client.query(queries.newPostId, [username]);
        return result;
    }
    catch(err) {
        console.log("controller newPostId error", err);
    }
    finally {
        client.release();
    }
}


//user_like
const like_or_dislike = async (post_id, username) => {
    const client = await pool.connect();
    try {
        const result = await client.query(queries.like_or_dislike, [post_id, username]);
        return result;
    }
    catch(err) {
        console.log("controller like_or_dislike error", err);
    }
    finally {
        client.release();
    }
}

const fetchPostLikeDetail = async (post_id_array, username) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(queries.LikeNumTable);
        await client.query(queries.isLikedTable);
        await client.query(queries.pre_LikeNum, [post_id_array]);
        await client.query(queries.pre_isLiked, [post_id_array, username]);
        const result = await client.query(queries.fetchIsUserLikedAndLikeNum);

        await client.query('COMMIT');

        return result;
    } 
    catch(err) {
        await client.query('ROLLBACK');
        console.log("controller fetchPostLikeDetail error", err);
    }
    finally {
        client.release();
    }
}

//user_retweet

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
    like_or_dislike,
    fetchPostLikeDetail,
    
    //user_retweet
};