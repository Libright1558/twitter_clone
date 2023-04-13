document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/posts", {
        method: 'GET'
    })
    .then((response) => {
        return response.json();
    })
    .then((results) => {
        const postsContainer = document.querySelector('.postsContainer');

        let len = results.length;

        let resultPost = {
            "username": results[len - 1].username, 
            "email": results[len - 1].email, 
            "profilePic": results[len - 1].profilePic, 
            "firstName": results[len - 1].firstName, 
            "lastName": results[len - 1].lastName,
            "timestamp": null,
            "postData": null,
            "post_id": null,
        }

        results.slice(0, len - 1).forEach(result => {
            resultPost.timestamp = result.ts;
            resultPost.postData = result.content;
            resultPost.post_id = result.post_id;

            let html = createPostHtml(resultPost);
            postsContainer.insertAdjacentHTML("beforeend", html);
        });
    })
    .catch(error => {
        console.log("render posts error", error);
    })
});