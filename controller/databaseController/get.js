import sequelize from '../../database/sequelize.js'
import pool from '../../database/pgPool.js'
import queryUser from '../../database/queryString/queryUser.js'
import queryPost from '../../database/queryString/queryPost.js'
import { QueryTypes } from 'sequelize'

const userInfo = async (userId) => {
  try {
    const userResult = await sequelize.query(
      queryUser.personalData, {
        bind: [userId],
        type: QueryTypes.SELECT
      }
    )
    return userResult
  } catch (err) {
    console.log('sequelize userInfo error: ', err)
  }
}

/*
* fetchList =
* [
*  content,
*  createAt,
*  likeNums,
*  retweetNums,
*  selfLike,
*  selfRetweet
* ]
*
* To check which one is absent in the redis cache
* then query it
* 0: absent, 1: present
*/
const postInfo = async (username, fetchList) => {
  try {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      await client.query(queryPost.postData)
      await client.query(queryPost.likeNum)
      await client.query(queryPost.retweetNum)
      await client.query(queryPost.selfLike)
      await client.query(queryPost.selfRetweet)

      if (!fetchList[0] || !fetchList[1]) {
        await client.query(queryPost.appendPostData, [username])
      } else {
        await client.query(queryPost.appendPostId, [username])
      }

      if (!fetchList[2]) {
        await client.query(queryPost.appendLikeNum)
      }

      if (!fetchList[3]) {
        await client.query(queryPost.appendRetweetNum)
      }

      if (!fetchList[4]) {
        await client.query(queryPost.appendSelfLike, [username])
      }

      if (!fetchList[5]) {
        await client.query(queryPost.appendSelfRetweet, [username])
      }

      const postResult = await client.query(queryPost.fetchPost)

      await client.query('COMMIT')
      return postResult
    } catch (err) {
      await client.query('ROLLBACK')
      console.log('postInfo error: ', err)
    } finally {
      client.release()
    }
  } catch (err) {
    console.log('pgPool connection error: ', err)
  }
}

export {
  userInfo,
  postInfo
}
