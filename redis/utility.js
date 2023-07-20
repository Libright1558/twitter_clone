const pinned = async (username, client, controller) => {
    let isExist = await client.KEYS(username + "_pinned");

    if(!isExist.length) {
        const userPinned = await controller.fetchPinned(username);
        
        const rowLength = userPinned.rows.length;
        for(let i = 0; i < rowLength; i++) {
            await client.hSet(username + "_pinned", userPinned.rows[i].post_id, JSON.stringify(userPinned.rows[i].pinned));
        }
    }        
}

const likePeople = async (username, client, controller) => {
    let isExist = await client.KEYS(username + "_like_people");

    if(!isExist.length) {
        const userLikePeople = await controller.fetchLikePeople(username);

        const rowLength = userLikePeople.rows.length;
        for(let i = 0; i < rowLength; i++) {
            await client.hSet(username + "_like_people", userLikePeople.rows[i].post_id, JSON.stringify(userLikePeople.rows[i].like_people));
        }
    }
}

const retweetPeople = async (username, client, controller) => {
    let isExist = await client.KEYS(username + "_retweet_people");

    if(!isExist.length) {
        const userRetweetPeople = await controller.fetchRetweetPeople(username);

        const rowLength = userRetweetPeople.rows.length;
        for(let i = 0; i < rowLength; i++) {
            await client.hSet(username + "_retweet_people", userRetweetPeople.rows[i].post_id, JSON.stringify(userRetweetPeople.rows[i].retweet_people));
        }
    }
}

const postHashTable = async (username, client) => {
    let isExist = await client.KEYS(username + "_post_hashTable");

    if(!isExist.length) {
        let postWithScores = await client.ZRANGE_WITHSCORES(username + "_post", 0, -1);
        let lengthOfPosts = postWithScores.length;

        for(let i = 0; i < lengthOfPosts; i++) {
            let value = postWithScores[i].value;
            let parsedValue = JSON.parse(value);

            let post_id = parsedValue.post_id;
            let score = postWithScores[i].score;
            await client.hSet(username + "_post_hashTable", post_id, score);
        }
    }
}

const likeHashTable = async (username, client) => {
    let isExist = await client.KEYS(username + "_like_hashTable");

    if(!isExist.length) {
        let likeWithScores = await client.ZRANGE_WITHSCORES(username + "_like", 0, -1);
        let lengthOfLikes = likeWithScores.length;

        for(let i = 0; i < lengthOfLikes; i++) {
            let value = likeWithScores[i].value;
            let parsedValue = JSON.parse(value);

            let post_id = parsedValue.post_id;
            let score = likeWithScores[i].score;
            await client.hSet(username + "_like_hashTable", post_id, score);
        }
    }
}

module.exports = {
    pinned,
    likePeople,
    retweetPeople,
    postHashTable,
    likeHashTable,
}