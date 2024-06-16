const Textarea = document.getElementById('postTextarea');
const submitPostButton = document.getElementById('submitPostButton');

// enable the button if there are texts in the textarea
Textarea.addEventListener('input', () => {
    submitPostButton.disabled = Textarea.value.trim() === '';
});

// post texts in textarea
submitPostButton.addEventListener('click', () => {
    try {
        const value = Textarea.value.trim();
        const postText = {
            content: value
        };
        fetch('/api/posts', {
            credentials: 'include',
            body: JSON.stringify(postText),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((res) => {
                return res.json();
            })
            .then((returnedValue) => {
                const resultPost = {
                    firstName: userLoggedIn.firstname,
                    lastName: userLoggedIn.lastname,
                    profilePic: userLoggedIn.profilepic,
                    timestamp: returnedValue.createdAt,
                    postData: postText.content,
                    postby: userLoggedIn.username,
                    post_id: returnedValue.postId,
                    likenum: 0,
                    retweetnum: 0,
                    isretweeted: false,
                    isliked: false
                };
                const html = createPostHtml(resultPost);
                const postsContainer = document.querySelector('.postsContainer');
                postsContainer.insertAdjacentHTML('afterbegin', html);
            })
            .catch(e => {
                console.log('postText fail: ', e);
            });
    } catch (e) {
        console.log('Content param can not send with request', e);
    } finally {
        document.getElementById('postTextarea').value = '';
        document.getElementById('submitPostButton').disabled = true;
    }
});

// render the commentReplyText
// const replyModal = document.getElementById('replyModal')
// replyModal.addEventListener('show.bs.modal', (e) => {
//   const commentTarget = e.relatedTarget
//   const postId = getPostIdFromElement(commentTarget)

//   fetch(`/api/posts/${postId}`, {
//     method: 'GET'
//   })
//     .then((response) => {
//       return response.json()
//     })
//     .then((result) => {
//       console.log(result) // test
//     })
// })

// // replyTextarea button handler
// const replyTextarea = document.getElementById('replyTextarea')
// const submitReplyButton = document.getElementById('submitReplyButton')

// // enable the button if there are texts in the textarea
// replyTextarea.addEventListener('input', () => {
//   submitReplyButton.disabled = replyTextarea.value.trim() === ''
// })

// button click handler
const postsContainer = document.querySelector('.postsContainer');

postsContainer.addEventListener('click', (e) => {
    const likeTarget = e.target.closest('.likeButton');

    // like button click handler
    if (likeTarget) {
        const postId = getPostIdFromElement(likeTarget);
        if (postId !== undefined) {
            fetch('api/posts/like', {
                credentials: 'include',
                method: 'PUT',
                body: JSON.stringify({ postId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    return res.json();
                })
                .then(returnedValue => {
                    const likeNums = document.querySelector('.likeNums');
                    const likeButton = document.querySelector('.likeButton');
                    likeNums.value = returnedValue;
                    if (likeButton.classList.contains('active')) {
                        likeButton.classList.remove('active');
                    } else {
                        likeButton.classList.add('active');
                    }
                })
                .catch(e => {
                    console.log('likePost fail: ', e);
                });
        }
    }

    // retweet button click handler
    const retweetTarget = e.target.closest('.retweetButton');

    if (retweetTarget) {
        const postId = getPostIdFromElement(retweetTarget);
        if (postId !== undefined) {
            fetch('api/posts/retweet', {
                credentials: 'include',
                method: 'PUT',
                body: JSON.stringify({ postId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    return res.json();
                })
                .then(returnedValue => {
                    const retweetNums = document.querySelector('.retweetNums');
                    const retweetButton = document.querySelector('.retweetButton');
                    retweetNums.value = returnedValue;
                    if (retweetButton.classList.contains('active')) {
                        retweetButton.classList.remove('active');
                    } else {
                        retweetButton.classList.add('active');
                    }
                })
                .catch(e => {
                    console.log('retweetPost fail: ', e);
                });
        }
    }

    // delete post button click handler
    const deletePostTarget = e.target.closest('.deletePostButton');

    if (deletePostTarget) {
        const postId = getPostIdFromElement(deletePostTarget);
        console.log(postId);

        if (postId !== undefined) {
            const rootElement = getRootFromElement(deletePostTarget);
            rootElement.remove();

            fetch('api/posts/delete', {
                credentials: 'include',
                method: 'DELETE',
                body: JSON.stringify({ postId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    }
}, false);

function getPostIdFromElement (element) {
    const isRoot = element.classList.contains('post');
    const rootElement = isRoot === true ? element : element.closest('.post');
    const postId = rootElement.dataset.id;

    return postId;
}

function getRootFromElement (element) {
    const isRoot = element.classList.contains('post');
    const rootElement = isRoot === true ? element : element.closest('.post');

    return rootElement;
}

function createPostHtml (result) {
    const fullName = result.firstName + ' ' + result.lastName;

    const isLiked = result.isliked;
    const likeButtonActiveClass = isLiked === true ? 'active' : '';
    const isRetweeted = result.isretweeted;
    const retweetButtonActiveClass = isRetweeted === true ? 'active' : '';

    let retweetText = '';
    if (isRetweeted === true) {
        retweetText = `<span>
                            <i class="fa-solid fa-retweet"></i>
                            Retweeted by<a href=''>@${userLoggedIn.username}</a>
                        </span>`;
    }

    let deletePostButton = '';
    const hasAuthorization = true;
    if (hasAuthorization === true) {
        deletePostButton = `<div class='deletePostContainer'>
                                <button class='deletePostButton'>
                                <i class="fa-regular fa-trash-can"></i> <!-- This is an icon -->
                                </button>
                            </div>`;
    }

    return `<div class='post' data-id='${result.post_id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${result.profilePic}'>
                    </div>
                    ${deletePostButton}
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='' class='displayName'>${fullName}</a>
                            <span class='username'>@${result.postby}</span>
                            <span class='date'>${result.timestamp}</span>
                        </div>
                        <div class='postBody'>
                            <span>${result.postData}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button class='commentButton' data-bs-toggle="modal" data-bs-target="#replyModal">
                                <i class="fa-regular fa-comment"></i> <!-- This is an icon -->
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                <i class="fa-solid fa-retweet"></i> <!-- This is an icon -->
                                <span class='retweetNums'>${result.retweetnum || ''}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                <i class="fa-regular fa-heart"></i> <!-- This is an icon -->
                                <span class='likeNums'>${result.likenum || ''}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

export default {
    createPostHtml
};
