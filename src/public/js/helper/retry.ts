import { gainNewAccessToken } from './getNewToken.js';

const backOff = (delayTime: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delayTime);
    });
};

const fetchWrapper = async (path: string, options: object, delayTime: number, retryNums: number) => {
    let result = 'null';

    for (let count = 0; count < retryNums; ++count) {
        await fetch(path, options)
            .then(res => { return res.json(); })
            .then(async (resultValue) => {
                if (resultValue.message === 'jwt expired') {
                    await gainNewAccessToken();
                    throw new Error('token expired');
                } else {
                    result = resultValue;
                }
            })
            .catch(e => {
                console.log('fetchWrapper error: ', e);
            });

        if (result !== 'null') {
            break;
        }
        await backOff(delayTime);
    }

    return result;
};

export {
    fetchWrapper
};
