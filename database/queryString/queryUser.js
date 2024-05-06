const personalData =
`SELECT firstname, lastname, username, email, profilepic FROM user 
WHERE userId = $1`

export default {
  personalData
}
