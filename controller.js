const pool = require("./database");
const queries = require("./queries");

const regist = (param) => {
    return pool.query(queries.regist, param);   
}

const findDup = (username, email) => {
    return pool.query(queries.findDup, [username, email]);
}

const findOne = (username_or_email) => {
    return pool.query(queries.findOne, [username_or_email]);
}

const postData = (postData) => {
    return pool.query(queries.postData, postData);
}

module.exports = {
    regist,
    findDup,
    findOne,
    postData,
};