import { RedisPostIdArray } from '.';
import { client } from './init.js';
import { getPostInfo, getUserInfo, getPostIdArray } from './transaction.js';

const fetchPersonalData = async (userId: string) => {
    try {
        const result = await getUserInfo(client, userId);
        return result;
    } catch (err) {
        console.log('redis fetchPersonalData error', err);
    }
};

const getPosts = async (userId: string, postIdArray: RedisPostIdArray) => {
    try {
        const result = await getPostInfo(client, userId, postIdArray);
        return result;
    } catch (err) {
        console.log('redis getPosts error', err);
    }
};

const fetchPostIdArray = async (userId: string) => {
    try {
        const result = await getPostIdArray(client, userId);
        return result;
    } catch (err) {
        console.log('redis fetchPostIdArray error', err);
    }
};

export {
    fetchPersonalData,
    getPosts,
    fetchPostIdArray
};
