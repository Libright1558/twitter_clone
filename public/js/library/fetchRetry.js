const defer = (deferTime) => {
    return new Promise((resolve) => {
        setTimeout(resolve, deferTime);
    })
}

const fetchRetry = (url, deferTime, retryNum, options = {}, handleFunction) => {
    function errorHappened(err) {
        console.log(err);
        const retryNumRemain = retryNum - 1;
        if(!retryNumRemain) {
            throw err;
        }
        return defer(deferTime).then(() => fetchRetry(url, deferTime, retryNumRemain, options, handleFunction));
    }
    return fetch(url, options)
        .then((response) => {
            return response.json();
        })
        .then((result) => {
            return handleFunction(result);
        })
        .catch(errorHappened);
}

export default fetchRetry