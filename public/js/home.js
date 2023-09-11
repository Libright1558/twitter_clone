import fetchNewAccessToken from './library/getNewAccessToken.js'
import common from './common.js'
import fetchRetry from './library/fetchRetry.js'

document.addEventListener('DOMContentLoaded', () => {
  fetchRetry('/api/posts', 500, 2, {
    credentials: 'include',
    method: 'GET'
  }, handlePostManage)
})

async function handlePostManage (results) {
  if (results.message === 'jwt expired') {
    await fetchNewAccessToken()
    throw new Error('token expired!')
  }

  const postsContainer = document.querySelector('.postsContainer')

  const resultPost = {
    firstName: null,
    lastName: null,
    profilePic: null,
    timestamp: null,
    postData: null,
    postby: null,
    post_id: null,
    likenum: null,
    retweetnum: null,
    isretweeted: null,
    isliked: null
  }

  const userPostsLength = results.userPosts ? results.userPosts.length : 0
  const userRetweetsLength = results.userRetweets ? results.userRetweets.length : 0

  let i = 0
  let j = 0
  while (i < userPostsLength && j < userRetweetsLength) {
    if (results.userPosts[i].ts > results.userRetweets[j].retweet_ts) {
      await renderPost(resultPost, results.userPosts[i], postsContainer)
      i++
    } else {
      await renderPost(resultPost, results.userRetweets[j], postsContainer)
      j++
    }
  }

  while (i < userPostsLength) {
    await renderPost(resultPost, results.userPosts[i], postsContainer)
    i++
  }

  while (j < userRetweetsLength) {
    await renderPost(resultPost, results.userRetweets[j], postsContainer)
    j++
  }
}

async function renderPost (resultPost, result, element) {
  resultPost.firstName = result.firstname
  resultPost.lastName = result.lastname
  resultPost.profilePic = result.profilepic
  resultPost.timestamp = result.ts
  resultPost.postData = result.content
  resultPost.post_id = result.post_id
  resultPost.postby = result.postby
  resultPost.likenum = result.likenum
  resultPost.retweetnum = result.retweetnum
  resultPost.isretweeted = result.isretweeted
  resultPost.isliked = result.isliked

  const html = common.createPostHtml(resultPost)
  element.insertAdjacentHTML('beforeend', html)
}
