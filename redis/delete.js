import { client } from './init.js';
import { deletePostInfo } from './transaction.js';

const removePostCache = async (userId, postId) => {
    try {
        await deletePostInfo(client, userId, postId);
    } catch (err) {
        console.log('redis removePostCache error', err);
    }
};

export {
    removePostCache
};
