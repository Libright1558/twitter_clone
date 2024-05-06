const appendPostData =
`INSERT INTO post(postby, content) VALUES($1, $2) 
RETURNING postId`

export default {
  appendPostData
}
