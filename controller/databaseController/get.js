import sequelize from '../../database/sequelize.js'
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

const postInfo = async (username) => {
  const t = await sequelize.transaction()
  try {
    await sequelize.query(
      queryPost.likeRetweetNum, {
      },
      { transaction: t }
    )

    await sequelize.query(
      queryPost.postData, {
      },
      { transaction: t }
    )

    await sequelize.query(
      queryPost.selfLikeRetweet, {
      },
      { transaction: t }
    )

    await sequelize.query(
      queryPost.appendPostData, {
        bind: [username]
      },
      { transaction: t }
    )

    await sequelize.query(
      queryPost.appendLikeRetweetNum, {
      },
      { transaction: t }
    )

    await sequelize.query(
      queryPost.appendSelfLikeRetweet, {
        bind: [username]
      },
      { transaction: t }
    )

    const postResult = await sequelize.query(
      queryPost.fetchPost, {
      },
      { transaction: t }
    )

    await t.commit()
    return postResult
  } catch (err) {
    await t.rollback()
    console.log('sequelize postInfo error: ', err)
  }
}

export {
  userInfo,
  postInfo
}
