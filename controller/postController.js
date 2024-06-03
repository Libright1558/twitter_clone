import express from 'express'
import moment from 'moment'
import { setPostExpNX, delKey } from '../redis/cache.js'
import { getPosts, fetchPostIdArray } from '../redis/get.js'
import { postInfo, selfLikeInfo, selfRetweetInfo } from './databaseController/get.js'
import vanillaSort from '../library/sort/vanillaSort.js'
import { postWriteBack, setPostIdArray } from '../redis/write.js'
import { appendLike, appendRetweet, insertPost } from './databaseController/append.js'
import { updateLikeNums, updateRetweetNums } from '../redis/update.js'
import { removeLike, removePost, removeRetweet } from './databaseController/delete.js'
import { removePostCache } from '../redis/delete.js'
const app = express()

app.use(express.urlencoded({ extended: false }))

const getPost = async (req, res, next) => {
  try {
    const username = req.username
    const userId = req.userId

    const postIdArray = await fetchPostIdArray(userId)
    const post = await getPosts(userId, postIdArray.length !== 0 ? postIdArray : ['null'])

    const obj = {
      userPosts: post
    }

    const fetchList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    if (postIdArray.length !== 0) {
      if (post.content[0] !== null) {
        fetchList[0] = 1
      }

      if (post.createdAt[0] !== null) {
        fetchList[1] = 1
      }

      if (post.likeNums[0] !== null) {
        fetchList[2] = 1
      }

      if (post.retweetNums[0] !== null) {
        fetchList[3] = 1
      }

      if (post.selfLike[0] !== null) {
        fetchList[4] = 1
      }

      if (post.selfRetweet[0] !== null) {
        fetchList[5] = 1
      }

      if (post.postOwner[0] !== null) {
        fetchList[6] = 1
      }

      if (post.firstname[0] !== null) {
        fetchList[7] = 1
      }

      if (post.lastname[0] !== null) {
        fetchList[8] = 1
      }

      if (post.profilepic[0] !== null) {
        fetchList[9] = 1
      }
    }

    let userPosts = await postInfo(username, fetchList)

    const userPostsLen = userPosts?.rows ? userPosts.rows.length : 0

    if (userPostsLen !== 0) {
      userPosts = await vanillaSort(userPosts.rows, 'createdAt')
    }

    const content = []
    const createdAt = []
    const likeNums = []
    const retweetNums = []
    const selfLike = []
    const selfRetweet = []
    const postOwner = []
    const firstname = []
    const lastname = []
    const profilepic = []

    const PostIdArray = []

    for (let i = 0; i < userPostsLen; i++) {
      userPosts[i].createdAt = moment(userPosts[i].createdAt).format('YYYY-MM-DD HH:mm:ss')

      userPosts[i].content = fetchList[0] !== 0 ? post.content[i] : userPosts[i].content
      userPosts[i].createdAt = fetchList[1] !== 0 ? post.createdAt[i] : userPosts[i].createdAt
      userPosts[i].likeNum = fetchList[2] !== 0 ? post.likeNums[i] : userPosts[i].likeNum
      userPosts[i].retweetNum = fetchList[3] !== 0 ? post.retweetNums[i] : userPosts[i].retweetNum
      userPosts[i].selfLike = fetchList[4] !== 0 ? post.selfLike[i] : userPosts[i].selfLike
      userPosts[i].selfRetweet = fetchList[5] !== 0 ? post.selfRetweet[i] : userPosts[i].selfRetweet
      userPosts[i].postby = fetchList[6] !== 0 ? post.postOwner[i] : userPosts[i].postby
      userPosts[i].firstname = fetchList[7] !== 0 ? post.firstname[i] : userPosts[i].firstname
      userPosts[i].lastname = fetchList[8] !== 0 ? post.lastname[i] : userPosts[i].lastname
      userPosts[i].profilepic = fetchList[9] !== 0 ? post.profilepic[i] : userPosts[i].profilepic

      content.push([userPosts[i].postId, userPosts[i].content])
      createdAt.push([userPosts[i].postId, userPosts[i].createdAt])
      likeNums.push([userPosts[i].postId, userPosts[i].likeNum])
      retweetNums.push([userPosts[i].postId, userPosts[i].retweetNum])
      selfLike.push([userPosts[i].postId, userPosts[i].selfLike])
      selfRetweet.push([userPosts[i].postId, userPosts[i].selfRetweet])
      postOwner.push([userPosts[i].postId, userPosts[i].postby])
      firstname.push([userPosts[i].postId, userPosts[i].firstname])
      lastname.push([userPosts[i].postId, userPosts[i].lastname])
      profilepic.push([userPosts[i].postId, userPosts[i].profilepic])

      PostIdArray.push(userPosts[i].postId)
    }

    const postNestObj = {
      content,
      createdAt,
      likeNums,
      retweetNums,
      selfLike,
      selfRetweet,
      postOwner,
      firstname,
      lastname,
      profilepic
    }

    obj.userPosts = userPosts

    const promise = [
      setPostIdArray(userId, PostIdArray),
      postWriteBack(userId, postNestObj, fetchList)
    ]

    await Promise.allSettled(promise)
    await setPostExpNX(userId, 300)

    res.status(200).send(JSON.stringify(obj))
  } catch (err) {
    console.log('posts.js router.get error', err)
  }
}

const writePost = async (req, res, next) => {
  try {
    const postData = req.body
    const userId = req.userId
    postData.postby = req.username
    const result = await insertPost(postData) // result = [ [ { postId, createdAt } ], metadata ]
    const returnedValue = result[0][0] // { postId, createdAt }
    returnedValue.createdAt = moment(returnedValue.createdAt).format('YYYY-MM-DD HH:mm:ss')

    await delKey(userId + '_postIdArray')

    res.status(200).send(JSON.stringify(returnedValue))
  } catch (error) {
    console.log('writePost error', error)
  }
}

const updateLike = async (req, res, next) => {
  try {
    const postId = req.body?.postId
    const username = req.username

    const param = {
      postId,
      username
    }

    const selfLike = await selfLikeInfo(postId, username)?.rows[0]?.selfLike
    let result = null
    if (selfLike === 0) {
      result = await appendLike(param)
    } else {
      result = await removeLike(param)
    }
    const likeNum = result?.likeNumsInfo[0]?.likeNum
    const createdAt = result?.createdAt[0]?.createdAt
    const obj = {
      value: likeNum,
      timestamp: createdAt
    }

    await updateLikeNums(postId, obj, 60)

    res.status(200).send(JSON.stringify(likeNum))
  } catch (error) {
    console.log('updateLike error', error)
  }
}

const updateRetweet = async (req, res, next) => {
  try {
    const postId = req.body?.postId
    const username = req.username

    const param = {
      postId,
      username
    }

    const selfRetweet = await selfRetweetInfo(postId, username)?.rows[0]?.selfRetweet
    let result = null
    if (selfRetweet === 0) {
      result = await appendRetweet(param)
    } else {
      result = await removeRetweet(param)
    }

    const retweetNum = result?.retweetNumsInfo[0]?.retweetNum
    const createdAt = result?.createdAt[0]?.createdAt
    const obj = {
      value: retweetNum,
      timestamp: createdAt
    }

    await updateRetweetNums(postId, obj, 60)

    res.status(200).send(JSON.stringify(retweetNum))
  } catch (error) {
    console.log('updateRetweet error', error)
  }
}

const deletePost = (req, res, next) => {
  try {
    const postId = req.body?.postId
    const userId = req.userId

    const promise = [
      removePost(postId),
      removePostCache(userId, postId)
    ]

    Promise.allSettled(promise)
  } catch (error) {
    console.log('deletePost error', error)
  }
}

export default {
  getPost,
  writePost,
  updateLike,
  updateRetweet,
  deletePost
}
