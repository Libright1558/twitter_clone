import { client } from './cache.js'
import { deletePostInfo } from './transaction.js'

const removePostCache = async (userId, postId) => {
  await client.connect()

  try {
    await deletePostInfo(client, userId, postId)
  } catch (err) {
    console.log('redis removePostCache error', err)
  } finally {
    await client.quit()
  }
}

export {
  removePostCache
}
