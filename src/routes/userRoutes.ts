import express from 'express';
import rootController from '../controller/userController.js';
const router = express.Router();

router.route('/')
    .get(rootController.intoTheHomePage);

export default router;
