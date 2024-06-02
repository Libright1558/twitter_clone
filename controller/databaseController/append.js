import sequelize from '../../database/sequelize.js'
import pool from '../../database/pgPool.js'
import appendPost from '../../database/queryString/appendPost.js'
import queryPost from '../../database/queryString/queryPost.js'
import { QueryTypes } from 'sequelize'

/*
* postData =
* {
*  postby,
*  content
* }
*/
const insertPost = async (postData) => {
  try {
    const [postResult, metadata] = await sequelize.query(appendPost.appendPostData, {
      bind: [postData.postby, postData.content],
      type: QueryTypes.INSERT
    })
    const result = [postResult, metadata]
    return result
  } catch (err) {
    console.log('appendPost error: ', err)
  }
}

/*
* param =
* {
*  postId,
*  username
* }
*/
const appendLike = async (param) => {
  try {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const createdAt = await client.query(appendPost.addLike, [param.postId, param.username])

      await client.query(queryPost.likeNum)

      await client.query(queryPost.appendLikeNum, [param.username])
      const likeNumsInfo = await client.query(queryPost.fetchLikeNum, [param.postId])
      await client.query('COMMIT')

      const result = {
        likeNumsInfo: likeNumsInfo.rows,
        createdAt: createdAt.rows
      }
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      console.log('appendLike error: ', error)
    } finally {
      client.release()
    }
  } catch (error) {
    console.log('pgPool connection error: ', error)
  }
}

/*
* param =
* {
*  postId,
*  username
* }
*/
const appendRetweet = async (param) => {
  try {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const createdAt = await client.query(appendPost.addRetweet, [param.postId, param.username])

      await client.query(queryPost.retweetNum)

      await client.query(queryPost.appendRetweetNum, [param.username])
      const retweetNumsInfo = await client.query(queryPost.fetchRetweetNum, [param.postId])
      await client.query('COMMIT')

      const result = {
        retweetNumsInfo: retweetNumsInfo.rows,
        createdAt: createdAt.rows
      }
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      console.log('appendRetweet error: ', error)
    } finally {
      client.release()
    }
  } catch (error) {
    console.log('pgPool connection error: ', error)
  }
}

export {
  insertPost,
  appendLike,
  appendRetweet
}
