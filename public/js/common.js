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
            document.querySelector('.postsContainer').prepend(html);
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

function createPostHtml(result) {
    return result.data[1];   
};