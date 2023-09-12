import express from 'express'
import registerController from '../controller/registerController.js'
const router = express.Router()

router.route('/')
  .get(registerController.renderRegister)
  .post(registerController.registAccount)

export default router
