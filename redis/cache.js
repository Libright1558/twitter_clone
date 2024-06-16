import { client } from './init.js';
import { setUserInfoExp, setPostInfoExp } from './transaction.js';

// test if connection is alive
const pingTest = async () => {
    try {
        const response = await client.PING();
        return response;
    } catch (err) {
        console.log('redis pingTest error', err);
    }
};

// set expire
const setUserExpNX = async (times) => {
    try {
        await setUserInfoExp(client, times);
    } catch (err) {
        console.log('redis setUserExpNX error', err);
    }
};

const setPostExpNX = async (userId, times) => {
    try {
        await setPostInfoExp(client, userId, times);
    } catch (err) {
        console.log('redis setPostExpNX error', err);
    }
};

// delete key
const delKey = async (key) => {
    try {
        await client.DEL(key);
    } catch (err) {
        console.log('redis delKey error', err);
    }
};

const delHashField = async (key, field) => {
    try {
        await client.HDEL(key, field);
    } catch (err) {
        console.log('redis delField error', err);
    }
};

export {
    client,

    // test if connection is alive
    pingTest,

    // remove expire and set expire
    setUserExpNX,
    setPostExpNX,

    // delete key
    delKey,
    delHashField
};
