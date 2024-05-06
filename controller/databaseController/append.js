import sequelize from '../../database/sequelize.js'
import appendPost from '../../database/queryString/appendPost.js'
import { QueryTypes } from 'sequelize'

const insertPost = async (postData) => {
  try {
    const postId = await sequelize.query(appendPost.appendPostData, {
      bind: [postData],
      type: QueryTypes.INSERT
    })
    return postId
  } catch (err) {
    console.log('appendPost error: ', err)
  }
}

export {
  insertPost
}
