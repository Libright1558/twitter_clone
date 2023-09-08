import express from 'express';
const router = express.Router();
import registerController from "../controller/registerController.js";

router.route("/")
    .get(registerController.renderRegister)
    .post(registerController.registAccount)

export default router;