import pool from "../database/database.js";
import queries from "../database/queries.js";

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

const fetchPersonalData = async (username_or_email) => {
    const client = await pool.connect();
    try {
        const result = await client.query(queries.personalData, [username_or_email]);
        return result;
    }
    catch(err) {
        console.log("controller fetchPersonalData error", err);
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

const fetchLostPost = async (post_id_array, username) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(queries.LikeAndRetweet);
        await client.query(queries.postRecords);
        await client.query(queries.isUserRetweetAndLike);

        await client.query(queries.pre_fetchLostPost, [post_id_array]);
        await client.query(queries.getPostDetail);
        await client.query(queries.getUserRetweetAndLike, [username]);
        const result = await client.query(queries.fetchPost);

        await client.query('COMMIT');

        return result;
    } 
    catch(err) {
        await client.query('ROLLBACK');
        console.log("controller fetchLostPost error", err);
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
const retweet_or_disretweet = async (post_id, username) => {
    const client = await pool.connect();
    try {
        const result = await client.query(queries.retweet_or_disretweet, [post_id, username]);
        return result;
    } 
    catch (err) {
        console.log("controller retweet_or_disretweet error", err);
    }
    finally {
        client.release();
    }
}

const fetchPostRetweetDetail = async (post_id_array, username) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(queries.RetweetNumTable);
        await client.query(queries.isRetweetedTable);
        await client.query(queries.pre_RetweetNum, [post_id_array]);
        await client.query(queries.pre_isRetweeted, [post_id_array, username]);
        const result = await client.query(queries.fetchIsUserRetweetedAndRetweetNum);

        await client.query('COMMIT');

        return result;
    } 
    catch (err) {
        await client.query('ROLLBACK');
        console.log("controller fetchPostRetweetDetail error", err);
    }
    finally {
        client.release();
    }
}

//deletePost
const deletePost = async (post_id) => {
    const client = await pool.connect();
    try {
        await client.query(queries.deletePost, [post_id]);
    } 
    catch(err) {
        console.log("controller deletePost error", err);
    }
    finally {
        client.release();
    }
}

export default {
    //regist
    regist,
    findDup,
    findOne,
    fetchPersonalData,

    //post
    postData,
    fetchPost,
    fetchLostPost,
    
    //user_like
    like_or_dislike,
    fetchPostLikeDetail,
    
    //user_retweet
    retweet_or_disretweet,
    fetchPostRetweetDetail,

    //deletePost
    deletePost,
};