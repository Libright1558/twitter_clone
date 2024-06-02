const getUserInfo = async (client, userId) => {
  const [firstname, lastname, username, email, profilepic] = await client
    .multi()
    .HGET('firstname', userId)
    .HGET('lastname', userId)
    .HGET('username', userId)
    .HGET('email', userId)
    .HGET('profilepic', userId)
    .exec()

  const obj = {
    firstname,
    lastname,
    username,
    email,
    profilepic
  }

  return obj
}

const getPostInfo = async (client, userId, postIdArray) => {
  const [postOwner, content, createdAt, likeNums, retweetNums, selfLike, selfRetweet] = await client
    .multi()
    .HMGET('postOwner', postIdArray)
    .HMGET('content', postIdArray)
    .HMGET('createdAt', postIdArray)
    .HMGET('likeNums', postIdArray)
    .HMGET('retweetNums', postIdArray)
    .HMGET(userId + '_selfLike', postIdArray)
    .HMGET(userId + '_selfRetweet', postIdArray)
    .exec()

  const obj = {
    postOwner,
    content,
    createdAt,
    likeNums,
    retweetNums,
    selfLike,
    selfRetweet
  }

  return obj
}

const getPostIdArray = async (client, userId) => {
  const result = await client.LRANGE(userId + '_postIdArray', 0, -1)
  return result
}

const writeUserInfo = async (client, userId, userInfo) => {
  await client
    .multi()
    .HSETNX('firstname', userId, userInfo.firstname)
    .HSETNX('lastname', userId, userInfo.lastname)
    .HSETNX('username', userId, userInfo.username)
    .HSETNX('email', userId, userInfo.email)
    .HSETNX('profilepic', userId, userInfo.profilepic)
    .exec()
}

/*
* postNestObj =
* {
*  postOwner: [ [ postId1,'value1' ], [ postId2, 'value2' ], ... ],
*  content: [ [ postId1,'value1' ], [ postId2, 'value2' ], ... ],
*  createdAt: [ [ postId1,'value1' ], [ postId2, 'value2' ], ... ],
*  likeNums: [ [ postId1, number1 ], [ postId2, number2 ], ... ],
*  retweetNums: [ [ postId1, number1 ], [ postId2, number2 ], ... ],
*  _selfLike: [ [ postId1, boolean1 ], [ postId2, boolean2 ], ... ],
*  _selfRetweet: [ [ postId1, boolean1 ], [ postId2, boolean2 ], ... ]
* }
*
* listArray =
* [
*  content,
*  createdAt,
*  likeNums,
*  retweetNums,
*  selfLike,
*  selfRetweet
* ]
*
* To check which one is absent in the redis cache
* then set it
* 0: absent, 1: present
*/
const writePostInfo = async (client, userId, postNestObj, listArray) => {
  if (!listArray[0] || !listArray[1]) {
    await client
      .multi()
      .HSET('postOwner', postNestObj.postOwner)
      .HSET('content', postNestObj.content)
      .HSET('createdAt', postNestObj.createdAt)
      .exec()
  }

  if (!listArray[2]) {
    await client.HSET('likeNums', postNestObj.likeNums)
  }

  if (!listArray[3]) {
    await client.HSET('retweetNums', postNestObj.retweetNums)
  }

  if (!listArray[4]) {
    await client.HSET(userId + '_selfLike', postNestObj.selfLike)
  }

  if (!listArray[5]) {
    await client.HSET(userId + '_selfRetweet', postNestObj.selfRetweet)
  }
}

// member is an array
const writePostIdArray = async (client, userId, member) => {
  await client.RPUSH(userId + '_postIdArray', member)
}

/*
* expTime => lock expire time
*
* obj =
* {
*  value,
*  timestamp
* }
*/
const renewLikeNums = async (client, postId, obj, expTime) => {
  await client
    .multi()
    .SETNX(postId + 'postLikeNums', obj.timestamp)
    .expire(postId + 'postLikeNums', expTime)
    .HSETNX('retweetNums', postId, obj.value)
    .exec()

  await client.WATCH(postId + 'postLikeNums')
  const timestamp = await client.GET(postId + 'postLikeNums')
  if (timestamp <= obj.timestamp) {
    await client
      .multi()
      .SETNX(postId + 'postLikeNums', obj.timestamp)
      .expire(postId + 'postLikeNums', expTime)
      .HSET('likeNums', [[postId, obj.value]])
      .exec()
  } else {
    client.UNWATCH(postId + 'postLikeNums')
  }
}

/*
* expTime => lock expire time
*
* obj =
* {
*  value,
*  timestamp
* }
*/
const renewRetweetNums = async (client, postId, obj, expTime) => {
  await client
    .multi()
    .SETNX(postId + 'postRetweetNums', obj.timestamp)
    .expire(postId + 'postRetweetNums', expTime)
    .HSETNX('retweetNums', postId, obj.value)
    .exec()

  await client.WATCH(postId + 'postRetweetNums')
  const timestamp = await client.GET(postId + 'postRetweetNums')
  if (timestamp <= obj.timestamp) {
    await client
      .multi()
      .SETNX(postId + 'postRetweetNums', obj.timestamp)
      .expire(postId + 'postRetweetNums', expTime)
      .HSET('retweetNums', [[postId, obj.value]])
      .exec()
  } else {
    client.UNWATCH(postId + 'postRetweetNums')
  }
}

const deletePostInfo = async (client, userId, postId) => {
  await client
    .multi()
    .HDEL('postOwner', postId)
    .HDEL('content', postId)
    .HDEL('createdAt', postId)
    .HDEL('likeNums', postId)
    .HDEL('retweetNums', postId)
    .HDEL(userId + '_selfLike', postId)
    .HDEL(userId + '_selfRetweet', postId)
    .exec()
}

const setUserInfoExp = async (client, times) => {
  await client
    .multi()
    .expire('firstname', times, 'NX')
    .expire('lastname', times, 'NX')
    .expire('username', times, 'NX')
    .expire('email', times, 'NX')
    .expire('profilepic', times, 'NX')
    .exec()
}

const setPostInfoExp = async (client, userId, times) => {
  await client
    .multi()
    .expire('postOwner', times, 'NX')
    .expire('content', times, 'NX')
    .expire('createdAt', times, 'NX')
    .expire('likeNums', times, 'NX')
    .expire('retweetNums', times, 'NX')
    .expire(userId + '_selfLike', times, 'NX')
    .expire(userId + '_selfRetweet', times, 'NX')
    .expire(userId + '_postIdArray', times, 'NX')
    .exec()
}

export {
  getUserInfo,
  getPostInfo,
  getPostIdArray,
  writeUserInfo,
  writePostInfo,
  writePostIdArray,
  renewLikeNums,
  renewRetweetNums,
  deletePostInfo,
  setUserInfoExp,
  setPostInfoExp
}
