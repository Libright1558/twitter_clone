import express from 'express';
import requireLogin from "../middleware/requireLogin.js";
const router = express.Router();
import rootController from "../controller/rootController.js";

router.route("/")
    .get(requireLogin.preLogin, rootController.intoTheHomePage)

export default router