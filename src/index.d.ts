import { Request, Response, NextFunction } from "express";
import { JwtPayload } from 'jwt';
import { QueryResult } from 'pg';

type FetchListArray = Array<0 | 1>

interface DecodedValue extends JwtPayload {
    userId: string;
    username: string;
}

interface PersonalDetail {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    profilepic: string;
}

type PostIdValueTuple = [string, string]
type LikeRetweetNumsTuple = [string, string | number]
type SelfLikeRetweetTuple = [string, string | 0 | 1]

interface PostArrayNest {
    content: Array<PostIdValueTuple>;
    createdAt: Array<PostIdValueTuple>;
    likeNums: Array<LikeRetweetNumsTuple>;
    retweetNums: Array<LikeRetweetNumsTuple>;
    selfLike: Array<SelfLikeRetweetTuple>;
    selfRetweet: Array<SelfLikeRetweetTuple>;
    postOwner: Array<PostIdValueTuple>;
    firstname: Array<PostIdValueTuple>;
    lastname: Array<PostIdValueTuple>;
    profilepic: Array<PostIdValueTuple>;
}

interface getPostArrayType {
    content: Array<string>;
    createdAt: Array<string>;
    likeNums: Array<string>;
    retweetNums: Array<string>;
    selfLike: Array<"0" | "1">;
    selfRetweet: Array<"0" | "1">;
    postOwner: Array<string>;
    firstname: Array<string>;
    lastname: Array<string>;
    profilepic: Array<string>;
}

interface PostData {
    postby: string | null | undefined;
    content: string | null | undefined;
    createdAt: string | null | undefined;
    postId: string | null | undefined;
    likeNum: string | number | null | undefined;
    retweetNum: string | number | null | undefined;
    selfRetweet: string | 0 | 1 | null | undefined;
    selfLike: string | 0 | 1 | null | undefined;
    firstname: string | null | undefined;
    lastname: string | null | undefined;
    profilepic: string | null | undefined;
}

type PostDataArray = Array<PostData>

export {
    Request,
    Response,
    NextFunction,
    FetchListArray,
    DecodedValue,
    PersonalDetail,
    PostArrayNest,
    QueryResult,
    getPostArrayType,
    PostData,
    PostDataArray
};