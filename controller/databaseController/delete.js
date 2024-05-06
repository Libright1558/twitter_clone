import sequelize from '../../database/sequelize.js'
import deleteString from '../../database/queryString/deletePost.js'
import { QueryTypes } from 'sequelize'

const deletePost = async (postId) => {
  try {
    await sequelize.query(deleteString.deletePost, {
      bind: [postId],
      type: QueryTypes.DELETE
    })
  } catch (err) {
    console.log('deletePost error: ', err)
  }
}

export {
  deletePost
}
