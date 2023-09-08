const fetchNewAccessToken = () => {
    return fetch("/refresh", {
        credentials: "include",
        method: 'GET'
    })
}

export default fetchNewAccessToken
    