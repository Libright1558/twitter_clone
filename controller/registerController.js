import express from 'express'
import databaseController from './databaseController.js'
import bcrypt from 'bcrypt'
const app = express()

app.use(express.urlencoded({ extended: false }))

const renderRegister = (req, res, next) => {
  res.status(200).render('register')
}

const registAccount = async (req, res, next) => {
  const firstName = req.body.firstName.trim()
  const lastName = req.body.lastName.trim()
  const username = req.body.username.trim()
  const email = req.body.email.trim()
  let password = req.body.password

  const payload = req.body

  if (firstName && lastName && username && email && password) {
    let user
    try {
      user = await databaseController.findDup(username, email)
    } catch (e) {
      console.log(e)
      payload.errorMessage = 'Something went worng.'
      res.status(200).render('register', payload)
    }

    if (user.rows[0] == null) {
      // No user found
      try {
        password = await bcrypt.hash(password, 12) // Hashing the password.
        const default_profile = '/images/UserProfiles/ProfilePic.jpeg'
        const user_data = [firstName, lastName, username, email, password, default_profile]
        await databaseController.regist(user_data)// Writing user's data into the database.

        return res.redirect('/login')
      } catch (e) {
        console.log(e)
        payload.errorMessage = 'Something went worng.'
        res.status(200).render('register', payload)
      }
    } else {
      // User found
      if (email === user.rows[0].email) {
        payload.errorMessage = 'Email already in use.'
      } else {
        payload.errorMessage = 'username already in use.'
      }
      res.status(200).render('register', payload)
    }
  } else {
    payload.errorMessage = 'Make sure each field has a valid value.'
    res.status(200).render('register', payload)
  }
}

export default {
  renderRegister,
  registAccount
}
