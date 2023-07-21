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
            "timestamp": null,
            "postData": null,
            "postby": null,
            "post_id": null,
            "like_people": null,
            "retweet_people": null,
        }

        const userPostsLength = results.userPosts.length;
        const userRetweetsLength = results.userRetweets.length;

        let i = 0, j = 0;
        while(i < userPostsLength && j < userRetweetsLength) {
            if(results.userPosts[i].ts > results.userRetweets[j].retweet_ts) {
                await renderPost(resultPost, results.userPosts[i], "post", postsContainer);
                i++;
            }
            else {
                await renderPost(resultPost, results.userRetweets[j], "retweet", postsContainer);
                j++;
            }
        }

        while(i < userPostsLength) {
            await renderPost(resultPost, results.userPosts[i], "post", postsContainer);
            i++;
        }

        while(j < userRetweetsLength) {
            await renderPost(resultPost, results.userRetweets[j], "retweet", postsContainer);
            j++;
        }
    })
    .catch(error => {
        console.log("render posts error", error);
    })
});

async function renderPost(resultPost, result, postType, element) {
    if(postType === "post") {
        resultPost.timestamp = result.ts;
    }
    else if(postType === "retweet") {
        resultPost.timestamp = result.retweet_ts;
    }
    else if(postType === "like") {
        resultPost.timestamp = result.like_ts;
    }
    resultPost.postData = result.content;
    resultPost.post_id = result.post_id;
    resultPost.postby = result.postby;
    resultPost.like_people = result.like_people ? result.like_people : [];
    resultPost.retweet_people = result.retweet_people ? result.retweet_people : [];

    let html = createPostHtml(resultPost);
    element.insertAdjacentHTML("beforeend", html);
}