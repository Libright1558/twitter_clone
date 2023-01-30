const regist = 'INSERT INTO user_records(firstname, lastname, username, email, password, profilepic) VALUES($1, $2, $3, $4, $5, $6)';
const findDup = 'SELECT username, email FROM user_records WHERE username = $1 OR email = $2';
const findOne = 'SELECT * FROM user_records WHERE username = $1 OR email = $1';
const postData = 'INSERT INTO post_records(postby, content, pinned) VALUES($1, $2, $3)';

module.exports = {
    regist,
    findDup,
    findOne,
    postData,
};
