/*
* Create temporary tables for post data
*/
const likeNum =
`CREATE TEMP TABLE IF NOT EXISTS "lN" (
    "likeNum" INT,
    "postId" UUID
) ON COMMIT DROP`

const retweetNum =
`CREATE TEMP TABLE IF NOT EXISTS "rN" (
    "retweetNum" INT,
    "postId" UUID
) ON COMMIT DROP`

const postData =
`CREATE TEMP TABLE IF NOT EXISTS posd (
    "postId" UUID,
    postby VARCHAR(50),
    content TEXT,
    "createdAt" TIMESTAMP
) ON COMMIT DROP`

const selfLike =
`CREATE TEMP TABLE IF NOT EXISTS "sL" (
    "selfLike" INT,
    "postId" UUID
) ON COMMIT DROP`

const selfRetweet =
`CREATE TEMP TABLE IF NOT EXISTS "sR" (
    "selfRetweet" INT,
    "postId" UUID
) ON COMMIT DROP`

/*
* Append temporary tables
*/
const appendLikeNum =
`INSERT INTO "lN" ("postId", "likeNum")
SELECT posd."postId", COUNT(like_table.username)
FROM posd
LEFT JOIN like_table ON posd."postId" = like_table."postId"
GROUP BY posd."postId"`

const appendRetweetNum =
`INSERT INTO "rN" ("postId", "retweetNum")
SELECT posd."postId", COUNT(retweet_table.username)
FROM posd  
LEFT JOIN retweet_table ON posd."postId" = retweet_table."postId"
GROUP BY posd."postId"`

const appendPostData =
`INSERT INTO posd ("postId", postby, content, "createdAt")
SELECT "postId", postby, content, "createdAt"
FROM post_table WHERE postby = $1`

const appendPostId =
`INSERT INTO posd ("postId", postby)
SELECT "postId", postby
FROM post_table WHERE postby = $1`

const appendSelfLike =
`INSERT INTO "sL" ("postId", "selfLike")
SELECT posd."postId",
(CASE
    WHEN like_table.username IS NULL THEN 0
    ELSE 1
END)
FROM posd
LEFT JOIN like_table ON posd."postId" = like_table."postId" AND like_table.username = $1`

const appendSelfRetweet =
`INSERT INTO "sR" ("postId", "selfRetweet")
SELECT posd."postId", 
(CASE
    WHEN retweet_table.username IS NULL THEN 0
    ELSE 1
END)
FROM posd
LEFT JOIN retweet_table ON posd."postId" = retweet_table."postId" AND retweet_table.username = $1`

/*
* fetch Post data
*/
const fetchPost =
`SELECT posd.postby, posd.content, posd."createdAt", posd."postId", "likeNum", "retweetNum", "selfRetweet", "selfLike", 
firstname, lastname, profilepic
FROM posd
LEFT JOIN "lN" ON posd."postId" = "lN"."postId"
LEFT JOIN "rN" ON posd."postId" = "rN"."postId"
LEFT JOIN "sL" ON posd."postId" = "sL"."postId"
LEFT JOIN "sR" ON posd."postId" = "sR"."postId"
INNER JOIN user_table ON posd.postby = user_table.username`

const fetchLikeNum =
`SELECT "postId", "likeNum" FROM "lN"
WHERE "postId" = $1`

const fetchRetweetNum =
`SELECT "postId", "retweetNum" FROM "rN"
WHERE "postId" = $1`

const fetchSelfLike =
`SELECT "selfLike" FROM "sL"
WHERE "postId" = $1`

const fetchSelfRetweet =
`SELECT "selfRetweet" FROM "sR"
WHERE "postId" = $1`

export default {
  /*
  * Create temporary tables for post data
  */
  likeNum,
  retweetNum,
  postData,
  selfLike,
  selfRetweet,

  /*
  * Append temporary tables
  */
  appendLikeNum,
  appendRetweetNum,
  appendPostData,
  appendPostId,
  appendSelfLike,
  appendSelfRetweet,

  /*
  * fetch Post data
  */
  fetchPost,
  fetchLikeNum,
  fetchRetweetNum,
  fetchSelfLike,
  fetchSelfRetweet
}
