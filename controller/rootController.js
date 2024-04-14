import databaseController from './databaseController.js'
import redisCache from '../redis/cache.js'

const intoTheHomePage = async (req, res, next) => {
  try {
    const username = req.username

    let personalData = await redisCache.fetchPersonalData(username)
    if (!personalData) {
      const response = await databaseController.fetchPersonalData(username)
      personalData = response.rows[0]
      await redisCache.writePersonalData(username, personalData)
      await redisCache.setExpNX('personalData', 900)
    } else {
      personalData = JSON.parse(personalData)
    }

    const payload = {
      pageTitle: 'Home',
      UserloggedIn: personalData,
      UserloggedInJs: JSON.stringify(personalData)
    }
    res.status(200).render('home', payload)
  } catch (err) {
    console.log('intoTheHomePage error', err)
  }
}

export default {
  intoTheHomePage
}
