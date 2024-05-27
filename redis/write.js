import { client } from './cache.js'
import { writePostInfo, writeUserInfo, writePostIdArray } from './transaction.js'

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

const setPostIdArray = async (userId, member) => {
  await client.connect()

  try {
    const result = await writePostIdArray(client, userId, member)
    return result
  } catch (err) {
    console.log('redis writeSortedPostIdArray error', err)
  } finally {
    await client.quit()
  }
}

export {
  writePersonalData,
  postWriteBack,
  setPostIdArray
}
