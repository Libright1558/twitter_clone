//create temporary tables
const LikeAndRetweet = 
`CREATE TEMPORARY TABLE temp1 (
    LikeNum INT,
    RetweetNum INT,
    post_id UUID
) ON COMMIT DELETE ROWS`;

const postRecords = 
`CREATE TEMPORARY TABLE temp2 (
    post_id UUID,
    postby VARCHAR(50),
    content TEXT,
    ts TIMESTAMP
) ON COMMIT DELETE ROWS`;

//temporary queries
const preFetchPost = 
`INSERT INTO temp2 (post_id, postby, content, ts)
SELECT post_id, postby, content, ts
FROM post_records WHERE postby = $1`;

const getPostDetail = 
`INSERT INTO temp1 (post_id, RetweetNum, LikeNum)
SELECT t2.post_id, COUNT(ur.username), COUNT(ul.username)
FROM temp2 t2
LEFT JOIN user_likes ul ON t2.post_id = ul.post_id  
LEFT JOIN user_retweets ur ON t2.post_id = ur.post_id
GROUP BY t2.post_id`;

//post
const fetchPost = 
`SELECT postby, content, ts, t2.post_id, LikeNum, RetweetNum 
FROM temp2 t2
INNER JOIN temp1 t1 ON t2.post_id = t1.post_id
ORDER BY ts DESC`;

//regist
const regist = 'INSERT INTO user_records(firstname, lastname, username, email, password, profilepic) VALUES($1, $2, $3, $4, $5, $6)';
const findDup = 'SELECT username, email FROM user_records WHERE username = $1 OR email = $2';
const findOne = 'SELECT * FROM user_records WHERE username = $1 OR email = $1';

//insertPost
const postData = 'INSERT INTO post_records(postby, content, ts) VALUES($1, $2, $3)';
// const fetchPinned = 'SELECT post_id FROM post_records WHERE postby = $1 AND post_id IN (SELECT post_id FROM pinned_posts)';
const newPostId = 'SELECT post_id FROM post_records WHERE postby = $1 ORDER BY ts DESC LIMIT 1';

//user_like
const userLike = 'INSERT INTO user_likes(username, post_id) VALUES($1, $2)';
const delUserLike = 'DELETE FROM user_likes WHERE username = $1 AND post_id = $2';
const fetchUserLike = 'SELECT p.postby, p.content, p.ts, p.post_id, u.like_ts FROM post_records AS p, user_likes AS u WHERE u.username = $1 AND p.post_id = u.post_id ORDER BY u.like_ts DESC';

//user_retweet
const userRetweet = 'INSERT INTO user_retweets(username, post_id) VALUES($1, $2)';
const delUserRetweet = 'DELETE FROM user_retweets WHERE username = $1 AND post_id = $2';
const fetchUserRetweet = 
`SELECT p.postby, p.content, p.ts, p.post_id, u.retweet_ts 
FROM post_records p 
INNER JOIN user_retweets u ON p.post_id = u.post_id
WHERE u.username = $1 
ORDER BY u.retweet_ts DESC`;

module.exports = {
    //create temporary table
    LikeAndRetweet,
    postRecords,

    //temporary queries
    preFetchPost,
    getPostDetail,

    //post
    fetchPost,

    //regist
    regist,
    findDup,
    findOne,

    //insertPost
    postData,
    newPostId,

    //user_like
    userLike,
    delUserLike,
    fetchUserLike,

    //user_retweet
    userRetweet,
    delUserRetweet,
    fetchUserRetweet,
};
