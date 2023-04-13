document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/posts", {
        method: 'GET'
    })
    .then((response) => {
        return response.json();
    })
    .then((result) => {
        console.log(result);
    })
    .catch(error => {
        console.log("render posts error", error);
    })
});