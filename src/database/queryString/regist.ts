const regist =
`INSERT INTO user_table(firstname, lastname, username, email, password, profilepic) 
VALUES($1, $2, $3, $4, $5, $6)`;

const findDup =
`SELECT username, email FROM user_table
WHERE username = $1 OR email = $2`;

const findOne =
`SELECT "userId", username, password FROM user_table
WHERE username = $1 OR email = $1`;

export default {
    regist,
    findDup,
    findOne
};
