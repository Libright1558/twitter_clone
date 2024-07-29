import express from 'express';
import registerController from '../controller/registerController.js';
const router = express.Router();

router.route('/')
    .post(express.json(), registerController.registAccount);

export default router;
