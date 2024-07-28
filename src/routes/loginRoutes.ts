import express from 'express';
import loginController from '../controller/loginController.js';
const router = express.Router();

router.route('/')
    .post(loginController.userLogin);

export default router;
