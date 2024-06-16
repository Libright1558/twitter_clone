import sequelize from '../../database/sequelize.js';
import pool from '../../database/pgPool.js';
import queryUser from '../../database/queryString/queryUser.js';
import queryPost from '../../database/queryString/queryPost.js';
import { QueryTypes } from 'sequelize';

const userInfo = async (userId) => {
    try {
        const userResult = await sequelize.query(
            queryUser.personalData, {
                bind: [userId],
                type: QueryTypes.SELECT
            }
        );
        return userResult;
    } catch (err) {
        console.log('sequelize userInfo error: ', err);
    }
};

/*
* fetchList =
* [
*  content,
*  createAt,
*  likeNums,
*  retweetNums,
*  selfLike,
*  selfRetweet,
*  postby,
*  firstname,
*  lastname,
*  profilepic
* ]
*
* To check which one is absent in the redis cache
* then query it
* 0: absent, 1: present
*/
const postInfo = async (username, fetchList) => {
    try {
        if (fetchList[0] === 1 && fetchList[1] === 1 &&
      fetchList[2] === 1 && fetchList[3] === 1 &&
      fetchList[4] === 1 && fetchList[5] === 1 &&
      fetchList[6] === 1 && fetchList[7] === 1 &&
      fetchList[8] === 1 && fetchList[9] === 1) {
            return null;
        }
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const promise = [
                client.query(queryPost.postOwner),
                client.query(queryPost.postContent),
                client.query(queryPost.postTime),
                client.query(queryPost.postFirstname),
                client.query(queryPost.postLastname),
                client.query(queryPost.postProfilepic),
                client.query(queryPost.likeNum),
                client.query(queryPost.retweetNum),
                client.query(queryPost.selfLike),
                client.query(queryPost.selfRetweet)
            ];

            await Promise.allSettled(promise);

            if (!fetchList[0]) {
                await client.query(queryPost.appendPostContent, [username]);
            }

            if (!fetchList[1]) {
                await client.query(queryPost.appendPostTime, [username]);
            }

            if (!fetchList[2]) {
                await client.query(queryPost.appendLikeNum, [username]);
            }

            if (!fetchList[3]) {
                await client.query(queryPost.appendRetweetNum, [username]);
            }

            if (!fetchList[4]) {
                await client.query(queryPost.appendSelfLike, [username]);
            }

            if (!fetchList[5]) {
                await client.query(queryPost.appendSelfRetweet, [username]);
            }

            if (!fetchList[6]) {
                await client.query(queryPost.appendPostOwner, [username]);
            }

            if (!fetchList[7]) {
                await client.query(queryPost.appendPostFirstname, [username]);
            }

            if (!fetchList[8]) {
                await client.query(queryPost.appendPostLastname, [username]);
            }

            if (!fetchList[9]) {
                await client.query(queryPost.appendPostProfilepic, [username]);
            }

            const postResult = await client.query(queryPost.fetchPost, [username]);

            await client.query('COMMIT');
            return postResult;
        } catch (err) {
            await client.query('ROLLBACK');
            console.log('postInfo error: ', err);
        } finally {
            client.release();
        }
    } catch (err) {
        console.log('pgPool connection error: ', err);
    }
};

const selfLikeInfo = async (postId, username) => {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(queryPost.selfLike);

            await client.query(queryPost.appendSelfLike, [username]);
            const postResult = await client.query(queryPost.fetchSelfLike, [postId]);

            await client.query('COMMIT');
            return postResult;
        } catch (error) {
            await client.query('ROLLBACK');
        } finally {
            client.release();
        }
    } catch (error) {
        console.log('pgPool connection error: ', error);
    }
};

const selfRetweetInfo = async (postId, username) => {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(queryPost.selfRetweet);

            await client.query(queryPost.appendSelfRetweet, [username]);
            const postResult = await client.query(queryPost.fetchSelfRetweet, [postId]);

            await client.query('COMMIT');
            return postResult;
        } catch (error) {
            await client.query('ROLLBACK');
        } finally {
            client.release();
        }
    } catch (error) {
        console.log('pgPool connection error: ', error);
    }
};

export {
    userInfo,
    postInfo,
    selfLikeInfo,
    selfRetweetInfo
};
