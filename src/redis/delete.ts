import { client } from './init.js';
import { deletePostInfo } from './transaction.js';

const removePostCache = async (userId: string, postId: string) => {
    try {
        await deletePostInfo(client, userId, postId);
    } catch (err) {
        console.log('redis removePostCache error', err);
    }
};

export {
    removePostCache
};
