import { createClient } from 'redis'

const client = createClient()
client.on('error', err => console.log('Redis Client Error', err))
client.connect()
  .then(() => { console.log('redis connection succeed') })

export {
  client
}
