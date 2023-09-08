import express from 'express';
const router = express.Router();
import refreshTokenController from "../controller/refreshTokenController.js";

router.route("/")
    .get(refreshTokenController.handleRefreshToken)

export default router