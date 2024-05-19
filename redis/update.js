import { client } from './cache.js'
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
  await client.connect()
  try {
    await renewLikeNums(client, postId, obj, expTime)
  } catch (error) {
    console.log('updateLikeNums error', error)
  } finally {
    await client.quit()
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
  await client.connect()
  try {
    await renewRetweetNums(client, postId, obj, expTime)
  } catch (error) {
    console.log('updateRetweetNums error', error)
  } finally {
    await client.quit()
  }
}

export {
  updateLikeNums,
  updateRetweetNums
}
