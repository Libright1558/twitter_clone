const controller = require("../controller");

const fetchPostDetail = async (recordsObj, recordsObjIdArray, client, username) => {
    const recordLen = recordsObj.length;

    const [likenum, retweetnum, isliked, isretweeted] = await client
        .multi()
        .HMGET("likenum", recordsObjIdArray)
        .HMGET("retweetnum", recordsObjIdArray)
        .HMGET(username + "_isliked", recordsObjIdArray)
        .HMGET(username + "_isretweeted", recordsObjIdArray)
        .exec();

    // if likenum or isliked doesn't exist, fetching it from database. then writing it back to redis
    if(!likenum || !isliked) {
        const response = await controller.fetchPostLikeDetail(recordsObjIdArray, username);
        const likeNumObj = {};
        const isLikeObj = {};

        for(let i = 0; i < recordLen; i++) {
            likeNumObj[recordsObjIdArray[i]] = response.rows[i].likenum;
            isLikeObj[recordsObjIdArray[i]] = response.rows[i].isliked;

            recordsObj[i].likenum = JSON.parse(response.rows[i].likenum);
            recordsObj[i].isliked = JSON.parse(response.rows[i].isliked);
        }

        await client
        .multi()
        .HSET("likenum", likeNumObj)
        .HSET(username + "_isliked", isLikeObj)
        .exec();
    }

    // if retweetnum or isretweeted doesn't exist, fetching it from database. then writing it back to redis
    if(!retweetnum || !isretweeted) {

    }
    
    for(let i = 0; i < recordLen; i++) {
        if((!likenum || !isliked) && (!retweetnum || !isretweeted)) {
            break;
        }
        if(likenum && isliked) {
            recordsObj[i].likenum = JSON.parse(likenum[i]);
            recordsObj[i].isliked = JSON.parse(isliked[i]);
        }

        if(retweetnum && isretweeted) {
            recordsObj[i].retweetnum = JSON.parse(retweetnum[i]);
            recordsObj[i].isretweeted = JSON.parse(isretweeted[i]);
        }
    }    
    
    return recordsObj;
}

const setCacheExp = async (username, redis_cache) => {
    await redis_cache.setExpNX("likenum", process.env.exp_time);
    await redis_cache.setExpNX("retweetnum", process.env.exp_time);
    await redis_cache.setExpNX(username + "_isretweeted", process.env.exp_time);
    await redis_cache.setExpNX(username + "_isliked", process.env.exp_time);
}

module.exports = {
    fetchPostDetail,
    setCacheExp,
}