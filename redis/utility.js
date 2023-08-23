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
    if(likenum[0] === null || isliked[0] === undefined) {
        const response = await controller.fetchPostLikeDetail(recordsObjIdArray, username);
        const likeNumObj = {};
        const isLikeObj = {};
        const tempObj = {};

        const responseLength = response.rows.length;
        for(let i = 0; i < responseLength; i++) {
            tempObj[response.rows[i].post_id] = {
                "likenum": response.rows[i].likenum,
                "isliked": response.rows[i].isliked
            };
        }// construct postid:value pairs

        for(let i = 0; i < recordLen; i++) {
            likeNumObj[recordsObjIdArray[i]] = JSON.stringify(tempObj[recordsObjIdArray[i]].likenum);
            isLikeObj[recordsObjIdArray[i]] = JSON.stringify(tempObj[recordsObjIdArray[i]].isliked);

            recordsObj[i].likenum = JSON.parse(tempObj[recordsObjIdArray[i]].likenum);
            recordsObj[i].isliked = JSON.parse(tempObj[recordsObjIdArray[i]].isliked);
        }

        await client
        .multi()
        .HSET("likenum", likeNumObj)
        .HSET(username + "_isliked", isLikeObj)
        .exec();
    }

    // if retweetnum or isretweeted doesn't exist, fetching it from database. then writing it back to redis
    if(retweetnum[0] === null || isretweeted[0] === undefined) {
        const response = await controller.fetchPostRetweetDetail(recordsObjIdArray, username);
        const retweetNumObj = {};
        const isRetweetObj = {};
        const tempObj = {};

        const responseLength = response.rows.length;
        for(let i = 0; i < responseLength; i++) {
            tempObj[response.rows[i].post_id] = {
                "retweetnum": response.rows[i].retweetnum,
                "isretweeted": response.rows[i].isretweeted
            };
        }// construct postid:value pairs 

        for(let i = 0; i < recordLen; i++) {
            retweetNumObj[recordsObjIdArray[i]] = JSON.stringify(tempObj[recordsObjIdArray[i]].retweetnum);
            isRetweetObj[recordsObjIdArray[i]] = JSON.stringify(tempObj[recordsObjIdArray[i]].isretweeted);

            recordsObj[i].retweetnum = JSON.parse(tempObj[recordsObjIdArray[i]].retweetnum);
            recordsObj[i].isretweeted = JSON.parse(tempObj[recordsObjIdArray[i]].isretweeted);
        }

        await client
        .multi()
        .HSET("retweetnum", retweetNumObj)
        .HSET(username + "_isretweeted", isRetweetObj)
        .exec();
    }
    
    for(let i = 0; i < recordLen; i++) {
        if((likenum === null || isliked === undefined) && (retweetnum === null || isretweeted === undefined)) {
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