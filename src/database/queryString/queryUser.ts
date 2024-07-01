const personalData =
`SELECT firstname, lastname, username, email, profilepic FROM user_table 
WHERE "userId" = $1`;

export default {
    personalData
};
