interface selfLikeReturnType {
    likeNumsInfo: Array<any>;
    createdAt: Array<any>;
}

interface selfRetweetReturnType {
    retweetNumsInfo: Array<any>;
    createdAt: Array<any>;
}

interface FindOneType {
    userId: string;
    username: string;
    password: string;
}

interface FindDupType {
    username: string;
    email: string;
}

export {
    selfLikeReturnType,
    selfRetweetReturnType,
    FindOneType,
    FindDupType
};