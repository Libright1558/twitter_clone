//create temporary tables
const LikeAndRetweet = 
`CREATE TEMPORARY TABLE IF NOT EXISTS temp1 (
    LikeNum INT,
    RetweetNum INT,
    post_id UUID
) ON COMMIT DROP`;

const postRecords = 
`CREATE TEMPORARY TABLE IF NOT EXISTS temp2 (
    post_id UUID,
    postby VARCHAR(50),
    content TEXT,
    ts TIMESTAMP
) ON COMMIT DROP`;

const isUserRetweetAndLike =
`CREATE TEMPORARY TABLE IF NOT EXISTS temp3 (
    isLiked BOOLEAN,
    isRetweeted BOOLEAN,
    post_id UUID
) ON COMMIT DROP`;

const LikeNumTable = 
`CREATE TEMPORARY TABLE IF NOT EXISTS temp4 (
    LikeNum INT,
    post_id UUID
) ON COMMIT DROP`;

const isLikedTable = 
`CREATE TEMPORARY TABLE IF NOT EXISTS temp5 (
    isLiked BOOLEAN,
    post_id UUID
) ON COMMIT DROP`;

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

const getUserRetweetAndLike =
`INSERT INTO temp3 (post_id, isRetweeted, isLiked)
SELECT t2.post_id, 
(CASE
    WHEN ur.username IS NULL THEN false
    ELSE true
END), 
(CASE
    WHEN ul.username IS NULL THEN false
    ELSE true
END)
FROM temp2 t2
LEFT JOIN user_likes ul ON t2.post_id = ul.post_id AND ul.username = $1
LEFT JOIN user_retweets ur ON t2.post_id = ur.post_id AND ur.username = $1`;


//post
const fetchPost = 
`SELECT postby, content, ts, t2.post_id, LikeNum, RetweetNum, isRetweeted, isLiked
FROM temp2 t2
INNER JOIN temp1 t1 ON t2.post_id = t1.post_id
INNER JOIN temp3 t3 ON t2.post_id = t3.post_id`;

//regist
const regist = 'INSERT INTO user_records(firstname, lastname, username, email, password, profilepic) VALUES($1, $2, $3, $4, $5, $6)';
const findDup = 'SELECT username, email FROM user_records WHERE username = $1 OR email = $2';
const findOne = 'SELECT * FROM user_records WHERE username = $1 OR email = $1';

//insertPost
const postData = 'INSERT INTO post_records(postby, content, ts) VALUES($1, $2, $3)';
const newPostId = 'SELECT post_id FROM post_records WHERE postby = $1 ORDER BY ts DESC LIMIT 1';

//user_like
const like_or_dislike = `SELECT isLiked, likeNum FROM like_or_dislike($1, $2)`;

const pre_LikeNum = 
`WITH tempIdTable(post_id) AS (
    SELECT unnest($1::UUID[])
)
INSERT INTO temp4 (post_id, LikeNum)
SELECT ti.post_id, COUNT(ul.username)
FROM tempIdTable ti
LEFT JOIN user_likes ul ON ul.post_id = ti.post_id
GROUP BY ti.post_id`;

const pre_isLiked = 
`WITH tempIdTable(post_id) AS (
    SELECT unnest($1::UUID[])
)
INSERT INTO temp5 (post_id, isLiked)
SELECT ti.post_id, 
(
CASE
    WHEN ul.username IS NULL
    THEN false
    ELSE true
END
) FROM tempIdTable ti
LEFT JOIN user_likes ul ON ul.post_id = ti.post_id AND ul.username = $2`;

const fetchIsUserLikedAndLikeNum = 
`SELECT isLiked, LikeNum
FROM temp4 t4
INNER JOIN temp5 t5 ON t4.post_id = t5.post_id`;

//user_retweet
// const userRetweet = 'INSERT INTO user_retweets(username, post_id) VALUES($1, $2)';
// const delUserRetweet = 'DELETE FROM user_retweets WHERE username = $1 AND post_id = $2';

module.exports = {
    //create temporary table
    LikeAndRetweet,
    postRecords,
    isUserRetweetAndLike,
    LikeNumTable,
    isLikedTable,

    //temporary queries
    preFetchPost,
    getPostDetail,
    getUserRetweetAndLike,

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
    like_or_dislike,
    pre_LikeNum,
    pre_isLiked,
    fetchIsUserLikedAndLikeNum,

    //user_retweet
    // userRetweet,
    // delUserRetweet,
};
