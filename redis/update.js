import { client } from './init.js'
import { renewLikeNums, renewRetweetNums } from './transaction.js'

/*
* expTime => lock expire time
*
* obj =
* {
*  value,
*  timestamp
* }
*/
const updateLikeNums = async (postId, obj, expTime) => {
  try {
    await renewLikeNums(client, postId, obj, expTime)
  } catch (error) {
    console.log('updateLikeNums error', error)
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
const updateRetweetNums = async (postId, obj, expTime) => {
  try {
    await renewRetweetNums(client, postId, obj, expTime)
  } catch (error) {
    console.log('updateRetweetNums error', error)
  }
}

export {
  updateLikeNums,
  updateRetweetNums
}
