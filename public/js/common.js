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
            body: JSON.stringify(postText),
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            return response.json();
        })
        .then(result => {
            var html = createPostHtml(result);
            const postsContainer = document.querySelector('.postsContainer');
            postsContainer.insertAdjacentHTML("afterbegin", html);
        })
        .catch(error => {
            console.log(error);
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

            const postContentContainer = e.target.closest(".postContentContainer");
            const username = postContentContainer.querySelector('.username').innerHTML;
            const usernameMinusAT = username.slice(1);

            let updateLike = {
                "postId": postId,
                "postOwner": usernameMinusAT,
            }

            fetch(`api/posts/${postId}/like`, {
                method: "PUT",
                body: JSON.stringify(updateLike),
                headers: {
                    "Content-Type": "application/json"
                },
            })
            .then((response) => {
                return response.json();
            })
            .then((result) => {
                let num = likeTarget.querySelector('.likeNums');
                num.innerHTML = result.like_nums || "";

                if(result.isAlreadyLike === true) {
                    likeTarget.classList.remove("active");
                }
                else if(result.isAlreadyLike === false) {
                    likeTarget.classList.add("active");
                }
            })
        }
    }

    //retweet button click handler
    const retweetTarget = e.target.closest(".retweetButton");

    if(retweetTarget) {
        let postId = getPostIdFromElement(retweetTarget);
        if(postId !== undefined) {

            const postContentContainer = e.target.closest(".postContentContainer");
            const username = postContentContainer.querySelector('.username').innerHTML;
            const usernameMinusAT = username.slice(1);

            let updateRetweet = {
                "postId": postId,
                "postOwner": usernameMinusAT,
            }

            fetch(`api/posts/${postId}/retweet`, {
                method: "PUT",
                body: JSON.stringify(updateRetweet),
                headers: {
                    "Content-Type": "application/json"
                },
            })
            .then((response) => {
                return response.json();
            })
            .then((result) => {
                let num = retweetTarget.querySelector('.retweetNums');
                num.innerHTML = result.retweet_nums || "";

                if(result.isAlreadyRetweet === true) {
                    retweetTarget.classList.remove("active");
                }
                else if(result.isAlreadyRetweet === false) {
                    retweetTarget.classList.add("active");
                }
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

function createPostHtml(result) {

    let fullName = userLoggedIn.firstName + " " + userLoggedIn.lastName;

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

    return `<div class='post' data-id='${result.post_id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${userLoggedIn.profilePic}'>
                    </div>
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