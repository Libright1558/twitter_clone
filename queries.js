//regist
const regist = 'INSERT INTO user_records(firstname, lastname, username, email, password, profilepic) VALUES($1, $2, $3, $4, $5, $6)';
const findDup = 'SELECT username, email FROM user_records WHERE username = $1 OR email = $2';
const findOne = 'SELECT * FROM user_records WHERE username = $1 OR email = $1';

//post
const postData = 'INSERT INTO post_records(postby, content, pinned, ts) VALUES($1, $2, $3, $4)';

const fetchPost = 'SELECT * FROM post_records WHERE postby = $1 AND belong_to IS NULL ORDER BY ts DESC';
const fetchPinned = 'SELECT post_id, pinned FROM post_records WHERE postby = $1 AND belong_to IS NULL ORDER BY ts DESC';
const fetchLikePeople = 'SELECT post_id, like_people FROM post_records WHERE postby = $1 AND belong_to IS NULL ORDER BY ts DESC';
const fetchRetweetPeople = 'SELECT post_id, retweet_people FROM post_records WHERE postby = $1 AND belong_to IS NULL ORDER BY ts DESC';

const newPostId = 'SELECT post_id FROM post_records WHERE postby = $1 AND belong_to IS NULL ORDER BY ts DESC LIMIT 1';

const insertLikePeople = 'UPDATE post_records SET like_people = ARRAY_APPEND(like_people, $1) WHERE post_id = $2';
const removeLikePeople = 'UPDATE post_records SET like_people = ARRAY_REMOVE(like_people, $1) WHERE post_id = $2';

const insertRetweetPeople = 'UPDATE post_records SET retweet_people = ARRAY_APPEND(retweet_people, $1) WHERE post_id = $2';
const removeRetweetPeople = 'UPDATE post_records SET retweet_people = ARRAY_REMOVE(retweet_people, $1) WHERE post_id = $2';

//user_like
const userLike = 'INSERT INTO user_likes(username, post_id) VALUES($1, $2)';
const delUserLike = 'DELETE FROM user_likes WHERE username = $1 AND post_id = $2';
const fetchUserLike = 'SELECT p.postby, p.content, p.ts, p.post_id, u.like_ts FROM post_records AS p, user_likes AS u WHERE u.username = $1 AND p.post_id = u.post_id ORDER BY u.like_ts DESC';

//user_retweet
const userRetweet = 'INSERT INTO user_retweets(username, post_id) VALUES($1, $2)';
const delUserRetweet = 'DELETE FROM user_retweets WHERE username = $1 AND post_id = $2';
const fetchUserRetweet = 'SELECT p.postby, p.content, p.ts, p.post_id, u.retweet_ts FROM post_records AS p, user_retweets AS u WHERE u.username = $1 AND p.post_id = u.post_id ORDER BY u.retweet_ts DESC';

module.exports = {
    //regist
    regist,
    findDup,
    findOne,

    //post
    postData,

    fetchPost,
    fetchPinned,
    fetchLikePeople,
    fetchRetweetPeople,

    newPostId,

    insertLikePeople,
    removeLikePeople,

    insertRetweetPeople,
    removeRetweetPeople,

    //user_like
    userLike,
    delUserLike,
    fetchUserLike,

    //user_retweet
    userRetweet,
    delUserRetweet,
    fetchUserRetweet,
};
