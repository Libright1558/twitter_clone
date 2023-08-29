document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/posts", {
        method: 'GET'
    })
    .then((response) => {
        return response.json();
    })
    .then(async (results) => {
        const postsContainer = document.querySelector('.postsContainer');

        let resultPost = {
            "firstName": null,
            "lastName": null,
            "profilePic": null,
            "timestamp": null,
            "postData": null,
            "postby": null,
            "post_id": null,
            "likenum": null,
            "retweetnum": null,
            "isretweeted": null,
            "isliked": null
        }

        const userPostsLength = results.userPosts ? results.userPosts.length : 0;
        const userRetweetsLength = results.userRetweets ? results.userRetweets.length : 0;

        let i = 0, j = 0;
        while(i < userPostsLength && j < userRetweetsLength) {
            if(results.userPosts[i].ts > results.userRetweets[j].retweet_ts) {
                await renderPost(resultPost, results.userPosts[i], postsContainer);
                i++;
            }
            else {
                await renderPost(resultPost, results.userRetweets[j], postsContainer);
                j++;
            }
        }

        while(i < userPostsLength) {
            await renderPost(resultPost, results.userPosts[i], postsContainer);
            i++;
        }

        while(j < userRetweetsLength) {
            await renderPost(resultPost, results.userRetweets[j], postsContainer);
            j++;
        }
    })
    .catch(error => {
        console.log("render posts error", error);
    })
});

async function renderPost(resultPost, result, element) {
    resultPost.firstName = result.firstname
    resultPost.lastName = result.lastname
    resultPost.profilePic = result.profilepic
    resultPost.timestamp = result.ts;
    resultPost.postData = result.content;
    resultPost.post_id = result.post_id;
    resultPost.postby = result.postby;
    resultPost.likenum = result.likenum;
    resultPost.retweetnum = result.retweetnum;
    resultPost.isretweeted = result.isretweeted;
    resultPost.isliked = result.isliked;

    let html = createPostHtml(resultPost);
    element.insertAdjacentHTML("beforeend", html);
}