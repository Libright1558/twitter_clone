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
        var postText = {
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
function likeButtonClickHandler() {
    console.log("like button clicked");
}

function createPostHtml(result) {

    let fullName = result.firstName + " " + result.lastName;

    return `<div class='post'>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${result.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='' class='displayName'>${fullName}</a>
                            <span class='username'>@${result.username}</span>
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
                            <div class='postButtonContainer'>
                                <button>
                                <i class="fa-solid fa-retweet"></i> <!-- This is an icon -->
                                </button>
                            </div>
                            <div class='postButtonContainer'>
                                <button onclick="likeButtonClickHandler()">
                                <i class="fa-regular fa-heart"></i> <!-- This is an icon -->
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;   
};