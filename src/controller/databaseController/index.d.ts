interface PostData {
    postby: string,
    content: string
}

interface PostUsername {
    postId: string, 
    username: string
}

type Register = Array<string>

export {
    PostData,
    PostUsername,
    Register
};