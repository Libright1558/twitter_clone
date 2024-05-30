import { gainNewAccessToken } from './getNewToken.js'

const backOff = (delayTime) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delayTime)
  })
}

const fetchWrapper = async (path, options, delayTime, retryNums) => {
  let result = 'null'

  for (let count = 0; count < retryNums; ++count) {
    await fetch(path, options)
      .then(res => { return res.json() })
      .then(async (resultValue) => {
        if (resultValue.message === 'jwt expired') {
          await gainNewAccessToken()
          throw new Error('token expired')
        } else {
          result = resultValue
        }
      })
      .catch(e => {
        console.log('fetchWrapper error: ', e)
      })

    if (result !== 'null') {
      break
    }
    await backOff(delayTime)
  }

  return result
}

export {
  fetchWrapper
}
