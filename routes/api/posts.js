import express from 'express'
import postController from '../../controller/postController.js'
const router = express.Router()

router.route('/')
  .get(postController.getPost)
  .post(postController.postThePost)

router.put('/:id/like', postController.likePost)

router.put('/:id/retweet', postController.retweetPost)

router.delete('/:id/delete', postController.deletePost)

export default router
