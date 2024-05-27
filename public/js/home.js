import common from './common.js'

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/posts', {
    credentials: 'include',
    method: 'GET'
  })
    .then((results) => {
      return results.json()
    })
    .then((returnedValue) => {
      handlePostManage(returnedValue)
    })
    .catch(e => {
      console.log('get posts fail: ', e)
    })
})

async function handlePostManage (results) {
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
  resultPost.timestamp = result.createdAt
  resultPost.postData = result.content
  resultPost.post_id = result.postId
  resultPost.postby = result.postby
  resultPost.likenum = parseInt(result.likeNums)
  resultPost.retweetnum = parseInt(result.retweetNums)
  resultPost.isretweeted = parseInt(result.selfRetweet) === 1
  resultPost.isliked = parseInt(result.selfLike) === 1

  const html = common.createPostHtml(resultPost)
  element.insertAdjacentHTML('beforeend', html)
}

export {
  renderPost
}
