import sequelize from '../../database/sequelize.js';
import pool from '../../database/pgPool.js';
import deleteString from '../../database/queryString/deletePost.js';
import queryPost from '../../database/queryString/queryPost.js';
import { QueryTypes } from 'sequelize';

const removePost = async (postId) => {
    try {
        await sequelize.query(deleteString.deletePost, {
            bind: [postId],
            type: QueryTypes.DELETE
        });
    } catch (err) {
        console.log('deletePost error: ', err);
    }
};

const removeLike = async (param) => {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(deleteString.deleteLike, [param.postId, param.username]);
            const deletedAt = await client.query('SELECT NOW() AS "deletedAt"');

            await client.query(queryPost.likeNum);

            await client.query(queryPost.appendLikeNum, [param.username]);
            const likeNumsInfo = await client.query(queryPost.fetchLikeNum, [param.postId]);
            await client.query('COMMIT');

            const result = {
                likeNumsInfo: likeNumsInfo.rows,
                deletedAt: deletedAt.rows
            };
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
        } finally {
            client.release();
        }
    } catch (error) {
        console.log('pgPool connection error: ', error);
    }
};

const removeRetweet = async (param) => {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(deleteString.deleteRetweet, [param.postId, param.username]);
            const deletedAt = await client.query('SELECT NOW() AS "deletedAt"');

            await client.query(queryPost.retweetNum);

            await client.query(queryPost.appendRetweetNum, [param.username]);
            const retweetNumsInfo = await client.query(queryPost.fetchRetweetNum, [param.postId]);
            await client.query('COMMIT');

            const result = {
                retweetNumsInfo: retweetNumsInfo.rows,
                deletedAt: deletedAt.rows
            };
            return result;
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
    removePost,
    removeLike,
    removeRetweet
};
