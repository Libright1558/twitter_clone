import express from 'express'
import moment from 'moment'
import { setPostExpNX } from '../redis/cache.js'
import { getPosts } from '../redis/get.js'
import { postInfo } from './databaseController/get.js'
import vanillaSort from '../library/sort/vanillaSort.js'
import { postWriteBack } from '../redis/write.js'
const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const getPost = async (req, res, next) => {
  try {
    const username = req.username
    const userId = req.userId

    const postIdArray = await getPostIdArray(username) // not implement yet
    const post = await getPosts(postIdArray)

    const obj = {
      userPosts: post
    }

    const fetchList = [0, 0, 0, 0, 0, 0]

    if (postIdArray.length !== 0) {
      if (post.postOwner && post.content) {
        fetchList[0] = 1
      }

      // if (post.createdAt) {
      //   fetchList[1] = 1
      // }  Will be removed later

      if (post.likeNums) {
        fetchList[2] = 1
      }

      if (post.retweetNums) {
        fetchList[3] = 1
      }

      if (post.selfLike) {
        fetchList[4] = 1
      }

      if (post.selfRetweet) {
        fetchList[5] = 1
      }
    }

    let userPosts = await postInfo(username, fetchList)

    const userPostsLen = userPosts.rows ? userPosts.rows.length : 0

    if (userPostsLen !== 0) {
      userPosts = await vanillaSort(userPosts.rows, 'createdAt')
    }

    const postOwner = []
    const content = []
    const createdAt = []
    const likeNums = []
    const retweetNums = []
    const selfLike = []
    const selfRetweet = []

    for (let i = 0; i < userPostsLen; i++) {
      userPosts.rows[i].createdAt = moment(userPosts.rows[i].createdAt).format('YYYY-MM-DD HH:mm:ss')

      userPosts.rows[i].postby = fetchList[0] !== 0 ? post.postOwner[i] : userPosts.rows[i].postby
      userPosts.rows[i].content = fetchList[0] !== 0 ? post.content[i] : userPosts.rows[i].content
      userPosts.rows[i].likeNum = fetchList[2] !== 0 ? post.likeNums[i] : userPosts.rows[i].likeNum
      userPosts.rows[i].retweetNum = fetchList[3] !== 0 ? post.retweetNums[i] : userPosts.rows[i].retweetNum
      userPosts.rows[i].selfLike = fetchList[4] !== 0 ? post.selfLike[i] : userPosts.rows[i].selfLike
      userPosts.rows[i].selfRetweet = fetchList[5] !== 0 ? post.selfRetweet[i] : userPosts.rows[i].selfRetweet

      postOwner.push([userPosts.rows[i].postId, userPosts.rows[i].postby])
      content.push([userPosts.rows[i].postId, userPosts.rows[i].content])
      createdAt.push([userPosts.rows[i].postId, userPosts.rows[i].createdAt])
      likeNums.push([userPosts.rows[i].postId, userPosts.rows[i].likeNum])
      retweetNums.push([userPosts.rows[i].postId, userPosts.rows[i].retweetNum])
      selfLike.push([userPosts.rows[i].postId, userPosts.rows[i].selfLike])
      selfRetweet.push([userPosts.rows[i].postId, userPosts.rows[i].selfRetweet])
    }

    const postNestObj = {
      postOwner,
      content,
      createdAt,
      likeNums,
      retweetNums,
      selfLike,
      selfRetweet
    }

    obj.userPosts = userPosts

    await postWriteBack(userId, postNestObj, fetchList)
    await setPostExpNX(userId, 300)

    res.status(200).send(JSON.stringify(obj))
  } catch (err) {
    console.log('posts.js router.get error', err)
  }
}

export default {
  getPost
}
