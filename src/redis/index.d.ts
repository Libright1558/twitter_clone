// redis client
import { client } from "./init";
type RedisClientType = typeof client

// redis get
type RedisPostIdArray = Array<string> | undefined

//redis write
interface RenewLikeRetweetNum {
    value: string,
    timestamp: string
}

export {
    RedisClientType,
    RedisPostIdArray,
    RenewLikeRetweetNum
};