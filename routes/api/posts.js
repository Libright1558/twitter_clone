import express from 'express';
import postController from '../../controller/postController.js';
const router = express.Router();

router.route('/')
    .get(express.json(), postController.getPost)
    .post(express.json(), postController.writePost);

router.put('/like', express.json(), postController.updateLike);

router.put('/retweet', express.json(), postController.updateRetweet);

router.delete('/delete', express.json(), postController.deletePost);

export default router;
