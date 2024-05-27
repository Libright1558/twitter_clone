const appendPostData =
`INSERT INTO post_table(postby, content) VALUES($1, $2) 
RETURNING "postId", "createdAt"`

const addLike =
`INSERT INTO like_table("postId", username) 
VALUES($1, $2) RETURNING "createdAt"`

const addRetweet =
`INSERT INTO retweet_table("postId", username) 
VALUES($1, $2) RETURNING "createdAt"`

export default {
  appendPostData,
  addLike,
  addRetweet
}
