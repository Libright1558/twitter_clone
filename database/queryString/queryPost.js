/*
* Create temporary tables for post data
*/
const likeRetweetNum =
`CREATE TEMPORARY TABLE IF NOT EXISTS lRN (
    likeNum INT,
    retweetNum INT,
    postId UUID
) ON COMMIT DROP`

const postData =
`CREATE TEMPORARY TABLE IF NOT EXISTS pD (
    postId UUID,
    postby VARCHAR(50),
    content TEXT,
    createdAt TIMESTAMP
) ON COMMIT DROP`

const selfLikeRetweet =
`CREATE TEMPORARY TABLE IF NOT EXISTS sLR (
    selfLike BOOLEAN,
    selfRetweet BOOLEAN,
    postId UUID
) ON COMMIT DROP`

/*
* Append temporary tables
*/
const appendLikeRetweetNum =
`INSERT INTO lRN (postId, retweetNum, likeNum)
SELECT pD.postId, COUNT(retweet.username), COUNT(like.username)
FROM pD
LEFT JOIN like ON pD.postId = like.postId  
LEFT JOIN retweet ON pD.postId = retweet.postId
GROUP BY pD.postId`

const appendPostData =
`INSERT INTO pD (postId, postby, content, createdAt)
SELECT postId, postby, content, createdAt
FROM post WHERE postby = $1`

const appendSelfLikeRetweet =
`INSERT INTO sLR (postId, selfRetweet, selfLike)
SELECT pD.postId, 
(CASE
    WHEN retweet.username IS NULL THEN false
    ELSE true
END), 
(CASE
    WHEN like.username IS NULL THEN false
    ELSE true
END)
FROM pD
LEFT JOIN like ON pD.postId = like.postId AND like.username = $1
LEFT JOIN retweet ON pD.postId = retweet.postId AND retweet.username = $1`

/*
* Post data
*/
const fetchPost =
`SELECT pD.postby, content, createdAt, pD.postId, likeNum, retweetNum, selfRetweet, selfLike, 
firstname, lastname, profilepic
FROM pD
INNER JOIN lRN ON pD.postId = lRN.postId
INNER JOIN sLR ON pD.postId = sLR.postId
INNER JOIN user ON pD.postby = user.username`

export default {
  likeRetweetNum,
  postData,
  selfLikeRetweet,
  appendLikeRetweetNum,
  appendPostData,
  appendSelfLikeRetweet,
  fetchPost
}
