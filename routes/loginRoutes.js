import express from 'express';
import loginController from '../controller/loginController.js';
const router = express.Router();

router.route('/')
    .get(loginController.renderLoginPage)
    .post(loginController.userLogin);

export default router;
