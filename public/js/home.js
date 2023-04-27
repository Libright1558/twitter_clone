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
            "like_people": null,
            "retweet_people": null,
        }

        results.forEach(result => {
            resultPost.timestamp = result.ts;
            resultPost.postData = result.content;
            resultPost.post_id = result.post_id;
            resultPost.like_people = JSON.parse(JSON.stringify(result.like_people === null ? [] : result.like_people));
            resultPost.retweet_people = JSON.parse(JSON.stringify(result.retweet_people === null ? [] : result.retweet_people));

            let html = createPostHtml(resultPost);
            postsContainer.insertAdjacentHTML("beforeend", html);
        });
    })
    .catch(error => {
        console.log("render posts error", error);
    })
});