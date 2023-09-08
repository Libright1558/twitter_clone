import express from 'express';
const router = express.Router();
import loginController from "../controller/loginController.js";

router.route("/")
    .get(loginController.renderLoginPage)
    .post(loginController.userLogin)

export default router;