import express from 'express';
import requireLogin from '../middleware/requireLogin.js';
import rootController from '../controller/rootController.js';
const router = express.Router();

router.route('/')
    .get(requireLogin.preLogin, rootController.intoTheHomePage);

export default router;
