import { client } from './cache.js'
import { getPostInfo, getUserInfo } from './transaction.js'

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

const getPosts = async (postIdArray) => {
  await client.connect()

  try {
    const result = await getPostInfo(client, postIdArray)
    return result
  } catch (err) {
    console.log('redis getPosts error', err)
  } finally {
    await client.quit()
  }
}

export {
  fetchPersonalData,
  getPosts
}
