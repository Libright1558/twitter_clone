import { RedisPostIdArray } from '.';
import { PersonalDetail, FetchListArray, PostArrayNest } from '..';
import { client } from './init.js';
import { writePostInfo, writeUserInfo, writePostIdArray } from './transaction.js';

const writePersonalData = async (userId: string, userInfo: PersonalDetail) => {
    try {
        await writeUserInfo(client, userId, userInfo);
    } catch (err) {
        console.log('redis writePersonalData error', err);
    }
};

const postWriteBack = async (userId: string, postInfoObj: PostArrayNest, listArray: FetchListArray) => {
    try {
        await writePostInfo(client, userId, postInfoObj, listArray);
    } catch (err) {
        console.log('redis postWriteBack error', err);
    }
};

const setPostIdArray = async (userId: string, member: RedisPostIdArray) => {
    try {
        const result = await writePostIdArray(client, userId, member);
        return result;
    } catch (err) {
        console.log('redis setPostIdArray error', err);
    }
};

export {
    writePersonalData,
    postWriteBack,
    setPostIdArray
};
