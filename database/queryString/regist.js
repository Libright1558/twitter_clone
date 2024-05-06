const regist =
`INSERT INTO user(firstname, lastname, username, email, password, profilepic) 
VALUES($1, $2, $3, $4, $5, $6)`

export default {
  regist
}
