import controller from '../controller/databaseController.js'
import moment from 'moment'

const fetchPostHelper = async (idArray, client, username) => {
  try {
    if (idArray.length) {
      const [posts, likenum, retweetnum, isliked, isretweeted] = await client
        .multi()
        .HMGET('community_posts', idArray)
        .HMGET('likenum', idArray)
        .HMGET('retweetnum', idArray)
        .HMGET(username + '_isliked', idArray)
        .HMGET(username + '_isretweeted', idArray)
        .exec()

      if (posts.length) {
        let recordsObj = posts.map(str => JSON.parse(str))
        const recordLen = recordsObj.length

        if (recordsObj.includes(null)) {
          recordsObj = await checkIfPostDataIsComplete(idArray, recordsObj, username, client)
        }// to check if some posts is not in redis cache

        for (let i = 0; i < recordLen; i++) {
          if ((likenum.includes(null) || isliked.includes(undefined)) &&
                    (retweetnum.includes(null) || isretweeted.includes(undefined))) {
            break
          }
          if (likenum && isliked) {
            recordsObj[i].likenum = JSON.parse(likenum[i])
            recordsObj[i].isliked = JSON.parse(isliked[i])
          }

          if (retweetnum && isretweeted) {
            recordsObj[i].retweetnum = JSON.parse(retweetnum[i])
            recordsObj[i].isretweeted = JSON.parse(isretweeted[i])
          }
        }

        recordsObj.sort(function (a, b) {
          if (a.ts > b.ts) {
            return -1
          }

          if (a.ts < b.ts) {
            return 1
          }
          return 0
        }) // descendent sorting

        const sortedIdArray = recordsObj.map((obj) => obj.post_id)

        // if likenum or isliked doesn't exist, fetching it from database. then writing it back to redis
        if (likenum.includes(null) || isliked.includes(undefined)) {
          const response = await controller.fetchPostLikeDetail(sortedIdArray, username)

          const sortedLikeResult = await sortedLike(response, sortedIdArray, recordsObj)
          const likeNumObj = sortedLikeResult.likeNumObj
          const isLikeObj = sortedLikeResult.isLikeObj
          recordsObj = sortedLikeResult.recordsObj

          await client
            .multi()
            .HSET('likenum', likeNumObj)
            .HSET(username + '_isliked', isLikeObj)
            .exec()
        }
        // if retweetnum or isretweeted doesn't exist, fetching it from database. then writing it back to redis
        if (retweetnum.includes(null) || isretweeted.includes(undefined)) {
          const response = await controller.fetchPostRetweetDetail(sortedIdArray, username)

          const sortedRetweetResult = await sortedRetweet(response, sortedIdArray, recordsObj)
          const retweetNumObj = sortedRetweetResult.retweetNumObj
          const isRetweetObj = sortedRetweetResult.isRetweetObj
          recordsObj = sortedRetweetResult.recordsObj

          await client
            .multi()
            .HSET('retweetnum', retweetNumObj)
            .HSET(username + '_isretweeted', isRetweetObj)
            .exec()
        }

        return recordsObj
      }
    }
  } catch (err) {
    console.log('fetchPostHelper error', err)
  }
}

const sortedLike = async (response, sortedIdArray, recordsObj) => {
  try {
    const likeNumObj = {}
    const isLikeObj = {}
    const tempObj = {}

    const responseLength = response.rows.length
    for (let i = 0; i < responseLength; i++) {
      tempObj[response.rows[i].post_id] = {
        likenum: response.rows[i].likenum,
        isliked: response.rows[i].isliked
      }
    }// construct postid:value pairs

    const recordLen = recordsObj.length

    for (let i = 0; i < recordLen; i++) {
      likeNumObj[sortedIdArray[i]] = JSON.stringify(tempObj[sortedIdArray[i]].likenum)
      isLikeObj[sortedIdArray[i]] = JSON.stringify(tempObj[sortedIdArray[i]].isliked)

      recordsObj[i].likenum = JSON.parse(tempObj[sortedIdArray[i]].likenum)
      recordsObj[i].isliked = JSON.parse(tempObj[sortedIdArray[i]].isliked)
    }

    const resultObj = {
      likeNumObj,
      isLikeObj,
      recordsObj
    }

    return resultObj
  } catch (err) {
    console.log('sortedLike error', err)
  }
}

const sortedRetweet = async (response, sortedIdArray, recordsObj) => {
  try {
    const retweetNumObj = {}
    const isRetweetObj = {}
    const tempObj = {}

    const responseLength = response.rows.length
    for (let i = 0; i < responseLength; i++) {
      tempObj[response.rows[i].post_id] = {
        retweetnum: response.rows[i].retweetnum,
        isretweeted: response.rows[i].isretweeted
      }
    }// construct postid:value pairs

    const recordLen = recordsObj.length

    for (let i = 0; i < recordLen; i++) {
      retweetNumObj[sortedIdArray[i]] = JSON.stringify(tempObj[sortedIdArray[i]].retweetnum)
      isRetweetObj[sortedIdArray[i]] = JSON.stringify(tempObj[sortedIdArray[i]].isretweeted)

      recordsObj[i].retweetnum = JSON.parse(tempObj[sortedIdArray[i]].retweetnum)
      recordsObj[i].isretweeted = JSON.parse(tempObj[sortedIdArray[i]].isretweeted)
    }

    const resultObj = {
      retweetNumObj,
      isRetweetObj,
      recordsObj
    }

    return resultObj
  } catch (err) {
    console.log('sortedRetweet error', err)
  }
}

const checkIfPostDataIsComplete = async (idArray, recordsObj, username, client) => {
  try {
    const idArrayLength = idArray.length
    const nullIdArray = []
    for (let i = 0; i < idArrayLength; i++) {
      if (recordsObj[i] === null) {
        nullIdArray.push(idArray[i])
      }
    }

    if (nullIdArray.length) {
      const response = await controller.fetchLostPost(nullIdArray, username)

      await postWriteBackHelper(response, username, client)

      const responseLength = response.rows.length
      const result = recordsObj.filter((x) => x !== null).map((x) => x)
      for (let i = 0; i < responseLength; i++) {
        response.rows[i].ts = moment(response.rows[i].ts).format('YYYY-MM-DD HH:mm:ss')
        result.push(response.rows[i])
      }

      return result
    }
  } catch (err) {
    console.log('checkIfPostDataIsComplete error', err)
  }
}

const setCacheExp = async (username, redisCache) => {
  try {
    await redisCache.setExpNX('likenum', process.env.exp_time)
    await redisCache.setExpNX('retweetnum', process.env.exp_time)
    await redisCache.setExpNX(username + '_isretweeted', process.env.exp_time)
    await redisCache.setExpNX(username + '_isliked', process.env.exp_time)
  } catch (err) {
    console.log('setCacheExp', err)
  }
}

const postDetailWriteBack = async (objLike, objRetweet, client) => {
  try {
    await client.HSET('likenum', objLike)
    await client.HSET('retweetnum', objRetweet)
  } catch (err) {
    console.log('postDetailWriteBack error', err)
  }
}

const isUserLikeAndRetweetWriteBack = async (username, objLike, objRetweet, client) => {
  try {
    await client.HSET(username + '_isliked', objLike)
    await client.HSET(username + '_isretweeted', objRetweet)
  } catch (err) {
    console.log('isUserLikeAndRetweetWriteBack error', err)
  }
}

const postWriteBackHelper = async (userPosts, username, client) => {
  try {
    const data = {
      postby: null,
      content: null,
      ts: null,
      post_id: null,
      firstname: null,
      lastname: null,
      profilepic: null
    }

    const rowLength = userPosts.rows.length
    const postFieldValueObj = {}
    const postIdArray = []
    const likeNumObj = {}
    const retweetNumObj = {}
    const isLikeObj = {}
    const isRetweetObj = {}

    for (let i = 0; i < rowLength; i++) {
      data.postby = userPosts.rows[i].postby
      data.content = userPosts.rows[i].content
      data.ts = moment(userPosts.rows[i].ts).format('YYYY-MM-DD HH:mm:ss')
      data.post_id = userPosts.rows[i].post_id
      data.firstname = userPosts.rows[i].firstname
      data.lastname = userPosts.rows[i].lastname
      data.profilepic = userPosts.rows[i].profilepic

      postFieldValueObj[userPosts.rows[i].post_id] = JSON.stringify(data)

      postIdArray.push(userPosts.rows[i].post_id)
      likeNumObj[userPosts.rows[i].post_id] = JSON.stringify(userPosts.rows[i].likenum)
      retweetNumObj[userPosts.rows[i].post_id] = JSON.stringify(userPosts.rows[i].retweetnum)
      isLikeObj[userPosts.rows[i].post_id] = JSON.stringify(userPosts.rows[i].isliked)
      isRetweetObj[userPosts.rows[i].post_id] = JSON.stringify(userPosts.rows[i].isretweeted)
    }
    await client.HSET('community_posts', postFieldValueObj)
    await client.SADD(username + '_postid', postIdArray)
    await postDetailWriteBack(likeNumObj, retweetNumObj, client)
    await isUserLikeAndRetweetWriteBack(username, isLikeObj, isRetweetObj, client)
  } catch (err) {
    console.log('postWriteBackHelper error', err)
  }
}

export default {
  fetchPostHelper,
  setCacheExp,
  postDetailWriteBack,
  isUserLikeAndRetweetWriteBack,
  postWriteBackHelper
}
