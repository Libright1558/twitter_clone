document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/posts", {
        method: 'GET'
    })
    .then((response) => {
        return response.json();
    })
    .then((results) => {
        const postsContainer = document.querySelector('.postsContainer');

        let resultPost = {
            "timestamp": null,
            "postData": null,
            "post_id": null,
            "like_nums": null,
            "retweet_nums": null,
        }

        results.forEach(result => {
            resultPost.timestamp = result.ts;
            resultPost.postData = result.content;
            resultPost.post_id = result.post_id;
            resultPost.like_nums = Number(result.like_nums);
            resultPost.retweet_nums = Number(result.retweet_nums);

            let html = createPostHtml(resultPost);
            postsContainer.insertAdjacentHTML("beforeend", html);
        });
    })
    .catch(error => {
        console.log("render posts error", error);
    })
});