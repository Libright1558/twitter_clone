import express from 'express';
import moment from 'moment';
import { Request, Response, FetchListArray, PostArrayNest, QueryResult, getPostArrayType } from '..';
import { selfLikeReturnType, selfRetweetReturnType } from '.';
import { setPostExpNX, delKey } from '../redis/cache.js';
import { getPosts, fetchPostIdArray } from '../redis/get.js';
import { postInfo, selfLikeInfo, selfRetweetInfo } from './databaseController/get.js';
import vanillaSort from '../library/sort/vanillaSort.js';
import { postWriteBack, setPostIdArray } from '../redis/write.js';
import { appendLike, appendRetweet, insertPost } from './databaseController/append.js';
import { updateLikeNums, updateRetweetNums } from '../redis/update.js';
import { removeLike, removePost, removeRetweet } from './databaseController/delete.js';
import { removePostCache } from '../redis/delete.js';
const app = express();

app.use(express.urlencoded({ extended: false }));

const getPost = async (req: Request, res: Response) => {
    try {
        const username = req.headers['username'] as string;
        const userId = req.headers['userId'] as string;

        const postIdArray = await fetchPostIdArray(userId);
        const post = await getPosts(userId, postIdArray?.length !== 0 ? postIdArray : ['null']) as getPostArrayType;

        const fetchList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        if (postIdArray?.length !== 0 && post) {
            if (post.content?.length) {
                fetchList[0] = 1;
            }

            if (post.createdAt?.length) {
                fetchList[1] = 1;
            }

            if (post.likeNums?.length) {
                fetchList[2] = 1;
            }

            if (post.retweetNums?.length) {
                fetchList[3] = 1;
            }

            if (post.selfLike?.length) {
                fetchList[4] = 1;
            }

            if (post.selfRetweet?.length) {
                fetchList[5] = 1;
            }

            if (post.postOwner?.length) {
                fetchList[6] = 1;
            }

            if (post.firstname?.length) {
                fetchList[7] = 1;
            }

            if (post.lastname?.length) {
                fetchList[8] = 1;
            }

            if (post.profilepic?.length) {
                fetchList[9] = 1;
            }
        }

        let postArray;
        let userPosts = await postInfo(username, fetchList as FetchListArray);

        const userPostsLen = userPosts?.rows ? userPosts.rows.length : 0;

        if (userPosts && userPostsLen !== 0) {
            if (postIdArray && fetchList[1] === 1) {
                for (let iter = 0; iter < userPostsLen; ++iter) {
                    const index = postIdArray.indexOf(userPosts.rows[iter].postId);
                    userPosts.rows[iter].createdAt = post.createdAt[index];
                }
            }
            postArray = await vanillaSort(userPosts.rows, 'createdAt');
        } else if (postIdArray && postIdArray.length !== 0) {
            const postIdArrayLength = postIdArray.length;
            postArray = [];
            for (let i = 0; i < postIdArrayLength; i++) {
                const PostsObj = {
                    postId: postIdArray[i],
                    content: post.content[i],
                    createdAt: post.createdAt[i],
                    likeNum: post.likeNums[i],
                    retweetNum: post.retweetNums[i],
                    selfLike: post.selfLike[i],
                    selfRetweet: post.selfRetweet[i],
                    postby: post.postOwner[i],
                    firstname: post.firstname[i],
                    lastname: post.lastname[i],
                    profilepic: post.profilepic[i]
                };
                postArray.push(PostsObj);
            }
        }

        const content = [];
        const createdAt = [];
        const likeNums = [];
        const retweetNums = [];
        const selfLike = [];
        const selfRetweet = [];
        const postOwner = [];
        const firstname = [];
        const lastname = [];
        const profilepic = [];

        const PostIdArray = [] as string[];

        for (let i = 0; i < userPostsLen; i++) {
            postArray![i].createdAt = moment(postArray![i].createdAt).format('YYYY-MM-DD HH:mm:ss');

            postArray![i].content = fetchList[0] !== 0 ? post.content[i] : postArray![i].content;
            postArray![i].createdAt = fetchList[1] !== 0 ? post.createdAt[i] : postArray![i].createdAt;
            postArray![i].likeNum = fetchList[2] !== 0 ? post.likeNums[i] : postArray![i].likeNum;
            postArray![i].retweetNum = fetchList[3] !== 0 ? post.retweetNums[i] : postArray![i].retweetNum;
            postArray![i].selfLike = fetchList[4] !== 0 ? post.selfLike[i] : postArray![i].selfLike;
            postArray![i].selfRetweet = fetchList[5] !== 0 ? post.selfRetweet[i] : postArray![i].selfRetweet;
            postArray![i].postby = fetchList[6] !== 0 ? post.postOwner[i] : postArray![i].postby;
            postArray![i].firstname = fetchList[7] !== 0 ? post.firstname[i] : postArray![i].firstname;
            postArray![i].lastname = fetchList[8] !== 0 ? post.lastname[i] : postArray![i].lastname;
            postArray![i].profilepic = fetchList[9] !== 0 ? post.profilepic[i] : postArray![i].profilepic;

            content.push([postArray![i].postId, postArray![i].content]);
            createdAt.push([postArray![i].postId, postArray![i].createdAt]);
            likeNums.push([postArray![i].postId, postArray![i].likeNum]);
            retweetNums.push([postArray![i].postId, postArray![i].retweetNum]);
            selfLike.push([postArray![i].postId, postArray![i].selfLike]);
            selfRetweet.push([postArray![i].postId, postArray![i].selfRetweet]);
            postOwner.push([postArray![i].postId, postArray![i].postby]);
            firstname.push([postArray![i].postId, postArray![i].firstname]);
            lastname.push([postArray![i].postId, postArray![i].lastname]);
            profilepic.push([postArray![i].postId, postArray![i].profilepic]);

            PostIdArray.push(postArray![i].postId!);
        }

        const postNestObj = {
            content,
            createdAt,
            likeNums,
            retweetNums,
            selfLike,
            selfRetweet,
            postOwner,
            firstname,
            lastname,
            profilepic
        };

        const obj = {
            userPosts: postArray
        };

        const promise = [];

        if (PostIdArray?.length !== 0) {
            promise.push(setPostIdArray(userId, PostIdArray));
        } 

        if (userPostsLen !== 0) {
            promise.push(postWriteBack(userId, postNestObj as PostArrayNest, fetchList as FetchListArray));
        }

        await Promise.allSettled(promise);
        await setPostExpNX(userId, 300);

        res.status(200).send(JSON.stringify(obj));
    } catch (err) {
        console.log('posts.js router.get error', err);
        return res.sendStatus(500);
    }
};

const writePost = async (req: Request, res: Response) => {
    try {
        const postData = req.body;
        const userId = req.headers['userId'] as string;
        postData.postby = req.headers['username'] as string;
        const result = await insertPost(postData) as any; // result = [ [ { postId, createdAt } ], metadata ]
        const returnedValue = result[0][0]; // { postId, createdAt }
        returnedValue.createdAt = moment(returnedValue.createdAt).format('YYYY-MM-DD HH:mm:ss');

        await delKey(userId + '_postIdArray');

        res.status(200).send(JSON.stringify(returnedValue));
    } catch (error) {
        console.log('writePost error', error);
        return res.sendStatus(500);
    }
};

const updateLike = async (req: Request, res: Response) => {
    try {
        const postId = req.body?.postId;
        const username = req.headers['username'] as string;

        const param = {
            postId,
            username
        };

        const queryResult = await selfLikeInfo(postId, username) as QueryResult | undefined;
        const selfLike = queryResult?.rows[0]?.selfLike;
        let result: selfLikeReturnType | undefined;
        if (selfLike === 0) {
            result = await appendLike(param) as selfLikeReturnType | undefined;
        } else {
            result = await removeLike(param) as selfLikeReturnType | undefined;
        }
        const likeNum = result?.likeNumsInfo[0]?.likeNum;
        const createdAt = result?.createdAt[0]?.createdAt;
        const obj = {
            value: likeNum,
            timestamp: createdAt
        };

        await updateLikeNums(postId, obj, 60);

        res.status(200).send(JSON.stringify(likeNum));
    } catch (error) {
        console.log('updateLike error', error);
        return res.sendStatus(500);
    }
};

const updateRetweet = async (req: Request, res: Response) => {
    try {
        const postId = req.body?.postId;
        const username = req.headers['username'] as string;

        const param = {
            postId,
            username
        };

        const queryResult = await selfRetweetInfo(postId, username) as QueryResult | undefined;
        const selfRetweet = await queryResult?.rows[0]?.selfRetweet;
        let result: selfRetweetReturnType | undefined;
        if (selfRetweet === 0) {
            result = await appendRetweet(param) as selfRetweetReturnType | undefined;
        } else {
            result = await removeRetweet(param) as selfRetweetReturnType | undefined;
        }

        const retweetNum = result?.retweetNumsInfo[0]?.retweetNum;
        const createdAt = result?.createdAt[0]?.createdAt;
        const obj = {
            value: retweetNum,
            timestamp: createdAt
        };

        await updateRetweetNums(postId, obj, 60);

        res.status(200).send(JSON.stringify(retweetNum));
    } catch (error) {
        console.log('updateRetweet error', error);
        return res.sendStatus(500);
    }
};

const deletePost = (req: Request, res: Response) => {
    try {
        const postId = req.body?.postId;
        const userId = req.headers['userId'] as string;

        const promise = [
            removePost(postId),
            removePostCache(userId, postId)
        ];

        Promise.allSettled(promise);
        return res.sendStatus(200);
    } catch (error) {
        console.log('deletePost error', error);
        return res.sendStatus(500);
    }
};

export default {
    getPost,
    writePost,
    updateLike,
    updateRetweet,
    deletePost
};
