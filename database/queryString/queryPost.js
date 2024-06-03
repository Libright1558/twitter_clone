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

const postOwner =
`CREATE TEMP TABLE IF NOT EXISTS "pOwn" (
    postby VARCHAR(50),
    "postId" UUID
) ON COMMIT DROP`

const postContent =
`CREATE TEMP TABLE IF NOT EXISTS "pCon" (
    content TEXT,
    "postId" UUID
) ON COMMIT DROP`

const postTime =
`CREATE TEMP TABLE IF NOT EXISTS "pT" (
    "createdAt" TIMESTAMP,
    "postId" UUID
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

const postFirstname =
`CREATE TEMP TABLE IF NOT EXISTS "pFn" (
    firstname VARCHAR(50),
    "postId" UUID
) ON COMMIT DROP`

const postLastname =
`CREATE TEMP TABLE IF NOT EXISTS "pLn" (
    lastname VARCHAR(50),
    "postId" UUID
) ON COMMIT DROP`

const postProfilepic =
`CREATE TEMP TABLE IF NOT EXISTS "postPropic" (
    profilepic TEXT,
    "postId" UUID
) ON COMMIT DROP`

/*
* Append temporary tables
*/
const appendLikeNum =
`INSERT INTO "lN" ("postId", "likeNum")
SELECT post_table."postId", COUNT(like_table.username)
FROM post_table
LEFT JOIN like_table ON post_table."postId" = like_table."postId"
WHERE postby = $1
GROUP BY post_table."postId"`

const appendRetweetNum =
`INSERT INTO "rN" ("postId", "retweetNum")
SELECT post_table."postId", COUNT(retweet_table.username)
FROM post_table 
LEFT JOIN retweet_table ON post_table."postId" = retweet_table."postId"
WHERE postby = $1
GROUP BY post_table."postId"`

const appendPostOwner =
`INSERT INTO "pOwn" ("postId", postby)
SELECT "postId", postby
FROM post_table WHERE postby = $1`

const appendPostContent =
`INSERT INTO "pCon" ("postId", content)
SELECT "postId", content
FROM post_table WHERE postby = $1`

const appendPostTime =
`INSERT INTO "pT" ("postId", "createdAt")
SELECT "postId", "createdAt"
FROM post_table WHERE postby = $1`

const appendSelfLike =
`INSERT INTO "sL" ("postId", "selfLike")
SELECT post_table."postId",
(CASE
    WHEN like_table.username IS NULL THEN 0
    ELSE 1
END)
FROM post_table
LEFT JOIN like_table ON post_table."postId" = like_table."postId" AND postby = like_table.username
WHERE postby = $1`

const appendSelfRetweet =
`INSERT INTO "sR" ("postId", "selfRetweet")
SELECT post_table."postId", 
(CASE
    WHEN retweet_table.username IS NULL THEN 0
    ELSE 1
END)
FROM post_table
LEFT JOIN retweet_table ON post_table."postId" = retweet_table."postId" AND postby = retweet_table.username
WHERE postby = $1`

const appendPostFirstname =
`INSERT INTO "pFn" ("postId", firstname)
SELECT "postId", firstname
FROM post_table
INNER JOIN user_table ON postby = username
WHERE postby = $1`

const appendPostLastname =
`INSERT INTO "pLn" ("postId", lastname)
SELECT "postId", lastname
FROM post_table 
INNER JOIN user_table ON postby = username
WHERE postby = $1`

const appendPostProfilepic =
`INSERT INTO "postPropic" ("postId", profilepic)
SELECT "postId", profilepic
FROM post_table 
INNER JOIN user_table ON postby = username
WHERE postby = $1`

/*
* fetch Post data
*/
const fetchPost =
`SELECT "pOwn".postby, "pCon".content, "pT"."createdAt", post_table."postId", "likeNum", "retweetNum", "selfRetweet", "selfLike", 
firstname, lastname, profilepic
FROM post_table
LEFT JOIN "lN" ON post_table."postId" = "lN"."postId"
LEFT JOIN "rN" ON post_table."postId" = "rN"."postId"
LEFT JOIN "sL" ON post_table."postId" = "sL"."postId"
LEFT JOIN "sR" ON post_table."postId" = "sR"."postId"
LEFT JOIN "pOwn" ON post_table."postId" = "pOwn"."postId"
LEFT JOIN "pCon" ON post_table."postId" = "pCon"."postId"
LEFT JOIN "pT" ON post_table."postId" = "pT"."postId"
LEFT JOIN "pFn" ON post_table."postId" = "pFn"."postId"
LEFT JOIN "pLn" ON post_table."postId" = "pLn"."postId"
LEFT JOIN "postPropic" ON post_table."postId" = "postPropic"."postId"
WHERE post_table.postby = $1`

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
  postOwner,
  postContent,
  postTime,
  selfLike,
  selfRetweet,
  postFirstname,
  postLastname,
  postProfilepic,

  /*
  * Append temporary tables
  */
  appendLikeNum,
  appendRetweetNum,
  appendPostOwner,
  appendPostContent,
  appendPostTime,
  appendSelfLike,
  appendSelfRetweet,
  appendPostFirstname,
  appendPostLastname,
  appendPostProfilepic,

  /*
  * fetch Post data
  */
  fetchPost,
  fetchLikeNum,
  fetchRetweetNum,
  fetchSelfLike,
  fetchSelfRetweet
}
