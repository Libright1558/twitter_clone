import { client } from './init.js'
import { writePostInfo, writeUserInfo, writePostIdArray } from './transaction.js'

const writePersonalData = async (userId, userInfo) => {
  try {
    await writeUserInfo(client, userId, userInfo)
  } catch (err) {
    console.log('redis writePersonalData error', err)
  }
}

const postWriteBack = async (userId, postInfoObj, listArray) => {
  try {
    await writePostInfo(client, userId, postInfoObj, listArray)
  } catch (err) {
    console.log('redis postWriteBack error', err)
  }
}

const setPostIdArray = async (userId, member) => {
  try {
    const result = await writePostIdArray(client, userId, member)
    return result
  } catch (err) {
    console.log('redis writeSortedPostIdArray error', err)
  }
}

export {
  writePersonalData,
  postWriteBack,
  setPostIdArray
}
