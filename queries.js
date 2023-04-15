//regist
const regist = 'INSERT INTO user_records(firstname, lastname, username, email, password, profilepic) VALUES($1, $2, $3, $4, $5, $6)';
const findDup = 'SELECT username, email FROM user_records WHERE username = $1 OR email = $2';
const findOne = 'SELECT * FROM user_records WHERE username = $1 OR email = $1';

//post
const postData = 'INSERT INTO post_records(postby, content, pinned, ts) VALUES($1, $2, $3, $4)';
const fetchPost = 'SELECT * FROM post_records WHERE postby = $1 ORDER BY ts DESC';
const newPostId = 'SELECT post_id FROM post_records WHERE postby = $1 ORDER BY ts DESC LIMIT 1';

//post_like
const userLike = 'INSERT INTO user_likes(username, post_id, like_ts) VALUES($1, $2, $3)';
const postLike = 'INSERT INTO post_records(likes) VALUES(ARRAY[$1])';
const fetchUserLike = 'SELECT * FROM user_likes WHERE username = $1';

module.exports = {
    regist,
    findDup,
    findOne,
    postData,
    fetchPost,
    newPostId,
    userLike,
    postLike,
    fetchUserLike,
};
