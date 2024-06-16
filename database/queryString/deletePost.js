const deletePost =
`DELETE FROM post_table 
WHERE "postId" = $1`;

const deleteLike = 'DELETE FROM like_table WHERE "postId" = $1 AND username = $2';

const deleteRetweet = 'DELETE FROM retweet_table WHERE "postId" = $1 AND username = $2';

export default {
    deletePost,
    deleteLike,
    deleteRetweet
};
