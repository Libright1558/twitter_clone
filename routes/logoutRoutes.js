import express from 'express';
const router = express.Router();
import logoutController from "../controller/logoutController.js";

router.route("/")
    .get(logoutController.logout)

export default router;