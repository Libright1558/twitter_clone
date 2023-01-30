const Textarea = document.getElementById("postTextarea");
const submitPostButton = document.getElementById("submitPostButton");

//enable the button if there are texts in the textarea
Textarea.addEventListener("input", () => {
    submitPostButton.disabled = Textarea.value.trim() == '';
});

//post texts in textarea
submitPostButton.addEventListener("click", async () => {
    try {
        const value = Textarea.value.trim();
        var postText = {
            "content": value
        }
        const response = await fetch("/api/posts", {
            body: JSON.stringify(postText),
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json();
        console.log(data);
    }
    catch(e) {
        console.log("Content param can not send with request", e);
    }
});