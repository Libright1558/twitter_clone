import { client } from './cache.js'
import { writePostInfo, writeUserInfo } from './transaction.js'

const writePersonalData = async (userId, userInfo) => {
  await client.connect()

  try {
    await writeUserInfo(client, userId, userInfo)
  } catch (err) {
    console.log('redis writePersonalData error', err)
  } finally {
    await client.quit()
  }
}

const postWriteBack = async (userId, postInfoObj, listArray) => {
  await client.connect()

  try {
    await writePostInfo(client, userId, postInfoObj, listArray)
  } catch (err) {
    console.log('redis postWriteBack error', err)
  } finally {
    await client.quit()
  }
}

export {
  writePersonalData,
  postWriteBack
}
