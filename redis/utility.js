const fetchPostDetail = async (recordsObj, client, username) => {
    const recordLen = recordsObj.length;
    for(let i = 0; i < recordLen; i++) {
        const likenum = JSON.parse(await client.hGet(username + "_likenum", recordsObj[i].post_id));
        const retweetnum = JSON.parse(await client.hGet(username + "_retweetnum", recordsObj[i].post_id));
        const isliked = JSON.parse(await client.hGet(username + "_isliked", recordsObj[i].post_id));
        const isretweeted = JSON.parse(await client.hGet(username + "_isretweeted", recordsObj[i].post_id));

        recordsObj[i].likenum = likenum;
        recordsObj[i].retweetnum = retweetnum;
        recordsObj[i].isliked = isliked;
        recordsObj[i].isretweeted = isretweeted;
    }

    return recordsObj;
}

const setCacheExp = async (username, redis_cache) => {
    await redis_cache.setExp(username + "_likenum", process.env.exp_time);
    await redis_cache.setExp(username + "_retweetnum", process.env.exp_time);
    await redis_cache.setExp(username + "_isretweeted", process.env.exp_time);
    await redis_cache.setExp(username + "_isliked", process.env.exp_time);
}

module.exports = {
    fetchPostDetail,
    setCacheExp,
}