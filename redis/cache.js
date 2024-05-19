import * as redis from 'redis'
import { setUserInfoExp, setPostInfoExp } from './transaction.js'
const client = redis.createClient()

client.on('error', err => console.log('Redis Client Error', err))

// test if connection is alive
const pingTest = async () => {
  await client.connect()

  try {
    const response = await client.PING()
    return response
  } catch (err) {
    console.log('redis pingTest error', err)
  } finally {
    await client.quit()
  }
}

// set expire
const setUserExpNX = async (times) => {
  await client.connect()

  try {
    await setUserInfoExp(client, times)
  } catch (err) {
    console.log('redis setUserExpNX error', err)
  } finally {
    await client.quit()
  }
}

const setPostExpNX = async (userId, times) => {
  await client.connect()

  try {
    await setPostInfoExp(client, userId, times)
  } catch (err) {
    console.log('redis setPostExpNX error', err)
  } finally {
    await client.quit()
  }
}

// delete key
const delKey = async (key) => {
  await client.connect()

  try {
    await client.DEL(key)
  } catch (err) {
    console.log('redis delKey error', err)
  } finally {
    await client.quit()
  }
}

const delField = async (key, field) => {
  await client.connect()

  try {
    await client.HDEL(key, field)
  } catch (err) {
    console.log('redis delField error', err)
  } finally {
    await client.quit()
  }
}

export {
  client,

  // test if connection is alive
  pingTest,

  // remove expire and set expire
  setUserExpNX,
  setPostExpNX,

  // delete key
  delKey,
  delField
}
