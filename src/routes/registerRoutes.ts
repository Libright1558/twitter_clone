import express from 'express';
import registerController from '../controller/registerController.js';
const router = express.Router();

router.route('/')
    .post(registerController.registAccount);

export default router;
