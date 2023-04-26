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


//like button click handler
const postsContainer = document.querySelector('.postsContainer');

postsContainer.addEventListener("click", function(e) {

    const target = e.target.closest(".likeButton");

    if(target) {
        let postId = getPostIdFromElement(target);
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
                let num = target.querySelector('.likeNums');
                num.innerHTML = result.total_likes || "";

                if(result.isAlreadyLike === true) {
                    target.classList.remove("active");
                }
                else if(result.isAlreadyLike === false) {
                    target.classList.add("active");
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

    return `<div class='post' data-id='${result.post_id}'>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${userLoggedIn.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='' class='displayName'>${fullName}</a>
                            <span class='username'>@${userLoggedIn.username}</span>
                            <span class='date'>${result.timestamp}</span>
                        </div>
                        <div class='postBody'>
                            <span>${result.postData}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button>
                                <i class="fa-regular fa-comment"></i> <!-- This is an icon -->
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button>
                                <i class="fa-solid fa-retweet"></i> <!-- This is an icon -->
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton'>
                                <i class="fa-regular fa-heart"></i> <!-- This is an icon -->
                                <span class='likeNums'>${result.like_nums || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;   
};