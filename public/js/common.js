import fetchNewAccessToken from "./library/getNewAccessToken.js";

const Textarea = document.getElementById("postTextarea");
const submitPostButton = document.getElementById("submitPostButton");

//enable the button if there are texts in the textarea
Textarea.addEventListener("input", () => {
    submitPostButton.disabled = Textarea.value.trim() == '';
});

//post texts in textarea
submitPostButton.addEventListener("click", () => {
    try {
        const value = Textarea.value.trim();
        let postText = {
            "content": value
        }
        fetch("/api/posts", {
            credentials: "include",
            body: JSON.stringify(postText),
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            return response.json();
        })
        .then(async (result) => {
            if(result.message === 'jwt expired') {
                await fetchNewAccessToken(); // if access token expired, fetch the new one
            }

            var html = createPostHtml(result);
            const postsContainer = document.querySelector('.postsContainer');
            postsContainer.insertAdjacentHTML("afterbegin", html);
        })
        .catch((error) => {
            console.log("postTextError", error);
        })
        .finally(() => {
            document.getElementById("postTextarea").value = "";
            document.getElementById("submitPostButton").disabled = true;
        });
    }
    catch(e) {
        console.log("Content param can not send with request", e);
    }
});


//render the replyText
const replyModal = document.getElementById("replyModal");
replyModal.addEventListener("show.bs.modal", (e) => {
    const commentTarget = e.relatedTarget;
    let postId = getPostIdFromElement(commentTarget);
    
    fetch(`/api/posts/${postId}`, {
        method: 'GET'
    })
    .then((response) => {
        return response.json();
    })
    .then((result) => {
        console.log(result); // test
    })
})

//replyTextarea button handler
const replyTextarea = document.getElementById("replyTextarea");
const submitReplyButton = document.getElementById("submitReplyButton");

//enable the button if there are texts in the textarea
replyTextarea.addEventListener("input", () => {
    submitReplyButton.disabled = replyTextarea.value.trim() == '';
});



//button click handler
const postsContainer = document.querySelector('.postsContainer');

postsContainer.addEventListener("click", (e) => {

    const likeTarget = e.target.closest(".likeButton");

    //like button click handler
    if(likeTarget) {
        let postId = getPostIdFromElement(likeTarget);
        if(postId !== undefined) {

            let updateLike = {
                "postId": postId,
            }

            fetch(`api/posts/${postId}/like`, {
                credentials: "include",
                method: "PUT",
                body: JSON.stringify(updateLike),
                headers: {
                    "Content-Type": "application/json"
                },
            })
            .then((response) => {
                return response.json();
            })
            .then(async (result) => {
                if(result.message === 'jwt expired') {
                    await fetchNewAccessToken(); // if access token expired, fetch the new one    
                }

                let num = likeTarget.querySelector('.likeNums');
                num.innerHTML = result.like_nums || "";

                if(result.isAlreadyLike === true) {
                    likeTarget.classList.add("active");
                }
                else if(result.isAlreadyLike === false) {
                    likeTarget.classList.remove("active");
                }
            })
            .catch((err) => {
                console.log("likePostError", err);
            })
        }
    }

    //retweet button click handler
    const retweetTarget = e.target.closest(".retweetButton");

    if(retweetTarget) {
        let postId = getPostIdFromElement(retweetTarget);
        if(postId !== undefined) {

            let updateRetweet = {
                "postId": postId,
            }

            fetch(`api/posts/${postId}/retweet`, {
                credentials: "include",
                method: "PUT",
                body: JSON.stringify(updateRetweet),
                headers: {
                    "Content-Type": "application/json"
                },
            })
            .then((response) => {
                return response.json();
            })
            .then(async (result) => {
                if(result.message === 'jwt expired') {
                    await fetchNewAccessToken(); // if access token expired, fetch the new one    
                }

                let num = retweetTarget.querySelector('.retweetNums');
                num.innerHTML = result.retweet_nums || "";

                if(result.isAlreadyRetweet === true) {
                    retweetTarget.classList.add("active");
                }
                else if(result.isAlreadyRetweet === false) {
                    retweetTarget.classList.remove("active");
                }
            })
            .catch((err) => {
                console.log("retweetPostError", err);
            })
        }
    }

    // delete post button click handler
    const deletePostTarget = e.target.closest(".deletePostButton");

    if(deletePostTarget) {
        let postId = getPostIdFromElement(deletePostTarget);

        if(postId !== undefined) {

            let deletePost = {
                "postId": postId,
            }

            let rootElement = getRootFromElement(deletePostTarget);
            rootElement.remove();

            fetch(`api/posts/${postId}/delete`, {
                credentials: "include",
                method: "DELETE",
                body: JSON.stringify(deletePost),
                headers: {
                    "Content-Type": "application/json"
                },
            })
            .then((response) => {
                return response.json();
            })
            .then(async (result) => {
                if(result.message === 'jwt expired') {
                    await fetchNewAccessToken(); // if access token expired, fetch the new one
                }
            })
            .catch((err) => {
                console.log("deletePostError", err)
            })
        }
    }

}, false);


function getPostIdFromElement(element) {
    let isRoot = element.classList.contains('post');
    let rootElement = isRoot === true ? element : element.closest('.post');
    let postId = rootElement.dataset.id;

    return postId;
}

function getRootFromElement(element) {
    let isRoot = element.classList.contains('post');
    let rootElement = isRoot === true ? element : element.closest('.post');

    return rootElement;
}

function createPostHtml(result) {

    let fullName = result.firstName + " " + result.lastName;

    let isLiked = result.isliked;
    let likeButtonActiveClass =  isLiked === true ? "active" : "";
    let isRetweeted = result.isretweeted;
    let retweetButtonActiveClass = isRetweeted === true ? "active" : "";

    let retweetText = "";
    if(isRetweeted === true) {
        retweetText = `<span>
                            <i class="fa-solid fa-retweet"></i>
                            Retweeted by<a href=''>@${userLoggedIn.username}</a>
                        </span>`
    }

    let deletePostButton = ""
    let hasAuthorization = true;
    if(hasAuthorization === true) {
        deletePostButton = `<div class='deletePostContainer'>
                                <button class='deletePostButton'>
                                <i class="fa-regular fa-trash-can"></i> <!-- This is an icon -->
                                </button>
                            </div>`
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
                                <span class='retweetNums'>${result.retweetnum || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                <i class="fa-regular fa-heart"></i> <!-- This is an icon -->
                                <span class='likeNums'>${result.likenum || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;   
};

export default {
    createPostHtml,
}