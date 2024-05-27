import { client } from './cache.js'
import { getPostInfo, getUserInfo, getPostIdArray } from './transaction.js'

const fetchPersonalData = async (userId) => {
  await client.connect()

  try {
    const result = await getUserInfo(client, userId)
    return result
  } catch (err) {
    console.log('redis fetchPersonalData error', err)
  } finally {
    await client.quit()
  }
}

const getPosts = async (userId, postIdArray) => {
  await client.connect()

  try {
    const result = await getPostInfo(client, userId, postIdArray)
    return result
  } catch (err) {
    console.log('redis getPosts error', err)
  } finally {
    await client.quit()
  }
}

const fetchPostIdArray = async (userId) => {
  await client.connect()

  try {
    const result = await getPostIdArray(client, userId)
    return result
  } catch (err) {
    console.log('redis getSortedPostIdArray error', err)
  } finally {
    await client.quit()
  }
}

export {
  fetchPersonalData,
  getPosts,
  fetchPostIdArray
}
